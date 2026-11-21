/** Entrada de la biblioteca de runas usada por la página de lectura. */
export interface Rune {
  /** Identificador estable (slug) para claves de React y enlaces futuros. */
  id: string;
  /** Posición en el Futhark (1–24). La runa vacía complementaria es la 25. */
  number: number;
  name: string;
  /** Carácter runico Unicode del Elder Futhark (o el símbolo de la runa vacía). */
  symbol: string;
  keywords: string[];
  meaning: string;
  interpretation: string;
  application: string;
}
