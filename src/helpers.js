import jet from "@randajan/jet-core";


export const vault = jet.vault();

export const sides = ["top", "left", "right", "bottom"];

export const notNullString = (src)=>!src ? undefined : String.jet.to(src);
export const notNullNumber = (src)=>src == null ? undefined : Number.jet.to(src);
export const notNullMinZeroNumber = (src)=>src == null ? undefined : Number.jet.frame(Number.jet.to(src), 0);

export const minZeroNumber = (src)=>Math.max(Number.jet.to(src), 0);


export const enumFactory = (enums, after)=>jet.enumFactory(enums, { before:src=>String.jet.to(src).jet.simplify(), after });

export const flatArray = (srcArr, dstArr=[])=>{
    if (!Array.isArray(srcArr)) { dstArr.push(srcArr); }
    else {
        for (const item of srcArr) { flatArray(item, dstArr); }
    }
    return dstArr;
}