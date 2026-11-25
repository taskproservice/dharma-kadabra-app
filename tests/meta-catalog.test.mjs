import assert from "node:assert/strict";
import { test } from "node:test";
import {
  META_CATALOG_COLUMNS,
  buildMetaCatalogCsv,
  metaCatalogFilename,
} from "../modules/marketing/meta-catalog.ts";

const baseUrl = "https://dharmakadabra.mx";

/** Parser CSV mínimo (RFC 4180) para inspeccionar las celdas por posición. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const product = (overrides = {}) => ({
  sku: "PUL-001",
  name: "Pulsera de Ojo de Tigre",
  description: "Protección, valor y claridad.",
  price: 450,
  currency: "MXN",
  stock: 6,
  availability: "available",
  imageUrl: "/images/products/pulsera-1.jpg",
  published: true,
  isVisible: true,
  ...overrides,
});

test("el encabezado respeta el orden exacto del feed de Meta", () => {
  const { csv } = buildMetaCatalogCsv([], { baseUrl });
  assert.equal(csv.trim(), META_CATALOG_COLUMNS.join(","));
  assert.deepEqual([...META_CATALOG_COLUMNS], [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
  ]);
});

test("exporta una pieza con SKU, precio en MXN, condición new y marca", () => {
  const { csv, included, skipped } = buildMetaCatalogCsv([product()], { baseUrl });
  assert.equal(included, 1);
  assert.equal(skipped, 0);

  const [, cells] = parseCsv(csv);
  assert.equal(cells.length, META_CATALOG_COLUMNS.length);
  assert.equal(cells[0], "PUL-001");
  assert.equal(cells[1], "Pulsera de Ojo de Tigre");
  assert.equal(cells[3], "in stock");
  assert.equal(cells[4], "new");
  assert.equal(cells[5], "450.00 MXN");
  assert.equal(cells[6], `${baseUrl}/tienda#producto-PUL-001`);
  assert.equal(cells[7], `${baseUrl}/images/products/pulsera-1.jpg`);
  assert.equal(cells[8], "Dharma Kadabra");
});

test("marca out of stock cuando el stock es 0", () => {
  const { csv } = buildMetaCatalogCsv([product({ stock: 0, availability: "out_of_stock" })], { baseUrl });
  assert.match(csv, /,out of stock,/);
});

test("omite piezas ocultas, sin publicar o sin imagen", () => {
  const { csv, included, skipped } = buildMetaCatalogCsv(
    [
      product(),
      product({ sku: "PUL-002", isVisible: false }),
      product({ sku: "PUL-003", published: false }),
      product({ sku: "PUL-004", imageUrl: "" }),
    ],
    { baseUrl },
  );
  assert.equal(included, 1);
  assert.equal(skipped, 3);
  assert.doesNotMatch(csv, /PUL-002|PUL-003|PUL-004/);
});

test("escapa comas y comillas dobles (RFC 4180)", () => {
  const { csv } = buildMetaCatalogCsv(
    [product({ name: 'Collar "Luna", edición limitada', description: "Línea 1\nLínea 2" })],
    { baseUrl },
  );
  assert.ok(csv.includes('"Collar ""Luna"", edición limitada"'));
  assert.ok(csv.includes('"Línea 1\nLínea 2"'));
});

test("normaliza el SKU a mayúsculas y respeta URLs absolutas de Blob", () => {
  const blob = "https://abc.public.blob.vercel-storage.com/productos/pulsera-1.jpg";
  const { csv } = buildMetaCatalogCsv([product({ sku: " pul-009 ", imageUrl: blob })], { baseUrl });
  assert.match(csv, /^PUL-009,/m);
  assert.ok(csv.includes(blob));
});

test("el nombre del archivo va fechado", () => {
  assert.equal(metaCatalogFilename(new Date("2026-11-25T12:00:00Z")), "catalogo-meta-2026-11-25.csv");
});
