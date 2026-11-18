type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };
type ChatPayload = { messages: ChatMessage[] };

type DeepSeekResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
};

const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";
const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 4000;
const COZY_SYSTEM_PROMPT = `Eres Cozy, la asistente de Dharma Kadabra. Responde en español con calidez, respeto y un tono sereno. Puedes orientar sobre la marca y sus talismanes artesanales, pero no inventes precios, inventario, disponibilidad, políticas ni datos personales de Paola. No presentes creencias espirituales como hechos científicos ni prometas resultados. Si no tienes información suficiente, dilo con honestidad y sugiere contactar al equipo. Mantén tus respuestas claras y concisas.`;

export const runtime = "nodejs";

function isChatPayload(value: unknown): value is ChatPayload {
  if (!value || typeof value !== "object" || !("messages" in value)) return false;
  const { messages } = value as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return false;

  return messages.every((message: unknown) => {
    if (!message || typeof message !== "object") return false;
    const candidate = message as { role?: unknown; content?: unknown };
    return (
      (candidate.role === "user" || candidate.role === "assistant") &&
      typeof candidate.content === "string" &&
      candidate.content.trim().length > 0 &&
      candidate.content.length <= MAX_MESSAGE_LENGTH
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Envía un mensaje válido para Cozy." }, { status: 400 });
  }

  if (!isChatPayload(payload)) {
    return Response.json({ error: "El mensaje no tiene un formato válido." }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Cozy está en línea, pero su conexión de IA aún no está configurada. Inténtalo más tarde." },
      { status: 503 },
    );
  }

  const messages = [
    { role: "system", content: COZY_SYSTEM_PROMPT },
    ...payload.messages,
  ];

  try {
    const upstream = await fetch(DEEPSEEK_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 700,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });

    if (!upstream.ok) {
      console.error(`DeepSeek chat request failed with status ${upstream.status}`);
      return Response.json({ error: "Cozy no pudo conectarse en este momento. Inténtalo de nuevo." }, { status: 502 });
    }

    const result = (await upstream.json()) as DeepSeekResponse;
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return Response.json({ error: "Cozy no recibió una respuesta. Inténtalo de nuevo." }, { status: 502 });
    }

    return Response.json({ reply: reply.trim() });
  } catch (error) {
    const status = error instanceof Error && error.name === "TimeoutError" ? 504 : 502;
    return Response.json(
      { error: status === 504 ? "Cozy tardó demasiado en responder. Inténtalo de nuevo." : "Cozy no está disponible por el momento." },
      { status },
    );
  }
}
