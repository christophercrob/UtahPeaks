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
  // Personal hiking journal fields
  summited?: boolean;
  summitDate?: string;           // e.g. "July 11, 2026"
  hikeNote?: string;             // short personal note about the hike
  trailheadPhoto?: { url: string; caption?: string };
  summitPhoto?: { url: string; caption?: string };
  attempted?: boolean;           // true if attempted but not yet summited
  attemptDate?: string;          // date of the attempt
  attemptNote?: string;          // note about the attempt
  extraPhotos?: Array<{ url: string; caption?: string }>;  // additional gallery photos
  videoUrl?: string;             // link to a video (Google Photos, YouTube, etc.)
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
    color: "#9B6B8A",
    summited: true,
    summitDate: "June 13, 2026",
    hikeNote: "A beautiful high-altitude drive to Big John Flat puts you within striking distance of the summit. The Tushars are one of Utah's hidden gems — dramatic volcanic terrain, lush forests, and sweeping views of Eagle Point ski resort and the Sevier Plateau. The forest below the summit was still pristine on this June day, before the Cottonwood Fire swept through later that summer.",
    trailheadPhoto: { url: "/manus-storage/delano_trailhead_46c9d901.jpg", caption: "Delano Peak Trailhead #224 — June 13, 2026" },
    summitPhoto: { url: "/manus-storage/delano_summit_cc63fe5e.jpg", caption: "Summit of Delano Peak, 12,169 ft — June 13, 2026" },
    extraPhotos: [
      { url: "/manus-storage/delano_forest_35dd78a9.jpg", caption: "The lush Tushar forest looking west toward Beaver Valley — before the Cottonwood Fire" },
      { url: "/manus-storage/delano_eaglepoint_e2e04fb5.jpg", caption: "Eagle Point ski resort visible from the summit ridge" },
    ],
    polygon: [
      // From user-provided KML (Google Earth), Aug 2026
      [38.338381, -112.551621],
      [38.311925, -112.560742],
      [38.280927, -112.578998],
      [38.253286, -112.600808],
      [38.241901, -112.575182],
      [38.222626, -112.586468],
      [38.204865, -112.584100],
      [38.193984, -112.558613],
      [38.143574, -112.520041],
      [38.121029, -112.497958],
      [38.118008, -112.474423],
      [38.096244, -112.420446],
      [38.086499, -112.373346],
      [38.132830, -112.331920],
      [38.165000, -112.312128],
      [38.224765, -112.300106],
      [38.263793, -112.262769],
      [38.331575, -112.223054],
      [38.397690, -112.237902],
      [38.411887, -112.293009],
      [38.449256, -112.291546],
      [38.481864, -112.236102],
      [38.498551, -112.248679],
      [38.524147, -112.260375],
      [38.600203, -112.236320],
      [38.567711, -112.330097],
      [38.551994, -112.401148],
      [38.567888, -112.459644],
      [38.584514, -112.508636],
      [38.598123, -112.547540],
      [38.534631, -112.589555],
      [38.457067, -112.587403],
      [38.388387, -112.570829],
      [38.362800, -112.574055],
      [38.338381, -112.551621],
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
    summited: true,
    summitDate: "July 11, 2026",
    hikeNote: "Mount Nebo is the southern sentinel of the Wasatch — a long, exposed ridge walk with three distinct summits. The north peak is the true high point. Views stretch from the Uintas to the Tushar Mountains on a clear day.",
    trailheadPhoto: { url: "/manus-storage/nebo_trailhead_5b821db1.jpg", caption: "North Nebo Trailhead — July 11, 2026" },
    summitPhoto: { url: "/manus-storage/nebo_summit_1eaf7d79.jpg", caption: "Summit of Mount Nebo looking north toward Utah Lake — July 11, 2026" },
    polygon: [
      // Southern section per user cross-sections:
      // Provo→US-40, Mapleton→West Portal, Payson→Thistle, Rocky Ridge→Birdseye, Mona→Indianola
      [42.00, -111.80], [42.00, -111.45],
      [41.75, -111.38], [41.50, -111.38],
      [41.22, -111.42], [40.92, -111.40],
      [40.65, -111.50], [40.51, -111.41],
      [40.45, -111.38],
      [40.35, -111.50],
      [40.23, -111.41],   // US-40 east end
      [40.09, -111.50],   // West Portal
      [40.05, -111.50],   // Spanish Fork Peak area
      [39.98, -111.55],   // Thistle
      [39.92, -111.57],   // Birdseye
      [39.77, -111.53],   // Indianola
      [39.75, -111.70],   // southern tip
      [39.82, -111.86],   // Mona west end
      [39.96, -111.75],   // Rocky Ridge west end
      [40.04, -111.73],   // Payson west end
      [40.05, -111.66],   // Salem exclusion
      [40.13, -111.57],   // Mapleton west end
      [40.23, -111.64],   // Provo west end
      [40.40, -111.72],
      [40.55, -111.82], [40.76, -111.84], [40.89, -111.88],
      [41.22, -111.93],
      [41.38, -111.99],   // Willard Peak
      [41.47, -112.00],   // Perry foothills
      [41.51, -112.00],   // Brigham City foothills
      [41.60, -112.03],
      [41.74, -112.05],   // Garland/Tremonton tip
      [41.74, -111.90],
      [41.70, -111.89],
      [41.63, -111.88],
      [41.57, -111.88],
      [41.50, -111.82],
      [41.45, -111.85],
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
    summited: true,
    summitDate: "July 5, 2026",
    hikeNote: "The Henry Mountains are the last range in the contiguous US to be named and mapped. Mount Ellen's summit ridge is a short hike from Bull Creek Pass — but the remoteness and the views over Capitol Reef and Canyonlands make it feel like the edge of the world.",
    trailheadPhoto: { url: "/manus-storage/ellen_trail2_9610ab3f.jpg", caption: "Looking back toward Bull Creek Pass Trailhead from the ridge" },
    summitPhoto: { url: "/manus-storage/ellen_summit_118ed81e.jpg", caption: "Summit of Mount Ellen with Capitol Reef in the distance — July 5, 2026" },
    extraPhotos: [
      { url: "/manus-storage/ellen_trailhead2_85a487fd.jpg", caption: "Morning approach — Mount Ellen glowing in the distance" },
      { url: "/manus-storage/ellen_trail1_c6df66f4.jpg", caption: "On the ridge with canyon country stretching to the horizon" },
      { url: "/manus-storage/ellen_trailhead_412fbfe4.jpg", caption: "Morning approach to the Henry Mountains — July 5, 2026" },
    ],
    videoUrl: "https://photos.app.goo.gl/M7ukkBM9tKKmd8o99",
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
    trailheadLat: 40.483044,
    trailheadLon: -112.606392,
    gain: "~3,613 ft",
    color: "#B7950B",
    attempted: true,
    attemptDate: "July 25, 2026",
    attemptNote: "Got some bad directions from Google and ended up miles from the correct trailhead. By the time I sorted it out, afternoon thunderstorms were already building over the summit — too risky to start that late. Still got in a good hike on the lower slopes and got a great look at Deseret Peak. I\'ll be back.",
    summitPhoto: { url: "/manus-storage/stansbury_selfie_3fe9b2bf.jpg", caption: "Deseret Peak summit ridge from the lower slopes — July 25, 2026" },
    extraPhotos: [
      { url: "/manus-storage/stansbury_valley_3968e881.jpg", caption: "Looking west over Tooele Valley — the Great Salt Lake and salt flats visible on the horizon, Oquirrh Mountains beyond" },
      { url: "/manus-storage/stansbury_trail_b9543410.jpg", caption: "The trail through aspens and firs on the way up" },
    ],
    polygon: [
      // Shifted east 0.5 miles (+0.007°) from previous position
      [40.700, -112.643],
      [40.700, -112.553],
      [40.600, -112.543],
      [40.500, -112.543],
      [40.400, -112.543],
      [40.300, -112.553],
      [40.200, -112.553],
      [40.200, -112.643],
      [40.300, -112.703],
      [40.400, -112.723],
      [40.500, -112.723],
      [40.600, -112.703],
      [40.700, -112.663],
      [40.700, -112.643],
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
      // Oquirrh Mountains — excludes Stockton-Tooele flat plain; N tip at 40.68°N
      // East face (SLC Valley): ~112.08-112.18°W
      // West face (Tooele Valley): ~112.19-112.43°W
      // Tooele (112.298°W) and Stockton (112.367°W) confirmed outside
      [40.680, -112.140],
      [40.680, -112.100],
      [40.600, -112.090],
      [40.500, -112.080],
      [40.400, -112.100],
      [40.280, -112.150],
      [40.243, -112.183],
      [40.243, -112.350],
      [40.280, -112.400],
      [40.400, -112.430],
      [40.453, -112.360],
      [40.530, -112.290],
      [40.600, -112.200],
      [40.680, -112.200],
      [40.680, -112.140],
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
    summited: true,
    summitDate: "May 25, 2025",
    hikeNote: "Signal Peak is a long, forested climb through pine and aspen above the town of Pine Valley. The summit offers a surprising 360° panorama — Zion to the east, the Nevada desert to the west, and the red cliffs of the Arizona Strip to the south.",
    trailheadPhoto: { url: "/manus-storage/signal_trailhead_cceb968f.jpg", caption: "Pine Valley Mountains Wilderness / Dixie National Forest — the trail begins here" },
    summitPhoto: { url: "/manus-storage/signal_summit_ad132126.jpg", caption: "Summit of Signal Peak — St. George valley, Quail Creek Reservoir, and red rock mesas below" },
    extraPhotos: [
      { url: "/manus-storage/signal_view1_a684b5fe.jpg", caption: "Looking east from the summit ridge — St. George and Quail Creek Reservoir" },
      { url: "/manus-storage/signal_sign_6df7889f.jpg", caption: "Whipple Valley / Further Water trail junction — still plenty of snow in late May" },
      { url: "/manus-storage/signal_meadow_8f187816.jpg", caption: "High alpine meadow with lingering snow patches near the summit" },
      { url: "/manus-storage/signal_trees_34c72bdb.jpg", caption: "View through the pines looking down toward Pine Valley" },
      { url: "/manus-storage/signal_view2_e9221050.jpg", caption: "Looking south from the rocky summit edge — Arizona Strip and Lake Powell area in the distance" },
    ],
    videoUrl: "https://photos.app.goo.gl/8rm5s3KfetCBDb386",
    polygon: [
      // From user-provided KML (Google Earth), Aug 2026
      [37.296377, -113.311317],
      [37.399438, -113.249413],
      [37.422268, -113.244803],
      [37.438035, -113.258775],
      [37.470177, -113.304983],
      [37.479935, -113.330294],
      [37.506127, -113.323620],
      [37.540659, -113.340487],
      [37.519271, -113.365166],
      [37.543841, -113.409056],
      [37.553099, -113.419916],
      [37.540320, -113.456635],
      [37.543555, -113.488240],
      [37.518858, -113.526126],
      [37.484694, -113.637010],
      [37.465498, -113.650066],
      [37.454527, -113.650727],
      [37.438759, -113.669603],
      [37.423124, -113.657878],
      [37.427010, -113.614716],
      [37.419044, -113.605055],
      [37.376940, -113.617429],
      [37.322833, -113.618286],
      [37.298828, -113.590291],
      [37.262470, -113.592704],
      [37.226347, -113.574102],
      [37.177084, -113.531631],
      [37.228482, -113.514118],
      [37.214793, -113.447249],
      [37.236616, -113.406232],
      [37.268515, -113.375813],
      [37.266532, -113.346862],
      [37.296377, -113.311317],
    ],
  },
  {
    range: "Pahvant Range",
    peak: "Pioneer Peak",
    elevation: "10,466 ft",
    elevationFt: 10466,
    lat: 38.994,
    lon: -112.173,
    trailhead: "Paiute ATV Trail (Fillmore Canyon Rd)",
    trailheadLat: 38.9600,
    trailheadLon: -112.2100,
    gain: "~500 ft (from ridge road)",
    color: "#7D6608",
    polygon: [
      // From user-provided KML (Google Earth), Aug 2026
      [39.211525, -112.114868],
      [39.153927, -112.185095],
      [39.042351, -112.194177],
      [38.952563, -112.270065],
      [38.876934, -112.359135],
      [38.760062, -112.406932],
      [38.716474, -112.509352],
      [38.640076, -112.561615],
      [38.613857, -112.561452],
      [38.611686, -112.521115],
      [38.595950, -112.503960],
      [38.578427, -112.476845],
      [38.568091, -112.441152],
      [38.557956, -112.409296],
      [38.571165, -112.346739],
      [38.584166, -112.278554],
      [38.609148, -112.222781],
      [38.660728, -112.216897],
      [38.734349, -112.156441],
      [38.789657, -112.093703],
      [38.864640, -112.029003],
      [38.894209, -112.003140],
      [39.029011, -112.090607],
      [39.057459, -112.070174],
      [39.075345, -112.087621],
      [39.146149, -112.081951],
      [39.211525, -112.114868],
    ],
  },
];

// ── Markagunt Plateau ─────────────────────────────────────────────────────────
// Highest peak: Brian Head, 11,307 ft (37.6946°N, 112.8483°W)
// Trailhead: Brian Head Peak Trail (off UT-143)
MOUNTAIN_RANGES.push({
  range: "Markagunt Plateau",
  peak: "Brian Head Peak",
  elevation: "11,307 ft",
  elevationFt: 11307,
  lat: 37.6946,
  lon: -112.8483,
  trailhead: "Brian Head Peak Trailhead (UT-143)",
  trailheadLat: 37.6980,
  trailheadLon: -112.8520,
  gain: "~700 ft (from ski resort base road)",
  color: "#5D6D7E",
  polygon: [
    // Approximate boundary: Markagunt Plateau between Cedar City (NW), Panguitch (NE),
    // Long Valley (E), Zion NP (S), and Cedar Valley (W)
    [37.950, -112.650],  // NE corner near Panguitch
    [37.900, -112.500],  // East edge near Long Valley Junction
    [37.750, -112.500],  // SE edge
    [37.600, -112.600],  // South edge near Zion NP boundary
    [37.500, -112.750],  // SW edge
    [37.550, -112.950],  // West edge near Cedar City
    [37.700, -113.000],  // NW edge
    [37.850, -112.900],  // North edge
    [37.950, -112.650],  // back to start
  ],
  hikeNote: "The Markagunt Plateau sits above Cedar City at over 10,000 feet, offering sweeping views of Zion Canyon to the south and the Cedar Valley to the west. Brian Head Peak is the highest point in the region and one of Utah's most accessible high summits — the ski resort road brings you within a short hike of the top.",
  summitPhoto: { url: "/manus-storage/markagunt_zion_27b24df0.jpg", caption: "Looking south from the Markagunt Plateau — Zion NP visible on the horizon" },
});
