import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config/config";

const jwtPassword: any = JWT_PASSWORD;
const userAuth = async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const user: any = jwt.verify(token, jwtPassword);
    if (user) {
      req.username = user.username;
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error,
        msg: "Error Authentication User",
        status: 500,
        res: "Error",
      });
  }
};

export default userAuth;
