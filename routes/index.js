import express from "express"
import {getUsers,Register,Login,logout} from "../controler/User.js"
import { TokenVerify } from "../middleware/TokenVerify.js";
import {refreshToken} from "../controler/RefreshToken.js";
const router = express.Router();

router.get("/users",TokenVerify,getUsers);//users tidak bisa mengakses /users jika belum login
router.post("/users",Register);
router.post("/login",Login);
router.get("/token",refreshToken);
router.delete("/logout",logout);

export default router