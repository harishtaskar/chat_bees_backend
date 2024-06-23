import { User } from "../models/user_modal";
import connectDB from "./database";

export const userExists = async (username: string): Promise<boolean> => {
  try {
    await connectDB();
    const user = await User.findOne({ username });
    if (user) {
      return true;
    }
    return false;
  } catch (error) {
    throw new Error("Error validating username");
  }
};

export const validateDOB = (dobString: string) => {
  const dob: any = new Date(dobString);
  if (isNaN(dob)) {
    throw new Error("Invalid date format");
  }
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDifference = today.getMonth() - dob.getMonth();
  const dayDifference = today.getDate() - dob.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }
  return age > 16;
};

export function validateUsername(str: string) {
  // Regular expression to check for spaces or capital letters
  const regex = /^[a-z0-9]*$/;
  // Test the string against the regular expression
  return regex.test(str);
}
