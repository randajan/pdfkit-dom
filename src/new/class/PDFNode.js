import jet from "@randajan/jet-core";
import { flatArray, minZeroNumber, vault } from "../../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";
import { drawBorders } from "../rendering/drawBorders";

const { solid, virtual, cached } = jet.prop;

export class PDFNode extends PDFTextNode {

    static create(gen, content, parent) {
        if (PDFElement.is(content)) { return new PDFNode(gen, content, parent); }
        return new PDFTextNode(gen, content, parent);
    }

    constructor(gen, content, parent) {
        super(gen, content, parent);

        const children = [];

        for (const child of content.props.children) {
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

    async measureWidth(...args) {
        const { gen, content } = this;
        return gen.withStyle(content.props, async _=>{
            return content.gaps.width + await content.measureWidth(this, ...args);
        });
    }

    async measureHeight(...args) {
        const { gen, content } = this;
        return gen.withStyle(content.props, async _=>{
            return content.gaps.height + await content.measureHeight(this, ...args);
        });
    }

    async boundWidth(widthLimit) {
        const { gen, content } = this;
        const { gaps, props } = content;

        return gen.withStyle(props, async _=>{
            return gaps.width + await content.boundWidth(this, widthLimit-gaps.width);
        });
    }

    async boundHeight(widthLimit, heightLimit) {
        const { gen, content } = this;
        const { gaps, props } = content;

        return gen.withStyle(props, async _=>{
            return gaps.height + await content.boundHeight(this, widthLimit-gaps.width, heightLimit-gaps.height);
        });
    }

    async render(x, y) {
        const { gen, content, width, height } = this;
        const { gaps, props } = content;
        const { kit } = vault.get(gen.uid);

        drawBorders(kit, x, y, width, height, props);

        await gen.withStyle(props, _=>{
            return content.render(this, x+gaps.left, y+gaps.top, width-gaps.width, height-gaps.height);
        });

    }
}