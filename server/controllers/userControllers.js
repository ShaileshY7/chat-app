
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

//Signup a new user

export const signup= async (req,res)=>{

    const {fullName,email,password,bio}=req.body;

    try{
        if(! fullName || !email || !password || !bio){
            return res.json({success:false,message:"Missing Details"});
        }
        const user=await User.findOne({email});
        if(user){
            return res.json({success:false,message:"User already exists"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=await User.create({
            fullName,email,password:hashedPassword,bio
        });
        const token= generateToken(newUser._id);
        res.json({success:true, user: { // <-- CORRECTED: Changed 'userData' to 'user'
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                bio: user.bio,
                // Add any other public user properties you want to send back
            },message:"Account created successfully",token});
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    
    }
}

// controller to login user
// export const login= async (req,res)=>{
//     const {email,password}=req.body;
//     try{
//         const {email,password}=req.body;
//         const userData=await User.findOne({email});
//         const isPasswordCorrect=await bcrypt.compare(password,user.password);
//         if(!isPasswordCorrect){
//             return res.json({success:false,message:"Invalid credentials"});
//         }
//         const token= generateToken(newData._id);
//         res.json({success:true,userData,token,message:"Login successfully"});
//     }
//     catch(error){
//        console.log(error.message);
//         res.json({success:false,message:error.message});
//     }
// }

export const login = async (req, res) => {
    const { email, password } = req.body; // Destructure only once

    try {
        // Find user by email. Crucially, select the password field as it's often hidden by default.
        const user = await User.findOne({ email }).select('+password'); // Renamed from userData to user for consistency

        // 1. Check if user exists
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials (user not found)." });
        }

        // 2. Compare provided password with the hashed password from the database
        const isPasswordCorrect = await bcrypt.compare(password, user.password); // Correctly uses 'user.password'

        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid credentials (incorrect password)." });
        }

        // 3. Generate token for the authenticated user
        const token = generateToken(user._id); // Correctly uses 'user._id'

        // 4. Send back the user data under the 'user' key (consistent with frontend AuthContext)
        res.status(200).json({ // Use 200 for successful login
            success: true,
            user: { // This is the key your frontend's AuthContext expects
                _id: user._id,
                fullName: user.fullName, // Assuming your User model has fullName
                email: user.email,
                bio: user.bio, // Assuming your User model has bio
                // Add any other public user properties you want to send back
            },
            token: token,
            message: "Login successful!"
        });

    } catch (error) {
        // Catch any unexpected server errors
        console.error("Login Error:", error.message); // Log the detailed error on the server
        res.status(500).json({ success: false, message: "Server error during login." }); // Generic error for client
    }
};

//Controller to check if user is authenticated

export const checkAuth= async (req,res)=>{
    res.json({success:true,user:req.user});
}

//Controller to update user profile details

export const updateProfile= async (req,res)=>{
      try{
        const{profilePic,fullName,bio}=req.body;
        const userId=req.user._id;
        let updateUser;
        if(!profilePic){
            updateUser=await User.findByIdAndUpdate(userId,{fullName,bio},{new:true});
        }
        else{
            const upload=await cloudinary.uploader.upload(profilePic);
            updateUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
      }
      res.json({success:true,user:updateUser});
    }
    catch(error){
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}