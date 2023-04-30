import PDFElement from "../class/Element";

import jet from "@randajan/jet-core";
import createCompetitiveSchema from "../sizing/Competitive";
import { computeContent } from "../methods/compute";

const { solid, cached } = jet.prop;

export class PDFElementGrid extends PDFElement {
    constructor(gen, rows, style, {
        footer,
        header
    }={}, debugName) {
        super(gen, rows, style, true, debugName);

        cached.all(this, {}, {
            footer:_=>footer instanceof PDFElement ? footer : gen.text(this.style.ellipsis || "", jet.merge({align:"right"}, footer)),
            header:_=>header instanceof PDFElement ? header : gen.text(String.jet.to(header)),
            widthSchema:_=>createCompetitiveSchema(
                rows[0].length, //column count
                index=>rows[0][index].style.width, //get column style
                index=>{ //measure raw width of column
                    return rows.reduce((width, row)=>{ if (row[index]) { return Math.max(width, row[index].width); } }, 0);
                }
            ).follow(header?.widthSchema),
            heightSchema:_=>createCompetitiveSchema(
                rows.length, //column count
                index=>rows[index][0].style.height, //get column style
                index=>{ //measure raw height of row
                    return rows[index].reduce((height, col)=>Math.max(height, col.height), 0);
                }
            )
        });

    }

    getRequiredCellSize(dim, cell) {
        const def = cell[dim];
        const { style, raw, gaps } = cell;
        const main = this.style[dim].main;
        if (main !== "min" && main !== "auto") { return def; }
        return Math.max(style[dim].min, Math.min(def, raw[dim]+gaps[dim]));
    }

    computeRawWidth() {
        return this.value.reduce((width, row)=>Math.max(width, row.reduce((width, el)=>width+this.getRequiredCellSize("width", el), width)), 0);
    };

    computeWidth(raw, x) {
        const { value, gaps, widthSchema } = this;
        const gapX = gaps.column*(value[0].length-1);
        const freeWidth = super.computeWidth(raw+gapX);
        const widths = widthSchema.resize(freeWidth-gapX).sizes;

        const realWidth = gapX+widths.reduce((space, width, colId)=>{
            for (const row of value) { row[colId].set({ height:null, width }); }
            return space += width;
        }, 0);

        return realWidth;
    }

    computeRawHeight() {
        return this.value.reduce((height, row)=>height+row.reduce((height, el)=>Math.max(height, this.getRequiredCellSize("height", el)), 0), 0);
    }

    computeHeight(raw, y) {
        const { gen, value, gaps, footer, header, paging } = this;
        const gapY = gaps.row*(value.length-1);
        const freeHeight = super.computeHeight(raw+gapY);

        const heights = this.heightSchema.resize(freeHeight-gapY, true).sizes;
        const heightExtra = header.height+footer.height+gaps.height;

        let page = [];
        let pageHeight = 0;
        let wholeHeight = 0;

        for (let rowId in heights) {
            const height = heights[rowId];
            const heightFree = gen.page.heightFree-y;

            if (paging && heightFree < pageHeight+gaps.row+height+heightExtra) {
                this.addPage(page, pageHeight);
                page = [];
                pageHeight = 0;
                y = 0;
            } else if (page.length) {
                pageHeight += gaps.row;
                wholeHeight += gaps.row;
            }

            const row = solid([...this.value[rowId]], "height", height);
            page.push(row);

            for (const cell of row) { cell.set({height}); }

            pageHeight += height;
            wholeHeight += height;
        }

        this.addPage(page, pageHeight);

        return wholeHeight;
    };

    render() {
        const { gen, align, content, border, gaps, pages, header, footer, style:{ padding, margin } } = this;

        //const initX = content.x + align.horizontal*(content.width-raw.width);
        //const initY = content.y + align.vertical*(content.height-raw.height);

        for (const page of pages) {
            const boxHeight = page.height + padding.top + padding.bottom;

            let y = 0;
            if (page === pages[0]) { y = border.y; } else { gen.addPage(); y = margin.top; }

            header.set({ y, x:content.x-header.gaps.left, width:content.width+header.gaps.width }).render();
            y += header.height;

            this.drawBox(boxHeight, y);
            y += padding.top;

            for (const row of page) {
                let x = content.x;
        
                for (const cell of row) {
                    if (row === page[0] && cell != row[0]) {
                        this.drawVertical(x - gaps.column/2, row[0].y-padding.top, boxHeight);
                    }

                    cell.set({x, y:y+(align.baseline*(row.height-cell.height))}).render();
                    x += cell.width+gaps.column;
                };
                
                y += row.height;

                if (row != page[page.length-1]) {
                    this.drawHorizontal(y+gaps.row/2);
                    y += gaps.row;
                } else {
                    y += gaps.bottom;
                }
                
            }

            if (page !== pages[pages.length-1]) {
                footer.set({ y:y-margin.bottom, x:content.x-footer.gaps.left, width:content.width+footer.gaps.width }).render();
            }
           
        }

        return super.render();

    }

   end() {
        this.widthSchema.end();
        this.heightSchema.end();
        return super.end();
    }
}