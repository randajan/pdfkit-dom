import PDFElement from "../class/Element";
import jet from "@randajan/jet-core";

export class PDFElementText extends PDFElement {

    constructor(gen, text, style, debugName) {
        super(gen, text, style, false, debugName);
    }

    fontPreset(includeHeight=true, includeWidth=true) {
        
        const { content, gaps, style:{ align, font, spacing, link, lineBreak, ellipsis, columns }, } = this;

        return {
            width:includeWidth ? content.width-(includeHeight ? 0 : (gaps.column*(columns-1))) : undefined,
            height:includeHeight ? content.height+5 : undefined,
            align:align.horizontal, baseline:align.baseline,
            oblique:font.italic, underline:font.underline, columns, columnGap:gaps.column,
            lineGap:spacing.line, wordSpacing:spacing.word, characterSpacing:spacing.character,
            link, lineBreak, ellipsis
        };
    }

    computeRawWidth() {
        const { gen, value, style } = this;
        const width = gen.styled(style, _=>gen.textWidth(value, this.fontPreset(false, false)));
        return width;
    }

    computeRawHeight() {
        const { gen, value, style } = this;
        const height = gen.styled(style, _=>(gen.textHeight(value, this.fontPreset(false)) / style.columns));
        return height;
    }

    render() {

        const {gen,  align:{ vertical }, content, raw, style, value } = this;
        const { left, top } = gen.page.margins;
        let { x, y, width, height } = content;

        this.drawBox();
        y += vertical*(height-Math.min(raw.height, height));

        gen.styled(style, _=>gen.doc.text(value, left+x, top+y, this.fontPreset()));

        const widthColumn = width / style.columns;
        for (let c=widthColumn; c<width; c+=widthColumn) {
            this.drawVertical(x+c);
        }

        return super.render();

    }

}