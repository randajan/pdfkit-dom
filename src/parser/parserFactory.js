import jet from "@randajan/jet-core";
import { camelCase } from "../helpers";

const { solid } = jet.prop;

const toArray = v=>typeof v === "number" ? [v] : Array.jet.to(v, " ");

const createRetriever = (aliases)=>{
    if (aliases.length <= 1) { return (ns, obj)=>obj[camelCase(ns, aliases[0])]; }
    return (ns, obj)=>{
        for (const alias of aliases) {
            const name = camelCase(ns, alias);
            if (obj[name] != null) { return obj[name]; }
        }
    }
}

export const createSugarParser = (atrs)=>{
    atrs = atrs.map(a=>Array.jet.to(a, "|"));

    return (ns, obj)=>{
        if (!Object.jet.is(obj)) { obj = {[ns]:obj}; }

        const objns = obj[ns]; delete obj[ns];
        if (objns == null) { return obj; }
        const isObj = Object.jet.is(objns);
        const sugar = isObj ? objns : toArray(objns);

        for (const k in atrs) {
            const atr = atrs[k];
            const name = camelCase(ns, atr[0]);
            if (obj[name] != null) { continue; }

            const raw = sugar[isObj ? atr[0] : k];
            if (raw != null || isObj) { obj[name] = raw; continue; }

            for (let i=1; (i<atr.length); i++) {
                const raw = obj[camelCase(ns, atr[i])];
                if (raw != null) { obj[name] = raw; break; }
            }
        }

        return obj;
    }
}

export const createValidator = (atrs)=>{
    atrs = atrs.map(atr=>{
        const aliases = Array.jet.to(atr[0], "|");
        return [ aliases[0], atr[1], createRetriever(aliases) ];
    });

    return (nss, to, from, defs)=>{
        nss = Array.jet.to(nss, "|");
        const group = {};

        for (const [name, validator, retriever] of atrs) {
            const nsname = camelCase(nss[0], name);
            const def = defs ? defs[nsname] : undefined;
            let raw;
            for (const ns of nss) {
                raw = retriever(ns, from);
                if (raw != null) { break; }
            }

            const value = validator(raw, def, group, raw);
            solid(to, nsname, group[name] = value);
        }

        return to;
    }
}