import PDFElement from "../class/Element";
import SVGtoPDF from "svg-to-pdfkit";

import jet from "@randajan/jet-core";

const { solid, cached } = jet.prop;

const _viewBoxRegex = /<svg [\S\s]*viewBox=["'](-?[\d\.]+[, ]+-?[\d\.]+[, ][\d\.]+[, ][\d\.]+)["']/;

export class PDFElementSVG extends PDFElement {

    static fetchViewBox(svg) {
        const viewBox = (svg.match(_viewBoxRegex) || [])[1];
        if (!viewBox) { return; }
        const split = viewBox.split(" ");
        if (split.length !== 4) { return; }
        const width = Number.jet.to(split[2]);
        const height = Number.jet.to(split[3]);
        const ratio = height/width;
        return solid.all({}, {width, height, ratio});
    }

    constructor(gen, source, style, debugName) {

        super(gen, source, style, false, debugName);

        cached.all(this, {}, {
            viewBox:_=>PDFElementSVG.fetchViewBox(source),
        });
        
    }

    computeRawWidth() {
        const { gen, viewBox } = this;
        return viewBox ? viewBox.width : gen.page.width;
    }

    computeRawHeight() {
        const { gen, viewBox } = this;
        return viewBox ? viewBox.height : gen.page.height;
    }

    render() {

        const { gen, align:{ vertical, horizontal }, content, style, viewBox, value } = this;
        const { left, top } = gen.page.margins;
        let { x, y, height, width } = content;

        this.drawBox();

        x += left;
        y += top;

        if (viewBox) {
            const ratio = height/width;
            if (ratio < viewBox.ratio) {
                width = height/viewBox.ratio;
                x += horizontal*(content.width-width);
            }
            else if (ratio > viewBox.ratio) {
                height = width*viewBox.ratio;
                y += vertical*(content.height-height);
            }
        }

        gen.styled(style, _=>SVGtoPDF(gen.doc, value, x, y, {
            width, height
        }));

        return super.render();
        
    }
}