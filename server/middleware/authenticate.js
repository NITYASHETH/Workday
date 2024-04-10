const jwt = require("jsonwebtoken");
const userdb = require("../models/userSchema");
const keysecret = "vrajjariwalanityasheth";



const authenticate = async(req,res,next)=>{

    try {
        const token = req.headers.authorization;
        console.log('Token:', token); // Log token

        const verifytoken = jwt.verify(token,keysecret);
        console.log('Decoded Token:', verifytoken); // Log decoded token

        const rootUser = await userdb.findOne({_id:verifytoken._id});
        console.log('Root User:', rootUser); // Log user object

        if(!rootUser) {throw new Error("user not found")}

        req.token = token
        req.rootUser = rootUser
        req.userId = rootUser._id

        next();

    } catch (error) {
        console.error('Authentication Error:', error); // Log authentication error
        res.status(401).json({status:401,message:"Unauthorized token provide"})
    }
}


module.exports = authenticate