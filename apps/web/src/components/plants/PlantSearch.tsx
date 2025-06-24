'use client';

import { Droplets, Filter, Flower2, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';

type PlantFilters = {
  search?: string;
  category?: string;
  sunRequirements?: ('full_sun' | 'partial_sun' | 'shade')[];
  waterNeeds?: ('low' | 'moderate' | 'high')[];
  usdaZones?: string[];
  texasNative?: boolean;
  droughtTolerant?: boolean;
  tags?: string[];
  favoritesOnly?: boolean;
};

type PlantSearchProps = {
  onFiltersChange: (filters: PlantFilters) => void;
  showFavoritesFilter?: boolean;
};

export function PlantSearch({ onFiltersChange, showFavoritesFilter = true }: PlantSearchProps) {
  const [filters, setFilters] = useState<PlantFilters>({});
  const [searchInput, setSearchInput] = useState('');

  const { data: categories } = trpc.plant.categories.useQuery();

  const updateFilter = <K extends keyof PlantFilters>(key: K, value: PlantFilters[K]) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = () => {
    updateFilter('search', searchInput || undefined);
  };

  const toggleArrayFilter = <K extends keyof PlantFilters>(
    key: K,
    value: string,
    checked: boolean
  ) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    updateFilter(key, newValues as PlantFilters[K]);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput('');
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof PlantFilters] !== undefined
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search plants by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 size-4" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Filter className="size-4" />
              Filters
              {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => updateFilter('category', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sun Requirements */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sun className="size-4" />
                  Sun Requirements
                </Label>
                <div className="space-y-2">
                  {[
                    { value: 'full_sun', label: 'Full Sun' },
                    { value: 'partial_sun', label: 'Partial Sun/Shade' },
                    { value: 'shade', label: 'Full Shade' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={filters.sunRequirements?.includes(option.value as any) || false}
                        onCheckedChange={(checked) =>
                          toggleArrayFilter('sunRequirements', option.value, !!checked)
                        }
                      />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water Needs */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Droplets className="size-4" />
                  Water Needs
                </Label>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: 'Low (Drought Tolerant)' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`water-${option.value}`}
                        checked={filters.waterNeeds?.includes(option.value as any) || false}
                        onCheckedChange={(checked) =>
                          toggleArrayFilter('waterNeeds', option.value, !!checked)
                        }
                      />
                      <Label htmlFor={`water-${option.value}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Filters */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flower2 className="size-4" />
                  Special Characteristics
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="texas-native"
                      checked={filters.texasNative || false}
                      onCheckedChange={(checked) =>
                        updateFilter('texasNative', checked || undefined)
                      }
                    />
                    <Label htmlFor="texas-native" className="cursor-pointer">
                      Texas Native
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="drought-tolerant"
                      checked={filters.droughtTolerant || false}
                      onCheckedChange={(checked) =>
                        updateFilter('droughtTolerant', checked || undefined)
                      }
                    />
                    <Label htmlFor="drought-tolerant" className="cursor-pointer">
                      Drought Tolerant
                    </Label>
                  </div>
                  {showFavoritesFilter && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites-only"
                        checked={filters.favoritesOnly || false}
                        onCheckedChange={(checked) =>
                          updateFilter('favoritesOnly', checked || undefined)
                        }
                      />
                      <Label htmlFor="favorites-only" className="cursor-pointer">
                        My Favorites Only
                      </Label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
