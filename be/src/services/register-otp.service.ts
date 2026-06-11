import crypto from "crypto";
import net from "net";
import tls from "tls";

type RegisterOtpRecord = {
  otpHash: string;
  expiresAt: number;
  lastSentAt: number;
};

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const otpStore = new Map<string, RegisterOtpRecord>();

export class OtpRateLimitError extends Error {
  constructor() {
    super("Vui lòng chờ 60 giây trước khi gửi lại OTP.");
    this.name = "OtpRateLimitError";
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashOtp(email: string, otp: string): string {
  const secret = process.env.OTP_SECRET ?? process.env.JWT_SECRET_KEY ?? "uninest";
  return crypto
    .createHmac("sha256", secret)
    .update(`${normalizeEmail(email)}:${otp}`)
    .digest("hex");
}

function createOtp(): string {
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

function encodeBase64(value: string): string {
  return Buffer.from(value).toString("base64");
}

function escapeMailHeader(value: string): string {
  return value.replace(/[\r\n]/g, " ").trim();
}

function createEmailMessage(to: string, from: string, otp: string): string {
  const body = [
    `Mã OTP đăng ký UniNest của bạn là: ${otp}`,
    "",
    "Mã có hiệu lực trong 5 phút. Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.",
  ].join("\r\n");

  return [
    `From: ${escapeMailHeader(from)}`,
    `To: ${escapeMailHeader(to)}`,
    "Subject: Mã OTP đăng ký UniNest",
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
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

async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const config = getSmtpConfig();

  if (!config) {
    console.warn(`SMTP is not configured. OTP for ${email}: ${otp}`);
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
  await sendSmtpCommand(socket, `${createEmailMessage(email, config.from, otp)}\r\n.`);
  await sendSmtpCommand(socket, "QUIT");
  socket.end();
}

export class RegisterOtpService {
  async sendOtp(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const existingOtp = otpStore.get(normalizedEmail);
    const now = Date.now();

    if (existingOtp && now - existingOtp.lastSentAt < RESEND_COOLDOWN_MS) {
      throw new OtpRateLimitError();
    }

    const otp = createOtp();
    otpStore.set(normalizedEmail, {
      otpHash: hashOtp(normalizedEmail, otp),
      expiresAt: now + OTP_TTL_MS,
      lastSentAt: now,
    });

    await sendOtpEmail(normalizedEmail, otp);
  }

  verifyOtp(email: string, otp: string): boolean {
    const normalizedEmail = normalizeEmail(email);
    const record = otpStore.get(normalizedEmail);

    if (!record) return false;

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return false;
    }

    const isValid = record.otpHash === hashOtp(normalizedEmail, otp);
    if (isValid) {
      otpStore.delete(normalizedEmail);
    }

    return isValid;
  }
}
