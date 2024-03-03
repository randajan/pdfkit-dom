import { fitArray } from "../../helpers";
import { parseCells } from "../parser/parsers";
import { drawBackground } from "./drawBackground";

const drawBackgrounds = (isVertical, kit, x, y, length, gap, stroke, list, propCells)=>{
    if (!Array.isArray(list)) { return; }
    const cells = fitArray(parseCells(propCells), list.length);
    
    for (let i=0; i<list.length; i++) {
        const size = list[i]+gap-stroke;
        drawBackground(kit, x, y, isVertical ? size : length, isVertical ? length : size, cells[i]?.background, cells[i]?.opacity);
        if (isVertical) { x +=size+stroke; } else { y += size+stroke; }
    }

}

export const drawHorizontalRects = (kit, x, y, length, gap, stroke, list, propCells)=>drawBackgrounds(false, kit, x, y, length, gap, stroke, list, propCells);
export const drawVerticalRects = (kit, x, y, length, gap, stroke, list, propCells)=>drawBackgrounds(true, kit, x, y, length, gap, stroke, list, propCells);