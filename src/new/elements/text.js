import { elementDefine } from "../elements";



elementDefine("text", {
    measureWidth:(node, widthLimit)=>{
        return node.reduce(async (w, c)=>w + await c.measureWidth(), 0);
    },
    measureHeight:(node, widthLimit, heightLimit)=>{
        return node.reduce(async (w, c)=>w + await c.measureHeight(widthLimit), 0);
    },
    boundWidth:async (node, widthLimit)=>{
        const widthMax = await node.reduce(async (w, c)=>Math.max(w, await c.measureWidth()), 0);
        await node.forEach(c=>c.setWidth(widthMax));
        return widthMax;
    },
    boundHeight:async (node, widthLimit, heightLimit)=>{
        return node.reduce(async (h, c)=>h + await c.setHeight(), 0);
    },
    render:(node, x, y, width, height)=>{
        return node.forEach(async c=>{
            await c.render(x, y);
            y = y+c.height;
        });
    }
});