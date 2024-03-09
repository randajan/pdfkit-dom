import jet from "@randajan/jet-core";
import { flatArray } from "../helpers";
import { elementPick } from "../elements/elements";
import { parseStyle } from "../parser/parsers";
import { computeAligns, computeGaps } from "../compute";

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
        props = Object.jet.to(props);
        props.children = flatArray(props.children);

        solid.all(this, {
            tagName,
            props,
        });

        props.style = Object.jet.to(props.style);
        props.style.childrenCount = props.children.length;

        cached.all(this, {}, {
            style:_=>parseStyle(props.style, def.defaultStyle),
            gaps:_=>computeGaps(this.style),
            aligns:_=>computeAligns(this.style),
        });

        solid.all(this, def, false);
    }
}