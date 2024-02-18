import jet from "@randajan/jet-core";
import { flatArray } from "../../helpers";
import { elementPick } from "../elements";
import { parseStyle } from "../../methods/styleParser";
import { computeGaps } from "../../methods/compute";

const { solid, virtual } = jet.prop;

export class PDFElement {

    static is(any) {
        return any instanceof PDFElement;
    }

    static create(tagName, attributes, ...children) {
        const props = parseStyle(attributes);
        props.children = children;

        if (typeof tagName === "function") { return tagName(props); }
        tagName = String.jet.to(tagName);
        if (!tagName) { return children; }
        return new PDFElement(tagName, props);
    }

    constructor(tagName, props={}) {
        props.children = flatArray(props.children);

        solid(this, "tagName", tagName );
        virtual(this, "props", _=>({...props}));
        solid(this, "gaps", computeGaps(props));
        solid.all(this, elementPick(tagName));

    }
}