// Mock data for Sydney locations

export interface LocationPoint {
  id: string;
  originalReportId?: string;
  lat: number;
  lng: number;
  address: string;
  reports: number;
  intensity: number; // 0-1 for heat map coloring
  photo?: string;
  type?: string;
  date?: string;
  stillThere?: number;
  gone?: number;
  cleaned?: number;
}

export const SYDNEY_LOCATIONS: LocationPoint[] = [
  {
    id: '1',
    lat: -33.8599,
    lng: 151.2111,
    address: 'The Rocks, Sydney NSW 2000',
    reports: 45,
    intensity: 0.9,
  },
  {
    id: '2',
    lat: -33.8616,
    lng: 151.2104,
    address: 'Circular Quay, Sydney NSW 2000',
    reports: 38,
    intensity: 0.75,
  },
  {
    id: '3',
    lat: -33.8688,
    lng: 151.2093,
    address: 'Sydney CBD, George St',
    reports: 52,
    intensity: 1.0,
  },
  {
    id: '4',
    lat: -33.8738,
    lng: 151.2062,
    address: 'Darling Harbour, Sydney NSW 2000',
    reports: 41,
    intensity: 0.8,
  },
  {
    id: '5',
    lat: -33.8571,
    lng: 151.2152,
    address: 'Sydney Opera House, Bennelong Point',
    reports: 28,
    intensity: 0.55,
  },
  {
    id: '6',
    lat: -33.8523,
    lng: 151.2108,
    address: 'Milsons Point, Sydney NSW 2061',
    reports: 22,
    intensity: 0.45,
  },
  {
    id: '7',
    lat: -33.8816,
    lng: 151.2008,
    address: 'Pyrmont, Sydney NSW 2009',
    reports: 35,
    intensity: 0.7,
  },
  {
    id: '8',
    lat: -33.8830,
    lng: 151.2167,
    address: 'Surry Hills, Sydney NSW 2010',
    reports: 31,
    intensity: 0.62,
  },
  {
    id: '9',
    lat: -33.8650,
    lng: 151.2094,
    address: 'Wynyard, Sydney NSW 2000',
    reports: 26,
    intensity: 0.52,
  },
  {
    id: '10',
    lat: -33.8848,
    lng: 151.2055,
    address: 'Haymarket, Sydney NSW 2000',
    reports: 33,
    intensity: 0.65,
  },
  {
    id: '11',
    lat: -33.8704,
    lng: 151.2244,
    address: 'Potts Point, Sydney NSW 2011',
    reports: 19,
    intensity: 0.38,
  },
  {
    id: '12',
    lat: -33.8915,
    lng: 151.2767,
    address: 'Bondi Junction, Sydney NSW 2022',
    reports: 24,
    intensity: 0.48,
  },
];

export const RUBBISH_TYPES = [
  'Plastic Waste (Bottles, Bags, Packaging)',
  'Food & Organic Waste',
  'Cigarette Butts & Vapes',
  'Paper & Cardboard',
  'Glass (Bottles, Broken Glass)',
  'Metal (Cans, Scrap)',
  'E-Waste (Electronics, Batteries)',
  'Large Items (Furniture, Appliances)',
  'Construction Debris',
  'Textiles & Clothing',
  'Medical / Hazardous Waste',
  'General Litter / Mixed',
  'Other',
];
