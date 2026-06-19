import { Router } from "express";
import { register, login } from "../controllers/auth.controller";
// import { authenticate } from "../middleware/auth";
// import { isAdmin } from "../middleware/admin";

const router = Router();

// public routes
router.post("/register", register);
router.post("/login", login);

export default router;
