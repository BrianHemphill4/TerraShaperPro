'use client';

import styles from './MaterialSelector.module.css';

type Material = {
  id: string;
  name: string;
  color: string;
  icon?: string;
};

const materials: Material[] = [
  { id: 'grass', name: 'Grass', color: '#22c55e' },
  { id: 'mulch', name: 'Mulch', color: '#b45309' },
  { id: 'gravel', name: 'Gravel', color: '#6b7280' },
  { id: 'decomposedGranite', name: 'DG', color: '#fbbf24' },
  { id: 'pavers', name: 'Pavers', color: '#78716c' },
  { id: 'concrete', name: 'Concrete', color: '#9ca3af' },
];

type MaterialSelectorProps = {
  selectedMaterial: string;
  onMaterialChange: (material: string) => void;
  visible: boolean;
};

const MaterialSelector = ({ selectedMaterial, onMaterialChange, visible }: MaterialSelectorProps) => {
  if (!visible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.label}>Material:</div>
      <div className={styles.materials}>
        {materials.map((material) => (
          <button
            key={material.id}
            type="button"
            className={`${styles.materialButton} ${selectedMaterial === material.id ? styles.active : ''}`}
            onClick={() => onMaterialChange(material.id)}
            title={material.name}
          >
            <div 
              className={styles.colorSwatch} 
              style={{ backgroundColor: material.color }}
            />
            <span className={styles.materialName}>{material.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaterialSelector;