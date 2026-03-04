import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background border-b border-border pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className="max-w-md md:max-w-full md:pl-64 mx-auto">
        <div className="text-center py-3">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
            Mi<span className="text-mdp-amarillo font-light">Bondi</span>
          </h1>
          <div
            className="h-1 w-10 bg-mdp-amarillo mx-auto mt-1 rounded-full"
            aria-hidden="true"
          />
        </div>
      </div>
    </header>
  );
}
