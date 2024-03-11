
const _sugars = {};

const addSugar = (ns, atrs)=>{

    for (const atr of atrs) {
        const alts = Array.jet.to(atr[0], "|").map(key=>String.jet.capitalize(key));
        const name = atr[0] = alts[0]; //set name
    }

    _sugars[ns] = (from, to)=>{

    }
}


const explodeSugars = (obj, ns, ...atrs)=>{
    const toArray = v=>typeof v === "number" ? [v] : Array.jet.to(v, " ");

    for (const atr of atrs) {
        const aliases = Array.jet.to(atr[0], "|").map(key=>String.jet.capitalize(key));
        const name = atr[0] = keys[0]; //set name
        atr[2] = createRetriever(name, keys);
    }
}

addSugar("width", ["", "min", "max"]);
addSugar("height", ["", "min", "max"]);
addSugar("padding", ["top", "right|top", "bottom|top", "left|right"]);
addSugar("margin", ["top", "right|top", "bottom|top", "left|right"]);


const sugarPaterns = {
    width:["", "min", "max"],
    height:["", "min", "max"],
    padding:["top", "right|top", "bottom|top", "left|right"],
    margin:["top", "right|top", "bottom|top", "left|right"],
    font:["size", "family", "italic", "underline"],
    align:["horizontal", "vertical", "baseline"],
    grid:["horizontal", "vertical"],
    spacing:["line", "word", "character"],
    color:["foreground", "background", "opacity"],
    
}