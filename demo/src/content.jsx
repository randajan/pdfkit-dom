import info from "@randajan/simple-lib/info";
import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";
import fse from "fs-extra";

const Lorem = props=>{
    const { words } = props;

    return (
        <div border="1 green" align="center middle" width="max">
            <div width="max" height="max" border="1 red">{loremIpsum({ count:words, units:"words" })}</div>
        </div>
    );
}

const rgb = [{background:"red", opacity:.2}, {background:"green", opacity:.2}, {background:"blue", opacity:.2}];

export const content = (
    <grid columns={rgb} rows={rgb} margin="100" height="max" width="max" align="center middle" grid="5" padding="5 10" border={{row:"0", column:"0"}}>
        {Array(9).fill(<Lorem words={Math.round(Number.jet.rnd(5, 20))}/>)}
    </grid>
);

