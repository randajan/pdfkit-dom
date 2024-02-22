import path from "path";
import * as files from "./default/*";
import { elementDefine } from "./elements";

files.filenames.forEach((filename, key)=>{
    const tagName = path.parse(filename).name;

    elementDefine(
        tagName,
        {...files.default[key]}
    );
});
