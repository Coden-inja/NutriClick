import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, gradient, delay = 0 }: FeatureCardProps) {
  return (
    <Card 
      className={`bg-gradient-to-r ${gradient} border-0 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 group animate-bounce-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-card rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-soft">
          <div className="text-primary">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}