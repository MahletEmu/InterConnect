/**
 * Ethiopian University Departments, Universities, and Cities Data
 * Standardized across InterConnect student profiles, discovery filters, and company directories.
 */

export const ETHIOPIAN_DEPARTMENTS = [
  'Software Engineering',
  'Computer Science',
  'Information Technology',
  'Information Systems',
  'Electrical & Computer Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biomedical Engineering',
  'Chemical Engineering',
  'Architecture & Urban Planning',
  'Accounting & Finance',
  'Business Management',
  'Marketing Management',
  'Economics',
  'Statistics & Data Analytics',
  'Law',
  'Health & Medical Sciences',
  'Medicine',
  'Nursing & Public Health',
  'Pharmacy',
  'Agriculture & Environmental Sciences',
  'Journalism & Communication',
  'Management Information Systems (MIS)',
  'Data Science',
  'Artificial Intelligence',
  'Cyber Security',
  'Industrial Engineering',
  'Electro-Mechanical Engineering',
  'Other',
] as const;

export type EthiopianDepartment = typeof ETHIOPIAN_DEPARTMENTS[number];

export const ETHIOPIAN_CITIES = [
  'Addis Ababa',
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
  'Jigjiga',
  'Remote / Nationwide',
] as const;

export type EthiopianCity = typeof ETHIOPIAN_CITIES[number];

/**
 * Intelligent matcher for Ethiopian cities and regions.
 * Correctly distinguishes similarly named hubs (Debre Markos, Debre Tabor, Debre Birhan)
 * and recognizes regional industrial plants and campuses.
 */
