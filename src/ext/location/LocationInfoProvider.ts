import { GPSPoint } from "~/models";
import { useGlobals } from '../../globals';
import GoogleLocationInfoProvider from "./GoogleLocationInfoProvider";
import NominatimLocationInfoProvider from "./NominatimLocationInfoProvider";

useGlobals();

abstract class LocationInfoProvider {
  // TODO Cache location info
  abstract getLocationInfo: (location: GPSPoint) => Promise<GPSPoint>;

  static get(): LocationInfoProvider | undefined {
    switch ($geocode.provider) {
      case 'nominatim':
        return new NominatimLocationInfoProvider();
      case 'google':
        return new GoogleLocationInfoProvider();
    }

    return undefined;
  };
}

export default LocationInfoProvider;
