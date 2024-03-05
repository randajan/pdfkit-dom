import { PDFNode } from "../../class/PDFNode";

export const NodeConstructor = PDFNode;

export const defaultProps = {

};

export const setWidthRaw = (node)=>{
    return node.reduceMax(c=>c.setWidthRaw());
};

export const setWidthContent = (node)=>{
    return node.reduceMax(c=>c.setWidth(node.widthPadLimit));
};
    
export const setHeightRaw = node=>{
    return node.reduceSum(c=>c.setHeightRaw());
};

export const setHeightContent = node=>{
    return node.reduceSum(c=>c.setHeight(node.heightPadLimit))
};

export const render = async (node, x, y)=>{
    const { heightPad, heightContent, widthPad, element:{ gaps, aligns } } = node;

    y += aligns.vertical*(heightPad - heightContent);

    return node.forEach(async c=>{
        await c.render(x + aligns.horizontal*(widthPad - c.width), y);
        y = y+c.height;
    });
}
