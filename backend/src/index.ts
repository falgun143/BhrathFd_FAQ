import express from "express";
import { body, validationResult } from "express-validator";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
const SECRET_KEY = "secret"; 
import jwt from "jsonwebtoken";
export const app = express();

// User registration
app.post(
  "/api/register",
  [
    body("username").isLength({ min: 3 }),
    body("password").isLength({ min: 6 }),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const data = { username, password: hashedPassword, role: "user" };
    const user = await prisma.user.create({ data });
    const token = jwt.sign(data, SECRET_KEY, { expiresIn: "24h" });
    res.json({ token });
  }
);

// User login
app.post("/api/login", async (req: any, res: any) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: "24h",
  });
  res.json({ token });
});
