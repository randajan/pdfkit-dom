import { sum, vault } from "../../../helpers";
import { getSizing } from "../../sizing/getSizing";
import { computeGaps as cg } from "../../../methods/compute";
import { PDFNode } from "../../class/PDFNode";

export const NodeConstructor = PDFNode;

const getChild = (node, rowId, colId)=>node.getChildren(Number(rowId)*node.element.props.columns.length + Number(colId));
const getCid = (node, childIndex)=>childIndex % node.element.props.columns.length;
const getRid = (node, childIndex)=>Math.floor(childIndex / node.element.props.columns.length);
const getCdr = (node, childIndex)=>[ getRid(node, childIndex), getCid(node, childIndex) ];


export const defaultProps = {
    border:"1 black"
};

export const validate = node=>{
    const { columns } = node.element.props;
    
    if (columns.length) { return; }
    throw Error(`Grid requires columns to be set`);
}

export const setWidthRaw = async (node)=>{
    const total = [];

    await node.forEach(async (child, index)=>{
        const rid = getRid(node, index);
        if (!total[rid]) { total[rid] = 0; }
        total[rid] = (total[rid] || 0) + await child.setWidthRaw();
    });

    return Math.max(...total);
};

export const setWidthContent = async (node)=>{
    const { width, rows, columns } = node.element.props;

    const sizing = getSizing(node.widthContentLimit, width, columns, cid=>{
        return rows.reduce((v, r, rid)=>Math.max(v, getChild(node, rid, cid)?.widthRaw), 0);
    });

    await node.forEach(async (child, index)=>{
        const cid = getCid(node, index);
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
    const { height, rows, columns } = node.element.props;

    const total = [];

    const sizing = getSizing(node.heightContentLimit, height, rows, rid=>{
        return columns.reduce((v, r, cid)=>Math.max(v, getChild(node, rid, cid)?.heightRaw), 0);
    });

    await node.forEach(async (child, index)=>{
        const rid = getRid(node, index);
        await child.setHeight(sizing[rid]);
    });

    node.rows = sizing;

    return sum(...sizing);
};

export const render = (node, x, y)=>{
    const { columns, rows, element:{ gaps, aligns } } = node;
    const gx = x;

    return node.forEach(async (c, index)=>{
        const [rid, cid] = getCdr(node, index);

        if (cid !== 0) {
            x += columns[cid-1] + gaps.column;
        }
        else if (rid !== 0) {
            y += rows[rid-1] + gaps.row;
            x = gx;
        }
        
        await c.render(x + aligns.horizontal*(columns[cid] - c.width), y + aligns.vertical*(rows[rid] - c.height));
        
    });
}
