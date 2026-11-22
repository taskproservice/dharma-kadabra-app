/**
 * Cozy · Agente de ventas (server-side).
 *
 * `POST /api/cozy` — recibe el historial de la conversación y el contexto
 * del producto que se está consultando, y responde con la réplica de Cozy.
 *
 * - Con `OPENAI_API_KEY` configurada usa el modelo de lenguaje con el
 *   System Prompt de Asesora de Ventas Experta (`lib/cozy/agent.ts`).
 * - Sin key (o si el modelo falla) usa el respondedor local con el
 *   contexto real del producto, para que el embudo nunca se rompa.
 *
 * Responde `{ reply, handoff }`: `handoff: true` indica al cliente que
 * debe mostrar el botón de WhatsApp con Paola.
 */

import { NextResponse } from "next/server";
import { buildSystemPrompt, detectHandoffIntent, fallbackReply } from "../../../lib/cozy/agent";
import type { CozyApiMessage, CozyProductContext } from "../../../lib/cozy/types";

export const dynamic = "force-dynamic";

const MAX_MESSAGES = 24;
const MAX_CONTENT_LENGTH = 2000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMessages(value: unknown): CozyApiMessage[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const messages: CozyApiMessage[] = [];
  for (const item of value.slice(-MAX_MESSAGES)) {
    if (!isRecord(item)) continue;
    const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
    const content = typeof item.content === "string" ? item.content.trim() : "";
    if (!role || !content) continue;
    messages.push({ role, content: content.slice(0, MAX_CONTENT_LENGTH) });
  }
  return messages.length > 0 ? messages : null;
}

function parseProductContext(value: unknown): CozyProductContext | null {
  if (!isRecord(value)) return null;
  const { id, name, category, price, currency, availability, description, imageUrl } = value;
  if (typeof id !== "string" || typeof name !== "string" || typeof category !== "string") return null;
  if (typeof price !== "number" || !Number.isFinite(price)) return null;
  return {
    id: id.slice(0, 120),
    name: name.slice(0, 200),
    category: category.slice(0, 80),
    price,
    currency: typeof currency === "string" ? currency.slice(0, 8) : "MXN",
    availability: availability === "out_of_stock" ? "out_of_stock" : "available",
    description: typeof description === "string" ? description.slice(0, 1000) : undefined,
    imageUrl: typeof imageUrl === "string" ? imageUrl.slice(0, 2000) : undefined,
  };
}

/** Llama al modelo de lenguaje (OpenAI-compatible) si hay API key. */
async function callModel(
  messages: CozyApiMessage[],
  productContext: CozyProductContext | null,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: "system", content: buildSystemPrompt(productContext) },
          ...messages,
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return null;
    const data = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
    } | null;
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content ? content : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido.", code: "INVALID_JSON" }, { status: 400 });
  }

  const messages = parseMessages(isRecord(body) ? body.messages : null);
  if (!messages) {
    return NextResponse.json(
      { error: "Se requiere al menos un mensaje válido.", code: "INVALID_MESSAGES" },
      { status: 400 },
    );
  }
  const productContext = parseProductContext(isRecord(body) ? body.productContext : null);

  const lastUserText =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const handoff = detectHandoffIntent(lastUserText);

  const modelReply = await callModel(messages, productContext);
  const fallback = fallbackReply(messages, productContext);
  let reply = modelReply ?? fallback.reply;

  // Red de seguridad: si hay intención de humano y el modelo no mencionó
  // el botón, lo agregamos para que el cliente siempre pueda transferir.
  if (handoff && !/whatsapp|bot[oó]n/i.test(reply)) {
    reply += " Puedes hacer clic en el botón de WhatsApp que acaba de aparecer para hablar con Paola. 💬";
  }

  return NextResponse.json(
    { reply, handoff: handoff || fallback.handoff },
    { headers: { "Cache-Control": "no-store" } },
  );
}
