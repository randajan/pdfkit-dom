import jet from "@randajan/jet-core";
import { PDFElement } from "./PDFElement";
import { flatArray, minZeroNumber, vault } from "../../helpers";

const { solid, virtual, cached, safe } = jet.prop;

//PDFKIT bug. measured text box is not equal to rendered box, those numbers are there to clean this mess
const _minSize = {
    height:5, //rendered box is without this sometime too small and the last row disapear
    width:1 //rendered box is without this sometime too small and it will create another row
}

const createOptions = (props, width, height)=>{
    let opt;

    if (!props) { opt = {} } else {
        const { align, font, spacing, link, lineBreak, ellipsis } = props;

        opt = {
            align:align.horizontal, baseline:align.baseline,
            oblique:font.italic, underline:font.underline, //columnGap:gaps.column,
            lineGap:spacing.line, wordSpacing:spacing.word, characterSpacing:spacing.character,
            link, lineBreak, ellipsis
        }
    }

    if (width != null) { opt.width = _minSize.width+minZeroNumber(width); }
    if (height != null) { opt.height = _minSize.height+minZeroNumber(height); }

    //if (props && opt.width != null && opt.height != null) { opt.width -= gaps.column*(columns-1); }

    return opt;
}

const setFactory = cb=>({set:(t, f)=>f != null ? f : cb(t)});


export class PDFTextNode {

    static create(gen, element, parent) {
        return new PDFTextNode(gen, element, parent);
    }

    constructor(gen, element, parent) {

        solid.all(this, {
            gen,
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
        const { kit, current } = vault.get(this.gen.uid);
        this._setWidthRaw(kit.widthOfString(this.element, createOptions(current[0].props)))
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
        const { kit, current } = vault.get(this.gen.uid);
        this._setHeightRaw(kit.heightOfString(this.element, createOptions(current[0].props, this.width)));
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
        const { kit, current } = vault.get(this.gen.uid);
        const { gen, element } = this;
        
        kit.text(element, x, y, createOptions(current[0].props, this.width, this.height));

    }
}