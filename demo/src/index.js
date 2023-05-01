
import { info, log } from "@randajan/simple-lib/node";

import fs from "fs";
import { generateInvoice } from "./invoice.js";
import { PDFGeneratorItcan } from "./gen.js";


const gen = new PDFGeneratorItcan();


gen.pipe(fs.createWriteStream('tmp/file.pdf'));


gen.render(generateInvoice);

