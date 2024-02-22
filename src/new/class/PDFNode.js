import jet from "@randajan/jet-core";
import { flatArray, mapSides, minZeroNumber, vault } from "../../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";
import { drawBackground } from "../rendering/drawBackground";
import { parseBorders } from "../parser/parsers";

const { solid, virtual, cached } = jet.prop;

const frameSize = (num, propSize, respectMin=true)=>{
    const { min, max } = propSize;
    return respectMin ? Number.jet.frame(num, min, max) : Math.min(num, max);
}

const moveBoundBy = (bound, prop)=>{
    const isBorder = parseBorders.is(prop);
    const w = mapSides(side=>isBorder ? prop[side].weight : prop[side]);

    bound.x += w.left;
    bound.y += w.top;
    bound.width -= w.left + w.right; 
    bound.height -= w.top + w.bottom;

    return bound;
}

export class PDFNode extends PDFTextNode {

    static create(gen, element, parent) {
        if (PDFElement.is(element)) { return new PDFNode(gen, element, parent); }
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
        }, false);
    }

    _setWidthRaw(widthRaw) {
        const { gaps, props:{ width } } = this.element;
        
        super._setWidthRaw(frameSize(widthRaw+gaps.width, width));
    }

    _setWidthLimit(widthLimit) {
        const { gaps, props:{ width } } = this.element;
        super._setWidthLimit(frameSize(widthLimit, width, false));
        solid(this, "widthContentLimit", minZeroNumber(this.widthLimit-gaps.width));
    }

    _setWidthContent(widthContent) {
        const { gaps, props:{ width } } = this.element;
        super._setWidth(frameSize(widthContent+gaps.width, width));
        solid(this, "widthContent", minZeroNumber(this.width-gaps.width));
    }

    _setHeightRaw(heightRaw) {
        const { gaps, props:{ height } } = this.element;
        super._setHeightRaw(frameSize(heightRaw+gaps.height, height));
    }

    _setHeightLimit(heightLimit) {
        const { gaps, props:{ height} } = this.element;
        super._setHeightLimit(frameSize(heightLimit, height, false));
        solid(this, "heightContentLimit", minZeroNumber(this.heightLimit-gaps.height));
    }

    _setHeightContent(heightContent) {
        const { gaps, props:{ height } } = this.element;
        super._setHeight(frameSize(heightContent+gaps.height, height));
        solid(this, "heightContent", minZeroNumber(this.height-gaps.height));
    }

    //STEP 1
    async setWidthRaw() {
        const { gen, element } = this;
        this._setWidthRaw(await gen.withProps(element.props, _=>element.setWidthRaw(this)));
        return this.widthRaw;
    }

    //STEP 2
    async setWidth(widthLimit) {
        const { gen, element } = this;
        this._setWidthLimit(widthLimit);
        this._setWidthContent(await gen.withProps(element.props, _=>element.setWidthContent(this)));
        return this.width;
    }

    //STEP 3
    async setHeightRaw() {
        const { gen, element } = this;
        this._setHeightRaw(await gen.withProps(element.props, _=>element.setHeightRaw(this)));
        return this.heightRaw;
    }

    //STEP 4
    async setHeight(heightLimit) {
        const { gen, element } = this;
        this._setHeightLimit(heightLimit);
        this._setHeightContent(await gen.withProps(element.props, _=>element.setHeightContent(this)));
        return this.height;
    }

    //STEP 5
    async render(x, y) {
        const { gen, element, width, height } = this;
        const { margin, border, padding, color } = element.props;
        const { kit } = vault.get(gen.uid);

        const b = { x, y, width, height };

        moveBoundBy(b, margin);
        drawBorders(kit, b.x, b.y, b.width, b.height, border);

        moveBoundBy(b, border)
        drawBackground(kit, b.x, b.y, b.width, b.height, color);

        moveBoundBy(b, padding);
        await gen.withProps(element.props, _=>element.render(this, b.x, b.y, b.width, b.height));

    }
}