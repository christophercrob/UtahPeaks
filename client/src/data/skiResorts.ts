// Utah's 15 Ski Utah resorts, plus Wasatch Peaks Ranch, a private Morgan County ski resort.
// Coordinates place each marker at a representative resort access or base-area location.

export const SKI_RESORT_COLOR = "#0E7490";

export interface SkiResort {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const UTAH_SKI_RESORTS: SkiResort[] = [
  { id: "alta", name: "Alta", lat: 40.5882366, lon: -111.638401 },
  { id: "beaver-mountain", name: "Beaver Mountain", lat: 41.968056, lon: -111.541111 },
  { id: "brian-head", name: "Brian Head", lat: 37.7019016, lon: -112.8504016 },
  { id: "brighton", name: "Brighton", lat: 40.5983365, lon: -111.583744 },
  { id: "cherry-peak", name: "Cherry Peak", lat: 41.926253, lon: -111.7566547 },
  { id: "deer-valley", name: "Deer Valley", lat: 40.6121609, lon: -111.4823197 },
  { id: "eagle-point", name: "Eagle Point", lat: 38.3226067, lon: -112.3761508 },
  { id: "nordic-valley", name: "Nordic Valley", lat: 41.3099281, lon: -111.865193 },
  { id: "park-city-mountain", name: "Park City Mountain", lat: 40.6518, lon: -111.5081 },
  { id: "powder-mountain", name: "Powder Mountain", lat: 41.3787706, lon: -111.7634061 },
  { id: "snowbasin", name: "Snowbasin", lat: 41.2003657, lon: -111.8652518 },
  { id: "snowbird", name: "Snowbird", lat: 40.5665, lon: -111.6523 },
  { id: "solitude", name: "Solitude", lat: 40.6231058, lon: -111.59763 },
  { id: "sundance", name: "Sundance", lat: 40.390898, lon: -111.577661 },
  // Google Maps coordinate supplied for the Wasatch Peaks Ranch ski resort icon.
  { id: "wasatch-peaks-ranch", name: "Wasatch Peaks Ranch", lat: 41.10019182881441, lon: -111.81670896070314 },
  { id: "woodward-park-city", name: "Woodward Park City", lat: 40.7547751, lon: -111.5858869 },
];
