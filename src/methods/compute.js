import jet from "@randajan/jet-core";
import { sides } from "../helpers";

const { solid, safe, cached, virtual } = jet.prop;

export const computeGaps = (style = {} )=>{
    const { rows, columns, margin, border, padding, grid:{ horizontal, vertical } } = style;
    const gaps = {};

    for (const side of sides) {
        solid(gaps, side, margin[side]+border[side].weight+padding[side]);
    }

    const row = border.row.weight ? horizontal*2+border.row.weight : horizontal;
    const column = border.column.weight ? vertical*2+border.column.weight : vertical;

    const gapsRow = Math.max(0, row*Math.max(1, rows.length)-border.row.weight);
    const gapsColumn = Math.max(0, column*Math.max(1, columns.length)-border.row.weight);

    return solid.all(gaps, {
        width:gaps.left+gaps.right+gapsColumn,
        height:gaps.top+gaps.bottom+gapsRow,
        row, column
    });
}

export const computeAligns = (style = {})=>{
    const { horizontal, vertical, baseline } = style.align;
    return solid.all({}, {
        horizontal:horizontal === "right" ? 1 : horizontal === "center" ? .5 : 0,
        vertical:vertical === "bottom" ? 1 : vertical === "middle" ? .5 : 0,
        baseline:baseline === "bottom" ? 1 : baseline === "middle" ? .5 : 0,
    })
}

export const computeContent = (raw, forced, free, gap, { main, min, max })=>{
    let c;
    
    if (forced != null) { c = forced-gap; } else {
        c = main === "max" ? Infinity : (main === "min" || main === "auto") ? raw : main-gap;
        c = Number.jet.frame(c, min, max);
    }
    return Math.min(free-gap, c);
}