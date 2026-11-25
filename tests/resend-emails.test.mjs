import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { render } from "@react-email/render";
import ts from "typescript";
import { appBaseUrl, sendEmail } from "../lib/resend.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requireFromTest = Module.createRequire(import.meta.url);

function loadTsxComponent(relativeFilePath) {
  const fullPath = path.resolve(__dirname, relativeFilePath);
  const source = fs.readFileSync(fullPath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
    fileName: fullPath,
  });

  const mod = { exports: {} };
  const fn = new Function("exports", "require", "module", "__filename", "__dirname", outputText);
  fn(mod.exports, requireFromTest, mod, fullPath, path.dirname(fullPath));
  return mod.exports;
}

test("AppointmentConfirmation renderiza HTML Premium (Papiro, Tinta y Oro) para presencial y videollamada", async () => {
  const { AppointmentConfirmation } = loadTsxComponent("../emails/AppointmentConfirmation.tsx");

  const inPersonHtml = await render(
    React.createElement(AppointmentConfirmation, {
      clientName: "Sofía Ramírez",
      service: "Lectura de Registros Akáshicos",
      date: "lunes, 1 de diciembre de 2026",
      time: "10:00 hrs (hora Tijuana)",
      modality: "IN_PERSON",
      therapistName: "Paola Hernández",
      depositAmount: 360,
      folio: "A1B2C3D4",
      accountUrl: "https://dharmakadabra.mx/mi-cuenta",
    }),
  );

  assert.match(inPersonHtml, /#F4EFE6/i, "fondo Papiro");
  assert.match(inPersonHtml, /#2C241B/i, "texto oscuro institucional");
  assert.match(inPersonHtml, /#C5A059/i, "acentos dorados");
  assert.ok(inPersonHtml.includes("Sofía Ramírez"));
  assert.ok(inPersonHtml.includes("Lectura de Registros Akáshicos"));
  assert.ok(inPersonHtml.includes("lunes, 1 de diciembre de 2026"));
  assert.ok(inPersonHtml.includes("10:00 hrs (hora Tijuana)"));
  assert.ok(inPersonHtml.includes("Presencial en el estudio"));
  assert.ok(inPersonHtml.includes("Paola Hernández"));
  assert.ok(inPersonHtml.includes("A1B2C3D4"));

  const videoHtml = await render(
    React.createElement(AppointmentConfirmation, {
      clientName: "Mateo Ruiz",
      service: "Oráculo de Runas",
      date: "martes, 2 de diciembre de 2026",
      time: "16:00 hrs (hora Tijuana)",
      modality: "VIDEO_CALL",
      accountUrl: "https://dharmakadabra.mx/mi-cuenta",
    }),
  );

  assert.ok(videoHtml.includes("Videollamada (Zoom / Google Meet)"));
  assert.ok(videoHtml.includes("Oráculo de Runas"));
});

test("PasswordReset renderiza el botón dorado con el enlace de recuperación", async () => {
  const { PasswordReset } = loadTsxComponent("../emails/PasswordReset.tsx");
  const resetUrl = "https://dharmakadabra.mx/mi-cuenta/restablecer?token=abc123token";

  const html = await render(
    React.createElement(PasswordReset, {
      resetUrl,
      userName: "Lucía",
    }),
  );

  assert.match(html, /#F4EFE6/i, "fondo Papiro");
  assert.match(html, /#C5A059/i, "botón dorado");
  assert.ok(html.includes(resetUrl));
  assert.ok(html.includes("Lucía"));
});

test("sendEmail opera en modo Mock cuando RESEND_API_KEY no está configurada", async () => {
  const prevKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const logs = [];
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const { PasswordReset } = loadTsxComponent("../emails/PasswordReset.tsx");
    const result = await sendEmail({
      to: "cliente@ejemplo.com",
      subject: "Restablece tu contraseña · Dharma Kadabra",
      react: React.createElement(PasswordReset, {
        resetUrl: "https://dharmakadabra.mx/mi-cuenta/restablecer?token=mock123",
      }),
    });

    assert.equal(result.ok, true);
    assert.equal(result.mocked, true);
    assert.ok(
      logs.some((line) => line.includes("[Mock Resend] Enviando correo a cliente@ejemplo.com")),
      `Se esperaba log [Mock Resend], se obtuvo: ${logs.join("\n")}`,
    );
  } finally {
    console.log = originalLog;
    if (prevKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = prevKey;
  }
});

test("appBaseUrl prioriza NEXT_PUBLIC_APP_URL sin barras finales", () => {
  const prevAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://dharmakadabra.mx///";
  try {
    assert.equal(appBaseUrl("http://localhost:3000"), "https://dharmakadabra.mx");
  } finally {
    if (prevAppUrl === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = prevAppUrl;
  }
});
