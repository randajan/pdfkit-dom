import jet from "@randajan/jet-core";
import { fitArray, flatArray } from "../helpers";
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

        solid.all(this, {
            tagName,
        });

        //if (columns.length && !prerows.length) { prerows.push(parseCell()); }
        //const rows = !columns.length ? prerows : fitArray(prerows, Math.ceil(childrenCount / columns.length));

        cached.all(this, {}, {
            props:_=>Object.jet.exclude(props, ["children", "style"]),
            children:_=>flatArray(props.children),
            style:_=>parseStyle(Object.jet.to(props.style), def.defaultStyle),
            columns:_=>this.style.columns,
            rows:_=>!this.columns.length ? this.style.rows : fitArray(this.style.rows, Math.ceil(this.children.length / this.columns.length)),
            gaps:_=>computeGaps(this),
            aligns:_=>computeAligns(this),
        });

        solid.all(this, def, false);
    }
}