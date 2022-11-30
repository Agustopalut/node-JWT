// ini berguna untuk kita dapat refresh token lagi jika token nya sudah expied,tanpa perlu kita login ulang
import jwt from "jsonwebtoken"
import User from "../models/UsersModel.js"
export const refreshToken = async (req,res) => {
    try {
        const RefreshToken =req.cookies.refreshToken;//mendapatkan cookie di browser nya
        if(!RefreshToken) return res.sendStatus(403);//jika tidak ada tokennya di cookie

        // jika ada :maka membandingkan token client dengan token-Nya di database'
        const user = await User.findAll({
            where : {
                refresh_token : RefreshToken
            }
        })//menghasilkan single data
        // jika tidak ada kecocokan antara cookie dengan refresToken di database:
        if(!user[0]) return res.sendStatus(403)//jika tidak cocok

        // jika cocok :
        // maka melakukan verifikasi lagi
        jwt.verify(RefreshToken,process.env.REFRESH_TOKEN_SECRET,(err,decoded) => {
            if(err) return res.sendStatus(403);
            const userId = user[0].id
            const userName = user[0].name
            const userEmail = user[0].email
           const accesstoken = jwt.sign({userId,userName,userEmail},process.env.ACCESS_TOKEN_SECRET,{
                expiresIn : "20s"//expied dalam 20/15detik
                // syntax : jwt.sign(payload,secretKey,opsi)
            })//membuat access token baru
            res.json({accesstoken});
        });
    }catch (error) {
        console.error(error);
    }
}
