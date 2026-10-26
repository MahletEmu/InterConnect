import fs from 'fs';

const verifiedFile = 'lib/data/verifiedCompanies.ts';
const additionsFile = 'scratch/test_regional_additions.mjs';

let verifiedCode = fs.readFileSync(verifiedFile, 'utf8');
const additionsCode = fs.readFileSync(additionsFile, 'utf8');

// Extract the array contents inside REGIONAL_ETHIOPIAN_COMPANIES
const startIdx = additionsCode.indexOf('export const REGIONAL_ETHIOPIAN_COMPANIES = [');
const arrayContent = additionsCode.substring(
  startIdx + 'export const REGIONAL_ETHIOPIAN_COMPANIES = ['.length,
  additionsCode.lastIndexOf('];')
).trim();

const targetMarker = "    isClaimed: false,\n  },\n];\n\n/**\n * Filter verified companies";

if (!verifiedCode.includes(targetMarker)) {
  console.error('Target marker not found!');
  process.exit(1);
}

const injection = `    isClaimed: false,
  },

  // =========================================================================
  // 10. REGIONAL UNIVERSITY & INDUSTRIAL HUBS (ACROSS ETHIOPIA)
  // Bahir Dar, Hawassa, Dire Dawa, Debre Markos, Debre Tabor, Gondar,
  // Adama, Jimma, Mekelle, Dessie, Debre Birhan, Harar, Arba Minch, Jigjiga
  // =========================================================================
  ${arrayContent}
];

/**
 * Filter verified companies`;

verifiedCode = verifiedCode.replace(targetMarker, injection);
fs.writeFileSync(verifiedFile, verifiedCode, 'utf8');
console.log('Successfully injected regional companies into', verifiedFile);
