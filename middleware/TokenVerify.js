import jwt from "jsonwebtoken"

// function untuk memverifikasi token agar bisa login
export const TokenVerify = (req,res,next) => {
    const autHeader = req.headers['authorization'];
    const token = autHeader && autHeader.split(' ')[1];//karena menjadi array,kita mengambil token nya saja
    // di split karena kita hanya ingin mengambil token nya saja
    // karena sebelum nya output nya : bearer [token]

    if(token === null) return res.sendStatus(401);//autHeader sebelah kiri
    // 401 == unauthorization/tidak ada(tidak punya)
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded) => {
        // melakukann verifikasi acces token nya
        if(err) return res.sendStatus(403);//403 artinya token nya sudah expied(jika expied)
        // req.email = decoded.email
        // req.email adalah nama variable,yang bisa kita gunakan nanti
        // decoded.email,karena terdapat email didalam token nya
        next();
    })
}
