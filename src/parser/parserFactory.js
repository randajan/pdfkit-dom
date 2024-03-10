import jet from "@randajan/jet-core";
import { notNull } from "../helpers";

const { solid } = jet.prop;

const toArray = v=>typeof v === "number" ? [v] : Array.jet.to(v, " ");

const createRetriever = (name, keys)=>{
    if (!name) { return ()=>{}; }
    if (keys.length === 1) { return (ns, from)=>from[ns+name]; }
    return (ns, from)=>{
        for (const key of keys) {
            if (from[ns+key] != null) { return from[ns+key]; }
        }
    }
}


export const createParser = (atrs)=>{

    //format atrs
    for (const atr of atrs) {
        const keys = Array.jet.to(atr[0], "|").map(key=>String.jet.capitalize(key));
        const name = atr[0] = keys[0]; //set name
        atr[2] = createRetriever(name, keys);
    }

    return (nss, to, from, defs)=>{
        nss = Array.isArray(nss) ? nss : [nss];
        const arr = nss.map(ns=>toArray(from[ns]));

        for (let i in atrs) {
            const [name, parse, retrieve] = atrs[i];
            const def = defs ? defs[nss[0]+name] : undefined;
            let raw;
            for (let y in nss) {
                raw = notNull(retrieve(nss[y], from), arr[y][i]);
                if (raw != null) { break; }
            }

            const val = parse(raw, def, arr[0], to);
            if (val != null) { solid(to, nss[0]+name, val); }
        }
    };

};