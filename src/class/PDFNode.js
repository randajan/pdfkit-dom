import jet from "@randajan/jet-core";
import { minZeroNumber, sum, vault } from "../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";
import { drawBackground } from "../rendering/drawBackground";
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

    static create(doc, element, parent) {
        if (PDFElement.is(element)) { return new element.NodeConstructor(doc, element, parent); }
        return new PDFTextNode(doc, element, parent);
    }

    constructor(doc, element, parent) {
        super(doc, element, parent);
        const { props } = element;

        const children = [];

        for (const child of props.children) {
            children.push(PDFNode.create(doc, child, this));
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
        solid(this, "widthPadLimit", minZeroNumber(this.widthLimit-gaps.width));
    }

    _setWidthContent(widthPad) {
        const { gaps, props:{ width } } = this.element;
        super._setWidth(frameSize(widthPad+gaps.width, width));
        solid(this, "widthContent", minZeroNumber(frameSize(widthPad+gaps.width, width, false, false)-gaps.width));
        solid(this, "widthPad", minZeroNumber(this.width-gaps.width));
    }

    _setHeightRaw(heightRaw) {
        const { gaps, props:{ height } } = this.element;
        super._setHeightRaw(frameSize(heightRaw+gaps.height, height, false));
    }

    _setHeightLimit(heightLimit) {
        const { gaps, props:{ height} } = this.element;
        super._setHeightLimit(frameSize(heightLimit, height, false, false));
        solid(this, "heightPadLimit", minZeroNumber(this.heightLimit-gaps.height));
    }

    _setHeightContent(heightPad) {
        const { gaps, props:{ height } } = this.element;
        super._setHeight(frameSize(heightPad+gaps.height, height));
        solid(this, "heightContent", minZeroNumber(frameSize(heightPad+gaps.height, height, false, false)-gaps.height));
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
        this._setWidthRaw(await doc.withProps(element.props, _=>element.setWidthRaw(this)));
        return this.widthRaw;
    }

    //STEP 3
    async setWidth(widthLimit) {
        const { doc, element } = this;
        this._setWidthLimit(widthLimit);
        this._setWidthContent(await doc.withProps(element.props, _=>element.setWidthContent(this)));
        return this.width;
    }

    //STEP 4
    async setHeightRaw() {
        const { doc, element } = this;
        this._setHeightRaw(await doc.withProps(element.props, _=>element.setHeightRaw(this)));
        return this.heightRaw;
    }

    //STEP 5
    async setHeight(heightLimit) {
        const { doc, element } = this;
        this._setHeightLimit(heightLimit);
        this._setHeightContent(await doc.withProps(element.props, _=>element.setHeightContent(this)));
        return this.height;
    }

    //STEP 6
    async render(x, y) {
        const { doc, element, rows, columns } = this;
        const { props, gaps } = element;
        const { margin, border, padding, color, grid } = props;
        const { kit } = doc;

        const { left, top, right, bottom, row, column } = border

        let { width, height } = this;

        x += margin.left + left.weight;
        y += margin.top + top.weight;
        width -= margin.left + margin.right + left.weight + right.weight;
        height -= margin.top + margin.bottom + top.weight + bottom.weight;

        drawBackground(kit, x, y, width, height, color.background, color.opacity);
        drawHorizontalRects(kit, x, y+padding.top, width, gaps.row, row.weight, this.rows, props.rows);
        drawVerticalRects(kit, x+padding.left, y, height, gaps.column, column.weight, this.columns, props.columns);

        drawBorders(kit, x - left.weight, y - top.weight, width + left.weight + right.weight, height + top.weight + bottom.weight, border);
        drawHorizontals(kit, x, y+padding.top+grid.horizontal, width, gaps.row, rows, row);
        drawVerticals(kit, x+padding.left+grid.vertical, y, height, gaps.column, columns, column);


        x += padding.left + grid.vertical;
        y += padding.top + grid.horizontal;
        width -= padding.left + padding.right + grid.vertical*2;
        height -= padding.top + padding.bottom + grid.horizontal*2;

        await doc.withProps(props, _=>element.render(this, x, y, width, height));

    }
}