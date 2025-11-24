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

// 🔽 Arquivos estáticos da pasta dist com cache configurado
app.use(
  express.static(path.join(__dirname, "dist"), {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // ❗ não cachear o index.html (pra sempre pegar versão nova)
      if (filePath.endsWith("index.html")) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=0, must-revalidate"
        );
        return;
      }

      // ✅ cache forte para assets (js, css, imagens, fontes etc.)
      if (/\.(js|css|png|jpe?g|webp|svg|gif|ico|json|woff2?)$/i.test(filePath)) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable"
        );
      }
    },
  })
);

// 🔽 SPA: qualquer rota devolve o index.html (sem cache)
app.get("*", (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});
