import { parseBorder} from "../parser/parsers";
import { drawLine } from "./drawLine";

const drawLines = (isVertical, kit, x, y, length, gap, list, propBorder)=>{
    if (!Array.isArray(list)) { return; }

    const border = parseBorder(propBorder);
    
    for (let i=0; i<list.length; i++) {
        const size = list[i]+gap;
        //if (i>0) { drawLine(isVertical, kit, x, y, length, border); }
        if (isVertical) { x +=size; } else { y += size; }
    }

}

export const drawHorizontals = (kit, x, y, length, gap, list, propBorder)=>drawLines(false, kit, x, y, length, gap, list, propBorder);
export const drawVerticals = (kit, x, y, length, gap, list, propBorder)=>drawLines(true, kit, x, y, length, gap, list, propBorder);