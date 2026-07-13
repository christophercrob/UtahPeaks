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
      // Calibrated against Evanston, Vernal, Mountain View, Manila, Roosevelt
      // Northern edge peaks at ~41.09°N — just barely into Wyoming, correct per map
      //
      // Western notch upper entry
      [40.922, -111.045],
      // Western notch — distinctive lobe protruding west
      [40.885, -111.135],
      [40.773, -111.135],
      [40.729, -111.045],
      [40.639, -111.045],
      // Southern edge — broad curve dipping to ~40.53°N
      [40.564, -110.863],
      [40.527, -110.581],
      [40.527, -110.298],
      [40.550, -110.036],
      [40.594, -109.835],
      // Eastern tip — rounded, reaching ~109.48°W
      [40.729, -109.482],
      [40.878, -109.482],
      // Northern edge — peaks at 41.09°N (barely into Wyoming), then back south
      [41.064, -109.794],
      [41.094, -110.238],
      [41.064, -110.581],
      [41.012, -110.783],
      // Close polygon
      [40.922, -111.045],
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
      // Terrain-following polygon — compact NNW-SSE oval with 3 peak clusters
      // Peakbagger bbox: miny=38.071, maxy=38.818, minx=-109.606, maxx=-108.805
      // Straddles Utah-Colorado border; eastern edge near ~109.11°W
      // Northern tip — Mt Waas cluster
      [38.540, -109.280],
      [38.530, -109.200],
      [38.510, -109.140],
      // Eastern edge — near Colorado border
      [38.450, -109.110],
      [38.380, -109.120],
      [38.310, -109.150],
      // Southern tip — Mt Tukuhnikivatz area
      [38.260, -109.220],
      [38.270, -109.310],
      // Western edge
      [38.320, -109.360],
      [38.390, -109.370],
      [38.450, -109.360],
      [38.500, -109.340],
      // Close
      [38.540, -109.280],
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
      // Terrain-following polygon — bounded by I-15 (W), I-70 (N), US-89 (E), UT-20 (S)
      // Wikipedia: "bounded roughly by I-15 to the west, I-70 to the north,
      //  US-89 to the east and U-20 to the south"
      // Northern boundary — near I-70 / Clear Creek Canyon (~38.62-38.64°N)
      [38.620, -112.450],
      [38.640, -112.300],
      [38.620, -112.100],
      [38.580, -111.980],
      // Eastern edge — along US-89 corridor (~111.93-111.98°W)
      [38.480, -111.930],
      [38.380, -111.940],
      [38.280, -111.980],
      // Southern boundary — near UT-20 (~38.17-38.19°N)
      [38.180, -112.080],
      [38.170, -112.250],
      [38.190, -112.420],
      // Western edge — along I-15 corridor (~112.49-112.52°W)
      [38.300, -112.500],
      [38.420, -112.520],
      [38.540, -112.490],
      // Close
      [38.620, -112.450],
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
      // Traced from Google Maps Wasatch Range boundary (full range view)
      // Calibrated against Logan (41.74), SLC (40.76), Provo (40.23), Nephi (39.71)
      // All verified within 0.01° of known coordinates
      //
      // Northern tip — near Soda Springs / Preston (Idaho border)
      [42.481, -111.708],
      // NE arc — curves east past Bear Lake toward Wyoming
      [42.353, -111.372],
      [42.149, -111.136],
      [41.894, -111.103],
      // Eastern edge — runs south along the crest
      [41.536, -111.170],
      [41.178, -111.237],
      [40.820, -111.304],
      [40.514, -111.405],
      [40.258, -111.472],
      // Southern tip — near Mt. Nebo / Nephi
      // Mt. Nebo is at 39.822°N — extend south to 39.75°N to fully enclose it
      [39.820, -111.640],
      [39.750, -111.700],
      // SW corner
      [39.750, -111.900],
      [39.820, -111.943],
      // Western front — mountain face above I-15, running north
      // Trimmed west edge to ~111.88W to avoid overlapping the Oquirrh Mountains
      // (Oquirrh eastern edge is ~111.92W; Salt Lake Valley lies between them)
      [40.361, -111.880],
      [40.718, -111.880],
      [41.076, -111.890],
      [41.434, -111.900],
      [41.791, -111.920],
      // Back to northern tip
      [42.149, -111.909],
      [42.353, -111.855],
      [42.481, -111.708],
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
      // Derived from Peakbagger bounding box (miny=40.180, maxy=40.910, minx=-112.416, maxx=-111.900)
      // Shaped as a realistic NNW-SSE ridge; Flat Top Mountain (40.3723, -112.189) verified inside
      // Northern tip — near Magna/Saltair area
      [40.900, -112.050],
      [40.910, -112.100],
      [40.890, -112.180],
      // Western slope — broadens toward Tooele Valley
      [40.750, -112.350],
      [40.600, -112.400],
      [40.450, -112.380],
      // Southern tip — near Eureka/Tintic area
      [40.250, -112.250],
      [40.190, -112.150],
      // Eastern face — fronting the Salt Lake Valley
      [40.220, -111.950],
      [40.380, -111.920],
      [40.550, -111.930],
      [40.700, -111.960],
      [40.830, -112.000],
      // Close polygon
      [40.900, -112.050],
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
