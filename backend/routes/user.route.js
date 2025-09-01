import express from "express";
import { login, logout, signup } from "../controller/user.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;

//express.Router() ek mini express app hai jisme routes aur middleware define karte hain, phir usko main app ke under mount kar dete hain, taki code clean aur modular rahe.
