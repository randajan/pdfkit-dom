import { drawLine } from "./drawLine";

const drawLines = (isVertical, kit, x, y, length, gap, list, weight, color, dash, opacity)=>{
    if (!Array.isArray(list)) { return; }

    if (!weight || color === "transparent") { return; }

    const gapHalf = gap/2;
    let n = isVertical ? x : y;
    for (let i=0; i<(list.length-1); i++) {
        n += list[i]+gapHalf;
        drawLine(isVertical, kit, isVertical ? n : x, isVertical ? y : n, length, weight, color, dash, opacity);
        n += gapHalf;
    }

}

export const drawHorizontals = (kit, x, y, length, gap, list, weight, color, dash, opacity)=>drawLines(false, kit, x, y, length, gap, list, weight, color, dash, opacity);
export const drawVerticals = (kit, x, y, length, gap, list, weight, color, dash, opacity)=>drawLines(true, kit, x, y, length, gap, list, weight, color, dash, opacity);