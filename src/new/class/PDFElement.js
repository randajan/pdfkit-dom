import jet from "@randajan/jet-core";
import { flatArray } from "../../helpers";
import { elementPick } from "../elements";
import { parseProps } from "../parser/parseProps";
import { computeGaps } from "../../methods/compute";

const { solid, virtual } = jet.prop;

export class PDFElement {

    static is(any) {
        return any instanceof PDFElement;
    }

    static create(tagName, props, ...children) {
        if (!props) { props = {}; }

        if (!props.hasOwnProperty("children")) { props.children = children; }
        else { props.children = [props.children, children]; }

        if (typeof tagName === "function") { return tagName(parseProps(props)); }

        tagName = String.jet.to(tagName);
        if (!tagName) { return flatArray(props.children); }
        return new PDFElement(tagName, props);
    }

    constructor(tagName, props={}) {
        props = parseProps(props);

        solid(this, "tagName", tagName );
        virtual(this, "props", _=>({...props}));
        solid(this, "gaps", computeGaps(props));
        solid.all(this, elementPick(tagName));

    }
}