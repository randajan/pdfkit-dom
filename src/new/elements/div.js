import { elementDefine } from "../elements";



elementDefine("div", {
    getWidth:node=>{
        return node.reduce(async (w, c)=>w + await c.getWidth(), 0);
    },
    getHeight:node=>{
        return node.reduce(async (w, c)=>w + await c.getHeight(widthMax), 0);
    },
    render:(node, x, y, width, height)=>{
        return node.forEach(async c=>{
            const height = await c.getHeight(width);

            await c.render(x, y, width, height);
            y = y+height;
        });
    }
});