export function matchesEthiopianCity(
  company: { city?: string; location?: string },
  selectedCity: string
): boolean {
  if (!selectedCity || selectedCity === 'All') return true;
  const target = selectedCity.toLowerCase().trim();
  const cCity = (company.city || '').toLowerCase().trim();
  const cLoc = (company.location || '').toLowerCase().trim();

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

export const ETHIOPIAN_UNIVERSITIES = [
  'Addis Ababa University (AAU / AAiT)',
  'Addis Ababa Science & Technology University (AASTU)',
  'Adama Science & Technology University (ASTU)',
  'Bahir Dar University (BDU)',
  'Hawassa University',
  'Jimma University',
  'Mekelle University',
  'University of Gondar',
  'Haramaya University',
  'Arba Minch University',
  'Wollo University (KIOT)',
  'Dilla University',
  'Debre Birhan University',
  'Wolaita Sodo University',
  'Dire Dawa University',
  'Ambo University',
  'Debre Markos University',
  'Wolkite University',
  'Semera University',
  'Jigjiga University',
  'Mizan-Tepi University',
  'Assosa University',
  'Madda Walabu University',
  'Kotebe Education University',
  'Wachemo University',
  'Bule Hora University',
  'Oda Bultum University',
  'Debre Tabor University',
  'Wollega University',
  'Gambella University',
  'Raya University',
  'Axum University',
  'Werabe University',
  'Kebri Dehar University',
  'Selale University',
  'Borana University',
  'Jinka University',
  'Dembi Dolo University',
  'Injibara University',
  'Ethiopian Aviation University',
  'Civil Service University',
  'St. Mary\'s University',
  'Unity University',
  'HiLCoE School of Computer Science & Technology',
  'MicroLink Information Technology College',
  'Rift Valley University',
  'Admas University',
  'CPU College',
  'Hope University College',
  'Other University / College',
] as const;

export type EthiopianUniversity = typeof ETHIOPIAN_UNIVERSITIES[number];

// Common abbreviations and aliases for Ethiopian Universities
export const UNIVERSITY_ALIASES: Record<string, string> = {
  aau: 'Addis Ababa University (AAU / AAiT)',
  aait: 'Addis Ababa University (AAU / AAiT)',
  '4kilo': 'Addis Ababa University (AAU / AAiT)',
  '5kilo': 'Addis Ababa University (AAU / AAiT)',
  '6kilo': 'Addis Ababa University (AAU / AAiT)',
  'addis ababa university': 'Addis Ababa University (AAU / AAiT)',
  aastu: 'Addis Ababa Science & Technology University (AASTU)',
  'addis ababa science and technology university': 'Addis Ababa Science & Technology University (AASTU)',
  astu: 'Adama Science & Technology University (ASTU)',
  'adama university': 'Adama Science & Technology University (ASTU)',
  'adama science and technology university': 'Adama Science & Technology University (ASTU)',
  bdu: 'Bahir Dar University (BDU)',
  'bahir dar university': 'Bahir Dar University (BDU)',
  ju: 'Jimma University',
  'jimma university': 'Jimma University',
  mu: 'Mekelle University',
  'mekelle university': 'Mekelle University',
  hu: 'Hawassa University',
  'hawassa university': 'Hawassa University',
  uog: 'University of Gondar',
  gondar: 'University of Gondar',
  'gondar university': 'University of Gondar',
  'university of gondar': 'University of Gondar',
  amu: 'Arba Minch University',
  'arba minch university': 'Arba Minch University',
  dbu: 'Debre Birhan University',
  'debre birhan university': 'Debre Birhan University',
  wsu: 'Wolaita Sodo University',
  'wolaita sodo university': 'Wolaita Sodo University',
  ddu: 'Dire Dawa University',
  'dire dawa university': 'Dire Dawa University',
  hilcoe: 'HiLCoE School of Computer Science & Technology',
  'st mary': "St. Mary's University",
  "st. mary's": "St. Mary's University",
  stmary: "St. Mary's University",
  "st. mary's university": "St. Mary's University",
  unity: 'Unity University',
  'unity university': 'Unity University',
  aviation: 'Ethiopian Aviation University',
  eaa: 'Ethiopian Aviation University',
  kotebe: 'Kotebe Education University',
  'kotebe university': 'Kotebe Education University',
  wollo: 'Wollo University (KIOT)',
  'wollo university': 'Wollo University (KIOT)',
  kiot: 'Wollo University (KIOT)',
  haramaya: 'Haramaya University',
  'haramaya university': 'Haramaya University',
  dilla: 'Dilla University',
  'dilla university': 'Dilla University',
  ambo: 'Ambo University',
  'ambo university': 'Ambo University',
  'debre markos': 'Debre Markos University',
  'debre markos university': 'Debre Markos University',
  wolkite: 'Wolkite University',
  'wolkite university': 'Wolkite University',
  semera: 'Semera University',
  'semera university': 'Semera University',
  jigjiga: 'Jigjiga University',
  'jigjiga university': 'Jigjiga University',
  assosa: 'Assosa University',
  'assosa university': 'Assosa University',
  wachemo: 'Wachemo University',
  'wachemo university': 'Wachemo University',
  'rift valley': 'Rift Valley University',
  'rift valley university': 'Rift Valley University',
  admas: 'Admas University',
  'admas university': 'Admas University',
};

// Common abbreviations and aliases for Ethiopian Departments
export const DEPARTMENT_ALIASES: Record<string, string> = {
  se: 'Software Engineering',
  software: 'Software Engineering',
  'software eng': 'Software Engineering',
  'software engineering': 'Software Engineering',
  'software development': 'Software Engineering',
  cs: 'Computer Science',
  computer: 'Computer Science',
  'computer science': 'Computer Science',
  'comp sci': 'Computer Science',
  it: 'Information Technology',
  'information tech': 'Information Technology',
  'information technology': 'Information Technology',
  is: 'Information Systems',
  'information systems': 'Information Systems',
  mis: 'Management Information Systems (MIS)',
  ece: 'Electrical & Computer Engineering',
  'electrical engineering': 'Electrical & Computer Engineering',
  'electrical & computer engineering': 'Electrical & Computer Engineering',
  'electrical and computer engineering': 'Electrical & Computer Engineering',
  mechanical: 'Mechanical Engineering',
  'mechanical engineering': 'Mechanical Engineering',
  civil: 'Civil Engineering',
  'civil engineering': 'Civil Engineering',
  biomedical: 'Biomedical Engineering',
  'biomedical engineering': 'Biomedical Engineering',
  chemical: 'Chemical Engineering',
  'chemical engineering': 'Chemical Engineering',
  architecture: 'Architecture & Urban Planning',
  'architecture & urban planning': 'Architecture & Urban Planning',
  'architecture and urban planning': 'Architecture & Urban Planning',
  acc: 'Accounting & Finance',
  accounting: 'Accounting & Finance',
  'accounting & finance': 'Accounting & Finance',
  'accounting and finance': 'Accounting & Finance',
  finance: 'Accounting & Finance',
  mgmt: 'Business Management',
  management: 'Business Management',
  'business management': 'Business Management',
  marketing: 'Marketing Management',
  'marketing management': 'Marketing Management',
  econ: 'Economics',
  economics: 'Economics',
  stat: 'Statistics & Data Analytics',
  statistics: 'Statistics & Data Analytics',
  'statistics & data analytics': 'Statistics & Data Analytics',
  data: 'Data Science',
  'data science': 'Data Science',
  ai: 'Artificial Intelligence',
  'artificial intelligence': 'Artificial Intelligence',
  cyber: 'Cyber Security',
  'cyber security': 'Cyber Security',
  'cybersecurity': 'Cyber Security',
  law: 'Law',
  medicine: 'Medicine',
  health: 'Health & Medical Sciences',
  'health & medical sciences': 'Health & Medical Sciences',
  nurse: 'Nursing & Public Health',
  nursing: 'Nursing & Public Health',
  'nursing & public health': 'Nursing & Public Health',
  pharmacy: 'Pharmacy',
  agriculture: 'Agriculture & Environmental Sciences',
  'agriculture & environmental sciences': 'Agriculture & Environmental Sciences',
  journalism: 'Journalism & Communication',
  'journalism & communication': 'Journalism & Communication',
};

/**
 * Normalizes user input into a recognized Ethiopian University.
 * Returns the standardized name or null if invalid/meaningless.
 */
export function normalizeEthiopianUniversity(input: string): string | null {
  const clean = input.trim();
  if (!clean || clean.length < 2) return null;
  const lower = clean.toLowerCase();

  // Reject literal "Other" or "Other University"
  if (lower === 'other' || lower.startsWith('other university') || lower.startsWith('other college')) {
    return null;
  }

  // 1. Direct alias match
  if (UNIVERSITY_ALIASES[lower]) {
    return UNIVERSITY_ALIASES[lower];
  }

  // 2. Exact match in ETHIOPIAN_UNIVERSITIES (case-insensitive)
  const exact = ETHIOPIAN_UNIVERSITIES.find((u) => u !== 'Other University / College' && u.toLowerCase() === lower);
  if (exact) return exact;

  // 3. Meaningful match: university name starts with or contains the user query
  const matched = ETHIOPIAN_UNIVERSITIES.find((u) => {
    if (u === 'Other University / College') return false;
    const uLower = u.toLowerCase();
    const coreName = uLower.replace(/\s*\([^)]*\)/g, '').trim();
    return uLower.includes(lower) || (lower.length >= 4 && coreName.includes(lower));
  });
  if (matched) return matched;

  return null;
}

