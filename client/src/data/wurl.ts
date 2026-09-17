/**
 * Curated major summits from the Wasatch Ultimate Ridge Linkup (WURL).
 * Route recommendations and trailhead statistics are based on the supplied
 * September 17, 2026 verification datasets.
 */
export interface WurlPeak {
  name: string;
  elevationFt: number;
  lat: number;
  lon: number;
  peakSource: string;
  recommendedTrailhead: string;
  trailheadLat: number;
  trailheadLon: number;
  elevationGainFt: number | null;
  distanceRtMi: number | null;
  routeNote: string;
  verification: string;
  source: string;
}

export const WURL_COLOR = "#6B3FA0";
export const WURL_CENTER = { lat: 40.568, lng: -111.68 };
export const WURL_ZOOM = 11;

export const WURL_PEAKS: WurlPeak[] = [
  {
    "name": "American Fork Twin Peaks",
    "elevationFt": 11489.5,
    "lat": 40.55195,
    "lon": -111.65682,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5468",
    "recommendedTrailhead": "Snowbird lower parking / Gad Valley approach",
    "trailheadLat": 40.57934,
    "trailheadLon": -111.65858,
    "elevationGainFt": 4183,
    "distanceRtMi": 8.5,
    "routeNote": "I believe Snowbird is the most practical access for a standalone ascent, especially when tram/lift access is available. Verify current resort access and route before publishing.",
    "verification": "verified_route; trailhead coordinate cross-checked to Snowbird hiking start",
    "source": "Wasatch Mountain Club hike table; SummitPost AF Twin Peaks; Walk the Wasatch Hidden Peak TH coordinate"
  },
  {
    "name": "Broad Fork Twin Peaks",
    "elevationFt": 11327.4,
    "lat": 40.59387,
    "lon": -111.72077,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5455",
    "recommendedTrailhead": "Broads Fork Trailhead / Mill B South",
    "trailheadLat": 40.63323,
    "trailheadLon": -111.72374,
    "elevationGainFt": 5345,
    "distanceRtMi": 8.52,
    "routeNote": "I believe Broads Fork is the standard standalone approach. Route is strenuous and involves off-trail/alpine terrain.",
    "verification": "verified",
    "source": "onX Broads Fork Twin Peaks; OpenStreetMap/Mapcarta Broads Fork Trailhead"
  },
  {
    "name": "White Baldy",
    "elevationFt": 11324.6,
    "lat": 40.53293,
    "lon": -111.68127,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5471",
    "recommendedTrailhead": "White Pine Trailhead",
    "trailheadLat": 40.575383,
    "trailheadLon": -111.681242,
    "elevationGainFt": 3891,
    "distanceRtMi": 11.2,
    "routeNote": "I believe White Pine is the most practical standalone access. Verify the exact route because White Baldy commonly involves substantial off-trail travel.",
    "verification": "verified for Red Pine/White Pine loop route",
    "source": "AllTrails Red Pine and White Pine Loop; SUV RVing White Pine TH coordinate"
  },
  {
    "name": "Pfeifferhorn",
    "elevationFt": 11320.9,
    "lat": 40.53357,
    "lon": -111.70594,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5470",
    "recommendedTrailhead": "White Pine / Red Pine Trailhead",
    "trailheadLat": 40.57547,
    "trailheadLon": -111.68127,
    "elevationGainFt": 3668,
    "distanceRtMi": 9.6,
    "routeNote": "Checked against a Peakbagger ascent reporting a 7,671-ft start, 10.4 mi distance, and 3,650 ft gain. Other recorded variants differ.",
    "verification": "verified",
    "source": "Utah.com Pfeifferhorn Trail"
  },
  {
    "name": "Sunrise Peak (O'Sullivan Peak)",
    "elevationFt": 11271.1,
    "lat": 40.59107,
    "lon": -111.71137,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5459",
    "recommendedTrailhead": "Broads Fork Trailhead / Mill B South",
    "trailheadLat": 40.63323,
    "trailheadLon": -111.72374,
    "elevationGainFt": null,
    "distanceRtMi": null,
    "routeNote": "I believe Broads Fork is a practical standalone approach. Verify route details before publishing.",
    "verification": "trailhead verified; standalone total gain not independently verified",
    "source": "SummitPost Sunrise Peak; OpenStreetMap/Mapcarta Broads Fork Trailhead"
  },
  {
    "name": "Lone Peak",
    "elevationFt": 11261.9,
    "lat": 40.52694,
    "lon": -111.7561,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5472",
    "recommendedTrailhead": "Peak View Trailhead via Jacob's Ladder",
    "trailheadLat": 40.488333,
    "trailheadLon": -111.820556,
    "elevationGainFt": 6029,
    "distanceRtMi": 15.2,
    "routeNote": "I believe the Orson Smith/Cherry Canyon approach is the most conventional public trailhead choice, with Jacob's Ladder another common approach. Verify access and route selection.",
    "verification": "verified recommended access and route stats; coordinates converted from published DMS",
    "source": "Draper City Lone Peak access; Climb-Utah Peak View coordinate; MyOutdoorBasecamp route stats"
  },
  {
    "name": "Red Baldy",
    "elevationFt": 11172.2,
    "lat": 40.54019,
    "lon": -111.66696,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=25209",
    "recommendedTrailhead": "White Pine Trailhead",
    "trailheadLat": 40.575383,
    "trailheadLon": -111.681242,
    "elevationGainFt": 3530,
    "distanceRtMi": 6.92,
    "routeNote": "I believe White Pine is the practical standalone access. Verify exact route.",
    "verification": "verified for White Pine Fork route; distance is doubled from published 3.46-mi one-way stat",
    "source": "SummitPost Red Baldy; SUV RVing White Pine TH coordinate"
  },
  {
    "name": "South Thunder Mountain",
    "elevationFt": 11163,
    "lat": 40.53268,
    "lon": -111.73482,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=25207",
    "recommendedTrailhead": "Bells Canyon Trailhead",
    "trailheadLat": 40.57204,
    "trailheadLon": -111.79851,
    "elevationGainFt": 6000,
    "distanceRtMi": 13,
    "routeNote": "I believe Bells Canyon is the logical standalone approach. Verify route because upper terrain is alpine and off-trail.",
    "verification": "verified approximately; source describes ~6,000 ft gain over ~6.5 mi to summit",
    "source": "Walk the Wasatch South Thunder; SummitPost Bells Canyon Trailhead"
  },
  {
    "name": "Monte Cristo Peak",
    "elevationFt": 11132.2,
    "lat": 40.59134,
    "lon": -111.6713,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=28885",
    "recommendedTrailhead": "Alta / Cardiff Pass trailhead",
    "trailheadLat": 40.59063,
    "trailheadLon": -111.63688,
    "elevationGainFt": 2746,
    "distanceRtMi": 5.4,
    "routeNote": "I believe Alta/Superior is the most practical standalone access. This is the 11,132-ft Central Wasatch Monte Cristo, not the Cache County peak.",
    "verification": "verified for combined Superior + Monte Cristo outing",
    "source": "Walk the Wasatch Superior and Monte Cristo via Cardiff Pass"
  },
  {
    "name": "Dromedary Peak",
    "elevationFt": 11106.9,
    "lat": 40.59305,
    "lon": -111.70593,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5457",
    "recommendedTrailhead": "Broads Fork Trailhead / Mill B South",
    "trailheadLat": 40.63323,
    "trailheadLon": -111.72374,
    "elevationGainFt": null,
    "distanceRtMi": null,
    "routeNote": "I believe Broads Fork is the conventional standalone approach. Verify route and scrambling exposure.",
    "verification": "trailhead and route verified; standalone total gain not independently verified",
    "source": "Wasatch Mountain Club Sunrise/Dromedary report; OpenStreetMap/Mapcarta Broads Fork Trailhead"
  },
  {
    "name": "Mount Baldy",
    "elevationFt": 11070.7,
    "lat": 40.56784,
    "lon": -111.63826,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5465",
    "recommendedTrailhead": "Cecret Lake Trailhead, Albion Basin",
    "trailheadLat": 40.57768,
    "trailheadLon": -111.61298,
    "elevationGainFt": 1658,
    "distanceRtMi": 4,
    "routeNote": "I believe Alta/Albion Basin is the most practical standalone access. Verify seasonal road and resort access.",
    "verification": "verified",
    "source": "SummitPost Mount Baldy; OpenStreetMap/Mapcarta Cecret Lake Trailhead"
  },
  {
    "name": "Sugarloaf Mountain",
    "elevationFt": 11052.8,
    "lat": 40.56592,
    "lon": -111.62479,
    "peakSource": "https://www.peakbagger.com/List.aspx?lid=-951203",
    "recommendedTrailhead": "Cecret Lake / Albion Basin access",
    "trailheadLat": 40.57768,
    "trailheadLon": -111.61298,
    "elevationGainFt": 1878,
    "distanceRtMi": 5,
    "routeNote": "I believe Alta/Albion Basin is the most practical standalone access. Coordinate was cross-checked against an open-map result; elevation against the WURL list.",
    "verification": "route stats verified for Sugarloaf via Cecret Lake; parking coordinate verified separately",
    "source": "Trailforks Sugarloaf Peak via Cecret Lake route; OpenStreetMap/Mapcarta Cecret Lake Trailhead"
  },
  {
    "name": "Superior Peak",
    "elevationFt": 11040,
    "lat": 40.592166,
    "lon": -111.667046,
    "peakSource": "https://peakbagger.com/peak.aspx?pid=5458",
    "recommendedTrailhead": "Alta / Cardiff Pass trailhead",
    "trailheadLat": 40.59063,
    "trailheadLon": -111.63688,
    "elevationGainFt": 2746,
    "distanceRtMi": 5.4,
    "routeNote": "I believe Alta/Cardiff Pass is the standard practical access. Peakbagger gives an elevation range of 11,040-11,080 ft rather than a single surveyed summit elevation.",
    "verification": "verified for combined Superior + Monte Cristo outing; standalone Superior would be less",
    "source": "Walk the Wasatch Superior and Monte Cristo via Cardiff Pass"
  },
  {
    "name": "Devil's Castle",
    "elevationFt": 10995.7,
    "lat": 40.56553,
    "lon": -111.61348,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5467",
    "recommendedTrailhead": "Cecret Lake Trailhead, Albion Basin",
    "trailheadLat": 40.5777,
    "trailheadLon": -111.6128,
    "elevationGainFt": 1500,
    "distanceRtMi": 5,
    "routeNote": "I believe Albion Basin is the practical access. The summit traverse can involve exposed scrambling; verify route difficulty before publishing.",
    "verification": "verified",
    "source": "Park City Hikes Devil's Castle"
  },
  {
    "name": "Hidden Peak",
    "elevationFt": 10961.9,
    "lat": 40.56076,
    "lon": -111.64523,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=25874",
    "recommendedTrailhead": "Snowbird hiking start",
    "trailheadLat": 40.57934,
    "trailheadLon": -111.65858,
    "elevationGainFt": 2930,
    "distanceRtMi": 6.4,
    "routeNote": "I believe Snowbird is the direct access. Verify whether your site should describe hiking-only access or include tram/lift-assisted access.",
    "verification": "verified",
    "source": "Walk the Wasatch Hidden Peak"
  },
  {
    "name": "Mount Wolverine",
    "elevationFt": 10799.6,
    "lat": 40.58542,
    "lon": -111.60358,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=5461",
    "recommendedTrailhead": "Catherine Pass Trailhead, Albion Basin",
    "trailheadLat": 40.58278,
    "trailheadLon": -111.61836,
    "elevationGainFt": 1473,
    "distanceRtMi": 4.6,
    "routeNote": "I believe Brighton or Guardsman Pass provides the most practical standalone access, depending on the route chosen. Verify exact trailhead.",
    "verification": "verified",
    "source": "Walk the Wasatch Mount Wolverine; Trailforks Catherine Pass"
  },
  {
    "name": "Honeycomb Cliffs",
    "elevationFt": 10488.6,
    "lat": 40.60156,
    "lon": -111.61403,
    "peakSource": "https://www.peakbagger.com/peak.aspx?pid=25218",
    "recommendedTrailhead": "Solitude / East Church Road access",
    "trailheadLat": 40.61704,
    "trailheadLon": -111.61375,
    "elevationGainFt": 1925,
    "distanceRtMi": 4,
    "routeNote": "I believe Solitude/Brighton is the practical access. Verify exact public trailhead and route.",
    "verification": "verified for Trailforks Honeycomb Cliffs route",
    "source": "Trailforks Honeycomb Cliffs; 10Adventures access description"
  }
];
