import express from "express";
import {createPaperMember,getAllMembers, searchMember,updateMember,deleteMember,getMemberById} from "../controllers/member.controller.js";

import { authenticate, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Admin creates member from paper
 * (may include username + email → temp password sent)
 */
router.post( "/paper",  authenticate, isAdmin,  createPaperMember);

router.get('/', authenticate, isAdmin,getAllMembers )
router.get("/search", authenticate, isAdmin, searchMember);
router.put("/update/:id", authenticate, isAdmin, updateMember);
router.put("/delete/:id", authenticate, isAdmin, deleteMember);
router.get("/:id", authenticate, isAdmin, getMemberById);


export default router;
