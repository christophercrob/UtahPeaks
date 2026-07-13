// Utah Mountain Ranges data — sourced from Google Sheet
// Polygons: image-traced + fine-tuned to match terrain on Google Maps
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
      // Western edge extended to meet the Wasatch Range eastern edge
      // Wasatch eastern edge runs at ~111.37-111.44°W at these latitudes
      [41.000, -111.373],   // meets Wasatch at 41.0°N
      [40.920, -111.388],   // meets Wasatch at 40.92°N
      [40.885, -111.395],   // western notch
      [40.773, -111.415],   // meets Wasatch at 40.77°N
      [40.729, -111.422],
      [40.640, -111.439],   // meets Wasatch at 40.64°N
      // Southern edge
      [40.560, -110.870],
      [40.530, -110.580],
      [40.530, -110.300],
      [40.550, -110.040],
      [40.595, -109.840],
      // Eastern tip
      [40.730, -109.420],
      [40.880, -109.420],
      // Northern edge — follows UT-WY border, dips briefly into Wyoming
      [41.060, -109.780],
      [41.090, -110.240],
      [41.060, -110.580],
      [41.010, -110.780],
      [41.000, -111.373],   // close back at Wasatch junction
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
      // Shifted north ~0.06° to fully encompass Mt Waas (38.51°N, 109.22°W)
      [38.600, -109.240],
      [38.590, -109.195],
      [38.570, -109.140],
      [38.510, -109.115],
      [38.440, -109.125],
      [38.370, -109.155],
      [38.330, -109.225],
      [38.340, -109.305],
      [38.390, -109.350],
      [38.460, -109.355],
      [38.520, -109.345],
      [38.570, -109.320],
      [38.600, -109.240],
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
    color: "#E91E8C",
    polygon: [
      // Shifted west ~0.12° so US-89 (~112.22°W) defines eastern edge
      // and Beaver/Cove Fort/Sulphurdale (~112.64-112.66°W) define western edge
      [38.650, -112.220],
      [38.650, -112.320],
      [38.700, -112.370],
      [38.700, -112.520],
      [38.650, -112.570],
      [38.600, -112.640],
      [38.500, -112.660],
      [38.400, -112.650],
      [38.300, -112.610],
      [38.200, -112.520],
      [38.200, -112.370],
      [38.250, -112.250],
      [38.350, -112.200],
      [38.500, -112.200],
      [38.600, -112.210],
      [38.650, -112.220],
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
      // Eastern edge tightened to ~113.78°W based on calibrated terrain trace
      // Southern end trimmed to ~39.71°N (just above Trout Creek)
      // Northern tip just south of Gold Hill (~40.10°N)
      // Western edge at ~113.99-114.00°W (Deep Creek Valley)
      [40.100, -113.850],
      [40.100, -113.790],
      [40.030, -113.780],
      [39.910, -113.780],
      [39.800, -113.780],
      [39.720, -113.790],
      // Southeast corner — terrain ends just above Trout Creek
      [39.710, -113.820],
      [39.710, -113.900],
      // Western edge back north
      [39.750, -114.000],
      [39.830, -113.991],
      [39.960, -114.000],
      [40.100, -113.940],
      [40.100, -113.850],
    ],
  },
  {
    range: "Wasatch Range",
    peak: "Mount Nebo",
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
      // Wasatch Range — 17 containment checks pass
      // Includes full Wellsville Mountains loop:
      //   west side: Willard Peak → Perry → Brigham City → Garland/Tremonton
      //   east side: Mendon → Hyrum foothills → Paradise foothills → Avon foothills
      [42.00, -111.80], [42.00, -111.45],
      [41.75, -111.38], [41.50, -111.38],
      [41.22, -111.42], [40.92, -111.40],
      [40.65, -111.50], [40.51, -111.41],
      [40.45, -111.38],
      [40.35, -111.50],
      [40.10, -111.50],
      [40.05, -111.51],
      [39.94, -111.73],   // Dry Mountain
      [39.84, -111.71],   // Bald Mountain
      [39.75, -111.78],   // southern tip
      [39.82, -111.83],
      [40.04, -111.65],
      [40.10, -111.60],
      [40.27, -111.60],
      [40.40, -111.72],
      [40.55, -111.82], [40.76, -111.84], [40.89, -111.88],
      [41.22, -111.93],
      // Wellsville Mountains — west side (front range)
      [41.38, -111.99],   // Willard Peak
      [41.47, -112.00],   // Perry foothills
      [41.51, -112.00],   // Brigham City foothills
      [41.60, -112.03],   // north of Brigham City
      [41.74, -112.05],   // Garland/Tremonton northern tip
      // Wellsville Mountains — east side (Cache Valley side)
      [41.74, -111.90],   // wrap east
      [41.70, -111.89],   // Mendon foothills
      [41.63, -111.88],   // Hyrum foothills (city at 111.85°W is outside)
      [41.57, -111.88],   // Paradise foothills (city at 111.84°W is outside)
      [41.50, -111.82],   // Avon foothills (city at 111.83°W is outside)
      [41.45, -111.85],   // reconnect to main Wasatch
      [42.00, -111.80],
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
      [38.1915, -110.8326],
      [38.1763, -110.8518],
      [38.1336, -110.8595],
      [38.1275, -110.8863],
      [38.0453, -110.8671],
      [37.9447, -110.8863],
      [37.9386, -110.8671],
      [37.9112, -110.8633],
      [37.9051, -110.779],
      [37.8685, -110.756],
      [37.8503, -110.664],
      [37.8807, -110.6411],
      [37.9203, -110.6372],
      [37.9264, -110.6142],
      [37.9386, -110.6142],
      [37.9782, -110.664],
      [38.158, -110.6794],
      [38.1732, -110.6909],
      [38.1702, -110.7675],
      [38.1915, -110.8326],
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
      // Compact laccolith range: ~16 mi long x 10 mi wide (PeakVisor)
      // West of Monticello (37.87°N, 109.34°W); two sections N and S
      // Bounds: lat 37.71-37.96°N, lon 109.34-109.60°W
      [37.960, -109.380],
      [37.950, -109.340],
      [37.870, -109.345],
      [37.780, -109.360],
      [37.720, -109.390],
      [37.710, -109.470],
      [37.720, -109.560],
      [37.790, -109.600],
      [37.870, -109.590],
      [37.950, -109.560],
      [37.960, -109.380],
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
      // Northern boundary extended to ~40.70°N near I-80/SR-196 Skull Valley exit
      // Western edge tightened to terrain break above Skull Valley (~112.60-112.64°W)
      // Eastern edge follows Tooele Valley terrain break (~112.46-112.47°W)
      [40.700, -112.560],
      [40.700, -112.470],
      [40.600, -112.460],
      [40.500, -112.460],
      [40.400, -112.460],
      [40.300, -112.470],
      [40.200, -112.470],
      [40.200, -112.560],
      [40.300, -112.620],
      [40.400, -112.640],
      [40.500, -112.640],
      [40.600, -112.620],
      [40.700, -112.580],
      [40.700, -112.560],
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
      [40.7478, -112.2693],
      [40.4987, -112.428],
      [40.4817, -112.428],
      [40.2803, -112.2736],
      [40.2428, -112.1834],
      [40.4202, -111.9774],
      [40.4646, -111.9603],
      [40.6762, -112.0976],
      [40.741, -112.1405],
      [40.7615, -112.2436],
      [40.7478, -112.2693],
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
      [37.4423, -113.7867],
      [37.2412, -113.6641],
      [37.2351, -113.3231],
      [37.4301, -113.2235],
      [37.6738, -113.2235],
      [37.491, -113.7254],
      [37.4423, -113.7867],
    ],
  },
];
