import jet from "@randajan/jet-core";
import { map } from "@randajan/jet-core/eachSync";

import { notNullNumber, notNullMinZeroNumber, notNullString, minZeroNumber, enumFactory, minNumber, typize, notNullBoolean, notNull } from "../helpers";
import { createSugarParser, createValidator } from "./parserFactory";

const { solid } = jet.prop;

const parsers = map({
    size: {
        sugar: ["", "min", "max"],
        sugarNS: ["width", "height"],
        validator:[
            ["", enumFactory(["min", "max"], (v, d, g, raw) => v ? v : raw != null ? Math.max(0, raw) : d != null ? d : "min")],
            ["min", (v, d, g) =>Math.min(minZeroNumber(v, d), typeof g[""] == "number" ? g[""] : Infinity)],
            ["max", (v, d, g) => minNumber(Math.max(g.min, typeof g[""] == "number" ? g[""] : 0), v, d, Infinity)],
        ]
    },
    side: {
        sugar: ["top", "right|top", "bottom|top", "left|right"],
        sugarNS: ["padding", "margin"],
        validator:[
            ["top|horizontal", (v, d) => minZeroNumber(v, d)],
            ["right|vertical", (v, d) => minZeroNumber(v, d)],
            ["bottom|horizontal", (v, d) => minZeroNumber(v, d)],
            ["left|vertical", (v, d) => minZeroNumber(v, d)],
        ]
    },
    font: {
        sugar: ["size", "family", "italic", "underline"],
        validator:[
            ["size", (v, d) => notNullMinZeroNumber(v, d)],
            ["family", (v, d) => notNullString(v, d)],
            ["italic|oblique", enumFactory(["true", "italic", "oblique"], (v, d, g, raw) => v ? true : notNull(notNullMinZeroNumber(raw), d))],
            ["underline", enumFactory(["true", "underline"], (v, d, g, raw) => v ? true : notNullBoolean(raw, d))]
        ]
    },
    align: {
        sugar: ["horizontal", "vertical", "baseline"],
        validator:[
            ["horizontal|x", enumFactory(["center", "middle", "right", "justify"], (v, d) => v ? v !== "middle" ? v : "center" : (d || "left"))],
            ["vertical|y", enumFactory(["center", "middle", "bottom"], (v, d) => v ? v !== "middle" ? v : "center" : (d || "top"))],
            ["baseline", enumFactory(["top", "bottom", "middle", "alphabetic", "hanging"], (v, d) => v || d || "common")]
        ]
    },
    grid: {
        sugar: ["horizontal", "vertical|horizontal"],
        validator:[
            ["horizontal|x", (v, d) => minZeroNumber(v, d)],
            ["vertical|y", (v, d) => minZeroNumber(v, d)],
        ]
    },
    spacing: {
        sugar: ["line", "word", "character"],
        validator:[
            ["line", (v, d) => notNullNumber(v, d)],
            ["word", (v, d) => notNullNumber(v, d)],
            ["character|char", (v, d) => notNullNumber(v, d)]
        ]
    },
    color: {
        sugar: ["", "opacity"],
        sugarNS: [ "color", "background", "bg" ],
        validator:[
            ["", (v, d) => notNullString(v, d)],
            ["opacity", (v, d) => Math.min(1, notNullMinZeroNumber(v, d, 1))]
        ],
        validatorNS:[
            "color",
            ["background", "bg"]
        ]
    },
    border: {
        sugar: ["weight", "color", "dash", "opacity"],
        sugarNS: [
            "border",
            "borderInner",
            "borderOuter",
            "borderVertical",
            "borderHorizontal",
            "borderTop",
            "borderRight",
            "borderBottom",
            "borderLeft",
            "borderRow",
            "borderColumn"
        ],
        validator:[
            ["weight", (v, d) => minZeroNumber(v, d)],
            ["color", (v, d) => notNullString(v, d)],
            ["dash", (v, d) => minZeroNumber(v, d)],
            ["opacity", (v, d) => Math.min(1, notNullMinZeroNumber(v, d, 1))]
        ],
        validatorNS:[
            ["borderTop", "borderHorizontal", "borderOuter", "border"],
            ["borderRight", "borderVertical", "borderOuter", "border"],
            ["borderBottom", "borderHorizontal", "borderOuter", "border"],
            ["borderLeft", "borderVertical", "borderOuter", "border"],
            ["borderRow", "borderHorizontal", "borderInner", "border"],
            ["borderColumn", "borderVertical", "borderInner", "border"],
        ]
    },
}, (v, ctx) => {
    v.sugar = createSugarParser(v.sugar);
    if (!v.sugarNS) { v.sugarNS = [ctx.key]; }
    v.validator = createValidator(v.validator);
    if (!v.validatorNS) { v.validatorNS = v.sugarNS; }
    return v;
});

const parseObjectFit = enumFactory(["stretch", "fit", "cover"], (v, d) => v || d || "fit");

export const parseCell = typize((style, defs)=>{
    const { size, font, color } = parsers;

    const input = size.sugar("size", Object.jet.is(style) ? {...style} : style);
    //font.sugar("font", input);
    //color.sugar("color", input);
    color.sugar("background", input);
    color.sugar("bg", input);

    const output = {};
    size.validator("size", output, input, defs);
    //font.validator("font", output, input, defs);
    //color.validator("color", output, input, defs);
    color.validator(["background", "bg"], output, input, defs);
    return output;
});

const parseCells = typize((cells, defs)=>{
    cells = typeof cells === "number" ? Array(cells).fill({}) : Array.jet.to(cells, " ");
    const cl = cells.length, dl = defs?.length || 0;
    const res = [];
    for (let i=0; (i<cl || i<dl); i++) {
        res[i] = parseCell(
            cl ? cells[Number.jet.period(i, 0, cl)] : undefined,
            dl ? defs[Number.jet.period(i, 0, dl)] : undefined
        )
    }
    return res;
});

export const parseStyle = typize((style, defs) => {
    const input = { ...style };

    const { objectFit, link, lineBreak, ellipsis, paging, rows, columns } = input;

    const output = {};
    for (const p in parsers) {
        const { sugar, sugarNS, validator, validatorNS } = parsers[p];
        for (const ns of sugarNS) { sugar(ns, input); } //expand all known sugars
        for (const ns of validatorNS) { validator(ns, output, input, defs); }
    }

    return solid.all(output, {
        link: notNullString(link, defs?.link),
        lineBreak: notNullBoolean(lineBreak, defs?.lineBreak, true),
        paging: notNullBoolean(paging, defs?.paging, true),
        ellipsis: notNullString(ellipsis, defs?.ellipsis),
        objectFit: parseObjectFit(objectFit, defs?.objectFit),
        rows:parseCells(rows, defs?.rows),
        columns:parseCells(columns, defs?.columns)
    });
});