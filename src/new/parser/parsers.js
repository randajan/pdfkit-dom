import jet from "@randajan/jet-core";
import { notNullNumber, notNullMinZeroNumber, notNullString, minZeroNumber, enumFactory, flatArray, minNumber, typize } from "../../helpers";
import { createParser } from "./parserFactory";

const { solid } = jet.prop;

export const parseBound = createParser([
    ["x", v=>Number.jet.to(v)],
    ["y", v=>Number.jet.to(v)],
    ["width", minZeroNumber],
    ["height", minZeroNumber]
]);

export const parseSize = createParser([
    ["main|current|target", enumFactory(["min", "max"], (v, a)=>v ? v : (minZeroNumber(a[0]) || "min"))],
    ["min", (v, a, r)=>typeof r.main === "number" ? r.main : minZeroNumber(v)],
    ["max", (v, a, r)=>typeof r.main === "number" ? r.main : v == null ? Infinity : minNumber(v, r.min)],
]);

export const parseSide = createParser([
    ["top|horizontal", minZeroNumber],
    ["right|vertical", (v, a)=>minZeroNumber(v != null ? v : a[0])],
    ["bottom|horizontal", (v, a)=>minZeroNumber(v != null ? v : a[0])],
    ["left|vertical", (v, a)=>minZeroNumber(v != null ? v : a[1] != null ? a[1] : a[0])],
]);

export const parseFont = createParser([
    ["size", notNullMinZeroNumber],
    ["family", notNullString],
    ["italic|oblique", enumFactory(["true", "italic", "oblique"], (v, a)=>v ? true : (Number.jet.to(a[2]) || false))],
    ["underline", enumFactory(["true", "underline"], (v, a)=>v ? true : (a[3] != "" && Boolean.jet.to(a[3])))]
]);

export const parseAlign = createParser([
    ["horizontal|x", enumFactory(["center", "right", "justify"], v=>v || "left")],
    ["vertical|y", enumFactory(["middle", "bottom"], v=>v || "top")],
    ["baseline", enumFactory(["top", "bottom", "middle", "alphabetic", "hanging"], v=>v || "common")]
]);

export const parseGrid = createParser([
    ["horizontal|x", minZeroNumber],
    ["vertical|y", (v, a)=>minZeroNumber(v != null ? v : a[0])],
]);

export const parseSpacing = createParser([
    ["line", notNullNumber],
    ["word", notNullNumber],
    ["character|char", notNullNumber]
]);

export const parseColor = createParser([
    ["foreground|fore|font|text|stroke", notNullString],
    ["background|back", notNullString]
]);

export const parseBorder = createParser([
    ["weight", minZeroNumber],
    ["color", notNullString],
    ["dash", notNullMinZeroNumber]
]);

export const parseBorders = typize((blob)=>{
    if (parseBorders.is(blob)) { return blob; }

    const bulk = {};

    if (!Object.jet.is(blob)) { bulk.all = parseBorder(blob); }
    else {
        if (blob.horizontal) { bulk.horizontal = parseBorder(blob.horizontal); }
        if (blob.vertical) { bulk.vertical = parseBorder(blob.vertical); }
        if (blob.inner) { bulk.inner = parseBorder(blob.inner); }
        if (blob.outer) { bulk.outer = parseBorder(blob.outer); }
    }

    return solid.all({}, {
        top:bulk.all || parseBorder(blob.top || bulk.horizontal || bulk.outer),
        right:bulk.all || parseBorder(blob.right || bulk.vertical || bulk.outer),
        bottom:bulk.all || parseBorder(blob.bottom || bulk.horizontal || blob.outer),
        left:bulk.all || parseBorder(blob.left || bulk.vertical || bulk.outer),
        row:bulk.all || parseBorder(blob.row || bulk.horizontal || bulk.inner),
        column:bulk.all || parseBorder(blob.column || bulk.vertical || bulk.inner),
    });
});

export const parseProps = typize((blob={}, defaults={})=>{
    blob = blob || {};

    const {
        width, height, grid,
        font, margin, padding, border, align, color,
        spacing, link, lineBreak, ellipsis, columns, paging,
        children
    } = blob;

    return solid.all({}, {
        ...blob,
        color:parseColor(color),
        link:notNullString(link),
        columns:minZeroNumber(columns) || 1,
        lineBreak:lineBreak == null ? true : Boolean.jet.to(lineBreak),
        paging:paging == null ? true : Boolean.jet.to(paging),
        ellipsis:notNullString(ellipsis),
        spacing:parseSpacing(spacing),
        grid:parseGrid(grid),
        width:parseSize(width),
        height:parseSize(height),
        font:parseFont(font),
        margin:parseSide(margin),
        padding:parseSide(padding),
        border:parseBorders(border),
        align:parseAlign(align),
        children:flatArray(children)
    });

})