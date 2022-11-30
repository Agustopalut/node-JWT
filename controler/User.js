import User from "../models/UsersModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
export const getUsers = async (req,res) => {
    try {
        const users= await User.findAll({
            attributes : ['id','name','email']
            //hanya mendapatkan data" tertentu saja
        });
        res.json(users)
    }catch (error){
        console.error(error);
    }
};

export const Register = async (req,res) => {
    const {name,email,password,ConfirmPassword} = req.body
    if(password !== ConfirmPassword) {
        return res.status(400).json({msg : "password dan confirm passwor tidak cocok"})
        // return akan masuk ke block catch pada frontend;
    }else {
        try {
            const salt = await bcrypt.genSalt();
            const hashPassword = await bcrypt.hash(password,salt);//membuat password di enkripsi
            await User.create({
                name : name,
                email : email,
                password: hashPassword
            });

            res.json({msg : "Register Berhasil"});
        }catch (err) {
            console.log(err);
        }
    }
}

export const Login = async (req,res) => {
    try {
        // mencari user bedasarkan email(login menggunakan email)
        const user = await User.findAll({
            where : {
                email : req.body.email
            }
        });
        // mendapatkan passwor dari user login menggunakan email
        const match = await bcrypt.compare(req.body.password,user[0].password)//mengcompare password di database
        // mencocokan password input dengan password di database
        if(!match) {
            return res.status(400).json({msg : "wrong password"});
        }else {
            // mendapatkan data-data user yang berhasil login
            const userId = user[0].id
            const userName = user[0].name
            const userEmail = user[0].email
            // id,name,email akan masuk ke Token
            const accessToken = jwt.sign({userId,userName,userEmail},process.env.ACCESS_TOKEN_SECRET,{
                expiresIn : "20s"//acces token akan expied selama 20 detik
            });
            const refreshToken = jwt.sign({userId,userName,userEmail},process.env.REFRESH_TOKEN_SECRET,{
                expiresIn : "1d"//refresh token akan expied selama 1 hari
            });

            // mengupdate field refresh_token user yang berhasil login berdasarkan id
            await User.update({refresh_token : refreshToken},{
                where :{
                    id : userId
                }
            })

            res.cookie('refreshToken',refreshToken,{
                // melakukan setting pafa cookie nya
                httpOnly : true,
                maxAge : 24 * 60 * 60 * 1000 //expied dalam 1 hari
                // secure : true lakukan ini jika menggunakan https
            });

            res.json({accessToken});//user akan mendapatkan acces token untuk login
        }
    }catch (error) {
        // jika email nya tidak ditemukan
        res.status(404).json({msg: "email tidak ditemukan"});
    }
}

export const logout= async (req,res) => {
    // logout berdasrkan cookie
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
        const id = user[0].id

        await User.update({refresh_token : null},{
            where :{
                id : id
            }
        });

        res.clearCookie("refreshToken");//menghapus cookie nya ketika logout

        return res.sendStatus(200);

}