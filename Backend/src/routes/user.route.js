const {Router} = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");


const authRouter = Router();

authRouter.post("/register",authController.registerUsercontroller);
authRouter.post("/login",authController.loginUserController);
authRouter.post("/logout",authController.logoutUserController);
authRouter.get("/get-me",authMiddleware.authUser,  authController.getMeController);

module.exports = authRouter;
