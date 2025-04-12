import { ValidationError } from '../errors';

type GeocodeProvider = 'google' | 'nominatim';

class NominatimConfig {
  public readonly url: string;
  public readonly userAgent: string;

  private constructor(args: { url: string; userAgent: string }) {
    this.url = args.url;
    this.userAgent = args.userAgent;
  }

  public static fromEnv(): NominatimConfig {
    return new NominatimConfig({
      url: process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
      userAgent: process.env.NOMINATIM_USER_AGENT || 'Mozilla/5.0 (compatible; gpstracker/1.0; +https://github.com/blacklight/gpstracker)',
    });
  }
}

class GoogleConfig {
  public readonly url: string;
  public readonly apiKey: string;

  private constructor(args: { apiKey: string }) {
    this.url = 'https://maps.googleapis.com/maps/api/geocode/json'
    this.apiKey = args.apiKey;
  }

  public static fromEnv(): GoogleConfig {
    return new GoogleConfig({
      apiKey: process.env.GOOGLE_API_KEY || '',
    });
  }
}

class Geocode {
  public readonly provider?: GeocodeProvider;
  public readonly nominatim: NominatimConfig;
  public readonly google: GoogleConfig;

  private constructor(args: {
    provider?: GeocodeProvider;
    nominatim: NominatimConfig;
    google: GoogleConfig;
  }) {
    this.provider = args.provider;
    this.nominatim = args.nominatim;
    this.google = args.google;

    if (this.provider === 'google' && !this.google.apiKey) {
      throw new ValidationError('Google API key is required when using Google geocoding.');
    }
  }

  public static fromEnv(): Geocode {
    const provider = process.env.GEOCODE_PROVIDER as GeocodeProvider | undefined;
    if (provider?.length && provider !== 'google' && provider !== 'nominatim') {
      throw new ValidationError('GEOCODE_PROVIDER must be either "google" or "nominatim".');
    }

    return new Geocode({
      provider,
      nominatim: NominatimConfig.fromEnv(),
      google: GoogleConfig.fromEnv(),
    });
  }
}

export default Geocode;
