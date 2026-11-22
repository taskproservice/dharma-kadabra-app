import assert from "node:assert/strict";
import { test } from "node:test";
import { getLunarInfo } from "../lib/lunar-utils.ts";

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
