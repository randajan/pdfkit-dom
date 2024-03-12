import { notNullMinZeroNumber } from "../helpers";

export const drawLine = (isVertical, kit, x, y, length, weight, color, dash, opacity)=>{
    
    if (!weight || color === "transparent" || opacity <= 0) { return kit; }

    kit.moveTo(x, y)
        .lineTo(isVertical ? x : x+length, isVertical ? y+length : y)
        .lineWidth(weight);

    if (dash) {
        const space = dash;
        const scale = length/space;
        const count = Math.ceil(scale);
        const isOdd = !!(count%2);
        const rest = length%space;
        const phase = isOdd ? (space-rest)/2 : space-(rest/2);
        kit.dash(space, { space, phase })
    }

    kit.strokeOpacity(opacity).stroke(color);
    kit.undash();
    
}

export const drawHorizontal = (kit, x, y, length, weight, color, dash, opacity)=>{
    return drawLine(false, kit, x, y, length, weight, color, dash, opacity);
}

export const drawVertical = (kit, x, y, length, weight, color, dash, opacity)=>{
    return drawLine(true, kit, x, y, length, weight, color, dash, opacity);
}
