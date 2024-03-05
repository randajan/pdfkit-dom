import { parseColor } from "../parser/parsers";

export const drawBackground = (kit, x, y, width, height, fillColor, opacity)=>{
    if (!fillColor || fillColor === "transparent" || opacity <= 0) { return; }

    const before = kit._fillColor;
    kit.save();
    kit.rect(x, y, width, height).fillOpacity(opacity == null ? 1 : opacity).fill(fillColor);
    kit.restore();
    kit.fillColor(before);

}