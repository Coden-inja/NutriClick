import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CircularProgress } from './CircularProgress';
import { NutritionCard } from './NutritionCard';

interface FoodItem {
  item_name: string;
  total_calories: number;
  total_protien: number;
  toal_carbs: number;
  toal_fats: number;
}

interface AnalysisResult {
  items: FoodItem[];
}

export function CalorieApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const uploadToImgbb = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgbb.com/1/upload?key=caa9e987e52508e76795ed3edebc273a', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data.url;
  };

  const analyzeImage = async (imageUrl: string): Promise<AnalysisResult> => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Give calories of each item in this image in this below JSON format only\n {items:[{item_name:name of item, total_calories:in gm, total_protien:in gm , toal_carbs: in gm ,toal_fats:in gm},...]}',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        model: 'llama-3.2-90b-vision-preview',
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: {
          type: 'json_object',
        },
        stop: null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(0);
      setAnalysisResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to imgbb
      const imageUrl = await uploadToImgbb(file);
      setUploadProgress(100);

      // Analyze image
      const result = await analyzeImage(imageUrl);
      setAnalysisResult(result);

      toast({
        title: 'Analysis complete!',
        description: `Found ${result.items.length} food items in your image.`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const totalCalories = analysisResult?.items.reduce((sum, item) => sum + item.total_calories, 0) || 0;
  const totalProtein = analysisResult?.items.reduce((sum, item) => sum + item.total_protien, 0) || 0;
  const totalCarbs = analysisResult?.items.reduce((sum, item) => sum + item.toal_carbs, 0) || 0;
  const totalFats = analysisResult?.items.reduce((sum, item) => sum + item.toal_fats, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-hero p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Calorie<span className="text-primary">Snap</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Snap a photo of your food and instantly discover its nutritional breakdown
          </p>
        </div>

        {/* Upload Section */}
        <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-card mb-8">
          <CardContent className="p-6 sm:p-8">
            {!selectedImage ? (
              <div className="text-center">
                <div className="border-2 border-dashed border-border rounded-2xl p-8 sm:p-12 bg-gradient-card">
                  <Activity className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">Ready to analyze your meal?</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Take a photo or upload an image of your food to get instant nutritional information
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Button
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isLoading}
                      className="bg-gradient-primary hover:shadow-elevated transition-all duration-300 flex-1"
                      size="lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </Button>
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex-1"
                      size="lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                  
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Selected food"
                    className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-soft"
                  />
                  <Button
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                    variant="outline"
                    className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm"
                  >
                    Change Image
                  </Button>
                </div>
                
                {isLoading && (
                  <div className="text-center py-8">
                    <CircularProgress progress={uploadProgress} />
                    <p className="text-muted-foreground mt-4">
                      {uploadProgress < 100 ? 'Uploading image...' : 'Analyzing nutritional content...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6 animate-slide-up">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-accent-orange-light to-accent-orange/20 border-0 shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-accent-orange mb-1">
                    {totalCalories.toFixed(0)}
                  </div>
                  <div className="text-sm text-accent-orange/80">Calories</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-nutrition-protein-light to-nutrition-protein/20 border-0 shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-nutrition-protein mb-1">
                    {totalProtein.toFixed(1)}g
                  </div>
                  <div className="text-sm text-nutrition-protein/80">Protein</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-nutrition-carbs-light to-nutrition-carbs/20 border-0 shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-nutrition-carbs mb-1">
                    {totalCarbs.toFixed(1)}g
                  </div>
                  <div className="text-sm text-nutrition-carbs/80">Carbs</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-nutrition-fats-light to-nutrition-fats/20 border-0 shadow-soft">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-nutrition-fats mb-1">
                    {totalFats.toFixed(1)}g
                  </div>
                  <div className="text-sm text-nutrition-fats/80">Fats</div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Food Items */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Nutritional Breakdown by Item</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {analysisResult.items.map((item, index) => (
                  <NutritionCard key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}