import { parseBorder, parseBorders } from "./styleParser";

export const drawSheerLine = (isVertical, doc, x, y, length, style)=>{
    style = parseBorder(style);
    
    if (!style.weight) { return doc; }

    doc.moveTo(x, y)
        .lineTo(isVertical ? x : x+length, isVertical ? y+length : y)
        .lineWidth(style.weight);

    if (style.dash) {
        const space = style.dash;
        const scale = length/space;
        const count = Math.ceil(scale);
        const isOdd = !!(count%2);
        const rest = length%space;
        const phase = isOdd ? (space-rest)/2 : space-(rest/2);
        doc.dash(space, { space, phase })
    }

    doc.stroke(style.color);
    return doc.undash();
}