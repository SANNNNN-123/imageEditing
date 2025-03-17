"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePromptInput } from "@/components/ImagePromptInput";
import { ImageResultDisplay } from "@/components/ImageResultDisplay";
import { ImageIcon, Upload, Clock, Check } from "lucide-react";
import { HistoryItem } from "@/lib/types";

interface TabsContainerProps {
  image: string | null;
  generatedImage: string | null;
  description: string | null;
  loading: boolean;
  error: string | null;
  history: HistoryItem[];
  onImageSelect: (imageData: string) => void;
  onPromptSubmit: (prompt: string) => void;
  onReset: () => void;
}

export function TabsContainer({
  image,
  generatedImage,
  description,
  loading,
  error,
  history,
  onImageSelect,
  onPromptSubmit,
  onReset,
}: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState("create");
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  
  // If we have a generated image, we want to edit it next time
  const currentImage = generatedImage || image;
  const isEditing = !!currentImage;
  
  // Get the latest image to display (always the generated image)
  const displayImage = generatedImage;

  // Format timestamp to show only the time (HH:MM AM/PM)
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get model responses from history
  const getModelResponses = () => {
    return history.filter(item => item.role === "model");
  };

  // Get user prompts from history
  const getUserPrompts = () => {
    return history.filter(item => item.role === "user");
  };

  // Get the prompt text for a specific version
  const getPromptForVersion = (versionIndex: number) => {
    const userPrompts = getUserPrompts();
    if (userPrompts[versionIndex] && userPrompts[versionIndex].parts) {
      const textParts = userPrompts[versionIndex].parts.filter(part => part.text);
      if (textParts.length > 0) {
        return textParts[0].text || "";
      }
    }
    return "";
  };

  return (
    <Tabs 
      defaultValue="create" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="create" disabled={loading}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Create
        </TabsTrigger>
        <TabsTrigger 
          value="upload" 
          disabled={loading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </TabsTrigger>
      </TabsList>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <TabsContent value="create" className="space-y-4">
        {!displayImage && !loading ? (
          <>
            <ImageUpload
              onImageSelect={onImageSelect}
              currentImage={currentImage}
            />
            <ImagePromptInput
              onSubmit={onPromptSubmit}
              isEditing={isEditing}
              isLoading={loading}
            />
          </>
        ) : loading ? (
          <div
            role="status"
            className="flex items-center mx-auto justify-center h-56 max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-secondary"
          >
            <ImageIcon className="w-10 h-10 text-gray-200 dark:text-muted-foreground" />
            <span className="pl-4 font-mono font-xs text-muted-foreground">
              Processing...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ImageResultDisplay
                imageUrl={displayImage || ""}
                description={description}
                onReset={onReset}
                conversationHistory={[]}
              />
              <div className="mt-4">
                <ImagePromptInput
                  onSubmit={onPromptSubmit}
                  isEditing={true}
                  isLoading={loading}
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="p-4 rounded-lg bg-card border shadow-sm h-full overflow-auto max-h-[600px]">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Edit History
                </h3>
                
                {image && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">Original</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Original image</p>
                  </div>
                )}
                
                {getModelResponses().length > 0 && (
                  <div className="space-y-4">
                    {getModelResponses().map((item, index) => {
                      const versionNumber = getModelResponses().length - index;
                      const prompt = getPromptForVersion(index);
                      const isSelected = selectedVersion === index;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-background hover:bg-muted/30'} transition-colors cursor-pointer`}
                          onClick={() => setSelectedVersion(index)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {item.parts.some(part => part.image) && (
                                <div className="w-10 h-10 rounded-md overflow-hidden">
                                  <img 
                                    src={item.parts.find(part => part.image)?.image || ''} 
                                    alt={`Version ${versionNumber}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium">Version {versionNumber}</span>
                                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{prompt}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatTime()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="upload" className="space-y-4">
        {!currentImage ? (
          <div className="p-4 rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-4">Upload an Image</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image to edit or use as a reference for generating new images.
            </p>
            <ImageUpload
              onImageSelect={onImageSelect}
              currentImage={currentImage}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-4">Edit Your Image</h3>
                <div className="rounded-lg overflow-hidden bg-muted p-2 mb-4">
                  <img
                    src={currentImage}
                    alt="Uploaded"
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
                <ImagePromptInput
                  onSubmit={onPromptSubmit}
                  isEditing={true}
                  isLoading={loading}
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="p-4 rounded-lg bg-card border shadow-sm h-full overflow-auto max-h-[600px]">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Edit History
                </h3>
                
                {image && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">Original</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatTime()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Original image</p>
                  </div>
                )}
                
                {getModelResponses().length > 0 && (
                  <div className="space-y-4">
                    {getModelResponses().map((item, index) => {
                      const versionNumber = getModelResponses().length - index;
                      const prompt = getPromptForVersion(index);
                      const isSelected = selectedVersion === index;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-background hover:bg-muted/30'} transition-colors cursor-pointer`}
                          onClick={() => setSelectedVersion(index)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {item.parts.some(part => part.image) && (
                                <div className="w-10 h-10 rounded-md overflow-hidden">
                                  <img 
                                    src={item.parts.find(part => part.image)?.image || ''} 
                                    alt={`Version ${versionNumber}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium">Version {versionNumber}</span>
                                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{prompt}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatTime()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}