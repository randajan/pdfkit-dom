import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";

const Lorem = props=>{
    const { words } = props;

    return (
        <div {...props} border="1 green" padding="10">
            {loremIpsum({ count:words, units:"words" })}
        </div>
    );
}

const rowCount = 20;
const row = [];
for (let i=0; i<rowCount; i++) {
    row.push(<Lorem words={Math.round(Number.jet.rnd(2, 5))}/>);
}


export const newContent = (
    <grid font="12 Helvetica" rows={5} columns={"150 150 150 max"} border={{outer:"1 black", column:"1 blue", row:"1 red"}} margin="50">
        {row}
    </grid>
)


