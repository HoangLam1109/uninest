const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2";
const DEFAULT_EMBEDDING_DIMENSION = 768;

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
  embeddings?: Array<{
    values?: number[];
  }>;
};

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
}

export const EmbeddingService = {
  embedText: async (text: string): Promise<number[]> => {
    const model = process.env.GEMINI_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
    const outputDimensionality = Number(
      process.env.GEMINI_EMBEDDING_DIMENSION || DEFAULT_EMBEDDING_DIMENSION
    );
    const apiKey = getGeminiApiKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `models/${model}`,
        content: {
          parts: [{ text }],
        },
        ...(Number.isFinite(outputDimensionality)
          ? { output_dimensionality: outputDimensionality }
          : {}),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini embedding failed: ${response.status} ${errorBody}`);
    }

    const data = (await response.json()) as GeminiEmbeddingResponse;
    const values = data.embedding?.values || data.embeddings?.[0]?.values;

    if (!values || values.length === 0) {
      throw new Error("Gemini embedding response did not include vector values");
    }

    return values;
  },
};
