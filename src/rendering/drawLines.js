import { drawLine } from "./drawLine";

const drawLines = (isVertical, kit, x, y, length, gap, list, border)=>{
    if (!Array.isArray(list)) { return; }

    if (!border.weight || border.color === "transparent") { return; }

    const gapHalf = gap/2;
    let n = isVertical ? x : y;
    for (let i=0; i<(list.length-1); i++) {
        n += list[i]+gapHalf;
        drawLine(isVertical, kit, isVertical ? n : x, isVertical ? y : n, length, border);
        n += gapHalf;
    }

}

export const drawHorizontals = (kit, x, y, length, gap, list, propBorder)=>drawLines(false, kit, x, y, length, gap, list, propBorder);
export const drawVerticals = (kit, x, y, length, gap, list, propBorder)=>drawLines(true, kit, x, y, length, gap, list, propBorder);