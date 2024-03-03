import info from "@randajan/simple-lib/info";
import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";
import logo from "./logoItcan_plainColor.svg";
import grunt from "./GRUNT.jpeg";
import fse from "fs-extra";

const img = await fse.readFile(info.dir.dist + "\\" + logo);

const Lorem = props=>{
    const { words } = props;

    return (
        <div border="1 green" align="center middle" width="max">
            <div width="max" height="max" border="1 red">{loremIpsum({ count:words, units:"words" })}</div>
        </div>
    );
}

const rowCount = 8;
const row = [];
for (let i=0; i<rowCount; i++) {
    row.push(<Lorem words={Math.round(Number.jet.rnd(2, 5))}/>);
}

export const newContent = (
    <grid columns={[{background:"red", opacity:.5}, {background:"green", opacity:.5}, {background:"yellow", opacity:.5}]} rows={[{background:"blue", opacity:.5}, {}]} margin="100" height="max" width="max" align="center middle" grid="5" border={{row:"1 white 10"}} padding="10">
        {Array(9).fill(<img margin="5" src={img}/>)}
    </grid>
    
);

// export const newContent = (
//     <grid margin="50" columns={1} grid="5" width="max" height="max" align="center middle">
//         <grid font="8 Helvetica" rows={[{background:"#FF4444"}, {background:"transparent"}]} columns={[{background:"#44FF44", opacity:.3}, {background:"#4444FF", opacity:.3}]} grid="10" border="1 red 5 .5" align="center middle">
//             {row}
//         </grid>
//         <grid font="8 Helvetica" width="max" columns={2} border="1 blue" grid="5" align="center middle">
//             {row}
//         </grid>
//     </grid>
// )


