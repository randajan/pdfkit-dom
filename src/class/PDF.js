import jet from "@randajan/jet-core";
import PDFKit from "pdfkit";

import { minZeroNumber, vault } from "../helpers";

import { PDFElement } from "./PDFElement";
import { PDFNode } from "./PDFNode";
import { elementDefine } from "../elements/elements";

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
            bufferPages: true,
            margins:{
                left:0,
                right:0,
                top:0,
                bottom:0
            }
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
            kit,
            page:virtual.all({}, {
                width:_=>minZeroNumber(kit.page.width),
                height:_=>minZeroNumber(kit.page.height),
            })
        }, false);

        jet.forEach(options.fonts, (path, key)=>kit.registerFont(key, path));
    }

    msg(text) {
        return "PDF " + text;
    }

    async withStyle(style, callback) {
        const { kit, current } = vault.get(this.uid);
        let c = { ...current[0].inherit };

        if (style.fontSize != null) { c.fontSize = style.fontSize; }
        if (style.fontFamily != null) { c.fontFamily = style.fontFamily; }
        if (style.color != null) { c.fillColor = style.color; }
        if (style.colorOpacity != null) { c.colorOpacity = style.colorOpacity; }

        current.unshift({style, inherit:c});
        
        kit.font(c.fontFamily, c.fontSize).fillColor(c.fillColor, c.colorOpacity);
        const result = await callback(this);

        current.shift();

        c = current[0]?.inherit;
        kit.font(c.fontFamily, c.fontSize).fillColor(c.fillColor, c.colorOpacity);

        return result;
    }

    async render(children, pipeDestination, pipeOptions) {
        const _p = vault.get(this.uid);

        if (_p.state !== "init") { throw Error(this.msg("allready " + _p.state)); }
        _p.state = "rendering";

        if (pipeDestination) { _p.kit.pipe(pipeDestination, pipeOptions); }

        const { width, height } = this.page;

        const node = PDFNode.create(this, children);
        await node.validate();
        await node.setWidthRaw();
        await node.setWidth(width);
        await node.setHeightRaw();
        await node.setHeight(height);
        await node.render(0, 0);

        const prom = new Promise((res, rej)=>{
            _p.kit.on("finish", _=>{
                _p.state = "done";
                res();
            })
            _p.kit.on("error", e=>{
                rej(e);
            });
        });

        _p.kit.end();

        vault.end(this.uid);

        await prom;
    }

}