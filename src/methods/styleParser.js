import jet from "@randajan/jet-core";
import { notNullNumber, notNullMinZeroNumber, notNullString, minZeroNumber, enumFactory } from "../helpers";
import { setStyleParser } from "./styleParserFactory";

const { solid } = jet.prop;


export const parseSize = setStyleParser("styleSizes", [
    ["main|current|target", enumFactory(["min", "max"], (v, a)=>v ? v : (Math.max(0, Number.jet.to(a[0])) || "auto"))],
    ["min", minZeroNumber],
    ["max", (v, a, r)=>{ 
        if (v == null) { return Infinity; }
        return Math.max(r.min, Number.jet.to(v)) || Infinity;
    }],
]);

export const parseSide = setStyleParser("styleSide", [
    ["top|horizontal", minZeroNumber],
    ["right|vertical", (v, a)=>minZeroNumber(v != null ? v : a[0])],
    ["bottom|horizontal", (v, a)=>minZeroNumber(v != null ? v : a[0])],
    ["left|vertical", (v, a)=>minZeroNumber(v != null ? v : a[1] != null ? a[1] : a[0])],
]);

export const parseFont = setStyleParser("styleFont", [
    ["size", notNullMinZeroNumber],
    ["family", notNullString],
    ["italic|oblique", enumFactory(["true", "italic", "oblique"], (v, a)=>v ? true : (Number.jet.to(a[2]) || false))],
    ["underline", enumFactory(["true", "underline"], (v, a)=>v ? true : (a[3] != "" && Boolean.jet.to(a[3])))]
]);

export const parseAlign = setStyleParser("styleAlign", [
    ["horizontal|x", enumFactory(["center", "right", "justify"], v=>v || "left")],
    ["vertical|y", enumFactory(["middle", "bottom"], v=>v || "top")],
    ["baseline", enumFactory(["top", "bottom", "middle", "alphabetic", "hanging"], v=>v || "common")]
]);

export const parseGrid = setStyleParser("styleGrid", [
    ["horizontal|x", minZeroNumber],
    ["vertical|y", (v, a)=>minZeroNumber(v != null ? v : a[0])],
]);

export const parseSpacing = setStyleParser("styleSpacing", [
    ["line", notNullNumber],
    ["word", notNullNumber],
    ["character|char", notNullNumber]
]);

export const parseColor = setStyleParser("styleColor", [
    ["foreground|fore|font|text|stroke", notNullString],
    ["background|back", notNullString]
]);

export const parseBorder = setStyleParser("styleBorder", [
    ["weight", minZeroNumber],
    ["color", notNullString],
    ["dash", notNullMinZeroNumber]
]);

const $borders = Symbol("styleBorders");
export const parseBorders = (blob)=>{
    if (blob && blob.$$kind === $borders) { return blob; }

    const bulk = {};

    if (!Object.jet.is(blob)) { bulk.all = parseBorder(blob); }
    else {
        if (blob.horizontal) { bulk.horizontal = parseBorder(blob.horizontal); }
        if (blob.vertical) { bulk.vertical = parseBorder(blob.vertical); }
        if (blob.inner) { bulk.inner = parseBorder(blob.inner); }
        if (blob.outer) { bulk.outer = parseBorder(blob.outer); }
    }

    return solid.all(solid({}, "$$kind", $borders, false), {
        top:bulk.all || parseBorder(blob.top || bulk.horizontal || bulk.outer),
        right:bulk.all || parseBorder(blob.right || bulk.vertical || bulk.outer),
        bottom:bulk.all || parseBorder(blob.bottom || bulk.horizontal || blob.outer),
        left:bulk.all || parseBorder(blob.left || bulk.vertical || bulk.outer),
        row:bulk.all || parseBorder(blob.row || bulk.horizontal || bulk.inner),
        column:bulk.all || parseBorder(blob.column || bulk.vertical || bulk.inner),
    });
}

const $style = Symbol("style");
export const parseStyle = (blob={})=>{
    if (blob && blob.$$kind === $style) { return blob; }

    const {
        width, height, grid,
        font, margin, padding, border, align, color,
        spacing, link, lineBreak, ellipsis, columns, paging
    } = blob;

    return solid.all(solid({}, "$$kind", $style, false), {
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
        align:parseAlign(align)
    });

}