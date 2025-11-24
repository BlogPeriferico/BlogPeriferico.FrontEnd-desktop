import express from "express";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// 🔒 Limite de 40 requisições por IP por segundo
const limiter = rateLimit({
  windowMs: 1000,
  max: 40,
  message: "Muitas requisições simultâneas — tente novamente em instantes.",
});

app.use(limiter);
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT);
