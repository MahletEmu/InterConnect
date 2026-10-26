import fs from 'fs';

// Read internships.ts
const content = fs.readFileSync('lib/data/internships.ts', 'utf8');

// Parse objects roughly
const blocks = content.split(/\n\s*{\s*\n\s*id:\s*'/);
const internships = [];

for (let i = 1; i < blocks.length; i++) {
  const b = blocks[i];
  const idMatch = b.match(/^([^']+)'/);
  const titleMatch = b.match(/title:\s*'([^']+)'/);
  const deptMatch = b.match(/department:\s*'([^']+)'/);
  const locMatch = b.match(/location:\s*'([^']+)'/);
  const deadlineMatch = b.match(/applicationDeadline:\s*'([^']+)'/);
  const isExpMatch = b.match(/isExpired:\s*(true|false)/);
  const compMatch = b.match(/companyId:\s*'([^']+)'/);

  if (idMatch && titleMatch) {
    internships.push({
      id: idMatch[1],
      title: titleMatch[1],
      companyId: compMatch ? compMatch[1] : '',
      department: deptMatch ? deptMatch[1] : '',
      location: locMatch ? locMatch[1] : '',
      applicationDeadline: deadlineMatch ? deadlineMatch[1] : undefined,
      isExpired: isExpMatch ? isExpMatch[1] === 'true' : false,
      status: 'published',
      requiredSkills: []
    });
  }
}

console.log('Total verified internships in catalog:', internships.length);

function filterInternships(list, { keyword = '', department = 'All', city = 'All', showClosed = false }) {
  return list.filter((intern) => {
    if (!showClosed) {
      if (intern.isExpired) return false;
      if (intern.status && intern.status !== 'published') return false;
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const matchesTitle = intern.title.toLowerCase().includes(q);
      const matchesDept = intern.department.toLowerCase().includes(q);
      const matchesLoc = intern.location.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDept && !matchesLoc) {
        return false;
      }
    }

    if (department !== 'All') {
      const deptLower = department.toLowerCase().trim();
      const internDeptLower = (intern.department || '').toLowerCase().trim();
      const directMatch =
        internDeptLower === deptLower ||
        internDeptLower.includes(deptLower) ||
        deptLower.includes(internDeptLower);

      let semanticMatch = false;
      if (deptLower.includes('soft') && (internDeptLower.includes('comp') || internDeptLower.includes('info'))) semanticMatch = true;
      if (deptLower.includes('comp') && (internDeptLower.includes('soft') || internDeptLower.includes('info'))) semanticMatch = true;
      if ((deptLower.includes('health') || deptLower.includes('med')) && (internDeptLower.includes('med') || internDeptLower.includes('health') || internDeptLower.includes('nurs') || internDeptLower.includes('pharm'))) semanticMatch = true;
      if (deptLower.includes('civil') && (internDeptLower.includes('construct') || internDeptLower.includes('struct'))) semanticMatch = true;
      if (deptLower.includes('acc') && (internDeptLower.includes('fin') || internDeptLower.includes('bank'))) semanticMatch = true;

      if (!directMatch && !semanticMatch) return false;
    }

    return true;
  });
}

// 1. User's exact query: keyword = "Software Engineering", Department = "All"
console.log('\n=== Query: keyword = "Software Engineering" ===');
const resSoftware = filterInternships(internships, { keyword: 'Software Engineering' });
console.log(`Found: ${resSoftware.length} internships`);
resSoftware.forEach(item => console.log(`  * ${item.title} (${item.department}) [${item.location}]`));

// 2. Department = "Civil Engineering"
console.log('\n=== Query: department = "Civil Engineering" ===');
const resCivil = filterInternships(internships, { department: 'Civil Engineering' });
console.log(`Found: ${resCivil.length} internships`);
resCivil.forEach(item => console.log(`  * ${item.title} (${item.department}) [${item.location}]`));

// 3. Department = "Health & Medical Sciences"
console.log('\n=== Query: department = "Health & Medical Sciences" ===');
const resHealth = filterInternships(internships, { department: 'Health & Medical Sciences' });
console.log(`Found: ${resHealth.length} internships`);
resHealth.forEach(item => console.log(`  * ${item.title} (${item.department}) [${item.location}]`));

// 4. Department = "Accounting & Finance"
console.log('\n=== Query: department = "Accounting & Finance" ===');
const resFinance = filterInternships(internships, { department: 'Accounting & Finance' });
console.log(`Found: ${resFinance.length} internships`);
resFinance.forEach(item => console.log(`  * ${item.title} (${item.department}) [${item.location}]`));
