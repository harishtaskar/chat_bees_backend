import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { JWT_PASSWORD } from "../config/config";

const jwtPassword: string = JWT_PASSWORD;
const userAuth = async (req: Request & { username?: string; user_id?: string }, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    const token = auth ? auth.split(" ")[1] : '';
    const decodedToken: jwt.JwtPayload = jwt.verify(token, jwtPassword) as jwt.JwtPayload;
    if (decodedToken) {
      req.username = decodedToken.username;
      req.user_id = decodedToken.user_id;
      next();
    } else {
      res.send({
        msg: "Invalid Auth Token",
        status: 200,
        res: "Error",
      });
    }
  } catch (error) {
    console.log(error);
    res.send({
      error,
      msg: "Invalid Auth Token",
      status: 500,
      res: "Error",
    });
  }
};

export default userAuth;
