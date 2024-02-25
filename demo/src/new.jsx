import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";

const Lorem = props=>{
    const { words } = props;

    return (
        <div border="1 green" padding="5" align="center middle" height="max">
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
    row.push(<Lorem words={Math.round(Number.jet.rnd(2, 30))}/>);
}


export const newContent = (
    <grid font="8 Helvetica" height="max" width="max" rows={4} columns={2} border="1 blue" grid="5" margin="50" padding="5" align="center middle">
        {row}
    </grid>
)


