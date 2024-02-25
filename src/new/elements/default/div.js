import { minNumber, minZeroNumber } from "../../../helpers";
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

export const render = (node, x, y)=>{
    const { height, heightRaw, widthContent, element:{ gaps, aligns } } = node;

    y += aligns.vertical*(height - heightRaw);

    return node.forEach(async c=>{
        await c.render(x + aligns.horizontal*(widthContent - c.width), y);
        y = y+c.height;
    });
}
