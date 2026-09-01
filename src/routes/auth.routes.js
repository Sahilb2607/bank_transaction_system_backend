import { Router } from "express"
import { Register,Login,Logout,RefreshAccessToken,ChangePassword,ChangeData} from "../controllers/auth.controllers.js"
const router = Router()
import { auth } from "../middleware/auth.middleware.js"

router.route("/register").post(Register)
router.route("/login").post(Login)
router.route("/logout").get(Logout)
router.route("/refresh-Token").get(RefreshAccessToken)
router.route("/change-password").post(auth,ChangePassword)
router.route("/change-data").patch(auth,ChangeData)

export default router
