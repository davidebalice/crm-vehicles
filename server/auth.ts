import { User as SelectUser, User } from "@shared/schema";
import cookieParser from "cookie-parser";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import dotenv from "dotenv";
import { Express } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      headers: {
        [key: string]: string | undefined; // Questo permette di accedere a qualsiasi header
      };
      user?: User | undefined;
    }
  }
}

const scryptAsync = promisify(scrypt);

const jwtSecret = process.env.JWT_SECRET;

// Funzione per hashare la password
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Funzione per confrontare la password
async function comparePasswords(supplied: string, stored: string) {
  if (!stored.includes(".")) {
    return supplied === stored;
  }

  const [hashed, salt] = stored.split(".");
  if (!salt) {
    console.error("Password format error: missing salt");
    return false;
  }

  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Funzione per generare il JWT
function generateToken(user: SelectUser) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role, // Aggiungi eventuali altre informazioni dell'utente
  };

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, jwtSecret, {
    expiresIn: "1d", // Imposta la durata del token
  });
}

export function setupAuth(app: Express) {
  app.use(cookieParser());

  // Registrazione
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Nome utente già esistente" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Genera un token JWT dopo la registrazione
      const token = generateToken(user);

      res.status(201).json({ user: { ...user, password: undefined }, token });
    } catch (err) {
      next(err);
    }
  });

  // Login senza Passport, solo JWT
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ error: "Credenziali non valide" });
      }

      // Genera un token JWT dopo il login
      const token = generateToken(user);

      // Ritorna il token al client
      res.status(200).json({ user: { ...user, password: undefined }, token });
    } catch (err) {
      return res.status(500).json({ error: "Errore interno del server" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    // Con JWT non è necessario gestire una sessione, quindi puoi semplicemente inviare una risposta di successo.
    res.sendStatus(200);
  });

  // Protezione delle rotte con JWT
  app.get("/api/user", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token mancante" });
    }

    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET is not defined" });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token non valido" });
      }

      // Restituisci i dati dell'utente (senza la password)
      const userProfile =
        typeof decoded === "object" && decoded !== null ? { ...decoded } : {};
      res.json(userProfile);
    });
  });
}

// Middleware per proteggere le rotte API
import { NextFunction, Request, Response } from "express";
import { promisify } from "util";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = (req as Express.Request).headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Autenticazione richiesta" });
  }
  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT_SECRET is not defined" });
  }
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token non valido" });
    }

    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as User;
    } else {
      return res.status(401).json({ error: "Token non valido" });
    }
    next();
  });
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = Array.isArray(req.headers['x-api-key']) ? req.headers['x-api-key'][0] : req.headers['x-api-key'];
  const validKeys = ['abc123', 'partner456']; // meglio nel DB

  if (!apiKey || !validKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'API Key non valida' });
  }

  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Autenticazione richiesta" });
  }
  if (!jwtSecret) {
    return res.status(500).json({ error: "JWT_SECRET is not defined" });
  }
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (
      err ||
      !decoded ||
      (typeof decoded === "object" && decoded.role !== "admin")
    ) {
      return res.status(403).json({ error: "Permesso negato" });
    }

    if (typeof decoded === "object" && decoded !== null) {
      req.user = decoded as User;
    } else {
      return res.status(401).json({ error: "Token non valido" });
    }
    next();
  });
}
