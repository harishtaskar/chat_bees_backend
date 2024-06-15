import { Router } from "express";
import connectDB from "../utils/database";
import { User } from "../models/user_modal";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config/config";
import userAuth from "../middlewares/user_auth";
import { userExists, validateDOB } from "../utils/validations";
import { NormalizeUsername } from "../utils/mongoClient";
import { GroupMember } from "../models/group_member_modal";
import { ObjectId } from "mongodb";
import { IUser } from "../types";

const user_router = Router();
const jwtPassword: any = JWT_PASSWORD;

user_router.post("/signup", async (req, res) => {
  try {
    const { occupation, username, password, gender, dob, profileicon } =
      req?.body;
    const requiredFields: any = {};
    if (username?.trim() === "") {
      requiredFields.username = "require";
    } else if (dob.trim() === "") {
      requiredFields.dob = "require";
    } else if (occupation.trim() === "") {
      requiredFields.occupation = "require";
    } else if (profileicon?.trim() === "") {
      requiredFields.profileicon = "require";
    } else if (gender?.trim() === "") {
      requiredFields.gender = { require: true, type: "male/female" };
    } else if (password?.trim().length < 8) {
      requiredFields.password = { require: true, length: ">=8" };
    }
    if (Object.keys(requiredFields).length !== 0) {
      res.send({
        status: 500,
        require: requiredFields,
        msg: "invalid payload",
        res: "Error",
      });
    } else {
      await connectDB();
      const user_name = NormalizeUsername(username);
      if (await userExists(user_name)) {
        res.send({
          msg: "Username Already Exists",
          status: 200,
          res: "Invalid",
        });
      } else if (!validateDOB(dob)) {
        res.send({
          msg: "Invalid Age",
          status: 200,
          res: "Invalid",
        });
      } else {
        const saltRound = 10;
        bcrypt.genSalt(saltRound, function (err, salt) {
          bcrypt.hash(password, salt, async function (err, hashedPasswrod) {
            if (err) {
              res.send({
                err,
                msg: "Error while hashing password",
                status: 500,
                res: "Error",
              });
            }
            const user = new User({
              username: user_name,
              dob,
              gender,
              salt,
              password: hashedPasswrod,
              profileicon,
              occupation,
            });
            await user.save();
            if (user) {
              res.send({
                msg: "User Registered Successfully",
                user,
                status: 200,
                res: "ok",
              });
            }
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.send({
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
      res.send({
        requiredFields,
        msg: "invalid payload",
        status: 500,
        res: "Error",
      });
    } else {
      await connectDB();
      const user: any = await User.findOne({ username });
      const token = jwt.sign({ username, user_id: user?._id }, jwtPassword);
      if (user) {
        bcrypt.compare(password, user?.password, function (err, result) {
          if (err) {
            res.send({
              err,
              msg: "Error validating password",
              status: 500,
              res: "Error",
            });
          } else {
            if (result) {
              res.send({
                msg: "Sign in successfully",
                token,
                user,
                status: 200,
                res: "ok",
              });
            } else {
              res.send({
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

user_router.get("/", userAuth, async (req: any, res: any) => {
  try {
    const user_id = req.user_id;
    await connectDB();
    const user: any = await User.findOne({ _id: user_id });
    res.send({ msg: "This is user", user, status: 200, res: "ok" });
  } catch (error) {
    res.send({ error, msg: "Error Fetching Users", status: 500, res: "Error" });
  }
});

user_router.get("/users", userAuth, async (req, res) => {
  try {
    const { filter } = req.headers;
    await connectDB();
    const users: any = await User.find({
      $or: [{ username: { $regex: filter, $options: "i" } }],
      $and: [{ status: 1 }],
    });
    res.send({ msg: "This are users", users, status: 200, res: "ok" });
  } catch (error) {
    res.send({ error, msg: "Error Fetching Users", status: 500, res: "Error" });
  }
});

user_router.put("/update", userAuth, async (req: any, res) => {
  try {
    const { update } = req.body;
    const username = req.username;
    await connectDB();
    if (update && Object.keys(update).length === 0) {
      res.send({
        msg: "invalid payload",
        requiredField: { update: "Object" },
        status: 500,
        res: "ok",
      });
    } else {
      if (update?.username && (await userExists(update?.username))) {
        res.send({
          msg: "Username Already Exists",
          status: 200,
          res: "Invalid",
        });
      } else {
        await User.findOneAndUpdate({ username }, update);
        const user: any = await User.findOne({ username });
        if (user) {
          res.send({ msg: "User updated", user, status: 200, res: "ok" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, msg: "Error Updating User", status: 500, res: "Error" });
  }
});

user_router.post("/deactivate", userAuth, async (req: any, res) => {
  try {
    const username = req.username;
    await connectDB();
    await User.findOneAndUpdate({ username }, { status: 99 });
    const user: any = await User.findOne({ username });
    if (user) {
      res.send({ msg: "User Deactivated", user, status: 200, res: "ok" });
    } else {
      res.send({ msg: "User Not found", user, status: 200, res: "Error" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error, msg: "Error Updating User", status: 500, res: "Error" });
  }
});

user_router.get("/connections", userAuth, async (req: any, res: any) => {
  try {
    const user_id = req.user_id;
    if (user_id) {
      await connectDB();
      const connections = await GroupMember.find({
        user_id: new ObjectId(user_id),
      }).populate(["conversation_id", "createdBy"]);
      if (connections.length) {
        res.send({
          msg: "Connection fetched successfully",
          connections,
          status: 200,
          res: "ok",
        });
      } else {
        res.send({
          msg: "No connections found",
          connections,
          status: 200,
          res: "ok",
        });
      }
    }
  } catch (error) {
    res.send({ error, msg: "Error Updating User", status: 500, res: "Error" });
  }
});

user_router.put("/update-password", userAuth, async (req: any, res: any) => {
  try {
    const { oldPassword, newPassword } = req.body;
    let requireFields: any = {};
    if (!oldPassword) {
      requireFields.oldPassword = "required";
    } else if (!newPassword) {
      requireFields.newPassword = "required";
    }
    if (Object.keys(requireFields).length !== 0) {
      res.send({
        msg: "Invalid Payload",
        requireFields,
        status: 200,
        res: "Error",
      });
    } else {
      await connectDB();
      const user_id = req.user_id;
      const user: IUser | null = await User.findById(user_id);
      const match = await bcrypt.compare(oldPassword, user?.password || "");
      if (match) {
        const saltRound = 10;
        bcrypt.genSalt(saltRound, function (err, salt) {
          bcrypt.hash(newPassword, salt, async function (err, hashedPasswrod) {
            if (err) {
              res.send({
                err,
                msg: "Error while hashing password",
                status: 500,
                res: "Error",
              });
            }
            const updatedUser = await User.updateOne(
              { _id: user_id },
              {
                password: hashedPasswrod,
                salt,
              }
            );
            if (Number(updatedUser.matchedCount)) {
              res.send({
                msg: "Password Updated Successfully",
                status: 200,
                res: "ok",
              });
            }
          });
        });
      } else {
        res.send({
          msg: "Invalid Old Password",
          requireFields,
          status: 200,
          res: "Error",
        });
      }
    }
  } catch (error) {}
});

export default user_router;
