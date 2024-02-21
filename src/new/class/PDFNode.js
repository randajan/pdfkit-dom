import jet from "@randajan/jet-core";
import { flatArray, minZeroNumber, vault } from "../../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";
import { drawBackground } from "../rendering/drawBackground";

const { solid, virtual, cached } = jet.prop;

export class PDFNode extends PDFTextNode {

    static create(gen, element, parent) {
        if (PDFElement.is(element)) { return new PDFNode(gen, element, parent); }
        return new PDFTextNode(gen, element, parent);
    }

    constructor(gen, element, parent) {
        super(gen, element, parent);

        const children = [];

        for (const child of element.props.children) {
            children.push(PDFNode.create(gen, child, this));
        }

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
        });
    }

    _setWidthRaw(widthRaw) {
        super._setWidthRaw(widthRaw+this.element.gaps.width);
    }

    _setWidthLimit(widthLimit) {
        super._setWidthLimit(widthLimit);
        solid(this, "widthContentLimit", minZeroNumber(this.widthLimit-this.element.gaps.width));
    }

    _setWidthContent(widthContent) {
        solid(this, "widthContent", minZeroNumber(widthContent));
        super._setWidth(this.widthContent+this.element.gaps.width);
    }

    _setHeightRaw(heightRaw) {
        super._setHeightRaw(heightRaw+this.element.gaps.height);
    }

    _setHeightLimit(heightLimit) {
        super._setHeightLimit(heightLimit);
        solid(this, "heightContentLimit", minZeroNumber(this.heightLimit-this.element.gaps.height));
    }

    _setHeightContent(heightContent) {
        solid(this, "heightContent", minZeroNumber(heightContent));
        super._setHeight(this.heightContent+this.element.gaps.height);
    }

    //STEP 1
    async setWidthRaw() {
        const { gen, element } = this;
        return gen.withProps(element.props, async _=>{
            this._setWidthRaw(await element.setWidthRaw(this));
            return this.widthRaw;
        });
    }

    //STEP 2
    async setWidth(widthLimit) {
        const { gen, element } = this;
        return gen.withProps(element.props, async _=>{
            this._setWidthLimit(widthLimit);
            this._setWidthContent(await element.setWidth(this));
            return this.width;
        });
    }

    //STEP 3
    async setHeightRaw() {
        const { gen, element } = this;
        return gen.withProps(element.props, async _=>{
            this._setHeightRaw(await element.setHeightRaw(this));
            return this.heightRaw;
        });
    }

    //STEP 4
    async setHeight(heightLimit) {
        const { gen, element } = this;
        return gen.withProps(element.props, async _=>{
            this._setHeightLimit(heightLimit);
            this._setHeightContent(await element.setHeight(this));
            return this.height;
        });
    }

    //STEP 5
    async render(x, y) {
        const { gen, element } = this;
        const { props } = element;
        const { margin, border, padding, color } = props;
        const { kit } = vault.get(gen.uid);

        let { width, height } = this;

        x += margin.left;
        y += margin.top;
        width -= margin.left + margin.right;
        height -= margin.top + margin.bottom;

        drawBorders(kit, x, y, width, height, border);

        x += border.left.weight;
        y += border.top.weight;
        width -= border.left.weight + border.right.weight;
        height -= border.top.weight + border.bottom.weight;

        drawBackground(kit, x, y, width, height, color);

        x += padding.left;
        y += padding.top;
        width -= padding.left + padding.right;
        height -= padding.top + padding.bottom;

        await gen.withProps(props, _=>element.render(this, x, y));

    }
}