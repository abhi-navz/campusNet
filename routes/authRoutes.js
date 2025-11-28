import express from "express";
import signup from "../controllers/auth/signup.js";
import login from "../controllers/auth/login.js";
const router = express.Router();


router.post("/signup",signup);
router.post("/login",login);

export default router;