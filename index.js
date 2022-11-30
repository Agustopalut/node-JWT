import express from "express"
const app = express();
import db from "./config/Database.js"
// import User from "./models/UsersModel.js"
import router from "./routes/index.js"
import dotenv from "dotenv"
import cors from "cors";
import cookieParser from "cookie-parser";
try {
    await db.authenticate();
    console.log("database conected");
    // await User.sync();
}catch (err) {
    console.error(err);
}

app.use(cors({credentials : true , origin : "http://localhost:3000"}))
// credentials artiya client harus mengirim credentials
dotenv.config();
app.use(cookieParser());
app.use(express.json());
app.use(router)
app.listen(5050,() => console.log("server running in port 5050"))