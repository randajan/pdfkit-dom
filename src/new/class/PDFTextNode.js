import jet from "@randajan/jet-core";
import { PDFElement } from "./PDFElement";
import { flatArray, minZeroNumber, vault } from "../../helpers";

const { solid, virtual } = jet.prop;


const createOptions = (style, width, height)=>{
    let opt;

    if (!style) { opt = {} } else {
        const { align, font, spacing, link, lineBreak, ellipsis, columns } = style;

        opt = {
            align:align.horizontal, baseline:align.baseline,
            oblique:font.italic, underline:font.underline, columns, //columnGap:gaps.column,
            lineGap:spacing.line, wordSpacing:spacing.word, characterSpacing:spacing.character,
            link, lineBreak, ellipsis
        }
    }

    if (width != null) { opt.width = minZeroNumber(width); }
    if (height != null) { opt.height = minZeroNumber(height); }

    //if (style && opt.width != null && opt.height != null) { opt.width -= gaps.column*(columns-1); }

    return opt;
}

export class PDFTextNode {

    static create(gen, content, parent) {
        return new PDFTextNode(gen, content, parent);
    }

    constructor(gen, content, parent) {

        solid.all(this, {
            gen,
            content,
            parent,
        });

    }

    async getWidth() {
        const { kit, current } = vault.get(this.gen.uid);
        return kit.widthOfString(this.content, createOptions(current[0].style));
    }

    async getHeight(widthLimit) {
        const { kit, current } = vault.get(this.gen.uid);
        return kit.heightOfString(this.content, createOptions(current[0].style, widthLimit));
    }

    async render(x, y, width, height) {
        const { kit, current } = vault.get(this.gen.uid);
        const { gen, content } = this;

        kit.text(content, x, y, createOptions(current[0].style, width, height));

        //const { children } = content.props;

        // await Promise.all(children.map(child=>{
        //     if (PDFElement.is(child)) { return PDFFrame.render(doc, child, parent); }
        //     return child;
        // }));

    }
}