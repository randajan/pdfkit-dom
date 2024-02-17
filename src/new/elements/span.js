import { elementDefine } from "../elements";



elementDefine("span", {
    getWidth:node=>{
        return node.reduce(async (w, c)=>w + await c.getWidth(), 0);
    },
    getHeight:(node, widthLimit)=>{
        return node.reduce(async (w, c)=>w + await c.getHeight(widthLimit), 0);
    },
    render:(node, x, y, width, height)=>{
        return node.forEach(async c=>{
            const height = await c.getHeight(width);

            await c.render(x, y, width, height);
        });
    }
});