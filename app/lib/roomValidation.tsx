// src/app/utils/roomRateValidation.ts

/**
 * Validates if the selected rate IDs belong to the same recommendation
 * Only rates from the same recommendation can be selected together
 */
export const validateRateSelection = (
    selectedRateIds: string[],
    recommendations: any[]
  ): { valid: boolean; recommendationId?: string } => {
    if (!selectedRateIds.length || !recommendations.length) {
      return { valid: false };
    }
  
    // Find all recommendations that include all of the selected rates
    const validRecommendations = recommendations.filter(recommendation => {
      // Extract all rate IDs from this recommendation
      const recommendationRateIds = recommendation.rateIds || [];
      
      // Check if all selected rate IDs are included in this recommendation
      return selectedRateIds.every(rateId => 
        recommendationRateIds.includes(rateId)
      );
    });
  
    // If we found at least one valid recommendation, the selection is valid
    if (validRecommendations.length > 0) {
      return { 
        valid: true, 
        recommendationId: validRecommendations[0].recommendationId 
      };
    }
  
    return { valid: false };
  };
  
  /**
   * Gets compatible rates for the next room selection based on the currently selected rates
   */
  export const getCompatibleRates = (
    selectedRateIds: string[],
    rooms: any[],
    recommendations: any[]
  ): any[] => {
    if (!selectedRateIds.length || !rooms.length || !recommendations.length) {
      return [];
    }
  
    // Find recommendations that include all currently selected rates
    const compatibleRecommendations = recommendations.filter(recommendation => {
      const recommendationRateIds = recommendation.rateIds || [];
      return selectedRateIds.every(rateId => 
        recommendationRateIds.includes(rateId)
      );
    });
  
    if (!compatibleRecommendations.length) {
      return [];
    }
  
    // Get all compatible rate IDs from valid recommendations
    const compatibleRateIds = new Set<string>();
    
    compatibleRecommendations.forEach(recommendation => {
      const rateIds = recommendation.rateIds || [];
      rateIds.forEach((rateId: string) => {
        // Only add rate IDs that haven't been selected yet
        if (!selectedRateIds.includes(rateId)) {
          compatibleRateIds.add(rateId);
        }
      });
    });
  
    // Filter rooms to only include those with compatible rates
    return rooms.map(room => {
      // Create a copy of the room object
      const compatibleRoom = { ...room };
      
      // Filter the rates to only include compatible ones
      if (compatibleRoom.rates) {
        compatibleRoom.rates = compatibleRoom.rates.filter((rate: any) => 
          compatibleRateIds.has(rate.rateId)
        );
      }
      
      return compatibleRoom;
    }).filter(room => room.rates && room.rates.length > 0);
  };
  
  /**
   * Gets possible recommendations based on the current rate ID selection
   */
  export const getPossibleRecommendations = (
    selectedRateIds: string[],
    recommendations: any[]
  ): any[] => {
    if (!selectedRateIds.length || !recommendations.length) {
      return recommendations; // Return all recommendations if nothing selected yet
    }
  
    // Find recommendations that include all currently selected rates
    return recommendations.filter(recommendation => {
      const recommendationRateIds = recommendation.rateIds || [];
      return selectedRateIds.every(rateId => 
        recommendationRateIds.includes(rateId)
      );
    });
  };