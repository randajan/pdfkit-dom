import { sum, vault } from "../../../helpers";
import { getSizing } from "../../sizing/Competitive";
import { computeGaps as cg } from "../../../methods/compute";
import { PDFNode } from "../../class/PDFNode";

export const NodeConstructor = PDFNode;


const getChild = (node, rowId, colId)=>node.getChildren(Number(rowId)*node.element.props.columns.length + Number(colId));
const getCid = (node, childIndex)=>childIndex % node.element.props.columns.length;
const getRid = (node, childIndex)=>Math.floor(childIndex / node.element.props.columns.length);
const getCdr = (node, childIndex)=>[ getRid(node, childIndex), getCid(node, childIndex) ];


export const defaultProps = {
    border:"1 black",
    width:"min"
};


export const computeGaps = element=>cg(1, 1, element.props);

export const validate = node=>{
    const { childCount, element } = node;
    const { rows, columns } = element.props;
    const expectedChild = rows.length*columns.length;
    if (childCount === expectedChild) { return; }
    throw Error(`Grid incorrect child count ${childCount}/${expectedChild}`);
}


export const setWidthRaw = async (node)=>{
    const total = [];

    await node.forEach(async (child, index)=>{
        const rid = getRid(node, index);
        if (!total[rid]) { total[rid] = 0; }
        total[rid] += await child.setWidthRaw();
    });

    return Math.max(...total);
};

export const setWidthContent = async (node)=>{
    const { rows, columns } = node.element.props;

    const sizing = getSizing(node.widthContentLimit, columns, cid=>{
        return rows.reduce((v, r, rid)=>v + getChild(node, rid, cid).widthRaw, 0);
    });

    await node.forEach(async (child, index)=>{
        const [rid, cid] = getCdr(node, index);
        await child.setWidth(sizing[cid]);
    });

    node.columns = sizing;

    return sum(...sizing);
};
    
export const setHeightRaw = async node=>{
    const total = [];

    await node.forEach(async (child, index)=>{
        const rid = getRid(node, index);
        total[rid] = Math.max(total[rid] || 0, await child.setHeightRaw());
    });

    return sum(...total);
};

export const setHeightContent = async node=>{
    const total = [];

    await node.forEach(async (child, index)=>{
        const rid = getRid(node, index);
        total[rid] = Math.max(total[rid] || 0, await child.setHeight(node.heightContentLimit));
    });

    node.rows = total;

    return sum(...total);
};

export const render = (node, x, y)=>{
    const { gaps, props:{ border } } = node.element;
    // if (width < widthLimit) {
    //     if (align.horizontal === "center") { x += (widthLimit - width) / 2; }
    //     else if (align.horizontal === "right") { x += widthLimit - width; }
    // }

    // if (height < heightLimit) {
    //     if (align.vertical === "middle") { y += (heightLimit - height) / 2; }
    //     else if (align.vertical === "bottom") { y += heightLimit - height; }
    // }

    const gx = x;

    return node.forEach(async (c, index)=>{
        const [rid, cid] = getCdr(node, index);

        if (cid !== 0) {
            x += node.columns[cid-1] + gaps.column;
        }
        else if (rid !== 0) {
            y += node.rows[rid-1] + gaps.row;
            x = gx;
        }

        await c.render(x, y);
        
    });
}
