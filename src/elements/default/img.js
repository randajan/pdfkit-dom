import SVGtoPDF from "svg-to-pdfkit";
import { PDFNode } from "../../class/PDFNode";
import sizeOf from "image-size";
import fse from "fs-extra";

const _acceptTypes = ["png", "jpg", "svg"];

export const NodeConstructor = PDFNode;

export const defaultStyle = {
    align:"center center"
};

export const validate = node=>{
    const { element } = node;
    const { src } = element.props;
    if (!src) { throw new Error("Image requires src to be set"); }
    if (!element.src) { element.src = sizeOf(src); }
    if (_acceptTypes.includes(element.src.type)) { return; }
    throw new Error("Image src supports only "+ _acceptTypes.join(", "));
}

export const setWidthRaw = (node)=>{
    return node.element.src.width;
};

export const setWidthContent = (node)=>{
    return Math.min(node.widthPadLimit, node.widthRaw);
};
    
export const setHeightRaw = node=>{
    const { width, height } = node.element.src;
    return height * (node.width / width); //scale picture by width
};

export const setHeightContent = node=>{
    return Math.min(node.heightPadLimit, node.heightRaw);
};

export const render = async (node, x, y)=>{
    const { doc, heightPad, widthPad, element } = node;
    const { props:{ src }, style:{ alignHorizontal, alignVertical, objectFit } } = element;

    const opt = {
        width:widthPad,
        height:heightPad,
        align:alignHorizontal,
        valign:alignVertical
    }

    if (objectFit == "cover" || objectFit == "fit") {
        opt[objectFit] = [widthPad, heightPad];
    }

    if (element.src.type === "svg") {
        const svg = Buffer.isBuffer(src) ? src.toString("utf-8") : await fse.readFile(src, "utf-8");    
        return SVGtoPDF(doc.kit, svg, x, y, opt);
    } else {
        return doc.kit.image(src, x, y, opt);
    }

}
