import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Middlware to protect routes
export const protectRoute=async(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;

    // 1. Check if Authorization header exists and is correctly formatted
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // 2. Extract the token after "Bearer "
    const token = authHeader.split(" ")[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.userId).select("-password");
        if(!user) return res.json({success:false,message:"User not found"});

        req.user=user;
        next();
    }catch(error){
        console.log(error.message);

        res.json({success:false,message:error.message})
    }
}