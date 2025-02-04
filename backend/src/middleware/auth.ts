import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

const SECRET_KEY = "secret";

interface CustomRequest extends Request {
  user?: any;
}

export const authenticateJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });

    return;
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      res.status(401).json({ message: "Invalid token" });

      return;
    }

    req.user = decoded;

    next();
  });
};

export const authorizeRole = (role: string) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      res.status(403).json({ message: "Forbidden" });
    } else {
      next();
    }
  };
};
