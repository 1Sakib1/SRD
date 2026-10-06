/**
 * Regenerates public/data/return-points-nsw.json from OpenStreetMap.
 *
 *   node scripts/fetch-return-points.mjs
 *
 * Source: OpenStreetMap via the Overpass API, licensed ODbL. Attribution is
 * required wherever the data is displayed -- see the attribution shown on the map.
 *
 * NOTE ON COVERAGE: OSM is community-mapped and currently holds roughly 60 NSW
 * container-deposit points against 600+ real Return and Earn locations. This file
 * is therefore a partial view and the UI must say so and link to the official
 * finder. Do not present it as the complete list.
 */
// Public Overpass instances are frequently busy; try each in turn.
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

const query = `
[out:json][timeout:180];
area["ISO3166-2"="AU-NSW"][admin_level=4]->.nsw;
(
  node["amenity"="recycling"]["recycling:container_deposit"="yes"](area.nsw);
  node["amenity"="recycling"]["operator"~"TOMRA|Return and Earn|Return & Earn",i](area.nsw);
  node["amenity"="recycling"]["brand"~"Return and Earn|TOMRA",i](area.nsw);
  node["amenity"="vending_machine"]["vending"="bottle_return"](area.nsw);
  way["amenity"="recycling"]["recycling:container_deposit"="yes"](area.nsw);
);
out center body;
`;

const titleCase = (s) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());

function kind(tags) {
  if (tags.vending === 'bottle_return' || tags.amenity === 'vending_machine') return 'Reverse vending machine';
  if (/depot/i.test(tags.name || '') || tags.recycling_type === 'centre') return 'Depot';
  if (/automated|machine/i.test(tags.operator || '')) return 'Reverse vending machine';
  return 'Return point';
}

function address(t) {
  const parts = [
    [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' '),
    t['addr:suburb'] || t['addr:city'],
    t['addr:state'],
    t['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ');
}

async function runQuery() {
  let lastErr;
  for (const url of MIRRORS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'LitterPin/1.0 (recycling centre map; https://litterpin.org)',
          },
          body: new URLSearchParams({ data: query }),
        });
        if (res.ok) return await res.json();
        lastErr = new Error(`${url} returned ${res.status}`);
      } catch (e) {
        lastErr = e;
      }
      console.warn(`  ${url} attempt ${attempt} failed, retrying...`);
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  throw lastErr;
}

const raw = await runQuery();

const seen = new Set();
const points = [];
for (const el of raw.elements || []) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (typeof lat !== 'number' || typeof lng !== 'number') continue;
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (seen.has(key)) continue;          // same site mapped twice
  seen.add(key);
  const t = el.tags || {};
  points.push({
    id: `osm-${el.type}-${el.id}`,
    name: t.name || titleCase(t.operator || 'Return and Earn point'),
    kind: kind(t),
    lat, lng,
    address: address(t) || null,
    hours: t.opening_hours || null,
    operator: t.operator || t.brand || null,
    website: t.website || t['contact:website'] || null,
  });
}
points.sort((a, b) => a.name.localeCompare(b.name));

// A busy Overpass mirror can return 200 with an empty element list. Writing that
// would silently wipe the dataset, so refuse to overwrite on a suspicious result.
const { existsSync, readFileSync } = await import('node:fs');
const previous = existsSync('public/data/return-points-nsw.json')
  ? JSON.parse(readFileSync('public/data/return-points-nsw.json', 'utf8')).count ?? 0
  : 0;
if (points.length === 0) {
  throw new Error('Overpass returned 0 points - refusing to overwrite the dataset. Try again later.');
}
if (previous > 0 && points.length < previous * 0.5) {
  throw new Error(
    `Overpass returned ${points.length} points, down from ${previous}. That is a suspicious drop, ` +
    'so the dataset was left untouched. Re-run, and if it persists the query or OSM data has changed.'
  );
}

const out = {
  generatedAt: new Date().toISOString(),
  source: 'OpenStreetMap contributors (ODbL) via Overpass API',
  coverage: 'Partial. OSM is community-mapped and does not contain every NSW return point.',
  officialFinder: 'https://returnandearn.org.au/map',
  count: points.length,
  points,
};
const { writeFileSync } = await import('node:fs');
writeFileSync('public/data/return-points-nsw.json', JSON.stringify(out, null, 2) + '\n');
console.log(`Wrote ${points.length} return points to public/data/return-points-nsw.json`);
