"use client";

import {
  Share2,
  Code,
  ExternalLink,
  Bus,
  Zap,
  Github,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AcercaPage() {
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      "Mirá esta app para ver cuándo llega el bondi en Mar del Plata 🚌 https://mibondi.vercel.app",
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MiBondi",
          text: "Consultá cuándo llega tu colectivo en Mar del Plata",
          url: "https://mibondi.vercel.app",
        });
      } catch {}
    } else {
      handleShareWhatsApp();
    }
  };

  const faq = [
    { q: "¿Es gratis?", a: "Sí. 100% gratuita y sin anuncios." },
    {
      q: "¿Funciona sin internet?",
      a: "Necesitás conexión para obtener los datos en tiempo real.",
    },
    {
      q: "¿Qué líneas incluye?",
      a: "Todas las líneas de colectivos de Mar del Plata.",
    },
  ];

  return (
    <div className="px-4 py-12 space-y-8">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-mdp-amarillo/10 rounded-2xl">
          <Image src="/icon.svg" alt="MiBondi" width={80} height={80} />
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Mi<span className="text-mdp-amarillo font-light">Bondi</span>
          </h1>
        </div>

        <p className="text-muted-foreground max-w-xs mx-auto text-sm">
          Información de colectivos en tiempo real para Mar del Plata. Rápida,
          clara y sin vueltas.
        </p>
      </section>

      {/* ── HECHO POR ────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Hecho por
        </h2>

        <div className="p-4 bg-muted/30 rounded-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-base font-semibold">Nicolás Jiménez</h3>
              <p className="text-sm text-muted-foreground">
                Frontend Developer & Multimedia Designer
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Conectemos
            </span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Diseño y desarrollo interfaces digitales que priorizan la claridad y
            la experiencia del usuario.{" "}
            <span className="text-foreground font-medium">MiBondi</span> es un
            ejemplo de cómo abordo los problemas
          </p>

          <div className="flex flex-wrap gap-2">
            <a
              href="https://github.com/dotfn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/60 text-sm font-medium transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/dotfn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/60 text-sm font-medium transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href="https://dotfn.github.io/portafolio-live-cv/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/60 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Portfolio
            </a>
          </div>
        </div>
      </section>

      {/* ── COMPARTIR ────────────────────────────────────────── */}
      <section className="bg-muted/30 rounded-2xl p-4 space-y-3">
        <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Compartir
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] py-3 px-4 rounded-xl font-semibold text-sm text-white active:scale-95 transition-transform"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </button>

          <button
            onClick={handleShareNative}
            className={cn(
              "flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm active:scale-95 transition-transform",
              "btn-mdp-amarillo",
            )}
          >
            <Share2 className="h-5 w-5" />
            Compartir
          </button>
        </div>
      </section>

      {/* ── SOBRE LA APP ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Sobre la app
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Bus className="h-5 w-5 text-mdp-amarillo shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Información en tiempo real</p>
              <p className="text-muted-foreground text-sm mt-1">
                Consultá líneas, paradas y próximos arribos al instante, desde
                cualquier dispositivo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Zap className="h-5 w-5 text-mdp-amarillo shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Diseñada para usarse en segundos</p>
              <p className="text-muted-foreground text-sm mt-1">
                Sin registro, sin publicidad y sin pasos innecesarios. Abrís,
                elegís tu línea y listo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
            <Code className="h-5 w-5 text-mdp-amarillo shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Proyecto independiente</p>
              <p className="text-muted-foreground text-sm mt-1">
                Una alternativa simple y directa para consultar el transporte
                sin fricción. Pensada para resolver rápido algo cotidiano.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓDIGO ABIERTO ───────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Código abierto
        </h2>

        <div className="space-y-3">
          <a
            href="https://github.com/dotfn/cuando-llega-mi-bondi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-mdp-amarillo" />
              <div>
                <p className="font-semibold text-sm">Repositorio en GitHub</p>
                <p className="text-muted-foreground text-xs">
                  Código fuente y decisiones técnicas
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <a
            href="https://github.com/dotfn/cuando-llega-mi-bondi/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-mdp-amarillo" />
              <div>
                <p className="font-semibold text-sm">Reportar bugs o proponer mejoras</p>
                <p className="text-muted-foreground text-xs">
                  El proyecto crece con la comunidad
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
          Preguntas frecuentes
        </h2>

        <div className="space-y-2">
          {faq.map((item, i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-xl">
              <p className="font-semibold text-sm">{item.q}</p>
              <p className="text-muted-foreground text-sm mt-1">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="text-center pt-4 pb-2">
        <p className="text-xs text-muted-foreground">© 2026 MiBondi · Mar del Plata</p>
        <p className="text-xs text-muted-foreground mt-1">
          Hecha con ❤️ para marplatenses 🌊
        </p>
      </footer>

    </div>
  );
}