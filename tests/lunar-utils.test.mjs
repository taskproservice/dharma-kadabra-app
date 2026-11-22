import assert from "node:assert/strict";
import { test } from "node:test";
import { getLunarInfo, getMonthlyLunarEvents } from "../lib/lunar-utils.ts";

const epoch = Date.UTC(2000, 0, 6, 18, 14);
const cycle = Math.round(29.53 * 24 * 60 * 60 * 1000);

test("calcula las ocho fases a lo largo del ciclo", () => {
  const phases = ["Luna nueva", "Luna creciente", "Cuarto creciente", "Luna gibosa creciente", "Luna llena", "Luna gibosa menguante", "Cuarto menguante", "Luna menguante"];
  phases.forEach((phase, index) => {
    assert.equal(getLunarInfo(new Date(epoch + index * cycle / 8)).phase, phase);
  });
});

test("la próxima luna llena siempre es futura, incluso en el instante exacto", () => {
  const fullMoon = epoch + cycle / 2;
  assert.equal(getLunarInfo(new Date(fullMoon - 1)).nextFullMoon.getTime(), fullMoon);
  assert.equal(getLunarInfo(new Date(fullMoon)).nextFullMoon.getTime(), fullMoon + cycle);
  assert.equal(getLunarInfo(new Date(epoch - 1)).nextFullMoon.getTime(), fullMoon);
});

test("los eventos lunares siguen el mes visible y sus fechas están ordenadas", () => {
  for (const month of ["2026-02", "2026-11", "2026-12", "2027-01"]) {
    const events = getMonthlyLunarEvents(month);
    assert.ok(events.length >= 3 && events.length <= 4, month);
    assert.deepEqual(events.map(({ date }) => date), events.map(({ date }) => date).sort());
    for (const { date, phase, title } of events) {
      assert.ok(date.startsWith(month), `${date} fuera de ${month}`);
      assert.ok(title.length > 0);
      assert.equal(getLunarInfo(new Date(`${date}T12:00:00Z`)).phase, phase);
    }
  }
});
