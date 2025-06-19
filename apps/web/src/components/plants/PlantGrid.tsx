'use client';

import { 
  Check,
  Droplets, 
  Flower2, 
  Heart,
  Plus,
  Sun
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

type Plant = {
  id: string;
  scientific_name: string;
  common_names: string[];
  thumbnail_url: string;
  dominant_color: string;
  category: string;
  water_needs: string;
  sun_requirements: string;
  texas_native: boolean;
  drought_tolerant: boolean;
  tags: string[];
}

type PlantGridProps = {
  plants: Plant[];
  isLoading?: boolean;
  onPlantSelect?: (plant: Plant) => void;
  onAddToCanvas?: (plant: Plant) => void;
  showAddButton?: boolean;
}

export function PlantGrid({ 
  plants, 
  isLoading, 
  onPlantSelect,
  onAddToCanvas,
  showAddButton = false 
}: PlantGridProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const toggleFavoriteMutation = trpc.plant.toggleFavorite.useMutation({
    onSuccess: (data, variables) => {
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (data.isFavorite) {
          newSet.add(variables.plantId);
        } else {
          newSet.delete(variables.plantId);
        }
        return newSet;
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent, plantId: string) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate({ plantId });
  };

  const handleAddToCanvas = (e: React.MouseEvent, plant: Plant) => {
    e.stopPropagation();
    onAddToCanvas?.(plant);
    setAddedIds(prev => new Set(prev).add(plant.id));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setAddedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(plant.id);
        return newSet;
      });
    }, 2000);
  };

  const getWaterIcon = (waterNeeds: string) => {
    const count = waterNeeds === 'low' ? 1 : waterNeeds === 'moderate' ? 2 : 3;
    return Array(count).fill(null).map((_, i) => (
      <Droplets key={i} className="size-3 fill-blue-500 text-blue-500" />
    ));
  };

  const getSunIcon = (sunReq: string) => {
    if (sunReq === 'full_sun') {
      return <Sun className="size-4 text-yellow-500" />;
    } else if (sunReq === 'partial_sun') {
      return <Sun className="size-4 text-yellow-600/60" />;
    } else {
      return <Sun className="size-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array(10).fill(null).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-4">
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="py-12 text-center">
        <Flower2 className="mx-auto mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No plants found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search filters or browse all plants
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {plants.map((plant) => (
        <Card
          key={plant.id}
          className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
          onClick={() => onPlantSelect?.(plant)}
        >
          {/* Image with dominant color background */}
          <div
            className="relative aspect-square"
            style={{ backgroundColor: plant.dominant_color }}
          >
            <img
              src={plant.thumbnail_url}
              alt={plant.common_names[0]}
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
            />
            
            {/* Favorite button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 bg-white/80 hover:bg-white"
              onClick={(e) => handleToggleFavorite(e, plant.id)}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  favoriteIds.has(plant.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                )}
              />
            </Button>

            {/* Badges */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {plant.texas_native && (
                <Badge variant="secondary" className="text-xs">
                  TX Native
                </Badge>
              )}
              {plant.drought_tolerant && (
                <Badge variant="secondary" className="text-xs">
                  Drought Tolerant
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="mb-1 line-clamp-1 text-sm font-semibold">
              {plant.common_names[0]}
            </h3>
            <p className="line-clamp-1 text-xs italic text-muted-foreground">
              {plant.scientific_name}
            </p>
            
            {/* Quick info */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1" title={`Sun: ${plant.sun_requirements}`}>
                {getSunIcon(plant.sun_requirements)}
              </div>
              <div className="flex items-center gap-0.5" title={`Water: ${plant.water_needs}`}>
                {getWaterIcon(plant.water_needs)}
              </div>
            </div>
          </CardContent>

          {showAddButton && (
            <CardFooter className="p-3 pt-0">
              <Button
                size="sm"
                variant={addedIds.has(plant.id) ? "secondary" : "outline"}
                className="w-full"
                onClick={(e) => handleAddToCanvas(e, plant)}
              >
                {addedIds.has(plant.id) ? (
                  <>
                    <Check className="mr-2 size-3" />
                    Added
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-3" />
                    Add to Design
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}