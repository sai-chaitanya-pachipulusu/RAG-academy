type LLMResponse = {
  text: string;
  tokens: { prompt: number; completion: number };
};

function getConfig() {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    return {
      provider: "openai" as const,
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.2"),
    };
  }

  if (anthropicKey) {
    return {
      provider: "anthropic" as const,
      apiKey: anthropicKey,
      model: process.env.ANTHROPIC_MODEL || "claude-3-haiku-20240307",
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || "2000"),
      temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || "0.2"),
    };
  }

  return null;
}

export function isLLMConfigured(): boolean {
  return getConfig() !== null;
}

export async function askLLM(
  system: string,
  user: string,
  overrides?: { model?: string; maxTokens?: number; temperature?: number; jsonMode?: boolean }
): Promise<LLMResponse> {
  const config = getConfig();
  if (!config) {
    throw new Error("No LLM configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in env.");
  }

  const model = overrides?.model ?? config.model;
  const maxTokens = overrides?.maxTokens ?? config.maxTokens;
  const temperature = overrides?.temperature ?? config.temperature;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    if (config.provider === "openai") {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: maxTokens,
        temperature,
      };
      if (overrides?.jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`OpenAI error (${res.status}): ${text.slice(0, 300)}`);
      }

      const json = await res.json();
      return {
        text: json.choices?.[0]?.message?.content?.trim() ?? "",
        tokens: {
          prompt: json.usage?.prompt_tokens ?? 0,
          completion: json.usage?.completion_tokens ?? 0,
        },
      };
    }

    // Anthropic
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic error (${res.status}): ${text.slice(0, 300)}`);
    }

    const json = await res.json();
    return {
      text: json.content?.[0]?.text?.trim() ?? "",
      tokens: {
        prompt: json.usage?.input_tokens ?? 0,
        completion: json.usage?.output_tokens ?? 0,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
