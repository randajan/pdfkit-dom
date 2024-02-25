import { parseBorder } from "../parser/parsers";
import { drawLine } from "./drawLine";

const drawLines = (isVertical, kit, x, y, length, gap, list, propBorder)=>{
    const border = parseBorder(propBorder);

    if (!Array.isArray(list) || border.color === "transparent") { return; }

    let n = isVertical ? x : y;
    for (let i=1; i<list.length; i++) {
        n += list[i-1] + gap;
        if (isVertical) { x = n-gap/2; } else { y = n-gap/2; }
        drawLine(isVertical, kit, x, y, length, border);
    }

}

export const drawHorizontals = (kit, x, y, length, gap, list, propBorder)=>drawLines(false, kit, x, y, length, gap, list, propBorder);
export const drawVerticals = (kit, x, y, length, gap, list, propBorder)=>drawLines(true, kit, x, y, length, gap, list, propBorder);