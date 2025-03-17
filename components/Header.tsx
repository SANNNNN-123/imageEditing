import { Wand2 } from "lucide-react";
import { ThemeToggle } from "./ui/theme-toggle";

export function Header() {
  return (
    <header className="w-full py-6 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-slate-900 dark:border-slate-700/60">
      <div className="container flex flex-col items-center justify-center space-y-2 max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <div className="flex-1"></div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Wand2 className="w-8 h-8 text-primary dark:text-blue-400" />
            <span className="dark:text-white">Image Creation & Editing</span>
          </h1>
          <div className="flex-1 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
        <p className="text-sm font-mono text-muted-foreground dark:text-slate-300">
          powered by Gemini 2.0 Flash Exp
        </p>
      </div>
    </header>
  );
} 