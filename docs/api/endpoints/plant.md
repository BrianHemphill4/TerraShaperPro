# Plant Endpoints

Access and search the comprehensive plant library with 400+ Texas native plants.

## plant.search

Search for plants with advanced filtering options.

### Request
```typescript
{
  query?: string;              // Search term
  category?: string;           // Plant category
  subcategory?: string;        // Plant subcategory
  filters?: {
    usdaZones?: string[];      // e.g., ['8a', '8b', '9a']
    sunRequirements?: ('full_sun' | 'part_shade' | 'full_shade')[];
    waterRequirements?: ('low' | 'medium' | 'high')[];
    soilTypes?: ('sandy' | 'loamy' | 'clay')[];
    nativeStatus?: ('native' | 'adapted' | 'non_native')[];
    matureHeight?: {
      min?: number;            // in feet
      max?: number;
    };
    matureWidth?: {
      min?: number;            // in feet
      max?: number;
    };
    features?: string[];       // e.g., ['butterfly', 'fragrant', 'evergreen']
  };
  page?: number;               // Default: 1
  limit?: number;              // Default: 20, Max: 100
  sortBy?: 'name' | 'scientific_name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}
```

### Response
```typescript
{
  plants: Array<{
    id: string;
    name: string;
    scientificName: string;
    commonNames: string[];
    category: string;
    subcategory: string;
    thumbnail: string;
    usdaZones: string[];
    sunRequirements: string[];
    waterRequirements: string;
    soilTypes: string[];
    nativeStatus: string;
    matureSize: {
      height: { min: number; max: number; unit: string };
      width: { min: number; max: number; unit: string };
    };
    features: string[];
    popularity: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  facets: {
    categories: Array<{ value: string; count: number }>;
    features: Array<{ value: string; count: number }>;
    usdaZones: Array<{ value: string; count: number }>;
  };
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/plant.search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "query": "oak",
      "filters": {
        "usdaZones": ["8b", "9a"],
        "sunRequirements": ["full_sun", "part_shade"],
        "nativeStatus": ["native"]
      },
      "limit": 10
    }
  }'
```

## plant.get

Get detailed information about a specific plant.

### Request
```typescript
{
  id: string;  // Plant ID
}
```

### Response
```typescript
{
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  family: string;
  category: string;
  subcategory: string;
  description: string;
  images: {
    thumbnail: string;
    medium: string;
    large: string;
    gallery: string[];
  };
  characteristics: {
    usdaZones: string[];
    sunRequirements: string[];
    waterRequirements: string;
    soilTypes: string[];
    soilPh: { min: number; max: number };
    nativeStatus: string;
    growthRate: 'slow' | 'moderate' | 'fast';
    lifespan: string;
  };
  dimensions: {
    matureHeight: { min: number; max: number; unit: string };
    matureWidth: { min: number; max: number; unit: string };
    spacing: { min: number; max: number; unit: string };
  };
  appearance: {
    foliageType: 'deciduous' | 'evergreen' | 'semi-evergreen';
    foliageColor: string[];
    foliageTexture: string;
    bloomTime: string[];
    bloomColor: string[];
    fruitTime: string[];
    barkTexture: string;
  };
  ecology: {
    wildlifeValue: string[];
    pollinators: string[];
    larvalHost: boolean;
    deerResistant: boolean;
    invasivePotential: 'low' | 'medium' | 'high';
  };
  maintenance: {
    level: 'low' | 'medium' | 'high';
    pruning: string;
    fertilization: string;
    pestsDiseases: string[];
    propagation: string[];
  };
  uses: {
    landscape: string[];
    ecological: string[];
    other: string[];
  };
  features: string[];
  notes: string;
  sources: string[];
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/plant.get \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"id": "plant_quercus_virginiana"}}'
```

## plant.categories

Get all available plant categories and subcategories.

### Request
No parameters required.

### Response
```typescript
{
  categories: Array<{
    id: string;
    name: string;
    description: string;
    plantCount: number;
    subcategories: Array<{
      id: string;
      name: string;
      plantCount: number;
    }>;
  }>;
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/plant.categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## plant.favorites

Manage favorite plants for quick access.

### plant.favorites.list

Get user's favorite plants.

#### Request
```typescript
{
  page?: number;
  limit?: number;
}
```

#### Response
Same as plant.search response, but only includes favorited plants.

### plant.favorites.add

Add a plant to favorites.

#### Request
```typescript
{
  plantId: string;
}
```

#### Response
```typescript
{
  success: boolean;
  message: string;
}
```

### plant.favorites.remove

Remove a plant from favorites.

#### Request
```typescript
{
  plantId: string;
}
```

#### Response
```typescript
{
  success: boolean;
  message: string;
}
```

## plant.palette

Manage custom plant palettes.

### plant.palette.create

Create a custom plant palette.

#### Request
```typescript
{
  name: string;
  description?: string;
  plantIds: string[];
  tags?: string[];
}
```

#### Response
```typescript
{
  id: string;
  name: string;
  description?: string;
  plantCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### plant.palette.list

List all palettes for the organization.

#### Request
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
}
```

#### Response
```typescript
{
  palettes: Array<{
    id: string;
    name: string;
    description?: string;
    plantCount: number;
    tags: string[];
    creator: {
      id: string;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## plant.recommend

Get AI-powered plant recommendations based on site conditions.

### Request
```typescript
{
  projectId?: string;       // Use project location/conditions
  conditions: {
    usdaZone: string;
    sunExposure: 'full_sun' | 'part_shade' | 'full_shade';
    soilType: 'sandy' | 'loamy' | 'clay';
    moisture: 'dry' | 'medium' | 'wet';
    space: {
      width: number;
      height?: number;
    };
  };
  preferences?: {
    nativeOnly?: boolean;
    lowMaintenance?: boolean;
    features?: string[];    // e.g., ['butterfly', 'fragrant']
    avoidFeatures?: string[]; // e.g., ['thorns', 'toxic']
  };
  limit?: number;          // Default: 10
}
```

### Response
```typescript
{
  recommendations: Array<{
    plant: { /* plant data */ };
    score: number;         // 0-100 match score
    reasons: string[];     // Why recommended
    cautions: string[];    // Potential issues
  }>;
}
```

## Error Responses

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Plant not found"
  }
}
```

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid search parameters"
  }
}
```