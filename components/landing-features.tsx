"use client";

import { Bus, Zap, Heart, Map, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Tiempo real",
    description:
      "Consultá los próximos arrivals de todas las líneas de colectivos en Mar del Plata.",
  },
  {
    icon: Zap,
    title: "Rápido y simple",
    description: "Sin registro, sin publicidad. Abrís, elegís y listo.",
  },
  {
    icon: Heart,
    title: "Guardá favoritos",
    description: "Guardá tus paradas frecuentes para accederlas al instante.",
  },
  {
    icon: Map,
    title: "Ver recorridos",
    description: "Explorá el mapa con todos los recorridos de las líneas.",
  },
  {
    icon: Bus,
    title: "Todas las líneas",
    description: "Información de todas las líneas de transporte de la ciudad.",
  },
  {
    icon: Shield,
    title: "100% gratuito",
    description: "App gratuita y sin costos ocultos. Uso libre.",
  },
];

export function LandingFeatures() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-4">
            ¿Por qué usar <span className="text-mdp-amarillo">MiBondi</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La forma más simple de consultar cuándo llega tu colectivo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-2xl p-6 hover:border-mdp-turquesa/50 transition-colors"
            >
              <div className="w-12 h-12 bg-mdp-amarillo/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-mdp-amarillo" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
