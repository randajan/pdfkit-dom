import jet from "@randajan/jet-core";

const { solid } = jet.prop;
export const vault = jet.vault();

export const sides = ["top", "left", "right", "bottom"];

export const notNullString = (src)=>!src ? undefined : String.jet.to(src);
export const notNullNumber = (src)=>src == null ? undefined : Number.jet.to(src);
export const notNullMinZeroNumber = (src)=>src == null ? undefined : Number.jet.frame(Number.jet.to(src), 0);

export const minNumber = (src, min)=>Math.max(Number.jet.to(src), min);
export const minZeroNumber = (src)=>Math.max(Number.jet.to(src), 0);


export const enumFactory = (enums, after)=>jet.enumFactory(enums, { before:src=>String.jet.to(src).jet.simplify(), after });

export const typize = fce=>{
    const $$kind = Symbol(String.jet.rnd(5));
    const is = any=>any?.$$kind === $$kind;

    return solid((blob, ...a)=>is(blob) ? blob : solid(fce(blob, ...a), "$$kind", $$kind), "is", is);
}

export const mapSides = callback=>{
    const result = {};
    for (const side of sides) { result[side] = callback(side); }
    return result;
}

export const flatArray = (srcArr, dstArr=[])=>{
    if (!Array.isArray(srcArr)) { dstArr.push(srcArr); }
    else {
        for (const item of srcArr) { flatArray(item, dstArr); }
    }
    return dstArr;
}