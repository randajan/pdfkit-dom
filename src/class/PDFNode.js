import jet from "@randajan/jet-core";
import { minZeroNumber } from "../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";
import { drawBackground } from "../rendering/drawBackground";
import { drawHorizontals, drawVerticals } from "../rendering/drawLines";
import { drawHorizontalRects, drawVerticalRects } from "../rendering/drawBackgrounds";

const { solid, virtual, cached } = jet.prop;


const frameSize = (num, size, sizeMin, sizeMax, maximaze=true, respectMin=true)=>{
    if (maximaze && size === "max") { num = sizeMax; }
    else if (typeof size == "number") { sizeMin = sizeMax = size; }
    return respectMin ? Number.jet.frame(num, sizeMin, sizeMax) : Math.min(num, sizeMax);
}

export class PDFNode extends PDFTextNode {

    static create(doc, element, parent) {
        if (PDFElement.is(element)) { return new element.NodeConstructor(doc, element, parent); }
        return new PDFTextNode(doc, String.jet.to(element), parent);
    }

    constructor(doc, element, parent) {
        super(doc, element, parent);
        const { style } = element;

        const children = element.children.map(child=>PDFNode.create(doc, child, this));

        virtual.all(this, {
            widthFix:_=>typeof style.width === "number" ? style.width : undefined,
            heightFix:_=>typeof style.height === "number" ? style.height : undefined,
            childCount:_=>children.length
        });

        solid.all(this, {
            forEach:async callback=>{
                for (const i in children) { await callback(children[i], i, children.length); }
            },
            map:async callback=>{
                const r = [];
                for (const i in children) { r.push(await callback(children[i], i, children.length)); }
                return r;
            },
            reduce:async (callback, init)=>{
                for (const i in children) { init = await callback(init, children[i], i, children.length); }
                return init;
            },
            getChildren:id=>children[id]
        }, false);
    }

    _setWidthRaw(widthRaw) {
        const { gaps, style:{ width, widthMin, widthMax } } = this.element;
        super._setWidthRaw(frameSize(widthRaw+gaps.width, width, widthMin, widthMax, false));
    }

    _setWidthLimit(widthLimit) {
        const { gaps, style:{ width, widthMin, widthMax } } = this.element;
        super._setWidthLimit(frameSize(widthLimit, width, widthMin, widthMax, false, false));
        solid(this, "widthPadLimit", minZeroNumber(this.widthLimit-gaps.width));
    }

    _setWidthContent(widthPad) {
        const { gaps, style:{ width, widthMin, widthMax } } = this.element;
        super._setWidth(frameSize(widthPad+gaps.width, width, widthMin, widthMax));
        solid(this, "widthContent", minZeroNumber(frameSize(widthPad+gaps.width, width, widthMin, widthMax, false, false)-gaps.width));
        solid(this, "widthPad", minZeroNumber(this.width-gaps.width));
    }

    _setHeightRaw(heightRaw) {
        const { gaps, style:{ height, heightMin, heightMax } } = this.element;
        super._setHeightRaw(frameSize(heightRaw+gaps.height, height, heightMin, heightMax, false));
    }

    _setHeightLimit(heightLimit) {
        const { gaps, style:{ height, heightMin, heightMax} } = this.element;
        super._setHeightLimit(frameSize(heightLimit, height, heightMin, heightMax, false, false));
        solid(this, "heightPadLimit", minZeroNumber(this.heightLimit-gaps.height));
    }

    _setHeightContent(heightPad) {
        const { gaps, style:{ height, heightMin, heightMax } } = this.element;
        super._setHeight(frameSize(heightPad+gaps.height, height, heightMin, heightMax));
        solid(this, "heightContent", minZeroNumber(frameSize(heightPad+gaps.height, height, heightMin, heightMax, false, false)-gaps.height));
        solid(this, "heightPad", minZeroNumber(this.height-gaps.height));
    }

    async reduceMax(getValueFromChild) {
        return this.reduce(async (v, c, i, l)=>Math.max(v, await getValueFromChild(c, i, l)), 0);
    }

    async reduceSum(getValueFromChild) {
        return this.reduce(async (v, c, i, l)=>v + await getValueFromChild(c, i, l), 0);
    }

    //STEP 1
    async validate() {
        if (this.element.validate) { await this.element?.validate(this); }
        await this.forEach(c=>c.validate());
    }

    //STEP 2
    async setWidthRaw() {
        const { doc, element } = this;
        this._setWidthRaw(await doc.withStyle(element.style, _=>element.setWidthRaw(this)));
        return this.widthRaw;
    }

    //STEP 3
    async setWidth(widthLimit) {
        const { doc, element } = this;
        this._setWidthLimit(widthLimit);
        this._setWidthContent(await doc.withStyle(element.style, _=>element.setWidthContent(this)));
        return this.width;
    }

    //STEP 4
    async setHeightRaw() {
        const { doc, element } = this;
        this._setHeightRaw(await doc.withStyle(element.style, _=>element.setHeightRaw(this)));
        return this.heightRaw;
    }

    //STEP 5
    async setHeight(heightLimit) {
        const { doc, element } = this;
        this._setHeightLimit(heightLimit);
        this._setHeightContent(await doc.withStyle(element.style, _=>element.setHeightContent(this)));
        return this.height;
    }

    //STEP 6
    async render(x, y) {
        const { doc, element, rows, columns, widthContent, heightContent } = this;
        const { kit } = doc;
        const { style, gaps } = element;
        const {
            marginTop, marginRight, marginBottom, marginLeft,
            paddingTop, paddingRight, paddingBottom, paddingLeft,
            borderTopWeight, borderRightWeight, borderBottomWeight, borderLeftWeight,
            borderRowWeight, borderRowColor, borderRowDash, borderRowOpacity,
            borderColumnWeight, borderColumnColor, borderColumnDash, borderColumnOpacity,
            gridHorizontal, gridVertical
        } = style;
        
        let { width, height } = this;

        if (!widthContent || !heightContent) { return; }
        
        x += marginLeft + borderLeftWeight;
        y += marginTop + borderTopWeight;
        width -= marginLeft + marginRight + borderLeftWeight + borderRightWeight;
        height -= marginTop + marginBottom + borderTopWeight + borderBottomWeight;

        drawBackground(kit, x, y, width, height, style);
        drawHorizontalRects(kit, x, y+paddingTop, width, gaps.row, borderRowWeight, this.rows, element.rows);
        drawVerticalRects(kit, x+paddingLeft, y, height, gaps.column, borderColumnWeight, this.columns, element.columns);

        drawBorders(kit, x, y, width, height, style);
        drawHorizontals(kit, x, y+paddingTop+gridHorizontal, width, gaps.row, rows, borderRowWeight, borderRowColor, borderRowDash, borderRowOpacity);
        drawVerticals(kit, x+paddingLeft+gridVertical, y, height, gaps.column, columns, borderColumnWeight, borderColumnColor, borderColumnDash, borderColumnOpacity);

        x += paddingLeft + gridVertical;
        y += paddingTop + gridHorizontal;
        width -= paddingLeft + paddingRight + gridVertical*2;
        height -= paddingTop + paddingBottom + gridHorizontal*2;

        await doc.withStyle(style, _=>element.render(this, x, y, width, height));

    }
}