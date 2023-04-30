import sapp from "@randajan/simple-lib";


sapp(process.env.NODE_ENV==="prod", {
    port:4002,
    mode:"node",

    lib:{
        external:["chalk"],
    },
    demo:{
        external:["chalk"]
    }
})