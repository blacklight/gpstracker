import { GPSPoint } from "../../models";

class GoogleLocationInfoProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = $geocode.google.apiKey
    this.apiUrl = $geocode.google.url
  }

  private parseAddressComponents(response: {
    results: {
      address_components: {
        long_name: string;
        short_name: string;
        types: string[];
      }[];
    }[]
  }): {
    address?: string;
    locality?: string;
    postalCode?: string;
    country?: string;
    description?: string;
  } {
    const result = {
      address: undefined,
      locality: undefined,
      postalCode: undefined,
      country: undefined,
      description: undefined,
    } as {
      address?: string;
      locality?: string;
      postalCode?: string;
      country?: string;
      description?: string;
    };

    if (!response.results?.length) {
      return result;
    }

    const addressComponents = response.results[0].address_components.reduce(
      (acc: any, component: any) => {
        ['street_number', 'route', 'locality', 'postal_code'].forEach((type) => {
          if (component.types.includes(type)) {
            acc[type] = component.long_name;
          }
        });

        if (component.types.includes('country')) {
          acc.country = component.short_name.toLowerCase();
        }

        return acc;
      },
      {},
    );

    if (addressComponents.route) {
      result.address = (
        (addressComponents.route || '') +
          (addressComponents.street_number ? ' ' + addressComponents.street_number : '')
        ).trim();

      if (!result.address?.length) {
        result.address = undefined;
      }
    }

    ['locality', 'postal_code', 'country'].forEach((key) => {
      if (addressComponents[key]) {
        // @ts-expect-error
        result[key] = addressComponents[key];
      }
    });

    return result;
  }

  async getLocationInfo(location: GPSPoint): Promise<GPSPoint> {
    const response = await fetch(
      `${this.apiUrl}?latlng=${location.latitude},${location.longitude}&key=${this.apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Error fetching location info: ${response.statusText}`);
    }

    const data = await response.json();
    const addressComponents = this.parseAddressComponents(data);

    return new GPSPoint({
      ...location,
      address: location.address || addressComponents.address,
      locality: location.locality || addressComponents.locality,
      postalCode: location.postalCode || addressComponents.postalCode,
      country: location.country || addressComponents.country,
    })
  }
}

export default GoogleLocationInfoProvider;
