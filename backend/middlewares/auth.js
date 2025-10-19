const jwt = require("jsonwebtoken")

const verifyToken = (req,res,next)=>{
    // console.log(req.headers.authorization)
    if(!req.headers.authorization)  return res.status(401).json("Unauthorized Access")
    const auth = req.headers.authorization
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1]: "";
    if(!token) return res.status(500).json("missing token")
        // console.log(token,process.env.JWT_SECRET)
    const payload = jwt.verify(token,process.env.JWT_SECRET, {algorithms:['HS256']})
    // console.log(payload)
    req.user =  payload

    next()
}

module.exports = {verifyToken}