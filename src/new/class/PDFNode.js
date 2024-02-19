import jet from "@randajan/jet-core";
import { flatArray, minZeroNumber, vault } from "../../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";

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

    //STEP 1
    async setWidthRaw() {
        const { gen, element } = this;
        this._setWidthRaw(await gen.withProps(element.props, async _=>{
            return element.gaps.width + await element.setWidthRaw(this);
        }));
        return this.widthRaw;
    }

    //STEP 2
    async setWidth(widthLimit) {
        const { gen, element } = this;
        this._setWidthLimit(widthLimit);
        solid(this, "widthContentLimit", minZeroNumber(this.widthLimit-element.gaps.width));

        this._setWidth(await gen.withProps(element.props, async _=>{
            return element.gaps.width + await element.setWidth(this);
        }));
        solid(this, "widthContent", minZeroNumber(this.width-element.gaps.width));

        return this.width;
    }

    //STEP 3
    async setHeightRaw() {
        const { gen, element } = this;
        this._setHeightRaw(await gen.withProps(element.props, async _=>{
            return element.gaps.height + await element.setHeightRaw(this);
        }));
        return this.heightRaw;
    }

    //STEP 4
    async setHeight(heightLimit) {
        const { gen, element } = this;
        this._setHeightLimit(heightLimit);
        solid(this, "heightContentLimit", minZeroNumber(this.heightLimit-element.gaps.height));

        this._setHeight(await gen.withProps(element.props, async _=>{
            return element.gaps.height + await element.setHeight(this);
        }));
        solid(this, "heightContent", minZeroNumber(this.height-element.gaps.height));

        return this.height;
    }

    //STEP 5
    async render(x, y) {
        const { gen, element, width, height } = this;
        const { gaps, props } = element;
        const { kit } = vault.get(gen.uid);

        x += gaps.left;
        y += gaps.top;

        drawBorders(kit, x, y, this.widthContent, this.heightContent, props);

        await gen.withProps(props, _=>element.render(this, x, y));

    }
}