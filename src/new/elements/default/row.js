
export const setWidthRaw = (node)=>{
    return node.reduce(async (w, c)=>Math.max(w, await c.setWidthRaw()), 0);
};

export const setWidthContent = (node)=>{
    return node.reduce(async (w, c)=>Math.max(w, await c.setWidth(node.widthContentLimit)), 0);
};
    
export const setHeightRaw = node=>{
    return node.reduce(async (h, c)=>h + await c.setHeightRaw(), 0);
};

export const setHeightContent = node=>{
    return node.reduce(async (h, c)=>h + await c.setHeight(node.heightContentLimit), 0);
};


    // boundWidth:async (node, widthLimit)=>{
    //     const s = node.element.props;

    //     let width;
    //     if (typeof s.width.main === "number") { width = s.width; }
    //     else if (s.width.main === "max") { width = widthLimit; }
    //     else { width = node.widthRaw; }

    //     width = Math.min(widthLimit, Number.jet.frame(width, s.width.min, s.width.max));

    //     await node.forEach(c=>c.setWidth(width));

    //     return width;
    // },
    // boundHeight:async (node, widthLimit, heightLimit)=>{
    //     const s = node.element.props;

    //     let height;
    //     if (typeof s.height.main === "number") { height = s.height; }
    //     else if (s.height.main === "max") { height = heightLimit; }
    //     else { height = node.heightRaw; }

    //     height = Math.min(heightLimit, Number.jet.frame(height, s.height.min, s.height.max));

    //     await node.forEach(c=>c.setHeight(height));

    //     return height;
    // },
export const render = (node, x, y)=>{

    // if (width < widthLimit) {
    //     if (align.horizontal === "center") { x += (widthLimit - width) / 2; }
    //     else if (align.horizontal === "right") { x += widthLimit - width; }
    // }

    // if (height < heightLimit) {
    //     if (align.vertical === "middle") { y += (heightLimit - height) / 2; }
    //     else if (align.vertical === "bottom") { y += heightLimit - height; }
    // }

    return node.forEach(async c=>{
        await c.render(x, y);
        y = y+c.height;
    });
}
