import fs from 'fs';

// Let's inspect VERIFIED_ETHIOPIAN_COMPANIES
const compContent = fs.readFileSync('lib/data/verifiedCompanies.ts', 'utf8');

// Parse verified companies by ID
const compBlocks = compContent.split(/\n\s*{\s*\n\s*id:\s*'/);
const companyMap = {};
for (let i = 1; i < compBlocks.length; i++) {
  const b = compBlocks[i];
  const idMatch = b.match(/^([^']+)'/);
  const nameMatch = b.match(/name:\s*(['"])(.*?)\1/);
  const cityMatch = b.match(/city:\s*'([^']+)'/);
  const indMatch = b.match(/industry:\s*'([^']+)'/);
  const locMatch = b.match(/location:\s*'([^']+)'/);
  const emailMatch = b.match(/contactEmail:\s*'([^']+)'/);
  const webMatch = b.match(/website:\s*'([^']+)'/);
  const logoMatch = b.match(/logo:\s*'([^']+)'/);
  if (idMatch && nameMatch) {
    companyMap[idMatch[1]] = {
      id: idMatch[1],
      name: nameMatch[2],
      logo: logoMatch ? logoMatch[1] : 'CO',
      city: cityMatch ? cityMatch[1] : 'Addis Ababa',
      location: locMatch ? locMatch[1] : 'Ethiopia',
      industry: indMatch ? indMatch[1] : 'Technology',
      website: webMatch ? webMatch[1] : '',
      contactEmail: emailMatch ? emailMatch[1] : '',
      openPositionsCount: 1,
      verified: true
    };
  }
}

console.log('Parsed verified companies for linking:', Object.keys(companyMap).length);
