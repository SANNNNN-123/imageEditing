import { Wand2 } from "lucide-react";

export function Header() {
  return (
    <header className="w-full py-6 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-center space-y-2 max-w-4xl mx-auto">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Wand2 className="w-8 h-8 text-primary" />
          Image Creation & Editing
        </h1>
        <p className="text-sm font-mono text-muted-foreground">
          powered by Gemini 2.0 Flash Exp
        </p>
      </div>
    </header>
  );
} 