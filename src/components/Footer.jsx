// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";
import { useRegiao } from "../contexts/RegionContext";
import { regionColors } from "../utils/regionColors";
import Houses from "../assets/svgs/houses.svg";
import IconGmail from "../assets/images/gmail.png";
import BlogIcon from "../assets/images/blog-icon.png";
import ImgNoticias from "../assets/images/fotoSaoPaulo.png";
import ImgDoacoes from "../assets/images/igreja.jpg";
import ImgVendas from "../assets/images/avenida.webp";
import ImgVagas from "../assets/images/25demarco2.webp";
import ImgSobre from "../assets/images/periferia.png";

export default function Footer() {
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#015E98";
  const corSecundaria = regionColors[regiao]?.[1] || "#5EC5FF";
  const baseEscura = "#050B2C";
  const baseClara = "#111C46";

  const linkCards = [
    {
      path: "/quebrada-informa",
      label: "Quebrada informa",
      descricao: "Notícias quentes direto das periferias.",
      image: ImgNoticias,
    },
    {
      path: "/doacoes",
      label: "Mão amiga",
      descricao: "Campanhas e mutirões solidários.",
      image: ImgDoacoes,
    },
    {
      path: "/achadinhos",
      label: "Achadinhos",
      descricao: "Peças únicas, bazares e economia criativa.",
      image: ImgVendas,
    },
    {
      path: "/vagas",
      label: "Corre certo",
      descricao: "Cursos, oportunidades e corre coletivo.",
      image: ImgVagas,
    },
    {
      path: "/sobre",
      label: "Sobre nós",
      descricao: "Quem cria, pauta e faz o Blog Periférico.",
      image: ImgSobre,
    },
  ];

  return (
    <footer
      className="relative w-full mt-auto text-white overflow-hidden"
      aria-label="Rodapé do site"
    >
      {/* shapes decorativos */}
      <div
        className="absolute inset-0 opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${corSecundaria}, transparent 55%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle at 80% 0%, ${corPrincipal}, transparent 50%)`,
        }}
        aria-hidden="true"
      />

      <div
        className="relative px-6 py-16 border-t"
        style={{
          borderColor: `${corPrincipal}30`,
          background: `linear-gradient(150deg, ${baseEscura}, ${baseClara} 55%, ${corPrincipal}90)`,
        }}
      >
        <div className="max-w-6xl mx-auto space-y-12">
          {/* linha principal */}
          <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr,1fr]">
            {/* Identidade */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-white/30 rounded-xl" />
                  <img
                    src={BlogIcon}
                    alt="Logo Blog Periférico"
                    className="relative w-14 h-14 rounded-xl border border-white/30 object-contain shadow-2xl"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="uppercase text-[0.65rem] tracking-[0.5rem] text-white/70">
                    Blog Periférico
                  </p>
                  <p className="text-2xl font-semibold leading-tight">
                    Voz da quebrada
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Amplificamos narrativas, conectamos oportunidades e celebramos o
                protagonismo periférico. Conte histórias com a gente.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
                  Região ativa:
                  <strong className="text-white">{regiao}</strong>
                </span>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-5 py-2 rounded-full bg-white/90 text-[#071132] shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition"
                  style={{ color: baseEscura }}
                >
                  Participar da rede
                </Link>
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
                Fale com a gente
              </h3>
              <a
                href="mailto:blog.periferico@gmail.com"
                className="flex items-center gap-3 text-sm text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-md px-1"
                aria-label="Enviar e-mail para blog.periferico@gmail.com"
              >
                <img
                  src={IconGmail}
                  alt="Ícone do Gmail"
                  className="w-9 h-9 object-contain"
                  loading="lazy"
                />
                blog.periferico@gmail.com
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 shadow-lg"
                  aria-label="Visite o Instagram do Blog Periférico"
                >
                  <FaInstagram size={20} />
                </a>
                <div className="text-xs text-white/70 leading-relaxed">
                  Bastidores, agendas e mutirões ao vivo.
                  <br />
                  @blog.periferico
                </div>
              </div>
            </div>

            {/* Carta da quebrada */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
                Carta aberta
              </h3>
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
                <p className="text-sm text-white/90 leading-relaxed">
                  “Cada rua tem um grito guardado. Nosso trabalho é transformá-lo
                  em megafone.” — time Blog Periférico
                </p>
                <Link
                  to="/sobre"
                  className="inline-flex items-center gap-2 mt-4 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white"
                >
                  Conheça nossa história →
                </Link>
              </div>
            </div>
          </div>

          {/* Páginas com cards reposicionadas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Descubra
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {linkCards.map((card) => (
                <Link
                  key={card.path}
                  to={card.path}
                  className="group relative h-52 rounded-[2rem] overflow-hidden border border-white/15 bg-white/5 shadow-2xl hover:-translate-y-2 hover:shadow-[0_28px_60px_rgba(0,0,0,0.55)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label={`Ir para ${card.label}`}
                >
                  <img
                    src={card.image}
                    alt={`Imagem representando ${card.label}`}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
                  <div className="relative h-full flex flex-col justify-between p-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3rem] text-white/70">
                        {card.label}
                      </p>
                      <p className="text-base font-semibold leading-snug max-w-[16rem]">
                        {card.descricao}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-widest text-white/80 group-hover:text-white">
                      Ver mais
                      <span className="h-px w-6 bg-white/60 group-hover:w-10 transition-all" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* cards secundários */}
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              to="/quebrada-informa"
              className="group relative p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex flex-col gap-3 hover:-translate-y-1 transition"
            >
              <span className="text-xs uppercase tracking-widest text-white/70">
                Espaço criador
              </span>
              <p className="text-lg font-semibold leading-tight">
                Quer criar sua notícia?
              </p>
              <span className="text-sm text-white/80">
                Compartilhe pautas e fortaleça a quebrada.
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80 group-hover:text-white">
                Ir para notícias →
              </span>
              <span className="absolute -top-2 -right-2 w-14 h-14 rounded-full bg-white/20 blur-xl" />
            </Link>

            <div className="relative p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex flex-col gap-4">
              <span className="text-xs uppercase tracking-widest text-white/70">
                Voz do povo
              </span>
              <p className="text-base text-white leading-relaxed">
                Reunimos vozes, causas e vitórias periféricas em um só lugar,
                com pauta responsiva e olhar coletivo.
              </p>
              <p className="text-sm text-white/80">
                Somos ponte entre quem vive a notícia e quem precisa ouvi-la.
              </p>
              <span className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/20 blur-3xl" />
            </div>
          </div>

          {/* Base */}
          <div className="pt-8 border-t border-white/20 text-xs text-white/70">
            © {new Date().getFullYear()} Blog Periférico. Toda quebrada importa.
          </div>
        </div>
      </div>

    </footer>
  );
}
