import { parseBorders } from "../parser/parsers";
import { drawHorizontal, drawVertical } from "./drawLine";

export const drawBorders = (kit, x, y, width, height, propBorders)=>{
    const border = parseBorders(propBorders);

    const w = {};
    for (let i in border) { w[i] = border[i].weight/2; }

    x += w.left;
    y += w.top;

    width -= w.left+w.right;
    height -= w.top+w.bottom;

    drawHorizontal(kit, x, y, width, border.top);
    drawVertical(kit, x+width, y, height, border.right);
    drawVertical(kit, x, y, height, border.left);
    drawHorizontal(kit, x, y+height, width, border.bottom);

}