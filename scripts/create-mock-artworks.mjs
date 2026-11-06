import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Deterministic, original SVG studies. No network or generation services are used.
const directory = fileURLToPath(new URL("../public/mock/artworks/", import.meta.url));
mkdirSync(directory, { recursive: true });
const studies = [
  ["open-field", "#435c70", "#d4b880", "#584d32", "#a1834d"],
  ["crossroads", "#494960", "#c99968", "#4d473a", "#ba965d"],
  ["quiet-room", "#263e3b", "#738479", "#273a35", "#87937a"],
  ["afternoon", "#766752", "#dfc18a", "#63523b", "#c3a572"],
  ["mist", "#667e88", "#c1c5b7", "#556665", "#a5afa0"],
  ["shore", "#657d92", "#d0cbb3", "#34586c", "#8da8aa"],
];
for (const [index, [id, sky, light, ground, accent]] of studies.entries()) {
  let seed = 137 + index;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const room = id === "quiet-room" || id === "afternoon";
  const colors = [sky, light, ground, accent, "#eee3c5"];
  const strokes = Array.from({ length: 750 }, () => {
    const x = random() * 840 - 20, y = random() * 1040 - 20;
    const length = 12 + random() * 110;
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(length / 2).toFixed(1)} ${(-15 + random() * 30).toFixed(1)} ${length.toFixed(1)} ${(-10 + random() * 20).toFixed(1)}" stroke="${colors[Math.floor(random() * colors.length)]}" stroke-width="${(2 + random() * 10).toFixed(1)}" opacity="${(.035 + random() * .12).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
  }).join("");
  const roomShapes = `<path d="M0 0H800V710L0 840Z" fill="${sky}"/><path d="M0 790L800 665V1000H0Z" fill="${ground}"/><rect x="275" y="190" width="270" height="405" fill="${ground}"/><rect x="294" y="208" width="231" height="365" fill="url(#glow)"/><path d="M409 209V573M294 389H525" stroke="${ground}" stroke-width="13"/><path d="M294 595H525L731 1000H42Z" fill="${light}" opacity=".23"/>${id === "quiet-room" ? '<path d="M165 700v100h100V700m-94 100-10 90m99-90 10 90M166 758h98" stroke="#172e2b" stroke-width="13" fill="none"/>' : ''}`;
  const landscapes = `<path d="M0 615Q150 535 300 614T800 568V1000H0Z" fill="${accent}"/><path d="M0 750Q200 608 405 714T800 659V1000H0Z" fill="${ground}"/>${id === "shore" ? '<path d="M0 628Q350 611 800 635M0 710Q410 680 800 702M30 827Q400 799 790 822" fill="none" stroke="#c6c8ac" stroke-width="5" opacity=".35"/>' : `<path d="M420 1000L393 824L449 715L468 649L459 718L423 828L502 1000Z" fill="${light}" opacity=".56"/>`}${id === "crossroads" ? `<path d="M396 840L332 754L246 674L339 740L433 817Z" fill="${light}" opacity=".6"/>` : ''}${id === "open-field" ? '<path d="M271 726q-9-33 0-39q9 6 0 39m0-2-6 18m6-18 5 18" stroke="#24302b" stroke-width="5" fill="none"/>' : ''}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset=".64" stop-color="${light}"/><stop offset="1" stop-color="${ground}"/></linearGradient><linearGradient id="glow" x2=".2" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${accent}"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".48" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".14"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs><g filter="url(#grain)"><path fill="url(#sky)" d="M0 0H800V1000H0Z"/>${room ? roomShapes : landscapes}${strokes}</g></svg>`;
  writeFileSync(`${directory}/${id}.svg`, svg);
}
console.log(`Created ${studies.length} local SVG studies.`);
