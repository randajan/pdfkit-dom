import { elementDefine } from "../elements";



// elementDefine("div", {
//     measureWidth:node=>{
//         return node.reduce(async (w, c)=>w + await c.measureWidth(), 0);
//     },
//     measureHeight:node=>{
//         return node.reduce(async (w, c)=>w + await c.measureHeight(widthMax), 0);
//     },
//     bound:async (node, widthLimit, heightLimit)=>{
//         await node.forEach(async c=>{
//             const height = await c.measureHeight(widthLimit, heightLimit);
//             await c.bound(widthLimit, height);
//         });
//         return {
//             width:widthLimit,
//             height:heightLimit
//         }
//     },
//     render:(node, x, y)=>{
//         return node.forEach(async c=>{
//             await c.render(x, y);
//             y = y+c.height;
//         });
//     }
// });