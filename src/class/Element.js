import jet from "@randajan/jet-core";
import { notNullMinZeroNumber, privateScope } from "../helpers";
import { parseStyle } from "../methods/styleParser";
import { computeAligns, computeContent, computeGaps } from "../methods/compute";

const { solid, safe, cached, virtual } = jet.prop;

const _ps = privateScope();

export default class PDFElement {

    constructor(gen, value, style, allowPaging, debugName) {
        const [ _p, uid ] = _ps.set({
            raw:{},
            forced:{},
            content:{},
            isComputingHeight:false,
            reset:_=>{
                delete _p.pages;
                delete _p.x;
                delete _p.y;
                delete _p.width;
                delete _p.height;
                delete _p.raw.width;
                delete _p.raw.height;
                for (let i in _p.content) { delete _p.content[i]; }
            }
        });

        const recompute = ()=>{
            
            _p.pages = [];

            _p.x = Math.max(0, _p.forced.x || 0);
            _p.y = Math.max(0, _p.forced.y || 0);

            _p.raw.width = this.computeRawWidth();
            _p.content.width = this.computeWidth(_p.raw.width, _p.x);

            
            _p.raw.height = this.computeRawHeight();
            _p.isComputingHeight = true;
            _p.content.height = this.computeHeight(_p.raw.height, _p.y);
            _p.isComputingHeight = false;
        }

        cached.all(this, {}, {
            style:_=>parseStyle(style),
            gaps:_=>computeGaps(this.style),
            align:_=>computeAligns(this.style),
            raw:_=>cached.all({}, _p.raw, {
                width:_=>{ recompute(); return _p.raw.width;  },
                height:_=>{ recompute(); return _p.raw.height; }
            }),
            forced:_=>safe.all({}, _p.forced, {
                x:{}, y:{}, width:{}, height:{}
            }),
            free:_=>virtual.all({}, {
                width:_=>gen.page.widthFree - this.x,
                height:_=>this.paging ? Infinity : gen.page.heightFree - this.y
            }),
            content:_=>cached.all({}, _p.content, {
                x:_=>this.x+this.gaps.left,
                y:_=>this.y+this.gaps.top,
                width:_=>{ recompute(); return _p.content.width; },
                height:_=>{ recompute(); return _p.content.height; }
            }),
            padding:_=>virtual.all({}, {
                x:_=>this.content.x-this.style.padding.left,
                y:_=>this.content.y-this.style.padding.top,
                width:_=>this.style.padding.left+this.content.width+this.style.padding.right,
                height:_=>this.style.padding.top+this.content.height+this.style.padding.bottom
            }),
            border:_=>virtual.all({}, {
                x:_=>this.x+this.style.margin.left,
                y:_=>this.y+this.style.margin.top,
                width:_=>this.width-this.style.margin.left-this.style.margin.right,
                height:_=>this.height-this.style.margin.top-this.style.margin.bottom
            }),
            paging:_=>allowPaging && this.style.paging
        });

        virtual.all(this, {
            pages:_=>{
                if (!_p.pages) { recompute(); }
                return [..._p.pages]
            }
        });

        cached.all(this, _p, {
            x:_=>{ recompute(); return _p.x; },
            y:_=>{ recompute(); return _p.y; },
            width:_=>this.content.width+this.gaps.width,
            height:_=>this.content.height+this.gaps.height,
        });

        solid.all(this, {
            uid,
            gen,
            value,
            debugName
        }, false);

        gen.after("end", _=>this.end());
    }

    log(...msgs) {
        if (this.debugName) { console.log(`PDFElement '${this.debugName}': ${String.jet.to(msgs, ", ")}`); }
    }

    addPage(childrens, height) {
        const _p = _ps.get(this.uid);
        if (!_p.isComputingHeight) { throw Error("PDFElement.addPage(childrens) could be executed only in the scope of .computeHeight() function"); }
        _p.pages.push(childrens = solid([...childrens], "height", height));
        return childrens;
    }

    computeRawWidth() {
        return 0;
    }

    computeRawHeight() {
        return 0;
    }

    computeWidth(raw) {
        const { forced, free, gaps, style } = this;
        return computeContent(raw, forced.width, free.width, gaps.width, style.width );
    }

    computeHeight(raw) {
        const { forced, free, gaps, style } = this;
        return computeContent(raw, forced.height, free.height, gaps.height, style.height );
    }

    drawHorizontal(y, altX, altWidth) {
        const { gen, padding, style:{ border } } = this;
        const m = gen.page.margins;

        const x = altX != null ? altX : padding.x;
        const width = altWidth != null ? altWidth : padding.width;

        gen.horizontal(m.left+x, m.top+y, width, border.row);

        return this;
    }
    
    drawVertical(x, altY, altHeight) {
        const { gen, padding, style:{ border} } = this;
        const m = gen.page.margins;

        const y = altY != null ? altY : padding.y;
        const height = altHeight != null ? altHeight : padding.height;

        gen.vertical(m.left+x, m.top+y, height, border.column);

        return this;
    }

    drawBox(altHeight, altY) {
        const { gen, padding, style:{ border, color } } = this;
        let {x, y, width, height} = padding;
        const m = gen.page.margins;

        if (altY != null) { y = altY; }
        if (altHeight != null) { height = altHeight; }

        x += m.left; y += m.top;

        const fill = color.background;
        if (fill && fill !== "transparent") {
            const color = gen.doc._fillColor;
            gen.doc.save();
            gen.doc.rect(x, y, width, height).fill(fill);
            gen.doc.restore();
            gen.doc.fillColor(color);
        }

        const w = {};
        for (let i in border) { w[i] = border[i].weight/2; }

        x -= w.left; y -= w.top;
        width += w.left+w.right;
        height += w.top+w.bottom;
    
        gen.horizontal(x, y, width, border.top);
        gen.vertical(x+width, y, height, border.right);
        gen.vertical(x, y, height, border.left);
        gen.horizontal(x, y+height, width, border.bottom);
    
        return this;
    }

    set(options={}) {
        const _p = _ps.get(this.uid);

        let {x, y, width, height} = options;

        x = (options.hasOwnProperty("x") || _p.x == null) ? Number.jet.to(x) : _p.x;
        y = (options.hasOwnProperty("y") || _p.y == null) ? Number.jet.to(y) : _p.y;
        width = options.hasOwnProperty("width") ? notNullMinZeroNumber(width) : _p.forced.width;
        height = options.hasOwnProperty("height") ? notNullMinZeroNumber(height) : _p.forced.height;

        if (_p.x !== x || _p.y !== y || _p.forced.width !== width || _p.forced.height !== height) {
            _p.forced.x = x;
            _p.forced.y = y;
            _p.forced.width = width;
            _p.forced.height = height;
            _p.reset();
        }
        return this;
    }

    render() {
        return this;
    }

    end() {
        _ps.end(this.uid);
    }
    
}