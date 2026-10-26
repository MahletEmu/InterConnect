import fs from 'fs';
const filePath = 'c:/interConnects/lib/data/internships.ts';
let code = fs.readFileSync(filePath, 'utf8');
code = code.replace(/postedDate:\s*'[^']*days\s*ago',/g, "postedDate: '',");
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully cleared all fake days-ago postedDate strings.');
