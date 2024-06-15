import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config/config";

const jwtPassword: any = JWT_PASSWORD;
const userAuth = async (req: any, res: any, next: any) => {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    const decodedToken: any = jwt.verify(token, jwtPassword);
    if (decodedToken) {
      req.username = decodedToken.username;
      req.user_id = decodedToken.user_id;
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        error,
        msg: "Invalid Auth Token",
        status: 500,
        res: "Error",
      });
  }
};

export default userAuth;
