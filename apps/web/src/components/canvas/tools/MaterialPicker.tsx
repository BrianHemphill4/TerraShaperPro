'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Star, Clock, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMaterialStore, type Material, type MaterialCategory } from '@/stores/canvas/useMaterialStore';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface MaterialPickerProps {
  onMaterialSelect?: (material: Material) => void;
  showCreateButton?: boolean;
  compact?: boolean;
}

const CATEGORY_ICONS: Record<MaterialCategory, React.ComponentType<{ className?: string }>> = {
  mulch: Package,
  stone: Package,
  hardscape: Package,
  grass: Package,
  plant: Package,
  water: Package
};

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  mulch: 'Mulch',
  stone: 'Stone',
  hardscape: 'Hardscape',
  grass: 'Grass',
  plant: 'Plants',
  water: 'Water Features'
};

export function MaterialPicker({ onMaterialSelect, showCreateButton = true, compact = false }: MaterialPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MaterialCategory | 'recent' | 'all'>('all');

  const {
    materials,
    selectedMaterialId,
    setSelectedMaterial,
    getMaterialsByCategory,
    getRecentMaterials,
    searchMaterials,
    addToRecentMaterials
  } = useMaterialStore();

  // Filter materials based on search and category
  const filteredMaterials = useMemo(() => {
    let result = materials;

    if (searchQuery.trim()) {
      result = searchMaterials(searchQuery);
    } else if (activeCategory === 'recent') {
      result = getRecentMaterials();
    } else if (activeCategory !== 'all') {
      result = getMaterialsByCategory(activeCategory as MaterialCategory);
    }

    return result;
  }, [materials, searchQuery, activeCategory, searchMaterials, getRecentMaterials, getMaterialsByCategory]);

  const recentMaterials = getRecentMaterials();

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material.id);
    addToRecentMaterials(material.id);
    onMaterialSelect?.(material);
  };

  const MaterialCard = ({ material }: { material: Material }) => {
    const isSelected = selectedMaterialId === material.id;
    const Icon = CATEGORY_ICONS[material.category];

    return (
      <div
        onClick={() => handleMaterialClick(material)}
        className={cn(
          'group relative p-3 border rounded-lg cursor-pointer transition-all',
          'hover:border-primary hover:shadow-sm',
          isSelected && 'border-primary bg-primary/5 shadow-sm',
          compact && 'p-2'
        )}
      >
        {/* Material color indicator */}
        <div
          className={cn(
            'w-full h-8 rounded-md mb-2 border',
            compact && 'h-6 mb-1'
          )}
          style={{ backgroundColor: material.color }}
        />

        <div className="flex items-start gap-2">
          <Icon className={cn('w-4 h-4 text-gray-500 mt-0.5', compact && 'w-3 h-3')} />
          <div className="flex-1 min-w-0">
            <div className={cn('font-medium text-sm truncate', compact && 'text-xs')}>
              {material.name}
            </div>
            {!compact && material.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {material.description}
              </div>
            )}
            <div className={cn('flex items-center gap-2 mt-1', compact && 'mt-0.5')}>
              <Badge variant="secondary" className={cn('text-xs', compact && 'text-[10px] px-1 py-0')}>
                {CATEGORY_LABELS[material.category]}
              </Badge>
              <span className={cn('text-xs text-gray-600', compact && 'text-[10px]')}>
                ${material.costPerUnit.toFixed(2)}/{material.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
          </div>
        )}
      </div>
    );
  };

  const CreateMaterialDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {showCreateButton && (
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Material
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Custom Material</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Material Name</label>
            <Input placeholder="Enter material name" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input type="color" className="mt-1 h-10" />
            </div>
            <div>
              <label className="text-sm font-medium">Cost per Unit</label>
              <Input type="number" step="0.01" placeholder="0.00" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Unit</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md">
              <option value="sqft">Square Feet</option>
              <option value="sqm">Square Meters</option>
              <option value="lf">Linear Feet</option>
              <option value="lm">Linear Meters</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button className="flex-1">
              Create Material
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>

        {/* Quick categories */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-2 py-1 text-xs rounded whitespace-nowrap transition-colors',
              activeCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('recent')}
            className={cn(
              'px-2 py-1 text-xs rounded whitespace-nowrap transition-colors',
              activeCategory === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 hover:bg-gray-200'
            )}
          >
            Recent
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as MaterialCategory)}
              className={cn(
                'px-2 py-1 text-xs rounded whitespace-nowrap transition-colors',
                activeCategory === key ? 'bg-primary text-primary-foreground' : 'bg-gray-100 hover:bg-gray-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Materials grid */}
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">
              {searchQuery ? 'No materials found' : 'No materials in this category'}
            </div>
          </div>
        )}

        <CreateMaterialDialog />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Material Library</h3>
        <CreateMaterialDialog />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="text-xs">
            All Materials
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="mulch" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            Popular
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const Icon = CATEGORY_ICONS[key as MaterialCategory];
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as MaterialCategory)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors',
                    activeCategory === key 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Materials grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredMaterials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg font-medium mb-1">
                {searchQuery ? 'No materials found' : 'No materials in this category'}
              </div>
              <div className="text-sm">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Materials will appear here when available'
                }
              </div>
            </div>
          )}
        </div>
      </Tabs>

      {/* Recent materials quick access */}
      {!searchQuery && activeCategory === 'all' && recentMaterials.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Recently Used</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {recentMaterials.slice(0, 5).map((material) => (
              <div
                key={material.id}
                onClick={() => handleMaterialClick(material)}
                className={cn(
                  'flex-shrink-0 w-20 p-2 border rounded-lg cursor-pointer transition-all',
                  'hover:border-primary hover:shadow-sm',
                  selectedMaterialId === material.id && 'border-primary bg-primary/5'
                )}
              >
                <div
                  className="w-full h-6 rounded mb-2 border"
                  style={{ backgroundColor: material.color }}
                />
                <div className="text-xs font-medium truncate">
                  {material.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  ${material.costPerUnit.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialPicker;