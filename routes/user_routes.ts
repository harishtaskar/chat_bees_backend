import { Router } from "express";
import userAuth from "../middlewares/user_auth";
import UserController from "../controllers/UserController";

const user_router = Router();

user_router.post("/signup", UserController.signup);
user_router.post("/signin", UserController.signin);
user_router.get("/", userAuth, UserController.getUser);
user_router.get("/users", userAuth, UserController.getUser);
user_router.patch("/update", userAuth, UserController.updateUser);
user_router.post("/deactivate", userAuth, UserController.deactivateUser);
user_router.get("/connections", userAuth, UserController.getConnections);
user_router.patch("/update-password", userAuth, UserController.updatePassword);

export default user_router;
