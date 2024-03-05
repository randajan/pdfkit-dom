import jet from "@randajan/jet-core";
import { typize } from "../helpers";

const { solid } = jet.prop;

export const createParser = props=>{
    
    //format props
    for (const prop of props) {
        const keys = prop[3] = prop[0].split("|");
        prop[0] = keys[0]; //set name
        prop[2] = blob=>{
            if (keys.length === 1) { return blob[keys[0]]; }
            for (const key of keys) {
                if (blob[key] != null) { return blob[key]; }
            }
        }
    }

    const parser = typize((input, defs)=>{
        const isObj = Object.jet.is(input);
        const arr = isObj ? [] : Array.jet.to(input, " ");

        const r = {};
        for (let i in props) {
            const [name, parse, retrieve, aliases] = props[i];
            const value = isObj ? retrieve(input) : arr[i];
            const d = defs ? defs[name] : undefined;
            solid(r, name, parse(value, d, arr, r));
        }
        
        return r;
    });

    return parser;

};