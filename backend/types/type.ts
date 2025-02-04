import { JwtPayload as OriginalJwtPayload } from "jsonwebtoken";
export const SECRET_KEY = "secret";
export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface TranslatedFAQ extends FAQ {
  question: string;
}
export interface JwtPayload extends OriginalJwtPayload {
  role?: string;
}

export interface CustomRequest extends Request {
  user?: string | JwtPayload;
}
