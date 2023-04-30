
import PDFDocument from "pdfkit";

import jet from "@randajan/jet-core";

import { privateScope, sides } from "../helpers";

import { PDFElementText } from "../elements/text";
import { PDFElementGrid } from "../elements/grid";
import { PDFElementSVG } from "../elements/svg";

import { parseStyle } from "../methods/styleParser";
import { drawSheerLine } from "../methods/draw";

const { solid, virtual, cached } = jet.prop;
const _ps = privateScope();

export default class {
    constructor(options) {
        const [ _p, uid ] = _ps.set({
            pageId: 0,
            after: {},
            before: {},
            effect: (event, callback, afterEffect = true) => {
                const listeners = _p[afterEffect ? "after" : "before"];
                let list = listeners[event];
                if (!list) { list = listeners[event] = new Set(); }
                list.add(callback);
                return _ => list.delete(callback);
            }
        });

        const doc = new PDFDocument(options = jet.merge({ size: 'A4' }, options, { bufferPages: true }));

        solid.all(this, {
            uid,
            doc,
            document:doc,
        }, false);

        cached.all(this, _p, {
            style:_=>parseStyle(options.style)
        });

        virtual.all(this, {
            page:_=>doc.page,
            y:_=>doc.y-doc.page.margins.left,
            x:_=>doc.x-doc.page.margins.top
        });

        const extendPage = _ => {
            const page = doc.page;
            solid(page, "id", _p.pageId++);

            virtual.all(page, {
                widthFree: _ => page.width - page.margins.left - page.margins.right,
                heightFree: _ => page.height - page.margins.top - page.margins.bottom
            });

            const { font: { size, family }, color: { foreground, background }, spacing:{ line } } = this.style;

            if (background) {
                doc.save();
                doc.rect(0, 0, page.width, page.height).fill(background);
                doc.restore();
            }

            if (family !== undefined) { doc.font(family); }
            if (size !== undefined) { doc.fontSize(size); }
            if (foreground !== undefined) { doc.fillColor(foreground); }
            if (line !== undefined) { doc.lineGap(line); }

        }

        jet.forEach(options.fonts, (path, key)=>doc.registerFont(key, path));

        extendPage();

        doc.on('pageAdded', _ => {
            extendPage();
            const { before, after } = _p;

            if (before.pageAdded) {
                doc.switchToPage(doc.page.id - 1);
                jet.run(before.pageAdded);
                doc.switchToPage(doc.page.id + 1);
            }
            if (after.pageAdded) { jet.run(after.pageAdded); }

        });

        doc.on("end", _ => { jet.run(_p.after.end); _ps.end(uid); });
        doc.on("data", _ => { jet.run(_p.after.data); });

    }

    pipe(destination, options) {
        this.doc.pipe(destination, options);
        return this;
    }

    after(event, callback) {
        return _ps.get(this.uid).effect(event, callback, true);
    }

    before(event, callback) {
        return _ps.get(this.uid).effect(event, callback, false);
    }

    horizontal(x, y, length, style) {
        drawSheerLine(false, this.doc, x, y, length, style);
        return this;
    }
    vertical(x, y, length, style) {
        drawSheerLine(true, this.doc, x, y, length, style);
        return this;
    }

    textWidth(text, options) {
        return this.doc.widthOfString(text, options);
    }

    textHeight(text, options) {
        return this.doc.heightOfString(text, options);

    }

    addPage(options) {
        this.doc.addPage(options);
        return this;
    }

    styled(style, render) {
        const { doc } = this;
        const _fontSize = doc._fontSize;
        const _fontFamily = doc._font?.name;
        const _fillColor = doc._fillColor ? doc._fillColor[0] : undefined;

        const { font: { size, family }, color: { foreground } } = style = parseStyle(style);

        if (family) { doc.font(family); }
        if (size) { doc.fontSize(size); }
        if (foreground) { doc.fillColor(foreground); }

        const result = render(this, style);

        doc.font(_fontFamily, _fontSize).fillColor(_fillColor);

        return result;
    }

    text(text, style, debugName) {
        return new PDFElementText(this, text, style, debugName);
    }

    grid(rows, style, options, debugName) {
        return new PDFElementGrid(this, rows, style, options, debugName);
    }

    svg(svg, style, debugName) {
        return new PDFElementSVG(this, svg, style, debugName);
    }

    overflow(side = "top", renderer) {
        if (!sides.includes(side)) { throw new Error(`doc.overflow accepts only '${sides.join("', '")}' but was provided with '${side}'`); }
        const { page } = this;
        const margins = { ...page.margins };
        const margin = margins[side];
        page.margins[side] = 0;
        renderer(margins);
        page.margins[side] = margin;
        return this;
    }

    header(renderer) {
        _ps.get(this.uid).header = renderer;
        return this;
    }

    footer(renderer) {
        _ps.get(this.uid).footer = renderer;
        return this;
    }

    mapPages(fce) {
        const { doc } = this;
        const pages = doc.bufferedPageRange();
        const currentPage = doc.page;
        const result = [];

        for (let id = 0; id < pages.count; id++) {
            doc.switchToPage(id);
            result.push(fce(doc.page, id, pages.count));
        }

        doc.switchToPage(currentPage.id);

        return result;
    }

    render(renderer) {
        const result = renderer(this);

        let { header, footer } = _ps.get(this.uid);

        this.mapPages((page, id, count)=>{
            if (jet.isRunnable(header)) { this.overflow("top", (margins)=>header(margins, id, count)); }
            if (jet.isRunnable(footer)) { this.overflow("bottom", (margins)=>footer(margins, id, count)); }
        });

        jet.run(_ps.get(this.uid).before.end);
        this.doc.end();

        return result;
    }

}