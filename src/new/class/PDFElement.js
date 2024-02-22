import jet from "@randajan/jet-core";
import { flatArray } from "../../helpers";
import { elementPick } from "../elements/elements";
import { parseProps } from "../parser/parsers";
import { computeGaps } from "../../methods/compute";

const { solid, virtual } = jet.prop;

export class PDFElement {

    static is(any) {
        return any instanceof PDFElement;
    }

    static create(tagName, props, ...children) {
        if (!props) { props = {}; }

        if (!children.length) {}
        else if (!props.hasOwnProperty("children")) { props.children = children; }
        else { props.children = [props.children, children]; }

        if (typeof tagName === "function") { return tagName(props); }

        tagName = String.jet.to(tagName);
        if (!tagName) { return flatArray(props.children); }
        return new PDFElement(tagName, props);
    }

    constructor(tagName, props={}) {
        const def = elementPick(tagName);
        props = parseProps(props, def.defaultStyle);

        solid(this, "tagName", tagName );
        virtual(this, "props", _=>({...props}));
        solid(this, "gaps", computeGaps(props));
        solid.all(this, def);

    }
}