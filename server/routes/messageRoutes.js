import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSideBar, markMessageAsSeen,sendMessage } from "../controllers/messageControllers.js";


const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSideBar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id",protectRoute,sendMessage);

export default messageRouter;
