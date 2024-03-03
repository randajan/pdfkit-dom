import slib from "@randajan/simple-lib";
import ImportGlobPlugin from 'esbuild-plugin-import-glob';

slib(process.env.NODE_ENV==="prod", {
    port:4002,
    mode:"node",
    loader:{
        ".js":"jsx",
        ".svg":"file",
        ".png":"file",
        ".jpg":"file",
        ".jpeg":"file"
    },
    lib:{
        external:["chalk"],
        plugins:[
            ImportGlobPlugin.default()
        ],
        jsx:{
            transform:"preserve"
        }
    },
    demo:{
        external:["chalk"],
        jsx:{
            factory:"PDF.createElement"
        }
    }
})