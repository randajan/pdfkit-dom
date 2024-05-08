import jet from "@randajan/jet-core";
import { each } from "@randajan/jet-core/eachSync";
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
        const _p = {
            kit,
            options,
            state:"init", //init, rendering, done
            styles:[{
                fontSize:12,
                fontFamily:"Courier",
                foreground:"#000000"
            }],
        }
        vault.set(this, _p);

        solid.all(this, {
            kit,
            page:virtual.all({}, {
                width:_=>minZeroNumber(kit.page.width),
                height:_=>minZeroNumber(kit.page.height),
            })
        }, false);

        each(options.fonts, (path, ctx)=>kit.registerFont(ctx.key, path));
    }

    msg(text) {
        return "PDF " + text;
    }

    async withStyle(style, callback) {
        const { kit, styles } = vault.get(this);
        const from = styles[styles.length-1];
        const to = {};

        for (let i in style) { to[i] = style[i] != null ? style[i] : from[i]; }

        styles.push(to);

        
        kit.font(to.fontFamily, to.fontSize).fillColor(to.color, to.colorOpacity);
        const result = await callback(this);

        styles.pop();

        kit.font(from.fontFamily, from.fontSize).fillColor(from.color, from.colorOpacity);
        return result;
    }

    async render(children, pipeDestination, pipeOptions) {
        const _p = vault.get(this);

        if (_p.state !== "init") { throw Error(this.msg("allready " + _p.state)); }
        _p.state = "rendering";

        if (pipeDestination) { _p.kit.pipe(pipeDestination, pipeOptions); }

        const { width, height } = this.page;

        const node = PDFNode.create(this, await children);
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

        await prom;
    }

}