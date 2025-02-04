import express from "express";
import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Redis from "ioredis";
import { translate } from "google-translate-api-x";
import cors from "cors";

import jwt from "jsonwebtoken";
import { authenticateJWT, authorizeRole } from "./middleware/auth";
import { FAQ, SECRET_KEY, TranslatedFAQ } from "../types/type";

export const app = express();
app.use(cors()); // Enabling CORS
app.use(express.json());

const prisma = new PrismaClient();
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

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

const translateWithRetry = async (
  text: string,
  lang: string,
  retries = 3
): Promise<string> => {
  try {
    const res = await translate(text, { to: lang });
    return res.text;
  } catch (error) {
    if (
      retries > 0 &&
      error instanceof Error &&
      error.message.includes("Too Many Requests")
    ) {
      console.warn(`Retrying translation... (${3 - retries + 1})`);
      await new Promise((res) =>
        setTimeout(res, 1000 * Math.pow(2, 3 - retries))
      );
      return translateWithRetry(text, lang, retries - 1);
    }
    throw error;
  }
};

const getTranslatedFaq = async (
  faq: FAQ,
  lang: string
): Promise<TranslatedFAQ> => {
  const translationCacheKeyQuestion = `faq_${faq.id}_question_${lang}`;
  const translationCacheKeyAnswer = `faq_${faq.id}_answer_${lang}`;
  const cachedTranslationQuestion = await redis.get(
    translationCacheKeyQuestion
  );
  const cachedTranslationAnswer = await redis.get(translationCacheKeyAnswer);

  if (cachedTranslationQuestion && cachedTranslationAnswer) {
    return {
      ...faq,
      question: cachedTranslationQuestion,
      answer: cachedTranslationAnswer,
    };
  }

  try {
    const translatedQuestion = await translateWithRetry(faq.question, lang);
    const translatedAnswer = await translateWithRetry(faq.answer, lang);
    await redis.set(
      translationCacheKeyQuestion,
      translatedQuestion,
      "EX",
      3600
    );
    await redis.set(translationCacheKeyAnswer, translatedAnswer, "EX", 3600);
    return { ...faq, question: translatedQuestion, answer: translatedAnswer };
  } catch (error) {
    console.error("Translation error:", error);
    return faq; // Fallback to english
  }
};

const getTranslatedFaqs = async (
  faqs: FAQ[],
  lang: string
): Promise<TranslatedFAQ[]> => {
  return Promise.all(
    faqs.map(async (faq: FAQ): Promise<TranslatedFAQ> => {
      return getTranslatedFaq(faq, lang);
    })
  );
};
app.get("/api/faqs", async (req: any, res: any, next: any) => {
  try {
    const lang = typeof req.query.lang === "string" ? req.query.lang : "en";
    const faqs = await prisma.fAQ.findMany();
    console.log(faqs.length + " faqs found");

    const translatedFaqs = await getTranslatedFaqs(faqs, lang);

    res.json(translatedFaqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    next(error);
  }
});
// Ask question (user)
app.post(
  "/api/faqs",
  authenticateJWT,
  authorizeRole("user"),
  [
    body("question").isLength({ min: 5 }),
    body("answer").optional().isLength({ min: 5 }),
  ],
  async (req: any, res: any, next: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { question, answer } = req.body;
      const faq = await prisma.fAQ.create({
        data: { question, answer: answer || "" },
      });
      res.json(faq);
    } catch (error) {
      next(error);
    }
  }
);

//  update (admin)
app.put(
  "/api/faqs/:id",
  authenticateJWT,
  authorizeRole("admin"),
  [body("question").isLength({ min: 5 }), body("answer").isLength({ min: 5 })],
  async (req: any, res: any, next: any): Promise<void> => {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;
      const faq = await prisma.fAQ.update({
        where: { id: Number(id) },
        data: { question, answer },
      });
      res.json(faq);
    } catch (error) {
      next(error);
    }
  }
);

// delete  (admin)
app.delete(
  "/api/faqs/:id",
  authenticateJWT,
  authorizeRole("admin"),
  async (req: any, res: any) => {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { id: Number(id) } });
    res.status(204).send();
  }
);
