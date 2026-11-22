import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getWorkTemplateSlots,
  getBlockedSlotKeysForDate,
  getAvailableSlotsForDate,
  findFirstAvailableDate,
  isDateAvailable,
} from "../lib/agenda-availability.ts";

/** Instante local "2026-11-22T10:00" en el TZ del proceso, como ISO. */
function localIso(monthOffsetDays, hour, minute = 0) {
  const d = new Date(2026, 10, 22 + monthOffsetDays, hour, minute, 0, 0);
  return d.toISOString();
}

test("la plantilla de trabajo cubre 09:00–17:00 en bloques de una hora", () => {
  const slots = getWorkTemplateSlots();
  assert.equal(slots.length, 9);
  assert.deepEqual(slots[0], "09:00");
  assert.deepEqual(slots[slots.length - 1], "17:00");
});

test("los horarios bloqueados del día quedan excluidos de la plantilla", () => {
  const blocked = [localIso(0, 9), localIso(0, 10)];
  const now = new Date(2026, 10, 22, 8, 0, 0); // antes de iniciar el día
  assert.deepEqual(getAvailableSlotsForDate("2026-11-22", blocked, now), [
    "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  ]);
});

test("hoy los horarios ya pasados se excluyen", () => {
  const blocked = [];
  const now = new Date(2026, 10, 22, 12, 30, 0); // medio día local
  const slots = getAvailableSlotsForDate("2026-11-22", blocked, now);
  assert.deepEqual(slots, ["13:00", "14:00", "15:00", "16:00", "17:00"]);
});

test("isDateAvailable es falso para fechas pasadas", () => {
  assert.equal(isDateAvailable("2026-11-20", [], "2026-11-22"), false);
});

test("findFirstAvailableDate salta los días completos o pasados", () => {
  // Ocupa todos los slots del día 22
  const blocked = [9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => localIso(0, h));
  const now = new Date(2026, 10, 22, 8, 0, 0);
  assert.equal(findFirstAvailableDate("2026-11", "2026-11-22", blocked, now), "2026-11-23");
});

test("findFirstAvailableDate devuelve null cuando no quedan horarios en el mes", () => {
  // Se bloquean todos los slots de los días 22, 23 y 24
  const blocked = [0, 1, 2].flatMap((dayOffset) => [9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => localIso(dayOffset, h)));
  assert.equal(getBlockedSlotKeysForDate("2026-11-22", blocked).size, 9);
  assert.equal(findFirstAvailableDate("2026-11", "2026-11-22", blocked, new Date(2026, 10, 22, 8, 0, 0)), "2026-11-25");
});
