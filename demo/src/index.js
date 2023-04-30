
import { info, log } from "@randajan/simple-lib/node";
import PDFGenerator from "../../dist/index.js";
import fs from "fs";


const gen = new PDFGenerator({});

gen.pipe(fs.createWriteStream('file.pdf'));


