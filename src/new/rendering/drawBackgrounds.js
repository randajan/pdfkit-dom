import { fitArray } from "../../helpers";
import { parseCells } from "../parser/parsers";
import { drawBackground } from "./drawBackground";

const drawBackgrounds = (isVertical, kit, x, y, length, gap, list, propCells)=>{
    if (!Array.isArray(list)) { return; }
    const cells = fitArray(parseCells(propCells), list.length);
    
    for (let i=0; i<list.length; i++) {
        const size = list[i];
        drawBackground(kit, x, y, isVertical ? size : length, isVertical ? length : size, cells[i]?.background, cells[i]?.opacity);
        if (isVertical) { x +=size+gap; } else { y += size+gap; }
    }

}

export const drawHorizontalRects = (kit, x, y, length, gap, list, propCells)=>drawBackgrounds(false, kit, x, y, length, gap, list, propCells);
export const drawVerticalRects = (kit, x, y, length, gap, list, propCells)=>drawBackgrounds(true, kit, x, y, length, gap, list, propCells);