import jet from "@randajan/jet-core";
import { notNullNumber, notNullMinZeroNumber, notNullString, minZeroNumber, enumFactory, flatArray, minNumber, typize, notNullBoolean, notNull, fitArray } from "../../helpers";
import { createParser } from "./parserFactory";

const { solid } = jet.prop;

export const parseSize = createParser([
    ["main|current|target", enumFactory(["min", "max"], (v, d, a)=>v ? v : (minZeroNumber(a[0]) || d || "min"))],
    ["min", (v, d)=>minZeroNumber(v, d)],
    ["max", (v, d, a, r)=>minNumber(r.min, v, d, Infinity) ],
]);

export const parseSide = createParser([
    ["top|horizontal", (v, d)=>minZeroNumber(v, d)],
    ["right|vertical", (v, d, a)=>minZeroNumber(v, a[0], d)],
    ["bottom|horizontal", (v, d, a)=>minZeroNumber(v, a[0], d)],
    ["left|vertical", (v, d, a)=>minZeroNumber(v, a[1], a[0], d)],
]);

export const parseFont = createParser([
    ["size", (v, d)=>notNullMinZeroNumber(v, d)],
    ["family", (v, d)=>notNullString(v, d)],
    ["italic|oblique", enumFactory(["true", "italic", "oblique"], (v, d, a)=>v ? true : notNull(notNullMinZeroNumber(a[2]), d))],
    ["underline", enumFactory(["true", "underline"], (v, d, a)=>v ? true : notNullBoolean(a[3], d))]
]);

export const parseAlign = createParser([
    ["horizontal|x", enumFactory(["center", "right", "justify"], (v, d)=>v || d || "left")],
    ["vertical|y", enumFactory(["middle", "bottom"], (v, d)=>v || d || "top")],
    ["baseline", enumFactory(["top", "bottom", "middle", "alphabetic", "hanging"], (v, d)=>v || d || "common")]
]);

export const parseGrid = createParser([
    ["horizontal|x", (v, d)=>minZeroNumber(v, d)],
    ["vertical|y", (v, d, a)=>minZeroNumber(v, a[0], d)],
]);

export const parseSpacing = createParser([
    ["line", (v, d)=>notNullNumber(v, d)],
    ["word", (v, d)=>notNullNumber(v, d)],
    ["character|char", (v, d)=>notNullNumber(v, d)]
]);

export const parseColor = createParser([
    ["foreground|fore|font|text|stroke", (v, d)=>notNullString(v, d)],
    ["background|back", (v, d)=>notNullString(v, d)],
    ["opacity", (v, d)=>Math.min(1, minZeroNumber(v, d))]
]);

export const parseBorder = createParser([
    ["weight", (v, d)=>minZeroNumber(v, d)],
    ["color", (v, d)=>notNullString(v, d)],
    ["dash", (v, d)=>minZeroNumber(v, d)],
    ["opacity", (v, d)=>Math.min(1, minZeroNumber(v, d, 1))]
]);

//not defaultable
export const parseCell = createParser([
    ["main|current|target", enumFactory(["min", "max"], (v, d, a)=>v ? v : (minZeroNumber(a[0]) || d || "min"))],
    ["min", (v, d)=>minZeroNumber(v, d)],
    ["max", (v, d, a, r)=>minNumber(r.min, v, d, Infinity) ],
    ["background|back", (v, d)=>notNullString(v, d)],
    ["opacity", (v, d)=>Math.min(1, minZeroNumber(v, d))]
]);

export const parseCells = typize((v, d)=>(typeof v === "number" ? Array(v).fill("auto") : Array.jet.to(v, " ")).map(v=>parseCell(v, d)));
export const parseRows = parseCells;
export const parseColumns = parseCells;

export const parseBorders = typize((v, d)=>{
    if (!Object.jet.is(v)) { v = {all:v}; }

    return solid.all({}, {
        top:parseBorder(v.all || v.top || v.horizontal || v.outer, d?.top),
        right:parseBorder(v.all || v.right || v.vertical || v.outer, d?.right),
        bottom:parseBorder(v.all || v.bottom || v.horizontal || v.outer, d?.bottom),
        left:parseBorder(v.all || v.left || v.vertical || v.outer, d?.left),
        row:parseBorder(v.all || v.row || v.horizontal || v.inner, d?.row),
        column:parseBorder(v.all || v.column || v.vertical || v.inner, d?.column),
    });
});

export const parseProps = typize((v, defs)=>{
    v = v || {};

    const {
        width, height, grid,
        font, margin, padding, border, align, color,
        spacing, link, lineBreak, ellipsis, paging,
    } = v;

    const children = flatArray(v.children || defs?.children);
    const columns = parseColumns(v.columns, defs?.columns);
    const prerows = parseRows(v.rows, defs?.rows);
    if (columns.length && !prerows.length) { prerows.push(parseCell()); }
    const rows = !columns.length ? prerows : fitArray(prerows, Math.ceil(children.length / columns.length));

    return solid.all({}, {
        ...v,
        color:parseColor(color, defs?.color),
        link:notNullString(link, defs?.link),
        lineBreak:notNullBoolean(lineBreak, defs?.lineBreak, true),
        paging:notNullBoolean(paging, defs?.paging, true),
        ellipsis:notNullString(ellipsis, defs?.ellipsis),
        spacing:parseSpacing(spacing, defs?.spacing),
        grid:parseGrid(grid, defs?.grid),
        width:parseSize(width, defs?.width),
        height:parseSize(height, defs?.height),
        font:parseFont(font, defs?.font),
        margin:parseSide(margin, defs?.margin),
        padding:parseSide(padding, defs?.padding),
        border:parseBorders(border, defs?.border),
        align:parseAlign(align, defs?.align),
        rows,
        columns,
        children
    });

})