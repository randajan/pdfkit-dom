import jet from "@randajan/jet-core";
import { sides } from "../helpers";

const { solid, safe, cached, virtual } = jet.prop;

export const computeGaps = (style = {})=>{
    const { margin, border, padding, grid } = style;
    const gaps = {};

    for (const side of sides) {
        solid(gaps, side, margin[side]+border[side].weight+padding[side]);
    }

    return solid.all(gaps, {
        width:gaps.left+gaps.right,
        height:gaps.top+gaps.bottom,
        row:border.row.weight ? grid.horizontal*2+border.row.weight : grid.horizontal,
        column:border.column.weight ? grid.vertical*2+border.column.weight : grid.vertical
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