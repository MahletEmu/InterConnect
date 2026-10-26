import fs from 'fs';

// Let's test getCompaniesMatchingDepartment across different Ethiopian departments
const content = fs.readFileSync('lib/data/verifiedCompanies.ts', 'utf8');

// Let's run a test using ts-node or transpiled execution
