declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => google.maps.places.AutocompleteService;
          PlacesService: new (element: HTMLElement) => google.maps.places.PlacesService;
          PlacesServiceStatus: {
            OK: string;
          };
        };
      };
    };
  }
}

declare namespace google.maps.places {
  interface AutocompleteService {
    getPlacePredictions(
      request: { input: string },
      callback: (predictions: AutocompletePrediction[] | null, status: string) => void
    ): void;
  }

  interface PlacesService {
    getDetails(
      request: { placeId: string; fields: string[] },
      callback: (place: PlaceResult | null, status: string) => void
    ): void;
  }

  interface AutocompletePrediction {
    place_id: string;
    description: string;
  }

  interface PlaceResult {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
    address_components?: any[];
  }
}

export {};