
export const drawBackground = (kit, x, y, width, height, style)=>{
    const { background, backgroundOpacity } = style || {};
    if (!background || background === "transparent" || backgroundOpacity <= 0) { return; }

    const before = kit._fillColor;
    kit.save();
    kit.rect(x, y, width, height).fillOpacity(backgroundOpacity).fill(background);
    kit.restore();
    kit.fillColor(before);

}