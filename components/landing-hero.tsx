"use client";

import Link from "next/link";
import { ArrowRight, Bus, Clock, Star } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-mdp-amarillo/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-mdp-amarillo/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                Mar del Plata
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter italic mb-6">
              Mi<span className="text-mdp-amarillo font-light">Bondi</span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Consultá cuándo llega tu colectivo en tiempo real. Rápido, claro y
              sin vueltas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/consultar"
                className="inline-flex items-center justify-center gap-2 btn-mdp-turquesa px-8 py-4 rounded-2xl text-lg font-black"
              >
                Consultar colectivo
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/favoritos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-lg font-black bg-muted hover:bg-muted/80 transition-colors"
              >
                <Star className="w-5 h-5" />
                Ver favoritos
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-mdp-amarillo" />
                <span>Todas las líneas</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-mdp-amarillo" />
                <span>Tiempo real</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full max-w-[400px] mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-mdp-turquesa/20 to-mdp-amarillo/20 rounded-[3rem] blur-3xl" />
              <div className="relative bg-card border border-border rounded-[2.5rem] p-4 shadow-2xl">
                <div className="bg-mdp-bg-principal rounded-[2rem] overflow-hidden">
                  <div className="bg-card border-b border-border p-4 text-center">
                    <div className="inline-block text-xl font-black uppercase italic">
                      Mi
                      <span className="text-mdp-amarillo font-light">
                        Bondi
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="text-xs font-bold uppercase text-muted-foreground mb-2">
                        Línea
                      </div>
                      <div className="text-2xl font-black text-foreground">
                        111
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="text-xs font-bold uppercase text-muted-foreground mb-2">
                        Parada
                      </div>
                      <div className="text-lg font-bold text-foreground truncate">
                        Güemes y Mitre
                      </div>
                    </div>
                    <div className="bg-mdp-amarillo/20 rounded-xl p-4 border border-mdp-amarillo/30">
                      <div className="text-xs font-bold uppercase text-muted-foreground mb-1">
                        Próximo arrivals
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-black text-mdp-turquesa">
                          3
                        </span>
                        <span className="text-lg font-bold text-muted-foreground mb-1">
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
