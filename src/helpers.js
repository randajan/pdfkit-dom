import jet from "@randajan/jet-core";

export const privateScope = _=>{
    const _private = {};
    let _uid = 1;
    
    return {
        set:data=>{
            const uid = Symbol("$$"+(_uid++));
            return [ _private[uid] = data, uid ];
        },
        get:uid=>_private[uid],
        end:uid=>delete _private[uid]
    }
}

export const sides = ["top", "left", "right", "bottom"];

export const notNullString = (src)=>!src ? undefined : String.jet.to(src);
export const notNullNumber = (src)=>src == null ? undefined : Number.jet.to(src);
export const notNullMinZeroNumber = (src)=>src == null ? undefined : Number.jet.frame(Number.jet.to(src), 0);

export const minZeroNumber = (src)=>Math.max(Number.jet.to(src), 0);


export const enumFactory = (enums, after)=>jet.enumFactory(enums, { before:src=>String.jet.to(src).jet.simplify(), after });