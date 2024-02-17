import slib from "@randajan/simple-lib";
import ImportGlobPlugin from 'esbuild-plugin-import-glob';

slib(process.env.NODE_ENV==="prod", {
    port:4002,
    mode:"node",

    lib:{
        external:["chalk"],
        plugins:[
            ImportGlobPlugin.default()
        ],
        loader:{
            ".js":"jsx"
        },
        jsx:{
            transform:"preserve"
        }
    },
    demo:{
        external:["chalk"],
        loader:{
            ".js":"jsx"
        },
        jsx:{
            factory:"PDF.createElement"
        }
    }
})