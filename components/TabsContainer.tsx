"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePromptInput } from "@/components/ImagePromptInput";
import { ImageResultDisplay } from "@/components/ImageResultDisplay";
import { ImageIcon, Upload, Clock, Check, ArrowLeft, Pencil } from "lucide-react";
import { HistoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";

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
  const [selectedVersionImage, setSelectedVersionImage] = useState<string | null>(null);
  const [selectedVersionDescription, setSelectedVersionDescription] = useState<string | null>(null);
  
  // If we have a generated image, we want to edit it next time
  const currentImage = generatedImage || image;
  const isEditing = !!currentImage;
  
  // Get the latest image to display (always the generated image unless a version is selected)
  const displayImage = selectedVersionImage || generatedImage;
  
  // Only show description for generated images, not for original uploaded images
  const displayDescription = selectedVersionImage === image ? null : selectedVersionDescription || description;

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

  // Handle version selection
  const handleVersionSelect = (index: number) => {
    const modelResponses = getModelResponses();
    if (modelResponses[index]) {
      const selectedItem = modelResponses[index];
      
      // Find the image in the selected version
      const imagePart = selectedItem.parts.find(part => part.image);
      const textPart = selectedItem.parts.find(part => part.text);
      
      if (imagePart && imagePart.image) {
        setSelectedVersionImage(imagePart.image);
        setSelectedVersionDescription(textPart?.text || null);
        setSelectedVersion(index);
      }
    }
  };

  // Reset to the latest version
  const resetToLatest = () => {
    setSelectedVersion(null);
    setSelectedVersionImage(null);
    setSelectedVersionDescription(null);
  };

  // Reset selected version when history changes
  useEffect(() => {
    resetToLatest();
  }, [history.length]);

  // Switch to edit tab when an image is generated
  useEffect(() => {
    if (generatedImage && activeTab === "create") {
      setActiveTab("upload");
    }
  }, [generatedImage]);

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
          {isEditing ? (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </>
          )}
        </TabsTrigger>
      </TabsList>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <TabsContent value="create" className="space-y-4">
        {!displayImage ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ImageResultDisplay
                imageUrl={displayImage || ""}
                description={displayDescription}
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
                  <div 
                    className="p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/30 transition-colors cursor-pointer mb-3"
                    onClick={() => {
                      setSelectedVersion(null);
                      setSelectedVersionImage(image);
                      setSelectedVersionDescription(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Original</span>
                          <p className="text-xs text-muted-foreground">Original image</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime()}</span>
                    </div>
                  </div>
                )}
                
                {getModelResponses().length > 0 && (
                  <div className="space-y-3">
                    {getModelResponses().map((item, index) => {
                      // Version number is just the index + 1 (first edit is Version 1)
                      const versionNumber = index + 1;
                      const prompt = getPromptForVersion(index);
                      const isSelected = selectedVersion === index;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-background hover:bg-muted/30'} transition-colors cursor-pointer`}
                          onClick={() => handleVersionSelect(index)}
                        >
                          <div className="flex items-center justify-between">
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
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime()}</span>
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
                  <div 
                    className="p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/30 transition-colors cursor-pointer mb-3"
                    onClick={() => {
                      setSelectedVersion(null);
                      setSelectedVersionImage(image);
                      setSelectedVersionDescription(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Original</span>
                          <p className="text-xs text-muted-foreground">Original image</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime()}</span>
                    </div>
                  </div>
                )}
                
                {getModelResponses().length > 0 && (
                  <div className="space-y-3">
                    {getModelResponses().map((item, index) => {
                      // Version number is just the index + 1 (first edit is Version 1)
                      const versionNumber = index + 1;
                      const prompt = getPromptForVersion(index);
                      const isSelected = selectedVersion === index;
                      
                      return (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50 bg-background hover:bg-muted/30'} transition-colors cursor-pointer`}
                          onClick={() => handleVersionSelect(index)}
                        >
                          <div className="flex items-center justify-between">
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
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime()}</span>
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