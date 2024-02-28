import jet from "@randajan/jet-core";
import { flatArray, mapSides, minZeroNumber, vault } from "../../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";
import { drawBackground } from "../rendering/drawBackground";
import { parseBorders } from "../parser/parsers";
import { drawHorizontal, drawVertical } from "../rendering/drawLine";
import { drawHorizontals, drawVerticals } from "../rendering/drawLines";
import { drawHorizontalRects, drawVerticalRects } from "../rendering/drawBackgrounds";

const { solid, virtual, cached } = jet.prop;

const frameSize = (num, propSize, maximaze=true, respectMin=true)=>{
    let { main, min, max } = propSize;
    if (maximaze && main === "max") { num = max; }
    else if (typeof main == "number") { min = max = main; }
    return respectMin ? Number.jet.frame(num, min, max) : Math.min(num, max);
}

export class PDFNode extends PDFTextNode {

    static create(gen, element, parent) {
        if (PDFElement.is(element)) { return new element.NodeConstructor(gen, element, parent); }
        return new PDFTextNode(gen, element, parent);
    }

    constructor(gen, element, parent) {
        super(gen, element, parent);
        const { props } = element;

        const children = [];

        for (const child of props.children) {
            children.push(PDFNode.create(gen, child, this));
        }

        virtual.all(this, {
            widthFix:_=>typeof props.width.main === "number" ? props.width.main : undefined,
            heightFix:_=>typeof props.height.main === "number" ? props.height.main : undefined,
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
        const { gaps, props:{ width } } = this.element;
        
        super._setWidthRaw(frameSize(widthRaw+gaps.width, width, false));
    }

    _setWidthLimit(widthLimit) {
        const { gaps, props:{ width } } = this.element;
        super._setWidthLimit(frameSize(widthLimit, width, false, false));
        solid(this, "widthContentLimit", minZeroNumber(this.widthLimit-gaps.width));
    }

    _setWidthContent(widthContent) {
        const { gaps, props:{ width } } = this.element;
        super._setWidth(frameSize(widthContent+gaps.width, width));
        solid(this, "widthContent", minZeroNumber(this.width-gaps.width));
    }

    _setHeightRaw(heightRaw) {
        const { gaps, props:{ height } } = this.element;
        super._setHeightRaw(frameSize(heightRaw+gaps.height, height, false));
    }

    _setHeightLimit(heightLimit) {
        const { gaps, props:{ height} } = this.element;
        super._setHeightLimit(frameSize(heightLimit, height, false, false));
        solid(this, "heightContentLimit", minZeroNumber(this.heightLimit-gaps.height));
    }

    _setHeightContent(heightContent) {
        const { gaps, props:{ height } } = this.element;
        super._setHeight(frameSize(heightContent+gaps.height, height));
        solid(this, "heightContent", minZeroNumber(this.height-gaps.height));
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
        const { gen, element } = this;
        this._setWidthRaw(await gen.withProps(element.props, _=>element.setWidthRaw(this)));
        return this.widthRaw;
    }

    //STEP 3
    async setWidth(widthLimit) {
        const { gen, element } = this;
        this._setWidthLimit(widthLimit);
        this._setWidthContent(await gen.withProps(element.props, _=>element.setWidthContent(this)));
        return this.width;
    }

    //STEP 4
    async setHeightRaw() {
        const { gen, element } = this;
        this._setHeightRaw(await gen.withProps(element.props, _=>element.setHeightRaw(this)));
        return this.heightRaw;
    }

    //STEP 5
    async setHeight(heightLimit) {
        const { gen, element } = this;
        this._setHeightLimit(heightLimit);
        this._setHeightContent(await gen.withProps(element.props, _=>element.setHeightContent(this)));
        return this.height;
    }

    //STEP 6
    async render(x, y) {
        const { gen, element, rows, columns } = this;
        const { margin, border, padding, color } = element.props;
        const { kit } = vault.get(gen.uid);

        const { left, top, right, bottom } = border

        let { width, height } = this;

        x += margin.left + left.weight;
        y += margin.top + top.weight;
        width -= margin.left + margin.right + left.weight + right.weight;
        height -= margin.top + margin.bottom + top.weight + bottom.weight;

        drawBackground(kit, x, y, width, height, color.background, color.opacity);
        drawHorizontalRects(kit, x, y+padding.top, width, element.gaps.row, rows, element.props.rows);
        drawVerticalRects(kit, x+padding.left, y, height, element.gaps.column, columns, element.props.columns);

        drawBorders(kit, x - left.weight, y - top.weight, width + left.weight + right.weight, height + top.weight + bottom.weight, border);
        drawHorizontals(kit, x, y+padding.top, width, element.gaps.row, rows, border.row);
        drawVerticals(kit, x+padding.left, y, height, element.gaps.column, columns, border.column);

        x += padding.left + element.gaps.column/2;
        y += padding.top + element.gaps.row/2;
        width -= padding.left + padding.right + element.gaps.row;
        height -= padding.top + padding.bottom + element.gaps.column;

        await gen.withProps(element.props, _=>element.render(this, x, y, width, height));

    }
}