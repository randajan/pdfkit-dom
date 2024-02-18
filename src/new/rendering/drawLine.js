import { parseBorder } from "../../methods/styleParser";

const drawLine = (isVertical, kit, x, y, length, styleBorder)=>{
    const style = parseBorder(styleBorder);
    
    if (!style.weight) { return kit; }

    kit.moveTo(x, y)
        .lineTo(isVertical ? x : x+length, isVertical ? y+length : y)
        .lineWidth(style.weight);

    if (style.dash) {
        const space = style.dash;
        const scale = length/space;
        const count = Math.ceil(scale);
        const isOdd = !!(count%2);
        const rest = length%space;
        const phase = isOdd ? (space-rest)/2 : space-(rest/2);
        kit.dash(space, { space, phase })
    }

    kit.stroke(style.color);
    kit.undash();
    return kit;
}

export const drawHorizontal = (kit, x, y, length, styleBorder)=>{
    return drawLine(false, kit, x, y, length, styleBorder);
}

export const drawVertical = (kit, x, y, length, styleBorder)=>{
    return drawLine(true, kit, x, y, length, styleBorder);
}

