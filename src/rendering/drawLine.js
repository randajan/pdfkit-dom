import { notNullMinZeroNumber } from "../helpers";

export const drawLine = (isVertical, kit, x, y, length, border)=>{
    
    if (!border.weight || border.color === "transparent" || border.opacity <= 0) { return kit; }

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

    kit.strokeOpacity(border.opacity).stroke(border.color);
    kit.undash();
    
}

export const drawHorizontal = (kit, x, y, length, border)=>{
    return drawLine(false, kit, x, y, length, border);
}

export const drawVertical = (kit, x, y, length, border)=>{
    return drawLine(true, kit, x, y, length, border);
}
