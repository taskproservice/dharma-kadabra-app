import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../app/api/chat/route";

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  let originalApiKey: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.DEEPSEEK_API_KEY;
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
  });

  afterEach(() => {
    if (originalApiKey === undefined) delete process.env.DEEPSEEK_API_KEY;
    else process.env.DEEPSEEK_API_KEY = originalApiKey;
    vi.unstubAllGlobals();
  });

  it("rejects invalid message payloads", async () => {
    const response = await POST(jsonRequest({ messages: [{ role: "system", content: "No permitido" }] }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("El mensaje no tiene un formato válido.");
  });

  it("returns a setup message when the server key is missing", async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const response = await POST(jsonRequest({ messages: [{ role: "user", content: "Hola Cozy" }] }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toContain("conexión de IA aún no está configurada");
  });

  it("sends a validated conversation to DeepSeek and returns Cozy's reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "Hola, qué gusto leerte." } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(jsonRequest({ messages: [{ role: "user", content: "Hola Cozy" }] }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ reply: "Hola, qué gusto leerte." });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-deepseek-key" }),
      }),
    );
  });
});
