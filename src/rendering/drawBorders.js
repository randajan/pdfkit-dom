import { drawHorizontal, drawVertical } from "./drawLine";

export const drawBorders = (kit, x, y, width, height, style)=>{
    const {
        borderTopWeight, borderRightWeight, borderBottomWeight, borderLeftWeight,
        borderTopColor, borderRightColor, borderBottomColor, borderLeftColor,
        borderTopDash, borderRightDash, borderBottomDash, borderLeftDash,
        borderTopOpacity, borderRightOpacity, borderBottomOpacity, borderLeftOpacity
    } = style || {};

    x -= borderLeftWeight/2;
    y -= borderTopWeight/2;

    width += (borderLeftWeight+borderRightWeight)/2;
    height += (borderTopWeight+borderBottomWeight)/2;

    drawHorizontal(kit, x, y, width, borderTopWeight, borderTopColor, borderTopDash, borderTopOpacity);
    drawVertical(kit, x+width, y, height, borderRightWeight, borderRightColor, borderRightDash, borderRightOpacity);
    drawVertical(kit, x, y, height, borderLeftWeight, borderLeftColor, borderLeftDash, borderLeftOpacity);
    drawHorizontal(kit, x, y+height, width, borderBottomWeight, borderBottomColor, borderBottomDash, borderBottomOpacity);

}