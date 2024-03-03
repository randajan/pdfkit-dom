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

const rgb = [{background:"red", opacity:.0}, {background:"green", opacity:.0}, {background:"blue", opacity:.0}];

export const newContent = (
    <grid columns={rgb} rows={rgb} margin="100" height="max" width="max" align="center middle" grid="5" padding="5 10" border={{row:"0", column:"0"}}>
        {Array(9).fill(<div border="1 green" align="center middle" width="max" height="max">{loremIpsum({ count:Math.round(Number.jet.rnd(5, 20)), units:"words" })}</div>)}
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


