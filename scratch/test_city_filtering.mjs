import fs from 'fs';

const content = fs.readFileSync('lib/data/verifiedCompanies.ts', 'utf8');

const blocks = content.split(/\n\s*{\s*\n\s*id:\s*'/);
const companies = [];
for (let i = 1; i < blocks.length; i++) {
  const b = blocks[i];
  const idMatch = b.match(/^([^']+)'/);
  const nameMatch = b.match(/name:\s*(['"])(.*?)\1/);
  const cityMatch = b.match(/city:\s*'([^']+)'/);
  const indMatch = b.match(/industry:\s*'([^']+)'/);
  const locMatch = b.match(/location:\s*'([^']+)'/);
  if (idMatch && nameMatch && cityMatch) {
    companies.push({
      id: idMatch[1],
      name: nameMatch[2],
      city: cityMatch[1],
      location: locMatch ? locMatch[1] : '',
      industry: indMatch ? indMatch[1] : ''
    });
  }
}

export function matchesCity(comp, selectedCity) {
  if (!selectedCity || selectedCity === 'All') return true;
  const target = selectedCity.toLowerCase().trim();
  const cCity = (comp.city || '').toLowerCase().trim();
  const cLoc = (comp.location || '').toLowerCase().trim();

  if (cCity === target) return true;
  if (cCity.includes(target) || (target.length > 5 && target.includes(cCity))) return true;

  if (target === 'adama') {
    return cCity.includes('adama') || cCity.includes('bishoftu') || cLoc.includes('adama') || cLoc.includes('bishoftu');
  }
  if (target === 'dessie') {
    return cCity.includes('dessie') || cCity.includes('kombolcha') || cLoc.includes('dessie') || cLoc.includes('kombolcha');
  }
  if (target === 'debre markos') {
    return cCity.includes('debre markos') || cLoc.includes('debre markos');
  }
  if (target === 'debre tabor') {
    return cCity.includes('debre tabor') || cLoc.includes('debre tabor');
  }
  if (target === 'debre birhan') {
    return cCity.includes('debre birhan') || cCity.includes('debre berhan') || cLoc.includes('debre birhan') || cLoc.includes('debre berhan');
  }
  if (target === 'bahir dar') {
    return cCity.includes('bahir dar') || cLoc.includes('bahir dar');
  }
  if (target === 'hawassa') {
    return cCity.includes('hawassa') || cLoc.includes('hawassa');
  }
  if (target === 'dire dawa') {
    return cCity.includes('dire dawa') || cLoc.includes('dire dawa');
  }
  if (target === 'gondar') {
    if (cCity.includes('debre tabor') || cLoc.includes('debre tabor')) return false;
    return cCity.includes('gondar') || cLoc.includes('gondar');
  }
  if (target === 'jimma') {
    return cCity.includes('jimma') || cLoc.includes('jimma');
  }
  if (target === 'mekelle') {
    return cCity.includes('mekelle') || cLoc.includes('mekelle');
  }
  if (target === 'harar') {
    return cCity.includes('harar') || cLoc.includes('harar');
  }
  if (target === 'arba minch') {
    return cCity.includes('arba minch') || cLoc.includes('arba minch');
  }
  if (target === 'jigjiga') {
    return cCity.includes('jigjiga') || cLoc.includes('jigjiga');
  }
  if (target === 'addis ababa') {
    return cCity.includes('addis ababa') || cLoc.includes('addis ababa');
  }

  return false;
}

const TEST_CITIES = [
  'Bahir Dar',
  'Hawassa',
  'Dire Dawa',
  'Debre Markos',
  'Debre Tabor',
  'Gondar',
  'Adama',
  'Jimma',
  'Mekelle',
  'Dessie',
  'Debre Birhan',
  'Harar',
  'Arba Minch',
  'Jigjiga'
];

TEST_CITIES.forEach(c => {
  const matches = companies.filter(comp => matchesCity(comp, c));
  console.log(`\n[${c}]: ${matches.length} organizations`);
  matches.forEach(m => console.log(`  - ${m.name} (${m.city})`));
});
