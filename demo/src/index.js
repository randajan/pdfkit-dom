
import { info, log } from "@randajan/simple-lib/node";

import fs from "fs";
import { PDF } from "../../dist/index.js";
import { content } from "./content.jsx";



const doc = PDF.create({layout:"landscape"});

doc.render(content, fs.createWriteStream('tmp/file.pdf'));


// const gen = new PDFGeneratorItcan();


// gen.pipe();


// gen.render(generateInvoice);



