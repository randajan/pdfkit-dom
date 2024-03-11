import jet from "@randajan/jet-core";
import { notNullNumber, notNullMinZeroNumber, notNullString, minZeroNumber, enumFactory, flatArray, minNumber, typize, notNullBoolean, notNull, fitArray, camelCase } from "../helpers";
import { createParser, createSugarParser, createValidator } from "./parserFactory";

const { solid } = jet.prop;

//not defaultable
const parseCell = createParser([
    ["main|current|target", enumFactory(["min", "max"], (v, d, a) => v ? v : (minZeroNumber(a[0]) || d || "min"))],
    ["min", (v, d) => minZeroNumber(v, d)],
    ["max", (v, d, a, r) => minNumber(r.min, v, d, Infinity)],
    ["background|back", (v, d) => notNullString(v, d)],
    ["opacity", (v, d) => Math.min(1, notNullMinZeroNumber(v, d, 1))]
]);

const parseObjectFit = enumFactory(["stretch", "fit", "cover"], (v, d) => v || d || "fit");
const parseCells = typize((v, d) => (typeof v === "number" ? Array(v).fill("auto") : Array.jet.to(v, " ")).map(v => parseCell(v, d)));
const parseRows = parseCells;
const parseColumns = parseCells;

const parsers = jet.map({
    size: {
        sugar: ["", "min", "max"],
        sugarNS: ["width", "height"],
        validator:[
            ["", enumFactory(["min", "max"], (v, d, g, raw) => v ? v : (minZeroNumber(raw) || d || "min"))],
            ["min", (v, d) => minZeroNumber(v, d)],
            ["max", (v, d, g) => minNumber(g.min, v, d, Infinity)],
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
        sugar: ["foreground", "background", "opacity"],
        validator:[
            ["foreground|fore|font|text|stroke", (v, d) => notNullString(v, d)],
            ["background|back|bg", (v, d) => notNullString(v, d)],
            ["opacity", (v, d) => Math.min(1, notNullMinZeroNumber(v, d, 1))]
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
            ["borderRow", "borderHorizontal", "bordeInner", "border"],
            ["borderColumn", "borderVertical", "bordeInner", "border"],
        ]
    },
}, (v, n) => {
    v.sugar = createSugarParser(v.sugar);
    if (!v.sugarNS) { v.sugarNS = [n]; }
    v.validator = createValidator(v.validator);
    if (!v.validatorNS) { v.validatorNS = v.sugarNS; }
    return v;
});


export const parseStyle = typize((style, defs) => {
    const input = { ...style };

    const { objectFit, link, lineBreak, ellipsis, paging, childrenCount } = input;

    const output = {};
    for (const p in parsers) {
        const { sugar, sugarNS, validator, validatorNS } = parsers[p];
        for (const ns of sugarNS) { sugar(ns, input); } //expand all known sugars
        for (const ns of validatorNS) { validator(ns, output, input, defs); }
    }

    const columns = parseColumns(input.columns, defs?.columns);
    const prerows = parseRows(input.rows, defs?.rows);
    if (columns.length && !prerows.length) { prerows.push(parseCell()); }
    const rows = !columns.length ? prerows : fitArray(prerows, Math.ceil(childrenCount / columns.length));

    return solid.all(output, {
        link: notNullString(link, defs?.link),
        lineBreak: notNullBoolean(lineBreak, defs?.lineBreak, true),
        paging: notNullBoolean(paging, defs?.paging, true),
        ellipsis: notNullString(ellipsis, defs?.ellipsis),
        objectFit: parseObjectFit(objectFit, defs?.objectFit),
        rows,
        columns
    });
})

console.log(parseStyle({  }, { borderOuter:"1 red" }));