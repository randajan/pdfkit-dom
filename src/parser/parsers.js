import jet from "@randajan/jet-core";
import { notNullNumber, notNullMinZeroNumber, notNullString, minZeroNumber, enumFactory, flatArray, minNumber, typize, notNullBoolean, notNull, fitArray } from "../helpers";
import { createParser } from "./parserFactory";

const { solid } = jet.prop;

const parseSize = createParser([
    ["", enumFactory(["min", "max"], (v, d, a)=>v ? v : (minZeroNumber(a[0]) || d || "min"))],
    ["min", (v, d)=>minZeroNumber(v, d)],
    ["max", (v, d, a, r)=>minNumber(r.min, v, d, Infinity) ],
]);

const parseSide = createParser([
    ["top|horizontal", (v, d)=>minZeroNumber(v, d)],
    ["right|vertical", (v, d, a)=>minZeroNumber(v, a[0], d)],
    ["bottom|horizontal", (v, d, a)=>minZeroNumber(v, a[0], d)],
    ["left|vertical", (v, d, a)=>minZeroNumber(v, a[1], a[0], d)],
]);

const parseFont = createParser([
    ["size", (v, d)=>notNullMinZeroNumber(v, d)],
    ["family", (v, d)=>notNullString(v, d)],
    ["italic|oblique", enumFactory(["true", "italic", "oblique"], (v, d, a)=>v ? true : notNull(notNullMinZeroNumber(a[2]), d))],
    ["underline", enumFactory(["true", "underline"], (v, d, a)=>v ? true : notNullBoolean(a[3], d))]
]);

const parseAlign = createParser([
    ["horizontal|x", enumFactory(["center", "middle", "right", "justify"], (v, d)=>v ? v !== "middle" ? v : "center" : (d || "left"))],
    ["vertical|y", enumFactory(["center", "middle", "bottom"], (v, d)=>v ? v !== "middle" ? v : "center" : (d || "top"))],
    ["baseline", enumFactory(["top", "bottom", "middle", "alphabetic", "hanging"], (v, d)=>v || d || "common")]
]);

const parseGrid = createParser([
    ["horizontal|x", (v, d)=>minZeroNumber(v, d)],
    ["vertical|y", (v, d, a)=>minZeroNumber(v, a[0], d)],
]);

const parseSpacing = createParser([
    ["line", (v, d)=>notNullNumber(v, d)],
    ["word", (v, d)=>notNullNumber(v, d)],
    ["character|char", (v, d)=>notNullNumber(v, d)]
]);

const parseColor = createParser([
    ["foreground|fore|font|text|stroke", (v, d)=>notNullString(v, d)],
    ["background|back|bg", (v, d)=>notNullString(v, d)],
    ["opacity", (v, d)=>Math.min(1, notNullMinZeroNumber(v, d, 1))]
]);

//not defaultable
const parseCell = createParser([
    ["main|current|target", enumFactory(["min", "max"], (v, d, a)=>v ? v : (minZeroNumber(a[0]) || d || "min"))],
    ["min", (v, d)=>minZeroNumber(v, d)],
    ["max", (v, d, a, r)=>minNumber(r.min, v, d, Infinity) ],
    ["background|back", (v, d)=>notNullString(v, d)],
    ["opacity", (v, d)=>Math.min(1, notNullMinZeroNumber(v, d, 1))]
]);

const parseObjectFit = enumFactory(["stretch", "fit", "cover"], (v, d)=>v || d || "fit");

const parseCells = typize((v, d)=>(typeof v === "number" ? Array(v).fill("auto") : Array.jet.to(v, " ")).map(v=>parseCell(v, d)));
const parseRows = parseCells;
const parseColumns = parseCells;

const parseBorder = createParser([
    ["weight", (v, d)=>minZeroNumber(v, d)],
    ["color", (v, d)=>notNullString(v, d)],
    ["dash", (v, d)=>minZeroNumber(v, d)],
    ["opacity", (v, d)=>Math.min(1, notNullMinZeroNumber(v, d, 1))]
]);

const parseBorders = (ns, to, from, defs)=>{
    const wrap = nss=>nss.map(s=>ns+String.jet.capitalize(s));

    parseBorder(wrap(["top", "horizontal", "outer", ""]), to, from, defs);
    parseBorder(wrap(["left", "vertical", "outer", ""]), to, from, defs);
    parseBorder(wrap(["bottom", "horizontal", "outer", ""]), to, from, defs);
    parseBorder(wrap(["right", "vertical", "outer", ""]), to, from, defs);
    parseBorder(wrap(["row", "horizontal", "inner", ""]), to, from, defs);
    parseBorder(wrap(["column", "vertical", "inner", ""]), to, from, defs);

    return to;
};

const _namespaced = {
    color:parseColor,
    spacing:parseSpacing,
    grid:parseGrid,
    width:parseSize,
    height:parseSize,
    font:parseFont,
    margin:parseSide,
    padding:parseSide,
    align:parseAlign,
    border:parseBorders
}

export const parseStyle = typize((style, defs)=>{
    const sf = Object.jet.to(style);
    const st = {};
    
    const { objectFit, link, lineBreak, ellipsis, paging, childrenCount } = sf;

    const columns = parseColumns(sf.columns, defs?.columns);
    const prerows = parseRows(sf.rows, defs?.rows);
    if (columns.length && !prerows.length) { prerows.push(parseCell()); }
    const rows = !columns.length ? prerows : fitArray(prerows, Math.ceil(childrenCount / columns.length));

    for (let ns in _namespaced) { _namespaced[ns](ns, st, sf, defs); }

    return solid.all(st, {
        link:notNullString(link, defs?.link),
        lineBreak:notNullBoolean(lineBreak, defs?.lineBreak, true),
        paging:notNullBoolean(paging, defs?.paging, true),
        ellipsis:notNullString(ellipsis, defs?.ellipsis),
        objectFit:parseObjectFit(objectFit, defs?.objectFit),
        rows,
        columns,
    });

});