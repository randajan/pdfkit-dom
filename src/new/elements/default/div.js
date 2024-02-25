import { computeGaps as cg } from "../../../methods/compute";
import { PDFElement } from "../../class/PDFElement";
import { PDFNode } from "../../class/PDFNode";

export const NodeConstructor = PDFNode;

export const defaultProps = {

};

export const computeGaps = element=>cg(1, 1, element.props);

export const setWidthRaw = (node)=>{
    return node.reduceMax(c=>c.setWidthRaw());
};

export const setWidthContent = (node)=>{
    return node.reduceMax(c=>c.setWidth(node.widthContentLimit));
};
    
export const setHeightRaw = node=>{
    return node.reduceSum(c=>c.setHeightRaw());
};

export const setHeightContent = node=>{
    return node.reduceSum(c=>c.setHeight(node.heightContentLimit))
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
