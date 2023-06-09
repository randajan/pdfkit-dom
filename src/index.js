import PDFGenerator from "./class/Generator";
import PDFElement from "./class/Element";
import { PDFElementText } from "./elements/text";
import { PDFElementGrid } from "./elements/grid";
import { PDFElementSVG } from "./elements/svg";

export {
    PDFGenerator,
    PDFElement,
    PDFElementText,
    PDFElementGrid,
    PDFElementSVG
}

export default options=>new PDFGenerator(options);