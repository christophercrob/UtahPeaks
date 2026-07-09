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
      // Traced from Wikipedia Uinta Mountains boundary map
      // Western notch/lobe (distinctive protrusion on the west side)
      [40.885, -111.135],
      [40.773, -111.135],
      [40.729, -111.045],
      [40.639, -111.045],
      // Southern edge — broad, curving south
      [40.564, -110.863],
      [40.535, -110.581],
      [40.527, -110.298],
      [40.550, -110.036],
      [40.594, -109.835],
      // Eastern end — rounded
      [40.729, -109.482],
      [40.878, -109.482],
      // Northern edge — flatter, near Wyoming border
      [41.064, -109.794],
      [41.094, -110.238],
      [41.064, -110.581],
      [41.012, -110.783],
      // Back to western notch
      [40.922, -111.045],
      [40.885, -111.135],
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
    trailheadLat: 38.3983,
    trailheadLon: -112.3317,
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
    trailheadLat: 39.8617,
    trailheadLon: -113.8883,
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
    trailheadLat: 39.9033,
    trailheadLon: -111.7617,
    gain: "~3,300–3,500 ft",
    color: "#2471A3",
    polygon: [
      // Traced from Google Maps Wasatch Range boundary (dashed outline)
      // Northern tip — Bear River Mountains / Utah-Idaho border ~42.0°N
      [42.00, -111.95], [42.00, -111.38],
      // East side: crest runs just east of Logan canyon (~111.38), then
      // bends slightly west through Ogden Valley, then tightens near SLC
      [41.75, -111.35], [41.55, -111.35],
      // Ogden area — range widens east into Ogden Valley
      [41.35, -111.38], [41.15, -111.40],
      // SLC / Bountiful / Draper — eastern edge ~111.45–111.52
      [40.95, -111.45], [40.75, -111.48],
      [40.55, -111.50], [40.35, -111.52],
      [40.15, -111.55],
      // Southern tip: Mt. Nebo / Nephi ~39.82°N
      [39.82, -111.62],
      // West side: mountain front above I-15 corridor
      // Southern section (Provo/SLC) — front at ~111.80–111.88
      [39.82, -111.88],
      [40.15, -111.85], [40.35, -111.83],
      [40.55, -111.82], [40.75, -111.82],
      // Bountiful / Ogden front — widens slightly west ~111.88–111.92
      [40.95, -111.85], [41.15, -111.88],
      [41.35, -111.90],
      // Logan / Cache Valley — range widens further, Bear River Mtns ~111.95
      [41.55, -111.92], [41.75, -111.95],
      [42.00, -111.95],
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
      // Northern boundary at 38.22 — covers Mount Ellen (38.1089°N) plus the full northern massif
      [37.75, -111.05], [37.75, -110.55], [38.22, -110.55],
      [38.22, -111.05], [37.75, -111.05],
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
    trailheadLat: 40.4583,
    trailheadLon: -112.5967,
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
    trailheadLat: 40.3733,
    trailheadLon: -112.2667,
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
    trailheadLat: 37.3883,
    trailheadLon: -113.5050,
    gain: "~4,480–4,630 ft",
    color: "#1E8449",
    polygon: [
      [37.20, -113.65], [37.20, -113.30], [37.55, -113.30],
      [37.55, -113.65], [37.20, -113.65],
    ],
  },
];
