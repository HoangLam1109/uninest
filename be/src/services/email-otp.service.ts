import crypto from "crypto";
import net from "net";
import tls from "tls";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 60 * 1000;

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

type ResendConfig = {
  apiKey: string;
  from: string;
  apiBaseUrl: string;
};

type OtpEmailPurpose = "register" | "reset-password";

const SMTP_TIMEOUT_MS = 15 * 1000;

export class OtpRateLimitError extends Error {
  constructor(message = "Vui lòng chờ 60 giây trước khi gửi lại OTP.") {
    super(message);
    this.name = "OtpRateLimitError";
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashOtp(email: string, otp: string): string {
  const secret = process.env.OTP_SECRET ?? process.env.JWT_SECRET_KEY ?? "uninest";
  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest("hex");
}

export function createOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !user || !pass || !from) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === "true",
  };
}

function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? process.env.SMTP_FROM;

  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    apiBaseUrl: process.env.RESEND_API_BASE_URL ?? "https://api.resend.com",
  };
}

function encodeBase64(value: string): string {
  return Buffer.from(value).toString("base64");
}

function escapeMailHeader(value: string): string {
  return value.replace(/[\r\n]/g, " ").trim();
}

function getEmailTemplate(purpose: OtpEmailPurpose, otp: string) {
  if (purpose === "reset-password") {
    return {
      subject: "Mã OTP đặt lại mật khẩu UniNest",
      text: [
        `Mã OTP đặt lại mật khẩu UniNest của bạn là: ${otp}`,
        "",
        "Mã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.",
      ].join("\n"),
    };
  }

  return {
    subject: "Mã OTP đăng ký UniNest",
    text: [
      `Mã OTP đăng ký UniNest của bạn là: ${otp}`,
      "",
      "Mã có hiệu lực trong 5 phút. Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.",
    ].join("\n"),
  };
}

function createEmailMessage(
  to: string,
  from: string,
  purpose: OtpEmailPurpose,
  otp: string,
): string {
  const template = getEmailTemplate(purpose, otp);

  return [
    `From: ${escapeMailHeader(from)}`,
    `To: ${escapeMailHeader(to)}`,
    `Subject: ${template.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    template.text.replace(/\n/g, "\r\n"),
  ].join("\r\n");
}

function readSmtpResponse(socket: net.Socket | tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines.at(-1);

      if (lastLine && /^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(buffer);
      }
    };

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function sendSmtpCommand(
  socket: net.Socket | tls.TLSSocket,
  command: string,
): Promise<string> {
  socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);

  if (/^[45]\d{2}/.test(response)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }

  return response;
}

async function connectSmtp(config: SmtpConfig): Promise<net.Socket | tls.TLSSocket> {
  const socket = config.secure
    ? tls.connect(config.port, config.host, { servername: config.host })
    : net.connect(config.port, config.host);

  socket.setTimeout(SMTP_TIMEOUT_MS, () => {
    socket.destroy(new Error("SMTP connection timed out"));
  });

  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });

  const response = await readSmtpResponse(socket);
  if (/^[45]\d{2}/.test(response)) {
    throw new Error(`SMTP connection failed: ${response.trim()}`);
  }

  return socket;
}

async function sendResendEmail(
  email: string,
  purpose: OtpEmailPurpose,
  otp: string,
): Promise<boolean> {
  const config = getResendConfig();
  if (!config) return false;

  const template = getEmailTemplate(purpose, otp);

  const response = await fetch(`${config.apiBaseUrl}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [email],
      subject: template.subject,
      text: template.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${errorText}`);
  }

  return true;
}

function warnOrThrowMissingEmailConfig(email: string, otp: string, purpose: OtpEmailPurpose) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Email service is not configured.");
  }

  console.warn(`[${purpose}] Email service is not configured. OTP for ${email}: ${otp}`);
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: OtpEmailPurpose,
): Promise<void> {
  if (await sendResendEmail(email, purpose, otp)) {
    return;
  }

  const config = getSmtpConfig();

  if (!config) {
    warnOrThrowMissingEmailConfig(email, otp, purpose);
    return;
  }

  let socket = await connectSmtp(config);
  const helloResponse = await sendSmtpCommand(socket, `EHLO ${config.host}`);

  if (!config.secure && /\bSTARTTLS\b/i.test(helloResponse)) {
    await sendSmtpCommand(socket, "STARTTLS");
    socket = tls.connect({ socket, servername: config.host });
    await new Promise<void>((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });
    await sendSmtpCommand(socket, `EHLO ${config.host}`);
  }

  await sendSmtpCommand(socket, "AUTH LOGIN");
  await sendSmtpCommand(socket, encodeBase64(config.user));
  await sendSmtpCommand(socket, encodeBase64(config.pass));
  await sendSmtpCommand(socket, `MAIL FROM:<${config.from}>`);
  await sendSmtpCommand(socket, `RCPT TO:<${email}>`);
  await sendSmtpCommand(socket, "DATA");
  await sendSmtpCommand(
    socket,
    `${createEmailMessage(email, config.from, purpose, otp)}\r\n.`,
  );
  await sendSmtpCommand(socket, "QUIT");
  socket.end();
}
