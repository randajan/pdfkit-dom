import jet from "@randajan/jet-core";
import { PDFElement } from "./PDFElement";
import { flatArray, minZeroNumber, vault } from "../helpers";

const { solid, virtual, cached, safe } = jet.prop;

//PDFKIT bug. measured text box is not equal to rendered box, those numbers are there to clean this mess
const _minSize = {
    height:5, //rendered box is without this sometime too small and the last row disapear
    width:1 //rendered box is without this sometime too small and it will create another row
}

const createOptions = (style, width, height)=>{
    let opt;

    if (!style) { opt = {} } else {
        const {
            alignHorizontal, alignBaseline,
            fontItalic, fontUnderline,
            spacingLine, spacingWord, spacingCharacter,
            link, lineBreak, ellipsis
        } = style;

        opt = {
            align:alignHorizontal, baseline:alignBaseline,
            oblique:fontItalic, underline:fontUnderline, //columnGap:gaps.column,
            lineGap:spacingLine, wordSpacing:spacingWord, characterSpacing:spacingCharacter,
            link, lineBreak, ellipsis
        }
    }

    if (width != null) { opt.width = _minSize.width+minZeroNumber(width); }
    if (height != null) { opt.height = _minSize.height+minZeroNumber(height); }

    //if (style && opt.width != null && opt.height != null) { opt.width -= gaps.column*(columns-1); }

    return opt;
}

export class PDFTextNode {

    static create(doc, element, parent) {
        return new PDFTextNode(doc, element, parent);
    }

    constructor(doc, element, parent) {

        solid.all(this, {
            doc,
            parent,
        }, false);

        solid.all(this, {
            element
        });

    }

    _setWidthRaw(widthRaw) { solid(this, "widthRaw", minZeroNumber(widthRaw)); }
    _setWidthLimit(widthLimit) { solid(this, "widthLimit", minZeroNumber(widthLimit)); }
    _setWidth(width) { solid(this, "width", Number.jet.frame(width, 0, this.widthLimit)); }
    _setHeightRaw(heightRaw) { solid(this, "heightRaw", minZeroNumber(heightRaw)); }
    _setHeightLimit(heightLimit) { solid(this, "heightLimit", minZeroNumber(heightLimit)); }
    _setHeight(height) { solid(this, "height", Number.jet.frame(height, 0, this.heightLimit)); }

    async validate() {
        return true;
    }

    //STEP 2
    async setWidthRaw() {
        const { kit, current } = vault.get(this.doc.uid);
        this._setWidthRaw(kit.widthOfString(this.element, createOptions(current[0].style)))
        return this.widthRaw;
    }

    //STEP 3
    async setWidth(widthLimit) {
        this._setWidthLimit(widthLimit);
        this._setWidth(this.widthRaw);
        return this.width;
    }

    //STEP 4
    async setHeightRaw() {
        const { kit, current } = vault.get(this.doc.uid);
        this._setHeightRaw(kit.heightOfString(this.element, createOptions(current[0].style, this.width)));
        return this.heightRaw;
    }

    //STEP 5
    async setHeight(heightLimit) {
        this._setHeightLimit(heightLimit);
        this._setHeight(this.heightRaw);
        return this.height;
    }

    //STEP 6
    async render(x, y) {
        const { kit, current } = vault.get(this.doc.uid);
        const { doc, element, width, height } = this;
        
        kit.text(element, x, y, createOptions(current[0].style, width, height));

    }
}