/**
 * Normalizes user input into a recognized Ethiopian Academic Department.
 * Returns the standardized name or null if invalid/meaningless.
 */
export function normalizeEthiopianDepartment(input: string): string | null {
  const clean = input.trim();
  if (!clean || clean.length < 2) return null;
  const lower = clean.toLowerCase();

  // Reject literal "Other"
  if (lower === 'other') {
    return null;
  }

  // 1. Direct alias match
  if (DEPARTMENT_ALIASES[lower]) {
    return DEPARTMENT_ALIASES[lower];
  }

  // 2. Exact match in ETHIOPIAN_DEPARTMENTS (case-insensitive)
  const exact = ETHIOPIAN_DEPARTMENTS.find((d) => d !== 'Other' && d.toLowerCase() === lower);
  if (exact) return exact;

  // 3. Meaningful match: department name contains the query (e.g. "software" -> "Software Engineering")
  const matched = ETHIOPIAN_DEPARTMENTS.find((d) => {
    if (d === 'Other') return false;
    const dLower = d.toLowerCase();
    return dLower.includes(lower) || (lower.length >= 4 && lower.includes(dLower));
  });
  if (matched) return matched;

  return null;
}

/**
 * Live search filter for suggestions while typing.
 */
export function getMatchingUniversities(query: string, limit = 5): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ETHIOPIAN_UNIVERSITIES.filter((u) => u !== 'Other University / College' && u.toLowerCase().includes(q)).slice(0, limit);
}

export function getMatchingDepartments(query: string, limit = 5): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ETHIOPIAN_DEPARTMENTS.filter((d) => d !== 'Other' && d.toLowerCase().includes(q)).slice(0, limit);
}

