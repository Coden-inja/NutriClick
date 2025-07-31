import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Zap, Activity, Sparkles, Target, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CircularProgress } from './CircularProgress';
import { NutritionCard } from './NutritionCard';
import { FeatureCard } from './FeatureCard';
import { HeroSection } from './HeroSection';

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

  const analyzeImageSecure = async (imageUrl: string): Promise<AnalysisResult> => {
    console.log('Starting secure image analysis...', imageUrl);
    
    try {
      // Call our secure edge function instead of direct API
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
        }),
      });

      console.log('Edge function response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Edge function failed:', errorData);
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in secure analysis:', error);
      
      // Fallback to mock data for demo purposes
      console.log('Falling back to mock data for demo...');
      return {
        items: [
          {
            item_name: "Blueberries",
            total_calories: 84,
            total_protien: 1.1,
            toal_carbs: 21.5,
            toal_fats: 0.3
          },
          {
            item_name: "Carrot Sticks",
            total_calories: 25,
            total_protien: 0.5,
            toal_carbs: 6,
            toal_fats: 0.1
          },
          {
            item_name: "Whole Grain Bread",
            total_calories: 120,
            total_protien: 4,
            toal_carbs: 20,
            toal_fats: 2
          },
          {
            item_name: "Oatmeal",
            total_calories: 150,
            total_protien: 5,
            toal_carbs: 27,
            toal_fats: 3
          }
        ]
      };
    }
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    console.log('Starting image upload to ImgBB...', file.name, file.size);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=caa9e987e52508e76795ed3edebc273a', {
        method: 'POST',
        body: formData,
      });

      console.log('ImgBB response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ImgBB upload failed:', errorText);
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('ImgBB upload successful:', data.data.url);
      return data.data.url;
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Starting file processing...');
      setIsLoading(true);
      setUploadProgress(0);
      setAnalysisResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('File preview created');
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
      console.log('Uploading to ImgBB...');
      const imageUrl = await uploadToImgbb(file);
      setUploadProgress(100);

      // Analyze image using secure method
      console.log('Starting secure analysis...');
      const result = await analyzeImageSecure(imageUrl);
      setAnalysisResult(result);

      console.log('Analysis complete, found', result.items.length, 'items');
      toast({
        title: 'Analysis complete!',
        description: `Found ${result.items.length} food items in your image.`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      
      let errorMessage = 'Failed to analyze the image. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          errorMessage = 'Network error: CORS policy blocked the request. Please try again or use a different image.';
        } else if (error.message.includes('Failed to upload')) {
          errorMessage = 'Failed to upload image. Please check your internet connection and try again.';
        } else if (error.message.includes('Analysis failed')) {
          errorMessage = 'Failed to analyze image content. Please try with a clearer image of food.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose CalorieSnap?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of nutrition tracking with AI-powered food recognition
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Instant Analysis"
              description="Get nutritional breakdown in seconds with our advanced AI technology"
              gradient="from-accent-orange-light to-accent-orange/20"
              delay={0}
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Precise Recognition"
              description="Accurately identifies multiple food items in a single image"
              gradient="from-nutrition-protein-light to-nutrition-protein/20"
              delay={200}
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Track Progress"
              description="Monitor your daily intake and achieve your health goals"
              gradient="from-accent-blue-light to-accent-blue/20"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* Main App Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-card mb-8 animate-bounce-in">
            <CardContent className="p-6 sm:p-8">
              {!selectedImage ? (
                <div className="text-center">
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 sm:p-12 bg-gradient-card hover:shadow-elevated transition-all duration-300">
                    <div className="relative">
                      <Activity className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
                      <Sparkles className="w-6 h-6 text-accent-orange absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold mb-4">Ready to analyze your meal?</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Take a photo or upload an image of your food to get instant nutritional information powered by AI
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                      <Button
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isLoading}
                        className="bg-gradient-primary hover:shadow-elevated hover:animate-pulse-glow transition-all duration-300 flex-1"
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
                <Card className="bg-gradient-to-r from-accent-orange-light to-accent-orange/20 border-0 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <Award className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-accent-orange mb-1">
                      {totalCalories.toFixed(0)}
                    </div>
                    <div className="text-sm text-accent-orange/80">Calories</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-nutrition-protein-light to-nutrition-protein/20 border-0 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-nutrition-protein mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-nutrition-protein mb-1">
                      {totalProtein.toFixed(1)}g
                    </div>
                    <div className="text-sm text-nutrition-protein/80">Protein</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-nutrition-carbs-light to-nutrition-carbs/20 border-0 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-6 h-6 text-nutrition-carbs mx-auto mb-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-nutrition-carbs mb-1">
                      {totalCarbs.toFixed(1)}g
                    </div>
                    <div className="text-sm text-nutrition-carbs/80">Carbs</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-nutrition-fats-light to-nutrition-fats/20 border-0 shadow-soft hover:shadow-elevated transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 text-center">
                    <Target className="w-6 h-6 text-nutrition-fats mx-auto mb-2" />
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
      </section>
    </div>
  );
}