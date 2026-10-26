import fs from 'fs';

const content = fs.readFileSync('lib/data/verifiedCompanies.ts', 'utf8');

// Parse objects
const regex = /{\s*id:\s*'([^']+)',\s*name:\s*(['"])(.*?)\2,\s*logo:\s*'([^']+)',\s*industry:\s*'([^']+)'/gs;
let match;
const companies = [];

// Safer parser: split by "id: '"
const blocks = content.split(/\n\s*{\s*\n\s*id:\s*'/);
for (let i = 1; i < blocks.length; i++) {
  const b = blocks[i];
  const idMatch = b.match(/^([^']+)'/);
  const nameMatch = b.match(/name:\s*(['"])(.*?)\1/);
  const indMatch = b.match(/industry:\s*'([^']+)'/);
  if (idMatch && nameMatch && indMatch) {
    companies.push({
      id: idMatch[1],
      name: nameMatch[2],
      industry: indMatch[1]
    });
  }
}

console.log('Total companies parsed:', companies.length);

export const INDUSTRY_OPTIONS = [
  'All',
  'Banking, Finance & Insurance',
  'Software, IT & Artificial Intelligence',
  'Telecommunications & Network Infrastructure',
  'Healthcare, Hospitals & Pharmaceuticals',
  'Civil Engineering, Construction & Architecture',
  'Aviation, Energy, Logistics & Transport',
  'Manufacturing, FMCG & Industrial Materials',
  'Agriculture, Agribusiness & Food Processing',
  'Law, Justice & Public Administration',
  'Media, Journalism & Communications'
];

export function matchesCompanyIndustry(compIndustry, filterCategory) {
  if (!filterCategory || filterCategory === 'All') return true;
  const ind = (compIndustry || '').toLowerCase();

  switch (filterCategory) {
    case 'Banking, Finance & Insurance':
      return (
        ind.includes('bank') ||
        ind.includes('financ') ||
        ind.includes('insur') ||
        ind.includes('payment') ||
        ind.includes('pos') ||
        ind.includes('fintech')
      );

    case 'Software, IT & Artificial Intelligence':
      return (
        ind.includes('software') ||
        ind.includes('artificial intelligence') ||
        ind.includes('robotics') ||
        ind.includes('cybersecurity') ||
        ind.includes('edtech') ||
        ind.includes('fintech') ||
        ind.includes('digital platforms') ||
        ind.includes('digital transformation') ||
        ind.includes('pos payments')
      );

    case 'Telecommunications & Network Infrastructure':
      return (
        ind.includes('telecom') ||
        ind.includes('ict') ||
        ind.includes('digital services') ||
        ind.includes('cybersecurity')
      );

    case 'Healthcare, Hospitals & Pharmaceuticals':
      return (
        ind.includes('health') ||
        ind.includes('medic') ||
        ind.includes('hospital') ||
        ind.includes('pharm') ||
        ind.includes('clinic') ||
        ind.includes('surgery') ||
        ind.includes('dermatology') ||
        ind.includes('burn care') ||
        ind.includes('epidemiology')
      );

    case 'Civil Engineering, Construction & Architecture':
      return (
        ind.includes('construction') ||
        ind.includes('civil') ||
        ind.includes('architecture') ||
        ind.includes('highways') ||
        ind.includes('bridges') ||
        ind.includes('building') ||
        ind.includes('prefab') ||
        ind.includes('water resources') ||
        ind.includes('hydraulics')
      );

    case 'Aviation, Energy, Logistics & Transport':
      return (
        ind.includes('aviation') ||
        ind.includes('energy') ||
        ind.includes('power') ||
        ind.includes('railway') ||
        ind.includes('shipping') ||
        ind.includes('logistics') ||
        ind.includes('dry ports') ||
        ind.includes('transport') ||
        ind.includes('grid') ||
        ind.includes('hydropower')
      );

    case 'Manufacturing, FMCG & Industrial Materials':
      return (
        ind.includes('cement') ||
        ind.includes('manufactur') ||
        ind.includes('beverage') ||
        ind.includes('brewing') ||
        ind.includes('fmcg') ||
        ind.includes('chemical') ||
        ind.includes('paint') ||
        ind.includes('bottling')
      );

    case 'Agriculture, Agribusiness & Food Processing':
      return (
        ind.includes('agricultur') ||
        ind.includes('agronomy') ||
        ind.includes('sugar') ||
        ind.includes('coffee') ||
        ind.includes('commodity') ||
        ind.includes('plantation') ||
        ind.includes('biodiversity')
      );

    case 'Law, Justice & Public Administration':
      return (
        ind.includes('law') ||
        ind.includes('justice') ||
        ind.includes('judiciary') ||
        ind.includes('human rights') ||
        ind.includes('investment') ||
        ind.includes('policy')
      );

    case 'Media, Journalism & Communications':
      return (
        ind.includes('media') ||
        ind.includes('broadcast') ||
        ind.includes('journalism') ||
        ind.includes('press') ||
        ind.includes('editorial') ||
        ind.includes('publishing') ||
        ind.includes('radio') ||
        ind.includes('news')
      );

    default:
      return ind.includes(filterCategory.toLowerCase());
  }
}

INDUSTRY_OPTIONS.filter(s => s !== 'All').forEach(sec => {
  const matches = companies.filter(c => matchesCompanyIndustry(c.industry, sec));
  console.log(`\n=== [${sec}] -> ${matches.length} organizations ===`);
  matches.forEach(c => console.log(`  * ${c.name} [${c.industry}]`));
});
