import jet from "@randajan/jet-core";
import { typize } from "../../helpers";

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

    return typize((input, def)=>{
        const isObj = Object.jet.is(input);
        const arr = isObj ? [] : Array.jet.to(input, " ");

        const r = {};
        for (let i in props) {
            const [name, parser, retrieve, aliases] = props[i];
            solid(r, name, parser(isObj ? retrieve(input) : arr[i], arr, r));
        }
        
        return r;
    });

};