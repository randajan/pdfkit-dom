import jet from "@randajan/jet-core";
import PDFKit from "pdfkit";

import { minZeroNumber, vault } from "../../helpers";

import { PDFElement } from "./PDFElement";
import { parseStyle } from "../../methods/styleParser";
import { PDFNode } from "./PDFNode";
import { elementDefine } from "../elements";

const { solid, virtual, safe } = jet.prop;


export class PDF {

    static create(options) {
        return new PDF({...options});
    }

    static createElement = PDFElement.create;

    static defineElement = elementDefine;

    constructor(options) {

        options = {
            size: 'A4',
            ...options,
            bufferPages: true
        };

        const kit = new PDFKit(options);
        const [ uid, _p ] = vault.set({
            kit,
            options,
            state:"init", //init, rendering, done
            current:[{ inherit:{
                fontSize:12,
                fontFamily:"Courier",
                foreground:"#000000"
            } }],
        });

        solid.all(this, {
            uid,
            page:virtual.all({}, {
                width:_=>minZeroNumber(kit.page.width-kit.page.margins.right-kit.page.margins.left),
                height:_=>minZeroNumber(kit.page.height-kit.page.margins.top-kit.page.margins.bottom),
                margin:_=>({...kit.page.margins})
            })
        }, false);

        jet.forEach(options.fonts, (path, key)=>kit.registerFont(key, path));
    }

    msg(text) {
        return "PDF " + text;
    }

    async withStyle(style, callback) {
        const { kit, current } = vault.get(this.uid);

        const s = style = parseStyle(style);
        let c = { ...current[0].inherit };

        if (s.font.size) { c.fontSize = s.font.size; }
        if (s.font.family) { c.fontFamily = s.font.family; }
        if (s.color.foreground) { c.fillColor = s.color.foreground; }

        current.unshift({style, inherit:c});
        
        kit.font(c.fontFamily, c.fontSize).fillColor(c.fillColor);
        const result = await callback(this);

        current.shift();

        c = current[0]?.inherit;
        kit.font(c.fontFamily, c.fontSize).fillColor(c.fillColor);

        return result;
    }

    async render(children, pipeDestination, pipeOptions) {
        const _p = vault.get(this.uid);

        if (_p.state !== "init") { throw Error(this.msg("allready " + _p.state)); }
        _p.state = "rendering";

        if (pipeDestination) { _p.kit.pipe(pipeDestination, pipeOptions); }

        const { width, height, margin:{ left, top } } = this.page;

        const node = PDFNode.create(this, children);
        await this.withStyle(_p.options.style, async _=>{
            await node.setWidth(width);
            await node.setHeight(height);
            return node.render(left, top);
        });

        new Promise((res, rej)=>{
            _p.kit.on("end", _=>{
                _p.state = "done";
                res();
            });
        });

        _p.kit.end();

        vault.end(this.uid);
    }

}