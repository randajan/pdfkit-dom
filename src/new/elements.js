import jet from "@randajan/jet-core";

const _elements = {};
const _defs = {
    "setWidthRaw":{ type:"function", isRequired:true, output:"number" },
    "setWidth":{ type:"function", isRequired:true, output:"number" },
    "setHeightRaw":{ type:"function", isRequired:true, output:"number" },
    "setHeight":{ type:"function", isRequired:true, output:"number"},
    "render":{ type:"function", isRequired:true },
};
const _defsList = Object.keys(_defs);

const msg = (tagName, text, list)=>{
    let msg = "Element" ;
    if (tagName) { msg += ` '${tagName}'`; }
    if (text) { msg += " "+text; }
    if (list) { msg += " '" + list.join(", ") + "'" }
    return msg;
}

const msgDef = (tagName, text, list)=>{
    return msg(tagName, text ? "define failed - " + text : "", list);
}

const validateOutput = (tagName, outputType, output)=>{
    return output;
    if (typeof output === outputType) { return output; }
    throw Error(msg(tagName, "expected output type is " + outputType + "\n got " + output));
}

export const elementDefine = (tagName, definition={})=>{
    tagName = String.jet.to(tagName);
    if (!tagName) { throw Error(msgDef(null, "tagName is missing")); }
    if (_elements.hasOwnProperty(tagName)) { throw Error(msgDef(tagName, "allready defined")); }

    const defsList = Object.keys(definition);

    const unexpected = defsList.filter(d=>!_defsList.includes(d));
    if (unexpected.length) { throw Error(msgDef(tagName, "unexpected definition", unexpected)); }

    const missing = _defsList.filter(d=>_defs[d].isRequired && !definition.hasOwnProperty(d));
    if (missing.length) { throw Error(msgDef(tagName, "missing required", missing)); }

    const mistype = _defsList.reduce((r, d)=>{
        const { type, output } = _defs[d], prop = definition[d];
        if (typeof definition[d] !== type) { r.push(`${d} expect ${type}`); }
        if (type === "function" && output) { definition[d] = async (...a)=>validateOutput(tagName, output, await prop(...a));}
        return r;
    }, []);

    if (mistype.length) { throw Error(msgDef(tagName, "mistype", mistype)); }

    _elements[tagName] = definition;
}

export const elementPick = tagName=>{
    tagName = String.jet.to(tagName);
    if (_elements.hasOwnProperty(tagName)) { return _elements[tagName]; }
    if (!tagName) { throw Error(msg(null, `tagName is missing`)); } 
    throw Error(msg(tagName, `is not defined. Please use PDF.defineElement('${tagName}')`));
}