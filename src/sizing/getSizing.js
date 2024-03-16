import { sum } from "../helpers";
import { Allocator } from "./Allocator";

import jet from "@randajan/jet-core";

const fetchZones = (allocator)=>{
    const kinds = allocator.kinds;
    const zones = kinds.map(z=>[]);

    let from = 0;

    for (const a of allocator.list) {
        const size = a.to-from;
        for (const i in kinds) {
            const zone = kinds[i];
            const targets = a[zone];
            if (!targets.length) { continue; }
            zones[i].push({ size, zone, targets });
        }
        from = a.to;
    }

    return [].concat(...zones);
}

const allocateZones = (maximaze, cells, getRawSize)=>{
    const allocator = new Allocator(["req", "ext"]);
    
    for (let index=0; index<cells.length; index++) {
        const { size, sizeMin, sizeMax } = cells[index];
        const byMin = size === "min", byMax = size === "max";
        if (!byMin && !byMax) { continue; }

        const sizeRaw = getRawSize(index);
        const cell = { index, sizeRaw };
        const req = Math.min(sizeRaw, sizeMax);

        allocator.add(sizeMin, req, "req", cell);
        if (maximaze && byMax) { allocator.add(req, sizeMax, "ext", cell); }
    }

    return allocator;
}

const getFixedSizes = (limit, cells)=>{
    if (limit <= 0) { return { sum:0, sizes:[] }; }

    let totalMin = 0, totalFix = 0;

    for (const { size, sizeMin } of cells) {
        if (typeof size == "number") { totalFix += size; }
        totalMin += sizeMin; 
    }

    const setMin = Math.min(limit, totalMin), setFix = Math.min(limit-setMin, totalFix);
    const ratioMin = totalMin <= 0 ? 0 : setMin / totalMin, ratioFix = totalFix <= 0 ? 0 : setFix / totalFix;

    return {
        sum:setMin+setFix,
        sizes:cells.map(({size, sizeMin})=>{
            const min = sizeMin*ratioMin;
            return min + (typeof size != "number" ? 0 : Math.max(0, size*ratioFix-min));
        })
    }
}

const getAutoSizes = (maximaze, limit, cells, getRawSize)=>{
    if (limit <= 0) { return { sum:0, sizes:[] }; }

    const allocator = allocateZones(maximaze, cells, getRawSize);
    const zones = fetchZones(allocator);

    const sizes = [];
    let sum = 0;

    for (const { size, zone, targets } of zones) {
        if (limit <= 0) { break; }
        const toGive = Math.min(limit, size*targets.length);
        const isExt = zone === "ext";
        //const sizeRawTotal = isExt ? targets.reduce(rawSizeCollector, 0) : undefined;

        for (const { index, sizeRaw } of targets) {
            const val = toGive/( targets.length); //isExt ? sizeRawTotal/sizeRaw :
            sizes[index] = (sizes[index] || 0) + val;
            sum += val;
            limit -= val;
        }
    }
    
    return { sum, sizes }

}



export const getSizing = (limit, size, cells, getRawSize)=>{
    const maximaze = size === "max";

    const fixed = getFixedSizes(limit, cells);
    limit -= fixed.sum;
    const auto = getAutoSizes(maximaze, limit, cells, getRawSize);
    limit -= auto.sum;

    const sum = fixed.sum + auto.sum;
    
    return cells.map((c, i)=>{
        let sizeSet = (fixed?.sizes[i] || 0) + (auto?.sizes[i] || 0);
        return (!maximaze || limit <= 0) ? sizeSet : sizeSet + limit*( sizeSet / sum );
    });
}
