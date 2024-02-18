import { parseStyle } from "../../methods/styleParser";
import { drawHorizontal, drawVertical } from "./drawLine";

export const drawBorders = (kit, x, y, width, height, style)=>{
    const { margin, border, color } = parseStyle(style);

    x += margin.left;
    y += margin.right;
    width -= (margin.left + margin.right);
    height -= (margin.top + margin.bottom);

    const fill = color.background;
    if (fill && fill !== "transparent") {
        const color = kit._fillColor;
        kit.save();
        kit.rect(x, y, width, height).fill(fill);
        kit.restore();
        kit.fillColor(color);
    }

    const w = {};
    for (let i in border) { w[i] = border[i].weight/2; }

    x -= w.left; y -= w.top;
    width += w.left+w.right;
    height += w.top+w.bottom;

    drawHorizontal(kit, x, y, width, border.top);
    drawVertical(kit, x+width, y, height, border.right);
    drawVertical(kit, x, y, height, border.left);
    drawHorizontal(kit, x, y+height, width, border.bottom);

    return kit;
}