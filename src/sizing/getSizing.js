import { Allocator } from "./Allocator";

import jet from "@randajan/jet-core";

const _zones = ["min", "set", "req", "ext"];

const rawSizeCollector = (current, cell)=>current+cell.sizeRaw;

const allocate = (size, sizes, getRawSize)=>{

    const allocator = new Allocator(_zones); 
    
    for (let index=0; index<sizes.length; index++) {
        const { size, sizeMin, sizeMax } = sizes[index];
        const sizeRaw = getRawSize(index);

        const cell = { index, sizeRaw };
        const byMin = size === "min", byMax = size === "max";

        const set = (byMin || byMax) ? sizeMin : Number.jet.frame(size, sizeMin, sizeMax);
        const req = (!byMin && !byMax) ? set : Number.jet.frame(sizeRaw, sizeMin, sizeMax);

        allocator.add(0, sizeMin, "min", cell);
        allocator.add(sizeMin, set, "set", cell);
        allocator.add(set, req, "req", cell);

        if (size !== "min" && req <= sizeMax) { allocator.add(req, sizeMax, "ext", cell); }
    }

    return allocator;
}

const fetchZones = (allocator)=>{
    const zones = _zones.map(z=>[]);

    let from = 0;

    for (const a of allocator.list) {
        const size = a.to-from;
        for (const i in _zones) {
            const zone = _zones[i];
            const targets = a[zone];
            if (!targets.length) { continue; }
            zones[i].push({ size, zone, targets });
        }
        from = a.to;
    }

    return [].concat(...zones);
}

const fetchSizes = (limit, zones)=>{
    const sizes = [];
    for (const { size, zone, targets } of zones) {
        if (limit <= 0) { break; }
        const toGive = Math.min(limit, size*targets.length);
        const isExt = zone === "ext";
        const sizeRawTotal = isExt ? targets.reduce(rawSizeCollector, 0) : undefined;

        for (const { index, sizeRaw } of targets) {
            const val = toGive/(isExt ? sizeRawTotal/sizeRaw : targets.length);
            sizes[index] = (sizes[index] || 0) + val;
            limit -= val;
        }
    }
    
    return sizes;
}


const fixSizes = (limit, cells)=>{
    let totalMin = 0, totalFix = 0;

    for (const { size, sizeMin } of cells) {
        if (typeof size == "number") { totalFix += size; }
        totalMin += sizeMin; 
    }

    const setMin = Math.min(limit, totalMin), setFix = Math.min(limit-setMin, totalFix);
    const ratioMin = totalMin <= 0 ? 0 : setMin / totalMin, ratioFix = totalFix <= 0 ? 0 : setFix / totalFix;

    return cells.map(({size, sizeMin})=>{
        const min = sizeMin*ratioMin;
        return min + (typeof size != "number" ? 0 : Math.max(0, size*ratioFix-min));
    });
}

export const getSizing = (limit, size, cells, getRawSize)=>{
    
    if (limit == 600) { console.log(limit, fixSizes(limit, cells)); }
    return fetchSizes(limit, fetchZones(allocate(size, cells, getRawSize)));
}
