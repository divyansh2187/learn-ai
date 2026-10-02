import { Router } from "express";
import { register , login,  getMe, refresh,  logout,
  logoutAll,} from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema  , loginSchema,} from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";


const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.get(
  "/me",
  requireAuth,
  getMe
);

router.post(
  "/refresh",
  refresh
);

router.post("/logout", logout);

router.post("/logout-all", requireAuth, logoutAll);


export default router;