import { loremIpsum } from "lorem-ipsum";
import { PDF } from "../../dist/index.js";




export const newContent = (
    <div font="12 Helvetica" color="red" border="1 lightgray" margin="20" padding="5">
        <div border="1 green" color="green #EEFFEE" padding="5">{loremIpsum({count:6})}</div>
        <div border="1 blue" color="blue #EEEEFF" margin={{top:5}} padding="5">{loremIpsum({count:16})}</div>
        <div border="1 blue" color="blue #EEEEFF" margin={{top:5}} padding="5">{loremIpsum({count:16})}</div>
    </div>
)


