import React from 'react';
import { Sparkles, Camera, Brain, Zap, CakeSlice } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-accent-orange/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-accent-blue/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-nutrition-protein/20 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Main Hero Content */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6 animate-bounce-in">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-elevated animate-pulse-glow">
                <CakeSlice className="w-8 h-8 text-primary-foreground" />
              </div>
              <Sparkles className="w-6 h-6 text-accent-orange absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent-orange to-accent-blue bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
              NutriClick
            </h1>
          </div>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            Transform your nutrition tracking with{' '}
            <span className="font-semibold text-primary">AI-powered</span> food recognition.{' '}
            <span className="font-semibold text-accent-orange">Snap</span>,{' '}
            <span className="font-semibold text-accent-blue">analyze</span>, and{' '}
            <span className="font-semibold text-nutrition-protein">track</span> in seconds.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-12 animate-scale-in" style={{ animationDelay: '600ms' }}>
          <Button
            size="lg"
            className="bg-gradient-primary hover:shadow-elevated hover:scale-105 transition-all duration-300 animate-pulse-glow"
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Tracking Now
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-5 h-5 mr-2" />
            See Demo
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '900ms' }}>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">99%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-accent-orange mb-2">&lt;3s</div>
            <div className="text-sm text-muted-foreground">Analysis Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-accent-blue mb-2">1000+</div>
            <div className="text-sm text-muted-foreground">Food Items</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-nutrition-protein mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Users</div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent"></div>
    </section>
  );
}