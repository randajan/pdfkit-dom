import jet from "@randajan/jet-core";

const { solid } = jet.prop;

export class Allocator {
    constructor(kinds) {
        const list = [{to:Infinity}];

        const copy = (t, f)=>{ for (const k of kinds) { t[k] = [...f[k]] } };

        const add = (from, to, kind, item)=>{
            if (from >= to) { return; }
            for (let i=0; i<list.length; i++) {
                const bef = list[i-1], pipe = list[i];
                const pFrom = bef ? bef.to : 0, pTo = pipe.to;
                if (pFrom >= to) { break } //above maximum
                if (pTo <= from) { continue; } //belove minimum
                if (pFrom < from) { list.splice(i, 0, {to:from}); copy(list[i], pipe); continue; } //low split
                if (pTo > to) { list.splice(i, 0, {to}); copy(list[i], pipe); } //up split
                list[i][kind].push(item);
            }
        }

        solid.all(this, {
            list,
            add
        });

        for (const k of kinds) {
            if (k === "to") { throw Error("Allocator kind 'to' is prohibited"); }
            list[0][k] = [];
        }
    }


}