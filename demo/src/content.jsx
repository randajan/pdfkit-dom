import info from "@randajan/simple-lib/info";
import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";
import fse from "fs-extra";

const Lorem = props=>{
    const { words } = props;


    return (
        <div style={{ border:"1 green", align:"center middle", width:"max", height:"max" }}>
            <div style={{ border:"1 yellow", align:"center" }}>{loremIpsum({ count:words, units:"words" })}</div>
        </div>
    );
}


const rgb = [{bg:"red .2"}, {bg:"green .2"}, {bg:"blue .2"}];

export const content = (
    <grid style={{columns:["150", "max", "50"], rows:rgb, height:"max", width:"min", align:"center middle", margin:"30", grid:"5", color:"green"}}>
        {Array(9).fill("").map(v=><Lorem words={Math.round(Number.jet.rnd(5, 5))}/>)}
    </grid>
);