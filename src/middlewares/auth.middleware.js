import jwt from "jsonwebtoken";
import Member from "../models/Member.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });

    req.member = decoded; // { id, role }
    next();
  });
};


export const isAdmin = (req, res, next) => {
  if (req.member.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
