import { describe, expect, it } from 'vitest';
import {
  parseSunRequirements,
  parseWaterNeeds,
  getTexasZones,
  generatePlantTags,
  generateSearchVector,
  generateDescription,
  generateCareInstructions,
  processPlantRecord,
  type PlantRecord,
} from '../plant-processing';

describe('Plant Processing Utilities', () => {
  const mockPlantRecord: PlantRecord = {
    ref: 'BLU001',
    p1: 'p1',
    underscore: 'texas_bluebonnet',
    speciesName: 'Lupinus texensis',
    commonName: 'Texas Bluebonnet',
    nicknames: 'Bluebonnet, State Flower',
    sunPreference: 'Full Sun',
    maintenanceLevel: '2',
    droughtResistant: '4',
    diseaseRisk: '2',
    avgLifespan: '25',
    nickname: 'Bluebonnet',
    plantType: 'Wildflower',
  };

  describe('parseSunRequirements', () => {
    it('should parse various sun requirement formats correctly', () => {
      expect(parseSunRequirements('Full Sun')).toBe('full_sun');
      expect(parseSunRequirements('FULL SUN')).toBe('full_sun');
      expect(parseSunRequirements('full sun to partial sun')).toBe('full_sun');
      
      expect(parseSunRequirements('Partial Sun')).toBe('partial_sun');
      expect(parseSunRequirements('partial shade')).toBe('partial_sun');
      expect(parseSunRequirements('PARTIAL')).toBe('partial_sun');
      
      expect(parseSunRequirements('Shade')).toBe('shade');
      expect(parseSunRequirements('Full Shade')).toBe('shade');
      expect(parseSunRequirements('SHADE')).toBe('shade');
      
      expect(parseSunRequirements('Unknown')).toBe('full_sun'); // default
      expect(parseSunRequirements('')).toBe('full_sun'); // default
    });
  });

  describe('parseWaterNeeds', () => {
    it('should parse drought resistance levels correctly', () => {
      expect(parseWaterNeeds('5')).toBe('low');
      expect(parseWaterNeeds('4')).toBe('low');
      expect(parseWaterNeeds('3')).toBe('moderate');
      expect(parseWaterNeeds('2')).toBe('moderate');
      expect(parseWaterNeeds('1')).toBe('high');
      expect(parseWaterNeeds('0')).toBe('high');
      
      // Test invalid inputs
      expect(parseWaterNeeds('invalid')).toBe('moderate'); // defaults to 3
      expect(parseWaterNeeds('')).toBe('moderate'); // defaults to 3
    });
  });

  describe('getTexasZones', () => {
    it('should return appropriate Texas USDA zones', () => {
      const zones = getTexasZones('Tree');
      expect(zones).toContain('8a');
      expect(zones).toContain('8b');
      expect(zones).toContain('9a');
      expect(zones).toContain('9b');
      expect(zones).toHaveLength(8); // All Texas zones
    });
  });

  describe('generatePlantTags', () => {
    it('should generate comprehensive tags for drought-tolerant plants', () => {
      const tags = generatePlantTags(mockPlantRecord);
      
      expect(tags).toContain('wildflower');
      expect(tags).toContain('texas');
      expect(tags).toContain('full_sun');
      expect(tags).toContain('low_water');
      expect(tags).toContain('drought_tolerant');
      expect(tags).toContain('maintenance_2');
      expect(tags).toContain('long_lived'); // lifespan > 20
    });

    it('should generate appropriate tags for water-dependent plants', () => {
      const waterDependentRecord = {
        ...mockPlantRecord,
        droughtResistant: '1',
        avgLifespan: '10',
        sunPreference: 'Partial Shade',
      };
      
      const tags = generatePlantTags(waterDependentRecord);
      
      expect(tags).toContain('partial_sun');
      expect(tags).toContain('high_water');
      expect(tags).toContain('water_dependent');
      expect(tags).toContain('short_lived'); // lifespan <= 20
    });
  });

  describe('generateSearchVector', () => {
    it('should create comprehensive search content', () => {
      const searchVector = generateSearchVector(mockPlantRecord);
      
      expect(searchVector).toContain('texas bluebonnet');
      expect(searchVector).toContain('lupinus texensis');
      expect(searchVector).toContain('wildflower');
      expect(searchVector).toContain('bluebonnet');
      expect(searchVector).toContain('state flower');
      
      // Should be lowercase
      expect(searchVector).toBe(searchVector.toLowerCase());
    });

    it('should handle plants with complex nickname lists', () => {
      const complexRecord = {
        ...mockPlantRecord,
        nicknames: 'Blue Bonnet, State Flower, Buffalo Clover, Wolf Flower',
      };
      
      const searchVector = generateSearchVector(complexRecord);
      
      expect(searchVector).toContain('blue bonnet');
      expect(searchVector).toContain('buffalo clover');
      expect(searchVector).toContain('wolf flower');
    });
  });

  describe('generateDescription', () => {
    it('should create informative descriptions', () => {
      const description = generateDescription(mockPlantRecord);
      
      expect(description).toContain('Texas Bluebonnet');
      expect(description).toContain('wildflower');
      expect(description).toContain('Texas landscapes');
      expect(description).toContain('low-maintenance'); // maintenance level 2
      expect(description).toContain('drought tolerance rating of 4/5');
      expect(description).toContain('25 years');
    });

    it('should identify moderate-maintenance plants', () => {
      const moderateRecord = {
        ...mockPlantRecord,
        maintenanceLevel: '4',
      };
      
      const description = generateDescription(moderateRecord);
      expect(description).toContain('moderate-maintenance');
    });
  });

  describe('generateCareInstructions', () => {
    it('should provide detailed care instructions', () => {
      const instructions = generateCareInstructions(mockPlantRecord);
      
      expect(instructions).toContain('Maintenance Level: 2/5 (Low)');
      expect(instructions).toContain('Drought Tolerance: 4/5');
      expect(instructions).toContain('Disease Risk: 2/5 (Low risk)');
      expect(instructions).toContain('Average lifespan: 25 years');
      expect(instructions).toContain('Water sparingly once established'); // drought >= 4
    });

    it('should provide appropriate watering advice', () => {
      const waterNeedyRecord = {
        ...mockPlantRecord,
        droughtResistant: '1',
      };
      
      const instructions = generateCareInstructions(waterNeedyRecord);
      expect(instructions).toContain('Requires regular watering');
    });

    it('should mention disease monitoring for high-risk plants', () => {
      const diseaseProneRecord = {
        ...mockPlantRecord,
        diseaseRisk: '4',
      };
      
      const instructions = generateCareInstructions(diseaseProneRecord);
      expect(instructions).toContain('Monitor for common diseases');
      expect(instructions).toContain('good air circulation');
    });
  });

  describe('processPlantRecord', () => {
    it('should create complete database-ready plant data', () => {
      const imageUrl = 'https://example.com/plant.webp';
      const thumbnailUrl = 'https://example.com/plant_thumb.webp';
      const dominantColor = '#4A7C59';

      const processedData = processPlantRecord(
        mockPlantRecord,
        imageUrl,
        thumbnailUrl,
        dominantColor
      );

      expect(processedData.scientific_name).toBe('Lupinus texensis');
      expect(processedData.common_names).toContain('Texas Bluebonnet');
      expect(processedData.common_names).toContain('Bluebonnet');
      expect(processedData.common_names).toContain('State Flower');
      
      expect(processedData.sun_requirements).toBe('full_sun');
      expect(processedData.water_needs).toBe('low');
      expect(processedData.drought_tolerant).toBe(true);
      expect(processedData.texas_native).toBe(true);
      
      expect(processedData.image_url).toBe(imageUrl);
      expect(processedData.thumbnail_url).toBe(thumbnailUrl);
      expect(processedData.dominant_color).toBe(dominantColor);
      
      expect(processedData.category).toBe('Wildflower');
      expect(processedData.tags).toContain('wildflower');
      expect(processedData.tags).toContain('drought_tolerant');
      
      expect(processedData.usda_zones).toContain('8a');
      expect(processedData.growth_rate).toBe('moderate');
      
      expect(processedData.description).toContain('Texas Bluebonnet');
      expect(processedData.care_instructions).toContain('Maintenance Level: 2/5');
      expect(processedData.search_vector).toContain('lupinus texensis');
    });

    it('should handle plants with minimal nickname data', () => {
      const minimalRecord = {
        ...mockPlantRecord,
        nicknames: '',
      };

      const processedData = processPlantRecord(
        minimalRecord,
        'url',
        'thumb_url',
        '#000000'
      );

      expect(processedData.common_names).toEqual(['Texas Bluebonnet']);
      expect(processedData.search_vector).toContain('texas bluebonnet');
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme maintenance levels', () => {
      const highMaintenanceRecord = {
        ...mockPlantRecord,
        maintenanceLevel: '5',
      };

      const description = generateDescription(highMaintenanceRecord);
      expect(description).toContain('moderate-maintenance');

      const lowMaintenanceRecord = {
        ...mockPlantRecord,
        maintenanceLevel: '1',
      };

      const description2 = generateDescription(lowMaintenanceRecord);
      expect(description2).toContain('low-maintenance');
    });

    it('should handle boundary lifespan values', () => {
      const shortLivedRecord = {
        ...mockPlantRecord,
        avgLifespan: '20',
      };

      const tags = generatePlantTags(shortLivedRecord);
      expect(tags).toContain('short_lived');

      const longLivedRecord = {
        ...mockPlantRecord,
        avgLifespan: '21',
      };

      const tags2 = generatePlantTags(longLivedRecord);
      expect(tags2).toContain('long_lived');
    });
  });
});