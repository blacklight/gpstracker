import { GPSPoint } from "../../models";

class NominatimLocationInfoProvider {
  private apiUrl: string;
  private userAgent: string;

  constructor() {
    this.apiUrl = $geocode.nominatim.url;
    this.userAgent = $geocode.nominatim.userAgent;
  }

  async getLocationInfo(location: GPSPoint): Promise<GPSPoint> {
    const response = await fetch(
      `${this.apiUrl}/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`,
      {
        headers: {
          'User-Agent': this.userAgent,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching location info: ${response.statusText}`);
    }

    const data = await response.json();
    const address = data.address || {};

    if (Object.keys(address).length > 0) {
      let addressString: string | undefined = (
        (address.road || '') + (
          address.house_number ? (' ' + address.house_number) : ''
        )
      ).trim();

      if (!addressString?.length) {
        addressString = undefined;
      }

      return new GPSPoint({
        ...location,
        description: location.description || address.amenity,
        address: addressString,
        locality: address.city || address.town || address.village,
        postalCode: address.postcode,
        country: address.country_code,
      })
    }

    return location;
  }
}

export default NominatimLocationInfoProvider;
