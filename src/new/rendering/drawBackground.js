import { parseColor } from "../parser/parsers";

export const drawBackground = (kit, x, y, width, height, propColor)=>{
    const { background } = parseColor(propColor);

    if (!background || background === "transparent") { return kit; }

    const before = kit._fillColor;
    kit.save();
    kit.rect(x, y, width, height).fill(background);
    kit.restore();
    kit.fillColor(before);

}