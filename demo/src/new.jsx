import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";

const Lorem = props=>{
    const { words } = props;

    return (
        <div border="1 green" padding="5" align="center middle" width="max">
            {loremIpsum({ count:words, units:"words" })}
            {loremIpsum({ count:words, units:"words" })}
            {loremIpsum({ count:words, units:"words" })}
            {loremIpsum({ count:words, units:"words" })}
        </div>
    );
}

const rowCount = 8;
const row = [];
for (let i=0; i<rowCount; i++) {
    row.push(<Lorem words={Math.round(Number.jet.rnd(2, 5))}/>);
}


export const newContent = (
    <grid margin="50" columns={1} grid="5" width="max" height="max" align="center middle">
        <grid font="8 Helvetica" height="max" padding="10" rows={[{background:"#FFCCCC"}, {background:"transparent"}]} columns={[{background:"#CCFFCC", opacity:.3}, {background:"#CCCCFF", opacity:.3}]} border="1 blue" grid="5" align="center middle">
            {row}
        </grid>
        <grid font="8 Helvetica" width="max" columns={2} border="1 blue" grid="5" align="center middle">
            {row}
        </grid>
    </grid>
)


