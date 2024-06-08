import { Router } from "express";
import connectDB from "../utils/database";
import { User } from "../models/user_modal";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config/config";
import userAuth from "../middlewares/user_auth";
const user_router = Router();
const jwtPassword: any = JWT_PASSWORD;

user_router.post("/signup", async (req, res) => {
  try {
    const { username, password, gender, dob, profileicon } = req?.body;
    const requiredFields: any = {};
    if (username?.trim() === "") {
      requiredFields.username = "require";
    } else if (dob.trim() === "") {
      requiredFields.dob = "require";
    } else if (profileicon?.trim() === "") {
      requiredFields.profileicon = "require";
    } else if (gender?.trim() === "") {
      requiredFields.gender = { require: true, type: "male/female" };
    } else if (password?.trim().length < 8) {
      requiredFields.password = { require: true, length: ">=8" };
    }
    if (Object.keys(requiredFields).length !== 0) {
      res.status(500).json({
        require: requiredFields,
        msg: "invalid payload",
        res: "Error",
      });
    } else {
      await connectDB();
      const saltRound = 10;
      bcrypt.genSalt(saltRound, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hashedPasswrod) {
          if (err) {
            res.status(500).json({
              err,
              msg: "Error while hashing password",
              status: 500,
              res: "Error",
            });
          }
          const user = new User({
            username,
            dob,
            gender,
            salt,
            password: hashedPasswrod,
            profileicon,
          });
          await user.save();
          if (user) {
            res.status(200).json({
              msg: "User Registered Successfully",
              user,
              status: 200,
              res: "ok",
            });
          }
        });
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
      msg: "Error while creating new user",
      status: 500,
      res: "Error",
    });
  }
});

user_router.post("/signin", async (req, res) => {
  try {
    const { username, password }: any = req.headers;
    const requiredFields: any = {};
    if (!username) {
      requiredFields.username = "require";
    } else if (!password) {
      requiredFields.password = "require";
    }
    if (Object.keys(requiredFields).length !== 0) {
      res.status(500).json({
        requiredFields,
        msg: "invalid payload",
        status: 500,
        res: "Error",
      });
    } else {
      await connectDB();
      const user: any = await User.findOne({ username });
      const token = jwt.sign({ username }, jwtPassword);
      if (user) {
        bcrypt.compare(password, user?.password, function (err, result) {
          if (err) {
            res.status(500).json({
              err,
              msg: "Error validating password",
              status: 500,
              res: "Error",
            });
          } else {
            if (result) {
              res.status(200).json({
                msg: "Sign in successfully",
                token,
                user,
                status: 200,
                res: "ok",
              });
            } else {
              res.status(200).json({
                msg: "Invalid Credentials",
                status: 200,
                res: "Invalid",
              });
            }
          }
        });
      } else {
        res
          .status(200)
          .json({ msg: "Invalid Credentials", status: 200, res: "Invalid" });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, msg: "Error singning in", status: 500, res: "Error" });
  }
});

user_router.get("/users", userAuth, async(req, res)=>{
    try {
        const {filter} = req.headers;
        await connectDB();
        const users : any = await User.find({username: `/${filter}/i` });
        if(users?.length){
            res
            .status(200)
            .json({ msg: "This are users", users, status: 200, res: "ok" });
        }
    } catch (error) {
        res
      .status(500)
      .json({ error, msg: "Error Fetching Users", status: 500, res: "Error" });
    }
});



export default user_router;
