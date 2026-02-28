export function RouteMapSkeleton() {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl bg-muted flex items-center justify-center border border-border">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Cargando mapa...</span>
      </div>
    </div>
  );
}
