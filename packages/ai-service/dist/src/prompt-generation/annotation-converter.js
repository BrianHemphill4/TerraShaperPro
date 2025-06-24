export class AnnotationConverter {
    constructor() {
        this.plantDatabase = new Map();
        this.initializePlantDatabase();
    }
    convertAnnotationsToDescription(annotations) {
        const grouped = this.groupAnnotationsByType(annotations);
        const descriptions = [];
        if (grouped.plant.length > 0) {
            descriptions.push(this.describePlants(grouped.plant));
        }
        if (grouped.hardscape.length > 0) {
            descriptions.push(this.describeHardscape(grouped.hardscape));
        }
        if (grouped.feature.length > 0) {
            descriptions.push(this.describeFeatures(grouped.feature));
        }
        if (grouped.lighting.length > 0) {
            descriptions.push(this.describeLighting(grouped.lighting));
        }
        if (grouped.water.length > 0) {
            descriptions.push(this.describeWater(grouped.water));
        }
        return descriptions.join(', ');
    }
    groupAnnotationsByType(annotations) {
        return annotations.reduce((acc, annotation) => {
            if (!acc[annotation.type]) {
                acc[annotation.type] = [];
            }
            acc[annotation.type].push(annotation);
            return acc;
        }, {});
    }
    describePlants(plants) {
        const plantGroups = this.groupPlantsByArea(plants);
        const descriptions = [];
        for (const [area, plantsInArea] of Object.entries(plantGroups)) {
            const plantNames = plantsInArea.map((p) => {
                const info = this.plantDatabase.get(p.name);
                return info ? `${info.commonName} (${info.visualCharacteristics})` : p.name;
            });
            descriptions.push(`${area} area with ${plantNames.join(', ')}`);
        }
        return descriptions.join(', ');
    }
    groupPlantsByArea(plants) {
        const areas = {
            foreground: [],
            midground: [],
            background: [],
        };
        plants.forEach((plant) => {
            const relativeY = plant.position.y;
            if (relativeY > 0.7) {
                areas.foreground.push(plant);
            }
            else if (relativeY > 0.3) {
                areas.midground.push(plant);
            }
            else {
                areas.background.push(plant);
            }
        });
        return areas;
    }
    describeHardscape(hardscapes) {
        const elements = hardscapes.map((h) => {
            var _a, _b;
            const material = ((_a = h.attributes) === null || _a === void 0 ? void 0 : _a.material) || 'natural stone';
            const pattern = ((_b = h.attributes) === null || _b === void 0 ? void 0 : _b.pattern) || 'irregular';
            return `${h.name} made of ${material} in ${pattern} pattern`;
        });
        return `hardscape elements including ${elements.join(', ')}`;
    }
    describeFeatures(features) {
        const elements = features.map((f) => {
            var _a;
            const style = ((_a = f.attributes) === null || _a === void 0 ? void 0 : _a.style) || 'contemporary';
            return `${style} ${f.name}`;
        });
        return `landscape features including ${elements.join(', ')}`;
    }
    describeLighting(lighting) {
        const types = lighting.map((l) => {
            var _a, _b;
            const type = ((_a = l.attributes) === null || _a === void 0 ? void 0 : _a.type) || 'accent';
            const placement = ((_b = l.attributes) === null || _b === void 0 ? void 0 : _b.placement) || 'strategic';
            return `${type} lighting with ${placement} placement`;
        });
        return `professional landscape lighting with ${types.join(', ')}`;
    }
    describeWater(water) {
        const features = water.map((w) => {
            var _a, _b;
            const style = ((_a = w.attributes) === null || _a === void 0 ? void 0 : _a.style) || 'natural';
            const flow = ((_b = w.attributes) === null || _b === void 0 ? void 0 : _b.flow) || 'gentle';
            return `${style} ${w.name} with ${flow} water movement`;
        });
        return `water features including ${features.join(', ')}`;
    }
    initializePlantDatabase() {
        const plants = [
            {
                scientificName: 'Acer palmatum',
                commonName: 'Japanese Maple',
                description: 'Ornamental tree with delicate leaves',
                visualCharacteristics: 'graceful branching structure with vibrant red-orange foliage',
            },
            {
                scientificName: 'Lavandula angustifolia',
                commonName: 'English Lavender',
                description: 'Fragrant perennial herb',
                visualCharacteristics: 'purple flower spikes above silvery-green foliage',
            },
            {
                scientificName: 'Festuca glauca',
                commonName: 'Blue Fescue',
                description: 'Ornamental grass',
                visualCharacteristics: 'compact blue-gray tufted grass',
            },
            {
                scientificName: 'Hydrangea macrophylla',
                commonName: 'Bigleaf Hydrangea',
                description: 'Flowering shrub',
                visualCharacteristics: 'large round flower clusters in pink or blue',
            },
            {
                scientificName: 'Buxus sempervirens',
                commonName: 'Common Boxwood',
                description: 'Evergreen shrub',
                visualCharacteristics: 'dense green foliage perfect for hedging',
            },
        ];
        plants.forEach((plant) => {
            this.plantDatabase.set(plant.commonName, plant);
            this.plantDatabase.set(plant.scientificName, plant);
        });
    }
    enrichAnnotationWithPlantInfo(annotation) {
        if (annotation.type !== 'plant') {
            return annotation;
        }
        const plantInfo = this.plantDatabase.get(annotation.name);
        if (!plantInfo) {
            return annotation;
        }
        return Object.assign(Object.assign({}, annotation), { attributes: Object.assign(Object.assign({}, annotation.attributes), { scientificName: plantInfo.scientificName, commonName: plantInfo.commonName, visualCharacteristics: plantInfo.visualCharacteristics }) });
    }
}
