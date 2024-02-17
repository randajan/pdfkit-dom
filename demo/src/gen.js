import fse from "fs-extra";

import { PDFGenerator } from "../../dist/index.js";
import jet from "@randajan/jet-core";


const { cached } = jet.prop;

const logoPath = "demo/static/img/logoItcan_plainColor.svg";
const margins = { top:90, bottom:60, left:30, right:30 };
const fonts = {};
["Regular", "Medium", "SemiBold", "Bold", "ExtraBold"].forEach(n=>fonts[n.toLowerCase()] = `demo/static/fonts/Baloo2-${n}.ttf`);


export class PDFGeneratorItcan extends PDFGenerator {
    constructor(options) {

        super(options = jet.merge({ margins, fonts, style:{
            font:"10 regular",
            color:"#666",
            spacing:-3,
        } }, options));

        cached(this, {}, "logoRaw", _=>fse.readFileSync(logoPath).toString());

    }

    logo(style) {
        return this.svg(this.logoRaw, style);
    }

    header(text) {
        return super.header(({ top })=>{
            const header = this.grid([[
                this.logo({
                    width:top,
                    align:"left bottom"
                }),
                this.text(text, {
                    font:"12 bold",
                    color:"#666",
                    align:"right bottom",
                })
            ]], {
                padding:"0 15",
                margin:5,
                width:"max",
                height:top,
                border:{ bottom:"1 gray" },
                columns:2
            }).render();
        });
    }

    footer(text) {
        return super.footer(({ top, bottom }, pageId, pageCount)=>{
            this.grid([[
                this.text(text, {
                    align:"left middle",
                    color:"#999",
                    font:"10 regular italic"
                }),
                this.text(`${pageId + 1}/${pageCount}`, {
                    width:"min 30",
                    align:"right middle",
                    color:"#999",
                    font:"10 regular",
                }),
            ]], {
                padding:"0 5",
                margin:5,
                width:"max",
                border:{ top:"1 gray", column:"1 lightgray"},
                columns:2,
                grid:"0 5"
            }).set({y:this.page.height-bottom-top}).render();

        })
    }

    contact(title, contact, style) {
        const { name, tin, street, city, phone, email } = contact;
        return this.grid([
            [this.text(title, { border:{bottom:"1 lightgray"}, padding:"0 15" })],
            [this.text(name, { font:"12 bold", padding:"0 5" })],
            [this.text(street, { padding:"0 6" })],
            [this.text(city, { padding:"0 6" })],
            [this.grid([
                [this.text("IČ:", { width:"min" }), this.text(contact.in)],
                [this.text("DIČ:"), this.text(tin)],
                [this.text("Telefon:", { font:8 }), this.text(phone, { font:8 })],
                [this.text("E-mail:", { font:8 }), this.text(email, { font:8 })]
            ],{ padding:"0 6", grid:"0 6" })]
        ], style, {});
    }


    contacts(leftTitle, rightTitle, leftContact, rightContact) {

        const contacts = [
            this.contact(leftTitle, leftContact),
            this.contact(rightTitle, rightContact, {}, rightTitle)
        ];
        
        contacts[1].heightSchema.follow(contacts[0].heightSchema);
        contacts[1].value[4][0].heightSchema.follow(contacts[0].value[4][0].heightSchema);

        const grid = this.grid([
            contacts
        ], { padding:"5 10", grid:"5 10" }, {});

        return grid;

    }

}