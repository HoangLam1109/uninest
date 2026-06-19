const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

export type RoomSearchAnswer = {
  answer: string;
  rooms: Array<{
    roomId: string;
    title: string;
    pricePerMonth: number;
    reasons: string[];
  }>;
  missingInfo: string[];
};

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
}

function parseJsonAnswer(text: string): RoomSearchAnswer {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<RoomSearchAnswer>;

  return {
    answer: parsed.answer || "Chua co du du lieu de ket luan",
    rooms: Array.isArray(parsed.rooms) ? parsed.rooms as RoomSearchAnswer["rooms"] : [],
    missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo as string[] : [],
  };
}

export const GeminiService = {
  generateRoomSearchAnswer: async (input: {
    question: string;
    context: string;
  }): Promise<RoomSearchAnswer> => {
    const model = process.env.GEMINI_CHAT_MODEL || DEFAULT_CHAT_MODEL;
    const apiKey = getGeminiApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `
Ban la tro ly tim phong cho UniNest.
Chi su dung du lieu trong CONTEXT.
Neu khong du du lieu, noi ro "Chua co du du lieu de ket luan".
Khi de xuat phong, luon tra ve roomId, ten phong, gia va ly do ngan gon.
Khong tu tao thong tin ve gia, dia chi, tien ich hoac review.
Chi tra ve JSON hop le theo schema:
{
  "answer": "string",
  "rooms": [
    {
      "roomId": "string",
      "title": "string",
      "pricePerMonth": 0,
      "reasons": ["string"]
    }
  ],
  "missingInfo": ["string"]
}

QUESTION:
${input.question}

CONTEXT:
${input.context}
`.trim();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini chat failed: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";

    if (!text) {
      throw new Error("Gemini chat response did not include text");
    }

    return parseJsonAnswer(text);
  },
};
