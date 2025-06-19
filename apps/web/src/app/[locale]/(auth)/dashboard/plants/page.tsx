'use client';

import { useState } from 'react';

import { PlantGrid } from '@/components/plants/PlantGrid';
import { PlantSearch } from '@/components/plants/PlantSearch';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export default function PlantsPage() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, isFetching } = trpc.plant.list.useQuery({
    filters,
    limit,
    offset: page * limit,
  });

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Plant Library</h1>
        <p className="text-muted-foreground">
          Browse our collection of Texas-appropriate plants for your landscape design
        </p>
      </div>

      <div className="space-y-6">
        <PlantSearch 
          onFiltersChange={setFilters}
          showFavoritesFilter
        />

        <PlantGrid
          plants={data?.plants || []}
          isLoading={isLoading}
          onPlantSelect={(plant) => {
            // TODO: Open plant details modal
            // eslint-disable-next-line no-console
            console.log('Selected plant:', plant);
          }}
        />

        {data?.hasMore && (
          <div className="text-center">
            <Button
              onClick={handleLoadMore}
              disabled={isFetching}
              variant="outline"
            >
              {isFetching ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}