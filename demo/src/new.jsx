import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";

const Lorem = props=>{
    const { words } = props;

    return (
        <row {...props} border="1 green" margin="2" padding="2">
            {loremIpsum({ count:words, units:"words" })}
        </row>
    );
}

const rowCount = 5;
const row = [];
for (let i=0; i<rowCount; i++) {
    row.push(<Lorem words={Math.round(Number.jet.rnd(5, 25))}/>);
}


export const newContent = (
    <div font="12 Helvetica" border="1 lightgray" margin="50" padding="50">
        {row}
    </div>
)


