import { Allocator } from "./Allocator";

import jet from "@randajan/jet-core";
import { parseSize, parseSizes } from "../parser/parsers";

const _zones = ["min", "set", "req", "ext"];

const rawSizeCollector = (current, cell)=>current+cell.sizeRaw;

const allocate = (size, sizes, getRawSize)=>{
    size  = parseSize(size);
    sizes = parseSizes(sizes);

    const allocator = new Allocator(_zones); 
    
    for (let index=0; index<sizes.length; index++) {
        const { main, min, max } = sizes[index];
        const sizeRaw = getRawSize(index);

        const cell = { index, sizeRaw };
        const byMin = main === "min", byMax = main === "max";

        const set = (byMin || byMax) ? min : Number.jet.frame(main, min, max);
        const req = (!byMin && !byMax) ? set : Number.jet.frame(sizeRaw, min, max);

        allocator.add(0, min, "min", cell);
        allocator.add(min, set, "set", cell);
        allocator.add(set, req, "req", cell);

        if (size.main !== "min" && req <= max) { allocator.add(req, max, "ext", cell); }
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

export const getSizing = (limit, propSize, propSizes, getRawSize)=>{
    return fetchSizes(limit, fetchZones(allocate(propSize, propSizes, getRawSize)));
}
