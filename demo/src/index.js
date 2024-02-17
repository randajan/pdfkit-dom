
import { info, log } from "@randajan/simple-lib/node";

import fs from "fs";
import { generateInvoice } from "./invoice.js";
import { PDFGeneratorItcan } from "./gen.js";
import { PDF } from "../../dist/index.js";
import { newContent } from "./new.jsx";



const doc = PDF.create({ style:{
    font:"15 Helvetica",
    color:"#FF0000"
} });

doc.render(newContent, fs.createWriteStream('tmp/file.pdf'));


// const gen = new PDFGeneratorItcan();


// gen.pipe();


// gen.render(generateInvoice);



