import { validateDOB, validateUsername } from "../utils/validations";
import { Request, Response } from "express";
import connectDB from "../utils/database";
import { User } from "../models/user_modal";
import bcrypt from "bcrypt";
import { NormalizeUsername } from "../utils/mongoClient";
import { userExists } from "../utils/validations";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config/config";
import { GroupMember } from "../models/group_member_modal";
import { ObjectId } from "mongodb";
import { IUser } from "../types";

const jwtPassword: any = JWT_PASSWORD;

const UserController = {
  signup: async (req: Request, res: Response) => {
    try {
      const { occupation, username, password, gender, dob, profileIcon } =
        req.body;
      console.log(occupation, username, password, gender, dob, profileIcon);

      // Validate all required fields at once
      const validationErrors = {
        ...((!username?.trim() || !validateUsername(username?.trim())) && {
          username: "require without capital latter and space",
        }),
        ...(!dob?.trim() && { dob: "require" }),
        ...(!occupation?.trim() && { occupation: "require" }),
        ...(!profileIcon?.trim() && { profileIcon: "require" }),
        ...(!gender?.trim() && {
          gender: { require: true, type: "male/female" },
        }),
        ...(password?.trim().length < 8 && {
          password: { require: true, length: ">=8" },
        }),
      };

      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          status: 400,
          require: validationErrors,
          msg: "invalid payload",
          res: "Error",
        });
      }

      await connectDB();
      const normalizedUsername = NormalizeUsername(username);

      // Check username and DOB validation
      if (await userExists(normalizedUsername)) {
        return res.status(409).json({
          msg: "Username Already Exists",
          status: 409,
          res: "Invalid",
        });
      }

      if (!validateDOB(dob)) {
        return res.status(400).json({
          msg: "Your age should be more than 16",
          status: 400,
          res: "Invalid",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        username: normalizedUsername,
        dob,
        gender,
        salt,
        password: hashedPassword,
        profileIcon,
        occupation,
      });

      return res.status(201).json({
        msg: "User Registered Successfully",
        user,
        status: 201,
        res: "ok",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      return res.status(500).json({
        error: error.message,
        msg: "Error while Signup",
        status: 500,
        res: "Error",
      });
    }
  },
  signin: async (req: Request, res: Response) => {
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
        .json({ error, msg: "Error in Sign in", status: 500, res: "Error" });
    }
  },
  getUser: async (req: Request & { username?: string }, res: Response) => {
    try {
      const { filter } = req.headers;
      const username = req.username;
      await connectDB();
      const users: any = await User.find({
        $or: [
          { username: { $regex: filter, $options: "i" } },
          { occupation: { $regex: filter, $options: "i" } },
        ],
        $and: [{ status: 1 }, { username: { $ne: username } }],
      });
      res.send({ msg: "This are users", users, status: 200, res: "ok" });
    } catch (error) {
      res.send({
        error,
        msg: "Error Fetching Users",
        status: 500,
        res: "Error",
      });
    }
  },
  updateUser: async (req: Request & { username?: string }, res: Response) => {
    try {
      const { update } = req.body;
      const username = req.username;
      await connectDB();
      if (update && Object.keys(update).length === 0) {
        res.send({
          msg: "invalid payload",
          requiredField: { update: "Object" },
          status: 500,
          res: "Error",
        });
      } else {
        if (
          update?.username !== username &&
          (await userExists(update?.username))
        ) {
          res.send({
            msg: "Username Already Exists",
            status: 200,
            res: "Invalid",
          });
        } else if (update?.dob && !validateDOB(update?.dob?.toString())) {
          res.send({
            msg: "Your age should be more than 16",
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
  },
  deactivateUser: async (
    req: Request & { username?: string },
    res: Response
  ) => {
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
      res
        .status(500)
        .json({ error, msg: "Error Updating User", status: 500, res: "Error" });
    }
  },
  getConnections: async (
    req: Request & { username?: string; user_id?: string },
    res: Response
  ) => {
    try {
      const user_id = req.user_id;
      if (user_id) {
        await connectDB();
        const conversations = await GroupMember.find({
          user: new ObjectId(user_id),
        });

        const conversation_ids = conversations?.map(
          (conn) => conn.conversation
        );

        const groupMember = await GroupMember.find({
          $and: [
            { conversation: { $in: conversation_ids } },
            { user: { $ne: user_id } },
          ],
        });

        const users_ids = groupMember?.map((conn) => conn.user);

        const connections = await User.find({ _id: { $in: users_ids } });

        const updatedConnections = connections?.map((connection) => {
          const connectionObject = connection.toObject();
          const group_member = groupMember?.find((gm) =>
            gm?.user.equals(connection?._id)
          );
          const groupMemberObject = group_member?.toObject();
          return { ...groupMemberObject, ...connectionObject };
        });

        if (connections.length) {
          res.send({
            msg: "Connection fetched successfully",
            connections: updatedConnections,
            status: 200,
            res: "ok",
          });
        } else {
          res.send({
            msg: "No connections found",
            connections: updatedConnections,
            status: 200,
            res: "ok",
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.send({
        error,
        msg: "Error Fetching connections",
        status: 500,
        res: "Error",
      });
    }
  },
  updatePassword: async (
    req: Request & { username?: string; user_id?: string },
    res: Response
  ) => {
    try {
      const { oldPassword, newPassword } = req.body;
      let requireFields: any = {};
      if (!oldPassword || oldPassword?.length < 8) {
        requireFields.oldPassword = "required password > 8";
      } else if (!newPassword || newPassword?.length < 8) {
        requireFields.newPassword = "required password > 8";
      }
      if (oldPassword === newPassword) {
        res.send({
          msg: "New password Can't be same",
          requireFields,
          status: 200,
          res: "Error",
        });
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
            bcrypt.hash(
              newPassword,
              salt,
              async function (err, hashedPassword) {
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
                    password: hashedPassword,
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
              }
            );
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
    } catch (error) {
      console.log(error);
      res.send({
        msg: "Something went wrong",
        status: 501,
        res: "Error",
      });
    }
  },
};

export default UserController;
