const {Router} = require(express);
const authController = require("../controllers/auth.controller");

const authRouter = Router();

authRouter.post("/register",authController.registerUsercontroller);
authRouter.post("/login",authController.loginUserController);
authRouter.post("/logout",authController.logoutUserController);
authRouter.get("/get-me",authController.getMeController);

module.exports = authRouter();