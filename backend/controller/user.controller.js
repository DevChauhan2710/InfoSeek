import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import config from "../config.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {

  // console.log("signup fun");

  //receving the all of things from users request body (tested in postman)
  const { firstName, lastName, email, password } = req.body;

  // console.log(firstName, lastName, email, password);


  try {
    //jb tk value database tk pauch nhi jati tb tk await krna padenga
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(401).json({ errors: "User already exist" });
    }
    //bcrypt the password
    const hashPassword = await bcrypt.hash(password, 10);
    const newuser = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });
    //to save new user at mongoDb
    await newuser.save();
    return res.status(201).json({ message: "signup succeeded" });
  } catch (error) {
    console.log("Error in signup: ", error);
    return res.status(500).json({ errors: "Error in signup" });
  }
};

export const login = async (req, res) => {
  // console.log("login fun");
  const { email, password } = req.body;
  try {

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).json({ errors: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid Credentials" });
    }

    // jwt code
    //user._id getting from mongoDb  (it means it's objectId from mongoDb for generating token for user)
    const token = jwt.sign({ id: user._id }, config.JWT_USER_SECRET,{
      expiresIn: "1d",
    });

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("jwt", token, cookieOptions);
    
    return res
      .status(201)
      .json({ message: "User loggedin succeeded", user , token});
  } catch (error) {
    console.log("Error in login: ", error);
    return res.status(500).json({ errors: "Error in login" });
  }
};

export const logout = (req, res) => {
  // console.log("logout fun");
  try {
    res.clearCookie("jwt");
    return res.status(200).json({ message: "Loggout succeeded" });
  } catch (error) {
    console.log("Error in logout: ", error);
    return res.status(500).json({ errors: "Error in logout" });
  }
};
