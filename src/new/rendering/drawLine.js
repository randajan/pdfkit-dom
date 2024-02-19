import { parseBorder } from "../parser/parseProps";

const drawLine = (isVertical, kit, x, y, length, propBorder)=>{
    const border = parseBorder(propBorder);
    
    if (!border.weight) { return kit; }

    kit.moveTo(x, y)
        .lineTo(isVertical ? x : x+length, isVertical ? y+length : y)
        .lineWidth(border.weight);

    if (border.dash) {
        const space = border.dash;
        const scale = length/space;
        const count = Math.ceil(scale);
        const isOdd = !!(count%2);
        const rest = length%space;
        const phase = isOdd ? (space-rest)/2 : space-(rest/2);
        kit.dash(space, { space, phase })
    }

    kit.stroke(border.color);
    kit.undash();
    return kit;
}

export const drawHorizontal = (kit, x, y, length, propBorder)=>{
    return drawLine(false, kit, x, y, length, propBorder);
}

export const drawVertical = (kit, x, y, length, propBorder)=>{
    return drawLine(true, kit, x, y, length, propBorder);
}

