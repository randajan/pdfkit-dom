import { drawBackground } from "./drawBackground";

const drawBackgrounds = (isVertical, kit, x, y, length, gap, stroke, list, cells)=>{
    if (!Array.isArray(list)) { return; }
    
    for (let i=0; i<list.length; i++) {
        const size = list[i]+gap-stroke;
        drawBackground(kit, x, y, isVertical ? size : length, isVertical ? length : size, cells[i]);
        const n = size+stroke;
        if (isVertical) { x += n } else { y += n; }
    }

}

export const drawHorizontalRects = (kit, x, y, length, gap, stroke, list, cells)=>drawBackgrounds(false, kit, x, y, length, gap, stroke, list, cells);
export const drawVerticalRects = (kit, x, y, length, gap, stroke, list, cells)=>drawBackgrounds(true, kit, x, y, length, gap, stroke, list, cells);