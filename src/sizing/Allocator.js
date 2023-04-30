import jet from "@randajan/jet-core";

const { solid, virtual, safe, cached } = jet.prop;

export class Allocator {
    constructor(ini, copy, add) {
        const list = [{to:Infinity}];

        const _add = (from, to, ...args)=>{
            for (let i=0; i<list.length; i++) {
                const bef = list[i-1], pipe = list[i];
                const pFrom = bef ? bef.to : 0, pTo = pipe.to;
                if (pFrom >= to) { break } //above maximum
                if (pTo <= from) { continue; } //belove minimum
                if (pFrom < from) { list.splice(i, 0, {to:from}); copy(list[i], pipe); continue; } //low split
                if (pTo > to) { list.splice(i, 0, {to}); copy(list[i], pipe); } //up split
                add(list[i], ...args); //up limit
            }
        }

        solid.all(this, {
            list,
            add:_add
        });

        ini(list[0]);
    }


}