"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePromptInput } from "@/components/ImagePromptInput";
import { ImageResultDisplay } from "@/components/ImageResultDisplay";
import { ImageIcon, Upload, Clock, Check, ArrowLeft, Pencil, Plus } from "lucide-react";
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

  // Switch to edit tab when an image is generated or uploaded
  useEffect(() => {
    if (currentImage && activeTab === "create") {
      setActiveTab("edit");
    }
  }, [currentImage, activeTab]);

  // Handle new creation (reset and switch to create tab)
  const handleNewCreation = () => {
    onReset();
    setActiveTab("create");
  };

  return (
    <Tabs 
      defaultValue="create" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger 
          value="create" 
          disabled={loading || isEditing}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </TabsTrigger>
        <TabsTrigger 
          value="edit" 
          disabled={loading || !isEditing}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit Image
        </TabsTrigger>
      </TabsList>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300 dark:border dark:border-red-800">
          {error}
        </div>
      )}
      
      <TabsContent value="create" className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/30 dark:bg-slate-800/50">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Upload Image</h3>
          <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">
            Upload an image to edit or describe an image to generate.
          </p>
          <ImageUpload
            onImageSelect={onImageSelect}
            currentImage={null}
          />
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white">Or Generate an Image</h3>
            <ImagePromptInput
              onSubmit={onPromptSubmit}
              isEditing={false}
              isLoading={loading}
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="edit" className="space-y-4">
        {!currentImage ? (
          <div className="p-4 rounded-lg bg-muted/30 dark:bg-slate-800/50 text-center">
            <h3 className="text-lg font-medium mb-2 dark:text-white">No Image to Edit</h3>
            <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">
              Please upload or generate an image first.
            </p>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Image
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ImageResultDisplay
                imageUrl={displayImage || currentImage}
                description={displayDescription}
                onReset={handleNewCreation}
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
              <div className="p-4 rounded-lg bg-card border shadow-sm h-full overflow-auto max-h-[600px] dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-foreground dark:text-white">
                  <Clock className="w-4 h-4 text-muted-foreground dark:text-blue-400" />
                  Edit History
                </h3>
                
                {image && (
                  <div 
                    className="p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/30 transition-colors cursor-pointer mb-3 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-700/50"
                    onClick={() => {
                      setSelectedVersion(null);
                      setSelectedVersionImage(image);
                      setSelectedVersionDescription(null);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-md overflow-hidden">
                          <img 
                            src={image} 
                            alt="Original Image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-sm font-medium dark:text-slate-200">Original Image</div>
                      </div>
                      {selectedVersionImage === image && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
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
                          className={`p-3 rounded-lg border ${isSelected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-border/50 bg-background hover:bg-muted/30 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-700/50'} transition-colors cursor-pointer`}
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
                                  <span className="text-sm font-medium dark:text-slate-200">Version {versionNumber}</span>
                                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground dark:text-slate-400 line-clamp-1">{prompt}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap">{formatTime()}</span>
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