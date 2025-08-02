import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils } from 'lucide-react';

interface FoodItem {
  item_name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface NutritionCardProps {
  item: FoodItem;
}

export function NutritionCard({ item }: NutritionCardProps) {
  const totalMacros = item.total_protein + item.total_carbs + item.total_fats;
  
  const proteinPercentage = totalMacros > 0 ? (item.total_protein / totalMacros) * 100 : 0;
  const carbsPercentage = totalMacros > 0 ? (item.total_carbs / totalMacros) * 100 : 0;
  const fatsPercentage = totalMacros > 0 ? (item.total_fats / totalMacros) * 100 : 0;

  return (
    <Card className="bg-card border-0 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 group">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Utensils className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-foreground capitalize">
              {item.item_name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1 bg-accent-orange-light text-accent-orange">
              {item.total_calories.toFixed(0)} cal
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Macronutrients */}
        <div className="space-y-3">
          {/* Protein */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-nutrition-protein"></div>
              <span className="text-sm font-medium text-foreground">Protein</span>
            </div>
            <span className="text-sm font-semibold text-nutrition-protein">
              {item.total_protein.toFixed(1)}g
            </span>
          </div>
          <div className="w-full bg-nutrition-protein-light rounded-full h-2">
            <div
              className="bg-nutrition-protein h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${proteinPercentage}%` }}
            ></div>
          </div>

          {/* Carbohydrates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-nutrition-carbs"></div>
              <span className="text-sm font-medium text-foreground">Carbs</span>
            </div>
            <span className="text-sm font-semibold text-nutrition-carbs">
              {item.total_carbs.toFixed(1)}g
            </span>
          </div>
          <div className="w-full bg-nutrition-carbs-light rounded-full h-2">
            <div
              className="bg-nutrition-carbs h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${carbsPercentage}%` }}
            ></div>
          </div>

          {/* Fats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-nutrition-fats"></div>
              <span className="text-sm font-medium text-foreground">Fats</span>
            </div>
            <span className="text-sm font-semibold text-nutrition-fats">
              {item.total_fats.toFixed(1)}g
            </span>
          </div>
          <div className="w-full bg-nutrition-fats-light rounded-full h-2">
            <div
              className="bg-nutrition-fats h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${fatsPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Macro Distribution Visual */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 text-center">Macro Distribution</div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-nutrition-protein transition-all duration-500 ease-out"
              style={{ width: `${proteinPercentage}%` }}
            ></div>
            <div
              className="bg-nutrition-carbs transition-all duration-500 ease-out"
              style={{ width: `${carbsPercentage}%` }}
            ></div>
            <div
              className="bg-nutrition-fats transition-all duration-500 ease-out"
              style={{ width: `${fatsPercentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}