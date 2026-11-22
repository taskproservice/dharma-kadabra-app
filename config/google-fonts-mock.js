/**
 * Cormorant Garamond se sirve desde este repositorio para que `next/font/google`
 * funcione también en entornos de build sin acceso a fonts.googleapis.com.
 * Es el mismo archivo que distribuye Google Fonts (SIL Open Font License 1.1).
 */
const path = require("path");
const fontFile = path.join(__dirname, "fonts", "CormorantGaramond-Variable.woff2");

module.exports = {
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300..700&display=swap": `/* latin */
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 300 700;
  font-display: swap;
  src: url(${fontFile}) format('woff2');
}`,
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap": `/* latin */
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 300 700;
  font-display: swap;
  src: url(${fontFile}) format('woff2');
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: italic;
  font-weight: 300 700;
  font-display: swap;
  src: url(${fontFile}) format('woff2');
}`,
};
