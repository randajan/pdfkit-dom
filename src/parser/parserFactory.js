import jet from "@randajan/jet-core";
import { typize } from "../helpers";

const { solid } = jet.prop;

const toArray = v=>typeof v === "number" ? [v] : Array.jet.to(v, " ");

export const createParser = (atrs)=>{
    
    //format atrs
    for (const atr of atrs) {
        const keys = Array.jet.to(atr[0], "|").map(key=>String.jet.capitalize(key));
        const name = atr[0] = keys[0]; //set name

        if (!name) {
            atr[2] = ()=>{};
        } else if (keys.length === 1) { 
            atr[2] = (ns, from)=>from[ns+name];
        } else {
            atr[2] = (ns, from)=>{
                for (const key of keys) {
                    if (from[ns+key] != null) { return from[ns+key]; }
                }
            }
        }

    }

    return (ns, to, from, defs)=>{
        const arr = toArray(from[ns]);

        for (let i in atrs) {
            const [name, parse, retrieve] = atrs[i];
            const value = retrieve(ns, from);
            const def = defs ? defs[name] : undefined;
            solid(to, ns+name, parse(value != null ? value : arr[i], def, arr, to));
        }

        return to;
    };

};