import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/dbConnection.js";

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running at port : ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("mongo db connection faild !!!", err)
    })