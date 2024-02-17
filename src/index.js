import PDFGenerator from "./class/Generator";
import PDFElement from "./class/Element";
import { PDFElementText } from "./elements/text";
import { PDFElementGrid } from "./elements/grid";
import { PDFElementSVG } from "./elements/svg";
import { PDF } from "./new/class/PDF.js";
import "./new/elements/*";



export {
    PDFGenerator,
    PDFElement,
    PDFElementText,
    PDFElementGrid,
    PDFElementSVG,
    PDF
}

export default options=>new PDFGenerator(options);