import jet from "@randajan/jet-core";
import { sides } from "./helpers";

const { solid } = jet.prop;

export const computeGaps = (element)=>{
    const { rows, columns, style:{
        marginTop, marginRight, marginBottom, marginLeft,
        paddingTop, paddingRight, paddingBottom, paddingLeft,
        borderTopWeight, borderRightWeight, borderBottomWeight, borderLeftWeight, borderRowWeight, borderColumnWeight,
        gridHorizontal, gridVertical
    } } = element;

    const top = marginTop+borderTopWeight+paddingTop;
    const right = marginRight+borderRightWeight+paddingRight;
    const bottom = marginBottom+borderBottomWeight+paddingBottom;
    const left = marginLeft+borderLeftWeight+paddingLeft;

    const row = 2*gridHorizontal + borderRowWeight;
    const column = 2*gridVertical + borderColumnWeight;

    const gapsRow = 2*gridHorizontal + Math.max(0, rows.length-1)*row;
    const gapsColumn = 2*gridVertical + Math.max(0, columns.length-1)*column;

    return solid.all({}, {
        top, right, bottom, left,
        width:left+right+gapsColumn,
        height:top+bottom+gapsRow,
        row, column
    });
}

export const computeAligns = (element)=>{
    const { alignHorizontal, alignVertical, alignBaseline } = element.style;
    return solid.all({}, {
        horizontal:alignHorizontal === "right" ? 1 : alignHorizontal === "center" ? .5 : 0,
        vertical:alignVertical === "bottom" ? 1 : alignVertical === "center" ? .5 : 0,
        baseline:alignBaseline === "bottom" ? 1 : alignBaseline === "middle" ? .5 : 0,
    })
}