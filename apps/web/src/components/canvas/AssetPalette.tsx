'use client';

import { useEffect, useState } from 'react';

import styles from './AssetPalette.module.css';

type Plant = {
  id: string;
  scientificName: string;
  commonNames: string[];
  imageUrl: string | null;
  category: string | null;
  plantType: string | null;
  mature_height_ft_min: number | null;
  mature_height_ft_max: number | null;
  mature_spread_ft_min: number | null;
  mature_spread_ft_max: number | null;
};

const AssetPalette = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch('/api/test-db');
        if (!response.ok) {
          throw new Error('Failed to fetch plants');
        }
        const data = await response.json();
        // The actual plant data is in the `data` property of the response
        const plantsData = data.data || [];
        // Parse commonNames if it's a string
        const parsedPlants = plantsData.map((plant: any) => ({
          ...plant,
          commonNames:
            typeof plant.commonNames === 'string'
              ? JSON.parse(plant.commonNames)
              : plant.commonNames || [],
        }));
        setPlants(parsedPlants);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleDragStart = (e: React.DragEvent, plant: Plant) => {
    const plantData = {
      id: plant.id,
      scientificName: plant.scientificName,
      commonName: plant.commonNames?.[0] || plant.scientificName,
      imageUrl: plant.imageUrl,
      category: plant.category,
      plantType: plant.plantType,
      defaultWidth: plant.mature_spread_ft_max || 50,
      defaultHeight: plant.mature_spread_ft_max || 50,
    };
    e.dataTransfer.setData('plant', JSON.stringify(plantData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (loading) {
    return <div className={styles.loading}>Loading assets...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  // Group plants by category
  const groupedPlants = plants.reduce(
    (acc, plant) => {
      const category = plant.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(plant);
      return acc;
    },
    {} as Record<string, Plant[]>
  );

  return (
    <div className={styles.palette}>
      <h3 className={styles.title}>Plant Assets</h3>
      {plants.length === 0 ? (
        <p className={styles.emptyMessage}>No plants found. Have you run the ingestion script?</p>
      ) : (
        <div className={styles.categories}>
          {Object.entries(groupedPlants).map(([category, categoryPlants]) => (
            <div key={category} className={styles.category}>
              <h4 className={styles.categoryTitle}>{category}</h4>
              <div className={styles.plantGrid}>
                {categoryPlants.map((plant) => (
                  <div
                    key={plant.id}
                    className={styles.plantItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, plant)}
                    title={`${plant.commonNames?.[0] || plant.scientificName}\nHeight: ${plant.mature_height_ft_min || '?'}-${plant.mature_height_ft_max || '?'} ft\nSpread: ${plant.mature_spread_ft_min || '?'}-${plant.mature_spread_ft_max || '?'} ft`}
                  >
                    {plant.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={plant.imageUrl}
                        alt={plant.scientificName}
                        className={styles.plantImage}
                      />
                    ) : (
                      <div className={styles.plantPlaceholder}>
                        <span>
                          {plant.commonNames?.[0]?.charAt(0) || plant.scientificName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className={styles.plantName}>
                      {plant.commonNames?.[0] || plant.scientificName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetPalette;
