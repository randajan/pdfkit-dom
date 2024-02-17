import jet from "@randajan/jet-core";
import { flatArray, minZeroNumber, vault } from "../../helpers";
import { PDFElement } from "./PDFElement";
import { PDFTextNode } from "./PDFTextNode";

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

    async getWidth() {
        const { gen, content } = this;
        return gen.withStyle(content.props, async _=>{
            return content.getWidth(this);
        });
    }

    async getHeight(widthLimit) {
        const { gen, content } = this;
        return gen.withStyle(content.props, async _=>{
            return content.getHeight(this, widthLimit);
        });
    }

    async render(x, y, width, height) {
        const { gen, content } = this;

        await gen.withStyle(content.props, _=>{
            return content.render(this, x, y, width, height);
        });

    }
}