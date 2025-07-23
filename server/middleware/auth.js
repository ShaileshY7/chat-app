import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        let token;

        // 1. Check for the token in the standard Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]; // Extract the token after 'Bearer '
        }
        // 2. Fallback: Check for a custom 'token' header (as in your original code)
        //    It's recommended to stick to the standard 'Authorization' header.
        else if (req.headers.token) {
            token = req.headers.token;
        }

        // 3. If no token is found, send a 401 Unauthorized response
        if (!token) {
            return res.status(401).json({ success: false, message: "Authentication token is missing. Please provide a JWT." });
        }

        // 4. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Find the user associated with the token's ID, excluding the password
        const user = await User.findById(decoded.userId).select("-password");

        // 6. If no user is found for the given ID in the token, return an error
        if (!user) {
            return res.status(401).json({ success: false, message: "User associated with this token no longer exists." });
        }

        // 7. Attach the user object to the request for subsequent middleware/route handlers
        req.user = user;

        // 8. Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Log the full error for server-side debugging (use console.error for errors)
        console.error("Authentication Error:", error.message);

        // 9. Handle specific JWT errors and return appropriate status codes
        if (error.name === 'JsonWebTokenError') {
            // This covers cases like malformed token, invalid signature
            return res.status(401).json({ success: false, message: "Invalid authentication token. Please log in again." });
        }
        if (error.name === 'TokenExpiredError') {
            // This covers cases where the token has expired
            return res.status(401).json({ success: false, message: "Authentication token has expired. Please log in again." });
        }

        // 10. Handle any other unexpected errors during the process
        res.status(500).json({ success: false, message: "An unexpected error occurred during authentication. Please try again later." });
    }
};


// import User from '../models/User.js';
// import jwt from 'jsonwebtoken';


// //Middleware to protect routes

// export const protectRoute=async (req,res,next)=>{
//       try{
//         const token=req.headers.token;
//          const decoded= jwt.verify(token,process.env.JWT_SECRET);

//         const user =await User.findById(decoded.userId).select("-password");
//         if(!user) return res.json({success:false,message:"User not found"});
//         req.user=user;
//         next();
//       }
//       catch(error){
//         console.log(error.message);
//          res.json({success:false,message:error.message});
//       }
// }