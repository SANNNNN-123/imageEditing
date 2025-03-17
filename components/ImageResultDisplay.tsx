"use client";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { HistoryItem, HistoryPart } from "@/lib/types";

interface ImageResultDisplayProps {
  imageUrl: string;
  description: string | null;
  onReset: () => void;
  conversationHistory?: HistoryItem[];
}

export function ImageResultDisplay({
  imageUrl,
  description,
  onReset,
  conversationHistory = [],
}: ImageResultDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold dark:text-white">Current Image</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {conversationHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleHistory} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onReset} className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-muted p-4 dark:bg-slate-800 dark:border dark:border-slate-700 flex justify-center">
        <img
          src={imageUrl}
          alt="Current Image"
          className="max-w-full h-auto object-contain"
          style={{ maxHeight: '600px' }}
        />
      </div>

      {description && (
        <div className="p-4 rounded-lg bg-muted dark:bg-slate-800 dark:border dark:border-slate-700">
          <h3 className="text-sm font-medium mb-2 dark:text-white">Description</h3>
          <p className="text-sm text-muted-foreground dark:text-slate-300">{description}</p>
        </div>
      )}

      {showHistory && conversationHistory.length > 0 && (
        <div className="p-4 rounded-lg dark:bg-slate-900">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Conversation History</h3>
          <div className="space-y-4">
            {conversationHistory.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg bg-secondary dark:bg-slate-800 dark:border dark:border-slate-700`}>
                <p
                  className={`text-sm font-medium mb-2 ${
                    item.role === "user" ? "text-foreground dark:text-white" : "text-primary dark:text-blue-400"
                  }`}
                >
                  {item.role === "user" ? "You" : "Gemini"}
                </p>
                <div className="space-y-2">
                  {item.parts.map((part: HistoryPart, partIndex) => (
                    <div key={partIndex}>
                      {part.text && <p className="text-sm dark:text-slate-300">{part.text}</p>}
                      {part.image && (
                        <div className="mt-2 overflow-hidden rounded-md">
                          <img
                            src={part.image}
                            alt={`${item.role} image`}
                            className="max-w-full h-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
