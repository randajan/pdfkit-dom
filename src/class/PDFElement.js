import jet from "@randajan/jet-core";
import { fitArray, flatArray } from "../helpers";
import { elementPick } from "../elements/elements";
import { parseStyle } from "../parser/parsers";
import { computeAligns, computeGaps } from "../compute";

const { solid, cached, virtual } = jet.prop;

export class PDFElement {

    static is(any) { return any instanceof PDFElement; }

    static async create(tagName, props, ...children) {
        if (!props) { props = {}; }

        if (!children.length) {}
        else if (!props.hasOwnProperty("children")) { props.children = children; }
        else { props.children = [props.children, children]; }

        props.children = await flatArray(props.children, []);

        if (typeof tagName === "function") { return tagName(props); }

        tagName = String.jet.to(tagName);
        if (!tagName) { return props.children; }

        return new PDFElement(tagName, props);
    }

    constructor(tagName, props={}) {
        const def = elementPick(tagName);
        props = Object.jet.to(props);

        solid.all(this, {
            tagName,
            children:props.children
        });

        cached.all(this, {}, {
            props:_=>Object.jet.exclude(props, ["children", "style"]),
            style:_=>parseStyle(Object.jet.to(props.style), def.defaultStyle),
            columns:_=>this.style.columns,
            rows:_=>!this.columns.length ? this.style.rows : fitArray(this.style.rows, Math.ceil(this.children.length / this.columns.length)),
            gaps:_=>computeGaps(this),
            aligns:_=>computeAligns(this),
        });

        solid.all(this, def, false);
    }
}