import { Allocator } from "./Allocator";

import jet from "@randajan/jet-core";
import { vault } from "../helpers";

const { solid, cached, virtual } = jet.prop;

const rawSizeCollector = (current, cell)=>current+cell.rawSize;

export class CompetitiveSizingSchema {
    
    constructor(length, fetchStyle, fetchRawSize) {

        const [uid, _p] = vault.set({
            fetchStyle,
            fetchRawSize,
            sizes:Array(length).fill(0),
            followers:new Set()
        });

        virtual(this, "sizes", _=>_p.follow ? _p.follow.sizes : [..._p.sizes]);

        solid.all(this, {
            uid,
            length,
        });

    }

    fetchZones() {
        const _p = vault.get(this.uid);

        const allocator = new Allocator(
            p=>{ p.minimal = []; p.absolute = []; p.relative = []; },
            (t, f)=>{ t.minimal = [...f.minimal]; t.absolute = [...f.absolute]; t.relative = [...f.relative]; },
            (p, kind, cell)=>p[kind].push(cell)
        );
        
        for (let index=0; index<this.length; index++) {
            let rawSize = _p.fetchRawSize(index);

            for (const follower of _p.followers) {
                rawSize = Math.max(rawSize, vault.get(follower.uid).fetchRawSize(index));
            }

            const cell = { index, rawSize };
            
            const { main, min, max } = _p.fetchStyle(index);
            const byMin = main === "min", byMax = (main === "max" || main === "auto");

            if (!byMin && !byMax) { allocator.add(0, Math.max(main, min), "minimal", cell); continue; } //static
            else if (min > 0) { allocator.add(0, min, "minimal", cell); } //relative with min
    
            if (byMax) { allocator.add(min, max, max === Infinity ? "relative" : "absolute", cell); }
            if (byMin) { allocator.add(min, Math.min(max, cell.rawSize), "absolute", cell); }
        }
    
        const zones = [[], []];
        allocator.list.reduce((from, { to, minimal, absolute, relative })=>{
            const size = to-from;
            if (minimal.length) { zones[0].push({to, size, targets:minimal}); }
            if (absolute.length) { zones[1].push({to, size, targets:absolute}); }
            if (relative.length) { zones[1].push({to, size, targets:relative, isRelative:true, relativeSize:relative.reduce(rawSizeCollector, 0)});}
            return to;
        }, 0);

        return [...zones[0], ...zones[1]];
    }

    fetchSizes(zones, freeSpace) {
        const sizes = [];
    
        for (const { size, targets, isRelative, relativeSize } of zones) {
            if (freeSpace <= 0) { break; }
            const toGive = Math.min(freeSpace, size*targets.length);
    
            for (const cell of targets) {
                const val = toGive/(isRelative ? relativeSize/cell.rawSize : targets.length);
                sizes[cell.index] = (sizes[cell.index] || 0) + val;
                freeSpace -= val;
            }
        }

        return sizes;
    }

    resize(freeSpace, recalculateZones=false) {
        const _p = vault.get(this.uid);
        if (_p.follow) { return _p.follow.resize(freeSpace, recalculateZones); }
        if (recalculateZones || !_p.zones) { _p.zones = this.fetchZones(); }
        _p.sizes = this.fetchSizes(_p.zones, freeSpace);
        return this;
    }

    follow(competitiveSchema) {
        const _p = vault.get(this.uid);
        if (!(competitiveSchema instanceof CompetitiveSizingSchema)) { return this; }
        if (_p.follow) { vault.get(_p.follow.uid).delete(this); }
        _p.follow = competitiveSchema;
        vault.get(competitiveSchema.uid).followers.add(this);
        return this;
    }

    end() {
        vault.end(this.uid);
    }

}


export default (length, getStyle, getRawSize)=>new CompetitiveSizingSchema(length, getStyle, getRawSize)