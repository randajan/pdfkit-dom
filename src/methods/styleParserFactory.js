import jet from "@randajan/jet-core";

const { solid } = jet.prop;

export const setStyleParser = (kind, schema)=>{
    const symbol = Symbol(kind);

    //format schema
    for (const prop of schema) {
        const keys = prop[3] = prop[0].split("|");
        prop[0] = keys[0]; //set name
        prop[2] = blob=>{
            if (keys.length === 1) { return blob[keys[0]]; }
            for (const key of keys) {
                if (blob[key] != null) { return blob[key]; }
            }
        }
    }

    return (blob)=>{
        if (blob && blob.$$kind === symbol) { return blob; }
        const isObj = Object.jet.is(blob);
        const arr = isObj ? [] : Array.jet.to(blob, " ");

        const r = solid({}, "$$kind", symbol, false);
        for (let i in schema) {
            const [name, parser, retrieve, aliases] = schema[i];
            solid(r, name, parser(isObj ? retrieve(blob) : arr[i], arr, r));
        }

        return r;
    }
};