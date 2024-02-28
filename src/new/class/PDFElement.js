import jet from "@randajan/jet-core";
import { flatArray } from "../../helpers";
import { elementPick } from "../elements/elements";
import { parseProps } from "../parser/parsers";
import { computeAligns, computeGaps } from "../../methods/compute";
import { PDFNode } from "./PDFNode";

const { solid, cached, virtual } = jet.prop;

export class PDFElement {

    static is(any) { return any instanceof PDFElement; }

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
        props = parseProps(props, def.defaultProps);

        solid.all(this, {
            tagName,
            props,
        });

        cached.all(this, {}, {
            gaps:_=>computeGaps(props),
            aligns:_=>computeAligns(props),
        });

        solid.all(this, def, false);
    }
}