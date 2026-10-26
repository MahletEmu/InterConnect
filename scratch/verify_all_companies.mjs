import fs from 'fs';

const content = fs.readFileSync('lib/data/verifiedCompanies.ts', 'utf8');

const regex = /id:\s*'([^']+)',\s*\n\s*name:\s*(['"])(.*?)\2,\s*\n\s*logo:\s*'([^']+)',\s*\n\s*industry:\s*'([^']+)',\s*\n\s*location:\s*'([^']+)',\s*\n\s*city:\s*'([^']+)'/gs;

const companies = [];
// Safe block splitter
const blocks = content.split(/\n\s*{\s*\n\s*id:\s*'/);
for (let i = 1; i < blocks.length; i++) {
  const b = blocks[i];
  const idMatch = b.match(/^([^']+)'/);
  const nameMatch = b.match(/name:\s*(['"])(.*?)\1/);
  const cityMatch = b.match(/city:\s*'([^']+)'/);
  const indMatch = b.match(/industry:\s*'([^']+)'/);
  if (idMatch && nameMatch && cityMatch) {
    companies.push({
      id: idMatch[1],
      name: nameMatch[2],
      city: cityMatch[1],
      industry: indMatch ? indMatch[1] : ''
    });
  }
}

console.log('Total verified companies in directory:', companies.length);

const cityCounts = {};
companies.forEach(c => {
  cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
});

console.log('\n=== Distribution per City ===');
for (const [city, count] of Object.entries(cityCounts)) {
  console.log(`  ${city.padEnd(20)}: ${count} organizations`);
}
