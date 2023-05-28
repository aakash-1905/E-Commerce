const app = require("./app");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database")


// handing uncaught exception
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception: ", err.name, err.message);
    console.log("Shutting down the server");
    process.exit(1);
}
);
//config
dotenv.config({path:"Backend/config/config.env"})

//connecting database
connectDatabase();

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})



//unhandled promise rejection
process.on("unhandledRejection",(err,promise)=>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to Unhandled promise rejection`);
    server.close(()=>{
        process.exit(1);
    }
    )
})