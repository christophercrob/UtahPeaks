// Utah Mountain Ranges data — sourced from Google Sheet
// Design: Utah Topo Field Guide — earthy cartographic palette

export interface MountainRange {
  range: string;
  peak: string;
  elevation: string;
  elevationFt: number;
  lat: number;
  lon: number;
  trailhead: string;
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
    gain: "~4,600–5,310 ft",
    color: "#C0392B",
    polygon: [
      [40.55, -111.10], [40.55, -109.50], [40.95, -109.50],
      [40.95, -111.10], [40.55, -111.10],
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
    gain: "~2,580–2,661 ft",
    color: "#D35400",
    polygon: [
      [38.30, -109.40], [38.30, -109.10], [38.55, -109.10],
      [38.55, -109.40], [38.30, -109.40],
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
    gain: "~1,625–1,700 ft",
    color: "#16A085",
    polygon: [
      [38.20, -112.55], [38.20, -112.20], [38.55, -112.20],
      [38.55, -112.55], [38.20, -112.55],
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
    gain: "~5,700–5,900 ft",
    color: "#1A5276",
    polygon: [
      [39.65, -114.05], [39.65, -113.75], [40.05, -113.75],
      [40.05, -114.05], [39.65, -114.05],
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
    gain: "~3,300–3,500 ft",
    color: "#2471A3",
    polygon: [
      // Northern tip near Idaho border
      [42.00, -112.05], [42.00, -111.40],
      // East side — follows the crest south through Logan, Ogden, Bountiful, SLC
      [41.70, -111.38], [41.40, -111.38],
      [41.20, -111.42], [41.00, -111.45],
      [40.80, -111.48], [40.60, -111.50],
      [40.30, -111.52], [40.10, -111.55],
      // Southern tip near Nephi / Mt. Nebo
      [39.75, -111.65],
      // West side — shifted westward to capture the full mountain front
      // from SLC (~111.90) widening north to Logan/Cache Valley (~112.05)
      [39.75, -112.00],
      [40.10, -111.92], [40.30, -111.90],
      [40.60, -111.88], [40.80, -111.88],
      // Ogden / Bountiful / Davis County front — west edge ~111.90–111.95
      [41.00, -111.90], [41.20, -111.92],
      // Logan corridor widens westward toward Cache Valley
      [41.40, -111.95], [41.70, -112.00],
      [42.00, -112.05],
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
    gain: "~1,024 ft",
    color: "#6C3483",
    polygon: [
      // Northern boundary moved south to ~38.10 (was 38.35 — too far north)
      [37.85, -111.00], [37.85, -110.60], [38.10, -110.60],
      [38.10, -111.00], [37.85, -111.00],
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
    gain: "~1,600 ft",
    color: "#BA4A00",
    polygon: [
      [37.70, -109.65], [37.70, -109.25], [38.00, -109.25],
      [38.00, -109.65], [37.70, -109.65],
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
    gain: "~3,613 ft",
    color: "#B7950B",
    polygon: [
      [40.30, -112.80], [40.30, -112.45], [40.65, -112.45],
      [40.65, -112.80], [40.30, -112.80],
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
    gain: "~2,920–3,540 ft",
    color: "#1A6B8A",
    polygon: [
      [40.10, -112.35], [40.10, -111.90], [40.70, -111.90],
      [40.70, -112.35], [40.10, -112.35],
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
    gain: "~4,480–4,630 ft",
    color: "#1E8449",
    polygon: [
      [37.20, -113.65], [37.20, -113.30], [37.55, -113.30],
      [37.55, -113.65], [37.20, -113.65],
    ],
  },
];
