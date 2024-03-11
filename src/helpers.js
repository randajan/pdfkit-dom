import jet from "@randajan/jet-core";

const { solid } = jet.prop;
export const vault = jet.vault();

export const sides = ["top", "left", "right", "bottom"];

export const notNull = (...src)=>{
    for (const item of src) { if (item != null && item !== "") { return item; } }
}

export const onNotNull = (on, ...src)=>{
    const v = notNull(...src);
    if (v != null) { return on(v); }
}

export const notNullBoolean = (...src)=>onNotNull(Boolean.jet.to, ...src);
export const notNullString = (...src)=>onNotNull(String.jet.to, ...src);
export const notNullNumber = (...src)=>onNotNull(Number.jet.to, ...src);

export const notNullMinZeroNumber = (...src)=>onNotNull(minZeroNumber, ...src);

export const minNumber = (min, ...src)=>Math.max(min, Number.jet.to(notNull(...src)));
export const minZeroNumber = (...src)=>Math.max(0, Number.jet.to(notNull(...src)));

export const sum = (...nums)=>nums.reduce((r, n)=>r+n, 0);

export const enumFactory = (enums, after)=>jet.enumFactory(enums, { before:src=>String.jet.to(src).jet.simplify(), after });

export const camelCase = (...strs)=>{
    let str = "";
    for (const s of strs) {
        if (s) { str += str ? String.jet.capitalize(s) : s; }
    }
    return str;
}

export const typize = fce=>{
    const $$kind = Symbol(String.jet.rnd(5));
    const is = any=>any?.$$kind === $$kind;
    const parse = (input, defs)=>{
        if (is(input)) { return input; }
        if (defs && !is(defs)) { defs = fce(defs); }
        return solid(fce(input, defs), "$$kind", $$kind, false)
    };

    return solid(parse, "is", is, false);
}

export const mapSides = callback=>{
    const result = {};
    for (const side of sides) { result[side] = callback(side); }
    return result;
}

export const flatArray = (srcArr, dstArr=[])=>{
    if (srcArr == null) {}
    else if (!Array.isArray(srcArr)) { dstArr.push(srcArr); }
    else {
        for (const item of srcArr) { flatArray(item, dstArr); }
    }
    return dstArr;
}

export const fitArray = (arr, requestedLength)=>{
    const length = arr?.length || 0;
    if (!length || length === requestedLength) { return arr; }

    const diff = Math.abs(length - requestedLength);
    
    for (let i=0; i < diff; i++) {
        if (length > requestedLength) { arr.pop(); }
        else { arr.push(arr[Number.jet.period(i, 0, length)]); }
    }

    return arr;
}