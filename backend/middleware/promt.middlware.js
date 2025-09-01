import jwt from "jsonwebtoken";
import config from "../config.js";

function userMiddleware(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ errors: "No token provided" });
  }

  //getting token from authHeader
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.JWT_USER_SECRET);
    console.log(decoded);
    //verify the token by using verify's id
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ errors: "Invalid token or expired" });
  }
}

export default userMiddleware;
