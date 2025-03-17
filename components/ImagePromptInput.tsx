"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface ImagePromptInputProps {
  onSubmit: (prompt: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

export function ImagePromptInput({
  onSubmit,
  isEditing,
  isLoading,
}: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  // Custom button styles
  const buttonStyle = {
    backgroundColor: isHovering ? 'hsl(var(--primary) / 0.9)' : 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    transition: 'background-color 0.2s ease-in-out',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground dark:text-white">
          {isEditing
            ? "Describe how you want to edit the image"
            : "Describe the image you want to generate"}
        </p>
      </div>

      <Input
        id="prompt"
        className="border-secondary resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-400"
        placeholder={
          isEditing
            ? "Example: Make the background blue and add a rainbow..."
            : "Example: A 3D rendered image of a pig with wings and a top hat flying over a futuristic city..."
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full h-10 px-4 py-2 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:disabled:opacity-40 dark:ring-offset-slate-900"
        style={buttonStyle}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 mr-2" />
            {isEditing ? "Edit Image" : "Generate Image"}
          </>
        )}
      </button>
    </form>
  );
}
