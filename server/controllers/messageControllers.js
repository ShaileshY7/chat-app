import Message from '../models/Message.js';
import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';
import {io,userSocketMap} from '../server.js';


// Get all users except logged in user
export const getUsersForSideBar=async(req,res)=>{
    try {
        const userId=req.user._id;
        const filteredUsers=await User.find({_id:{$ne:userId}}).select("-password");

        //count number of message is not seen
        const unseenMessages={}
        const promises=filteredUsers.map(async(user)=>{
            const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false})
            if(messages.length>0){
                unseenMessages[user._id]=messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success:true,users:filteredUsers,unseenMessages});
  } catch (error) {
         console.log(error.message);
         res.json({success:false,message:error.message})
         
    }
}

// get all message for selected user

export const getMessages=async (req,res) =>{
    try {
        const {id :selectedUserID}=req.params;
        const myId=req.user._id;
            const messages=await Message.find({
                $or:[
                   { senderId:myId,receiverId:selectedUserID},
                   { senderId:selectedUserID,receiverId:myId}
                ]
            })
            await Message.updateMany({senderId:selectedUserID,receiverId:myId},{seen:true});
    
            res.json({success:true,messages});
    } catch (error) {
        console.log(error.message);
         res.json({success:false,message:error.message})
    }
}

//api to mark message as seen using message id

export const markMessageAsSeen=async(req,res)=>{
    try {
        const {id}=req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
    } catch (error) {
         console.log(error.message);
         res.json({success:false,message:error.message});
    }
}

//Send message to selected user

export const sendMessage=async(req,res)=>{
    try {
        const {text,image}=req.body;
        const receiverId=req.params.id;
        const senderId=req.user._id;
        let imageURL;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageURL=uploadResponse.secure_url;
        }
        const newMessage=await Message.create({
            text,
            image:imageURL,
            senderId,
            receiverId
        })

        // Emit the new message to receiver socket
        const receiverSocketId= userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage);
        }

        res.json({success:true,newMessage});
    } catch (error) {
         console.log(error.message);
         res.json({success:false,message:error.message});
    }
}