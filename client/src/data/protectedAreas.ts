// Curated protected areas for the Utah Peaks contextual map layer.
// Sources are agency GIS services where available; PAD-US / National Map sources
// are used as nationwide reference geometry for the named regional-neighbor parks.

export type ProtectedAreaKind = "national_park" | "national_monument" | "recreation_area" | "state_park" | "regional_neighbor";

export interface ProtectedAreaSource {
  id: string;
  name: string;
  shortName: string;
  kind: ProtectedAreaKind;
  jurisdiction: string;
  sourceLabel: string;
  sourceUrl: string;
  endpoint: string;
  where: string;
  nameField: string;
  nameOverrides?: Record<string, string>;
  geometryNote?: string;
}

export const PROTECTED_AREA_SOURCES: ProtectedAreaSource[] = [
  {
    id: "nps-monuments",
    name: "NPS national monuments",
    shortName: "NPS monuments",
    kind: "national_monument",
    jurisdiction: "National Park Service",
    sourceLabel: "NPS Boundary Service",
    sourceUrl: "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2",
    endpoint: "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query",
    where: "UNIT_CODE IN ('CEBR','DINO','HOVE','NABR','TICA')",
    nameField: "UNIT_NAME",
    geometryNote: "NPS GIS boundary for thematic display; not a survey or legal boundary.",
  },
  {
    id: "glen-canyon-recreation-area",
    name: "Glen Canyon National Recreation Area",
    shortName: "Glen Canyon",
    kind: "recreation_area",
    jurisdiction: "National Park Service",
    sourceLabel: "NPS Boundary Service",
    sourceUrl: "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2",
    endpoint: "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query",
    where: "UNIT_CODE='GLCA'",
    nameField: "UNIT_NAME",
    geometryNote: "NPS GIS boundary for Glen Canyon National Recreation Area; thematic display only, not a survey or legal boundary.",
  },
  {
    id: "flaming-gorge-recreation-area",
    name: "Flaming Gorge National Recreation Area",
    shortName: "Flaming Gorge",
    kind: "recreation_area",
    jurisdiction: "U.S. Forest Service / Ashley National Forest",
    sourceLabel: "U.S. Forest Service Nationally Designated Areas",
    sourceUrl: "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_OtherNationalDesignatedArea_01/MapServer/0",
    endpoint: "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_OtherNationalDesignatedArea_01/MapServer/0/query",
    where: "areaname='Flaming Gorge' AND areatype='National Recreation Area'",
    nameField: "fullname",
    geometryNote: "U.S. Forest Service current designated-area boundary for thematic display; not a survey or legal boundary.",
  },
  {
    id: "utah-historic-monuments",
    name: "Historic Bears Ears and Grand Staircase–Escalante boundaries",
    shortName: "Historic Utah monument boundaries",
    kind: "national_monument",
    jurisdiction: "Bureau of Land Management / U.S. Forest Service",
    sourceLabel: "Utah AGRC Historic Monument Boundaries",
    sourceUrl: "https://opendata.gis.utah.gov/datasets/d5560a571a86436fbb3a664c3edd5488_0/about",
    endpoint: "https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/BLMNationalMonumentsAndNCAs/FeatureServer/0/query",
    where: "NAME IN ('Bears Ears National Monument','Grand Staircase Escalante National Monument')",
    nameField: "NAME",
    nameOverrides: {
      "Grand Staircase-Escalante": "Grand Staircase–Escalante National Monument",
      "Grand Staircase Escalante National Monument": "Grand Staircase–Escalante National Monument",
    },
    geometryNote: "Utah AGRC historical extent shown in place of the 2026-reduced monument boundaries; thematic display only, not a survey or legal boundary.",
  },
  {
    id: "utah-state-parks",
    name: "Utah state parks",
    shortName: "Utah state parks",
    kind: "state_park",
    jurisdiction: "Utah State Parks",
    sourceLabel: "Utah State Park Management Areas",
    sourceUrl: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_State_Park_Management_Areas/FeatureServer/0",
    endpoint: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Utah_State_Park_Management_Areas/FeatureServer/0/query",
    where: "parkabbid IN ('GVSP','CPSP','SNSP','AISP','KDSP','WMSP','JDSP','DCSP','SASP')",
    nameField: "name",
    nameOverrides: {
      "Goblin Valley": "Goblin Valley State Park",
      "Coral Pink Sand Dunes": "Coral Pink Sand Dunes State Park",
      "Snow Canyon": "Snow Canyon State Park",
      "Antelope Island": "Antelope Island State Park",
      "Kodachrome Basin": "Kodachrome Basin State Park",
      "Wasatch Mountain": "Wasatch Mountain State Park",
      "Jordanelle": "Jordanelle State Park",
      "Deer Creek": "Deer Creek State Park",
      "Sand Hollow": "Sand Hollow State Park",
    },
    geometryNote: "Utah State Parks management-area geometry for planning and thematic display.",
  },
  {
    id: "dead-horse-point",
    name: "Dead Horse Point State Park",
    shortName: "Dead Horse Point",
    kind: "state_park",
    jurisdiction: "Utah State Parks",
    sourceLabel: "Utah Land Ownership",
    sourceUrl: "https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership/FeatureServer/0",
    endpoint: "https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership/FeatureServer/0/query",
    where: "label_state='Dead Horse Point State Park'",
    nameField: "label_state",
    geometryNote: "State land-ownership administration geometry for thematic display.",
  },
  {
    id: "gold-butte",
    name: "Gold Butte National Monument",
    shortName: "Gold Butte",
    kind: "regional_neighbor",
    jurisdiction: "BLM Nevada",
    sourceLabel: "BLM Nevada National Conservation Lands",
    sourceUrl: "https://gis.blm.gov/nvarcgis/rest/services/BLM_Nevada_National_Landscape_Conservation_System/BLM_NV_National_Monument_National_Conservation_Area/FeatureServer/0",
    endpoint: "https://gis.blm.gov/nvarcgis/rest/services/BLM_Nevada_National_Landscape_Conservation_System/BLM_NV_National_Monument_National_Conservation_Area/FeatureServer/0/query",
    where: "NLCS_ID='NLCS000605'",
    nameField: "NLCS_NAME",
    nameOverrides: { "Gold Butte": "Gold Butte National Monument" },
    geometryNote: "Regional-neighbor area in Nevada, shown separately from Utah units.",
  },
  {
    id: "parashant",
    name: "Grand Canyon–Parashant National Monument",
    shortName: "Grand Canyon–Parashant",
    kind: "regional_neighbor",
    jurisdiction: "BLM / National Park Service, Arizona",
    sourceLabel: "USGS National Map / PAD-US",
    sourceUrl: "https://carto.nationalmap.gov/arcgis/rest/services/govunits/MapServer/30",
    endpoint: "https://carto.nationalmap.gov/arcgis/rest/services/govunits/MapServer/30/query",
    where: "NAME='Grand Canyon-Parashant National Monument'",
    nameField: "name",
    nameOverrides: { "Grand Canyon-Parashant National Monument": "Grand Canyon–Parashant National Monument" },
    geometryNote: "USGS PAD-US reference geometry for a regional-neighbor monument in Arizona.",
  },
  {
    id: "arizona-strip-ncl",
    name: "Northern Arizona national conservation lands",
    shortName: "Northern Arizona conservation lands",
    kind: "regional_neighbor",
    jurisdiction: "Bureau of Land Management, Arizona",
    sourceLabel: "BLM Arizona National Conservation Lands",
    sourceUrl: "https://gis.blm.gov/azarcgis/rest/services/nlcs/BLM_AZ_NMNCA/FeatureServer/0",
    endpoint: "https://gis.blm.gov/azarcgis/rest/services/nlcs/BLM_AZ_NMNCA/FeatureServer/0/query",
    where: "NLCS_ID IN ('NLCS000056','NLCS000112')",
    nameField: "NLCS_NAME",
    nameOverrides: {
      "Vermilion Cliffs": "Vermilion Cliffs National Monument",
      "Baaj Nwaavjo I'tah Kukveni - Ancestral Footprints of the Grand Canyon": "Baaj Nwaavjo I'tah Kukveni – Ancestral Footprints of the Grand Canyon National Monument",
    },
    geometryNote: "BLM Arizona boundary service for northern Arizona national monuments; thematic display only, not a survey or legal boundary.",
  },
  {
    id: "beaver-dam-wash",
    name: "Beaver Dam Wash National Conservation Area",
    shortName: "Beaver Dam Wash",
    kind: "recreation_area",
    jurisdiction: "Bureau of Land Management, Utah",
    sourceLabel: "BLM Utah National Conservation Lands",
    sourceUrl: "https://gis.blm.gov/utarcgis/rest/services/NLCS/BLM_UT_NMNCA/FeatureServer/1",
    endpoint: "https://gis.blm.gov/utarcgis/rest/services/NLCS/BLM_UT_NMNCA/FeatureServer/1/query",
    where: "NLCS_ID='NLCS000854'",
    nameField: "NLCS_NAME",
    nameOverrides: { "Beaver Dam Wash": "Beaver Dam Wash National Conservation Area" },
    geometryNote: "BLM Utah boundary service for the Beaver Dam Wash National Conservation Area; thematic display only, not a survey or legal boundary.",
  },
  {
    id: "nevada-state-parks",
    name: "Nevada regional state parks",
    shortName: "Nevada state parks",
    kind: "regional_neighbor",
    jurisdiction: "Nevada State Parks",
    sourceLabel: "USGS PAD-US reference geometry",
    sourceUrl: "https://data.usgs.gov/datacatalog/data/USGS:652ef930d34edd15305a9b03",
    endpoint: "https://arcgis.netl.doe.gov/server/rest/services/Hosted/Protected_Areas_Database_for_the_United_States_PADUS/FeatureServer/32/query",
    where: "loc_ds IN ('Cathedral Gorge State Park','Valley of Fire State Park')",
    nameField: "loc_ds",
    geometryNote: "USGS PAD-US reference geometry for Nevada regional-neighbor state parks.",
  },
];

// A single treatment keeps this contextual layer readable without assigning
// hierarchy or status through color; labels retain each area's identity.
export const PROTECTED_AREA_COLORS: Record<ProtectedAreaKind, { stroke: string; fill: string; label: string }> = {
  national_park: { stroke: "#6A3D9A", fill: "#8E5BBC", label: "Protected Area" },
  national_monument: { stroke: "#6A3D9A", fill: "#8E5BBC", label: "Protected Area" },
  recreation_area: { stroke: "#6A3D9A", fill: "#8E5BBC", label: "Protected Area" },
  state_park: { stroke: "#6A3D9A", fill: "#8E5BBC", label: "Protected Area" },
  regional_neighbor: { stroke: "#6A3D9A", fill: "#8E5BBC", label: "Protected Area" },
};
