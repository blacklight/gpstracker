import type { TCountryCode } from 'countries-list';
import { getCountryData, getEmojiFlag } from 'countries-list';

class Country {
  name: string;
  code: string;
  continent: string;
  flag: string;

  constructor(data: {
    name: string;
    code: string;
    continent: string;
    flag: string;
  }) {
    this.name = data.name;
    this.code = data.code;
    this.continent = data.continent;
    this.flag = data.flag;
  }

  public static fromCode(code: string | TCountryCode): Country | null {
    const cc = code.toUpperCase() as TCountryCode;
    const countryData = getCountryData(cc);
    if (!countryData) return null;

    return new Country({
      name: countryData.name,
      code: code,
      continent: countryData.continent,
      flag: getEmojiFlag(cc),
    });
  }
}

export default Country;
