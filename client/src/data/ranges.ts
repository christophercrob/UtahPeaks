// Utah Mountain Ranges data — sourced from Google Sheet
// Polygon boundaries updated to match Utah Mountain Ranges reference map
// Design: Utah Topo Field Guide — earthy cartographic palette

export interface MountainRange {
  range: string;
  peak: string;
  elevation: string;
  elevationFt: number;
  lat: number;
  lon: number;
  trailhead: string;
  trailheadLat: number;
  trailheadLon: number;
  gain: string;
  color: string;
  polygon: Array<[number, number]>; // [lat, lon] pairs
}

export const MOUNTAIN_RANGES: MountainRange[] = [
  {
    range: "Uinta Mountains",
    peak: "Kings Peak",
    elevation: "13,528 ft",
    elevationFt: 13528,
    lat: 40.7763,
    lon: -110.3728,
    trailhead: "Henrys Fork Trailhead",
    trailheadLat: 40.9285,
    trailheadLon: -110.6318,
    gain: "~4,600–5,310 ft",
    color: "#C0392B",
    polygon: [
      [40.92, -111.05], [40.88, -111.13], [40.77, -111.13], [40.73, -111.05],
      [40.64, -111.05], [40.56, -110.87], [40.53, -110.58], [40.53, -110.30],
      [40.55, -110.04], [40.59, -109.84], [40.73, -109.48], [40.88, -109.48],
      [41.06, -109.79], [41.09, -110.24], [41.06, -110.58], [41.01, -110.78],
      [40.92, -111.05],
    ],
  },
  {
    range: "La Sal Mountains",
    peak: "Mount Peale",
    elevation: "12,721 ft",
    elevationFt: 12721,
    lat: 38.4383,
    lon: -109.2292,
    trailhead: "La Sal Pass Trailhead",
    trailheadLat: 38.3667,
    trailheadLon: -109.2417,
    gain: "~2,580–2,661 ft",
    color: "#D35400",
    polygon: [
      [38.54, -109.28], [38.53, -109.20], [38.51, -109.14],
      [38.45, -109.11], [38.38, -109.12], [38.31, -109.15],
      [38.26, -109.22], [38.27, -109.31], [38.32, -109.36],
      [38.39, -109.37], [38.45, -109.36], [38.50, -109.34],
      [38.54, -109.28],
    ],
  },
  {
    range: "Tushar Mountains",
    peak: "Delano Peak",
    elevation: "12,169 ft",
    elevationFt: 12169,
    lat: 38.3689,
    lon: -112.3715,
    trailhead: "Big John Flat Trailhead",
    trailheadLat: 38.3983,
    trailheadLon: -112.3317,
    gain: "~1,625–1,700 ft",
    color: "#16A085",
    polygon: [
      [38.62, -112.45], [38.64, -112.30], [38.62, -112.10],
      [38.58, -111.98], [38.48, -111.93], [38.38, -111.94],
      [38.28, -111.98], [38.18, -112.08], [38.17, -112.25],
      [38.19, -112.42], [38.30, -112.50], [38.42, -112.52],
      [38.54, -112.49], [38.62, -112.45],
    ],
  },
  {
    range: "Deep Creek Range",
    peak: "Ibapah Peak",
    elevation: "12,087 ft",
    elevationFt: 12087,
    lat: 39.8449,
    lon: -113.9106,
    trailhead: "Granite Creek Trailhead",
    trailheadLat: 39.8617,
    trailheadLon: -113.8883,
    gain: "~5,700–5,900 ft",
    color: "#1A5276",
    polygon: [
      [40.05, -113.75], [40.05, -114.05], [39.65, -114.05],
      [39.65, -113.75], [40.05, -113.75],
    ],
  },
  {
    range: "Wasatch Range",
    peak: "Mount Nebo (North Peak)",
    elevation: "11,929 ft",
    elevationFt: 11929,
    lat: 39.8216,
    lon: -111.7605,
    trailhead: "North Nebo Trailhead",
    trailheadLat: 39.9033,
    trailheadLon: -111.7617,
    gain: "~3,300–3,500 ft",
    color: "#2471A3",
    polygon: [
      [42.20, -111.70], [42.20, -111.40],
      [41.75, -111.35], [41.50, -111.35], [41.25, -111.38],
      [41.00, -111.43], [40.75, -111.47], [40.50, -111.50],
      [40.25, -111.53], [40.00, -111.57], [39.75, -111.65],
      [39.75, -111.90], [40.00, -111.83], [40.25, -111.80],
      [40.50, -111.78], [40.75, -111.78], [41.00, -111.80],
      [41.25, -111.83], [41.50, -111.85], [41.75, -111.88],
      [42.20, -111.70],
    ],
  },
  {
    range: "Henry Mountains",
    peak: "Mount Ellen",
    elevation: "11,522 ft",
    elevationFt: 11522,
    lat: 38.1089,
    lon: -110.8133,
    trailhead: "Bull Creek Pass Trailhead",
    trailheadLat: 38.0817,
    trailheadLon: -110.7283,
    gain: "~1,024 ft",
    color: "#6C3483",
    polygon: [
      [38.22, -110.55], [38.22, -111.05], [37.75, -111.05],
      [37.75, -110.55], [38.22, -110.55],
    ],
  },
  {
    range: "Abajo Mountains",
    peak: "Abajo Peak",
    elevation: "11,360 ft",
    elevationFt: 11360,
    lat: 37.8394,
    lon: -109.4626,
    trailhead: "Cooley Pass",
    trailheadLat: 37.8883,
    trailheadLon: -109.4567,
    gain: "~1,600 ft",
    color: "#BA4A00",
    polygon: [
      [38.00, -109.25], [38.00, -109.65], [37.70, -109.65],
      [37.70, -109.25], [38.00, -109.25],
    ],
  },
  {
    range: "Stansbury Mountains",
    peak: "Deseret Peak",
    elevation: "11,031 ft",
    elevationFt: 11031,
    lat: 40.4594,
    lon: -112.6264,
    trailhead: "Loop Campground (Mill Fork)",
    trailheadLat: 40.4583,
    trailheadLon: -112.5967,
    gain: "~3,613 ft",
    color: "#B7950B",
    polygon: [
      [40.65, -112.45], [40.65, -112.80], [40.30, -112.80],
      [40.30, -112.45], [40.65, -112.45],
    ],
  },
  {
    range: "Oquirrh Mountains",
    peak: "Flat Top Mountain",
    elevation: "10,620 ft",
    elevationFt: 10620,
    lat: 40.3723,
    lon: -112.1890,
    trailhead: "Ophir Canyon",
    trailheadLat: 40.3733,
    trailheadLon: -112.2667,
    gain: "~2,920–3,540 ft",
    color: "#1A6B8A",
    polygon: [
      [40.90, -112.05], [40.91, -112.10], [40.89, -112.18],
      [40.75, -112.35], [40.60, -112.40], [40.45, -112.38],
      [40.25, -112.25], [40.19, -112.15], [40.22, -111.95],
      [40.38, -111.92], [40.55, -111.93], [40.70, -111.96],
      [40.83, -112.00], [40.90, -112.05],
    ],
  },
  {
    range: "Pine Valley Mountains",
    peak: "Signal Peak",
    elevation: "10,365 ft",
    elevationFt: 10365,
    lat: 37.3195,
    lon: -113.4922,
    trailhead: "Oak Grove Trailhead",
    trailheadLat: 37.3883,
    trailheadLon: -113.5050,
    gain: "~4,480–4,630 ft",
    color: "#1E8449",
    polygon: [
      [37.55, -113.30], [37.55, -113.65], [37.20, -113.65],
      [37.20, -113.30], [37.55, -113.30],
    ],
  },
];
