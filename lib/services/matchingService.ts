import { Student, Internship } from '@/types';

export interface HonestMatchEvaluation {
  isEvaluated: boolean;
  score: number | null;
  label: string;
  reasons: string[];
  missingProfileFields: string[];
  matchedSkills: string[];
  departmentMatch: boolean;
  locationMatch: boolean;
}

/**
 * Deterministic and honest matching evaluator.
 * Compares actual student department, verified skills, and location against genuine internship requirements.
 * Never invents arbitrary percentages or fake AI recommendations.
 */
export function evaluateHonestMatch(
  student: Student | null,
  internship: Internship
): HonestMatchEvaluation {
  // If student is not logged in or has no profile
  if (!student) {
    return {
      isEvaluated: false,
      score: null,
      label: 'Sign in to Evaluate Match',
      reasons: [],
      missingProfileFields: ['Sign in to view how your university field of study and skills align with this role.'],
      matchedSkills: [],
      departmentMatch: false,
      locationMatch: false,
    };
  }

  const reasons: string[] = [];
  const missingProfileFields: string[] = [];
  let departmentMatch = false;
  let locationMatch = false;

  // 1. Check for missing student profile fields
  const studentField = (student.fieldOfStudy || '').toLowerCase().trim();
  const studentDegree = (student.degree || '').toLowerCase().trim();
  const studentSkills = (student.skills || []).map((s) => s.name.toLowerCase().trim()).filter(Boolean);
  const studentLocation = (student.location || '').toLowerCase().trim();

  if (!studentField) {
    missingProfileFields.push('Add your field of study to check university academic alignment.');
  }
  if (studentSkills.length === 0) {
    missingProfileFields.push('Add your technical and professional skills to evaluate required skills alignment.');
  }
  if (!student.resumeUrl) {
    missingProfileFields.push('Upload your CV/resume in Profile Studio for rapid application review.');
  }

  // 2. Department / Academic Alignment
  const internDept = (internship.department || '').toLowerCase().trim();
  const companyFields = (internship.company?.internshipFields || []).map((f) => f.toLowerCase().trim());

  if (studentField) {
    const isDeptDirectMatch =
      internDept && (internDept.includes(studentField) || studentField.includes(internDept));
    const isCompanyFieldMatch = companyFields.some(
      (cf) => cf.includes(studentField) || studentField.includes(cf)
    );

    if (isDeptDirectMatch || isCompanyFieldMatch) {
      departmentMatch = true;
      reasons.push(`Academic alignment: Your field (${student.fieldOfStudy}) matches this role's target discipline.`);
    }
  }

  // 3. Technical & Professional Skills Alignment
  const required = (internship.requiredSkills || []).filter(Boolean);
  const matchedSkills: string[] = [];

  required.forEach((req) => {
    const reqLower = req.toLowerCase().trim();
    const isMatched = studentSkills.some(
      (sk) => sk === reqLower || sk.includes(reqLower) || reqLower.includes(sk)
    );
    if (isMatched) {
      matchedSkills.push(req);
    }
  });

  if (matchedSkills.length > 0) {
    reasons.push(
      `Skills match: ${matchedSkills.length} of ${required.length} required skill(s) on your profile (${matchedSkills.join(', ')}).`
    );
  } else if (required.length > 0 && studentSkills.length > 0) {
    // Note difference honestly
    reasons.push(
      `Skills note: None of the ${required.length} required skills (${required.slice(0, 3).join(', ')}) are currently listed on your profile.`
    );
  }

  // 4. Workplace & Location Alignment
  const internType = (internship.type || '').toLowerCase();
  const internLoc = (internship.location || '').toLowerCase();

  if (internType === 'remote') {
    locationMatch = true;
    reasons.push('Remote arrangement: Accessible for students located across all regions in Ethiopia.');
  } else if (studentLocation && (internLoc.includes(studentLocation) || studentLocation.includes(internLoc))) {
    locationMatch = true;
    reasons.push(`Location alignment: Office location (${internship.location}) matches your regional preference.`);
  }

  // 5. Compute Transparent, Honest Score
  // If the profile is essentially empty, do not show a misleading percentage
  if (!studentField && studentSkills.length === 0) {
    return {
      isEvaluated: true,
      score: null,
      label: 'Profile Incomplete',
      reasons: ['Complete your student profile with your department and skills to see personalized alignment.'],
      missingProfileFields,
      matchedSkills: [],
      departmentMatch: false,
      locationMatch: false,
    };
  }

  let points = 0;
  if (departmentMatch) points += 40;
  if (required.length > 0) {
    points += Math.round((matchedSkills.length / required.length) * 40);
  } else if (studentSkills.length > 0) {
    points += 20; // General skill presence
  }
  if (locationMatch) points += 20;

  const score = Math.min(100, Math.max(0, points));

  let label = 'General Alignment';
  if (score >= 70) label = 'Strong Profile Match';
  else if (score >= 40) label = 'Moderate Profile Match';
  else if (score > 0) label = 'Partial Match';

  return {
    isEvaluated: true,
    score,
    label,
    reasons,
    missingProfileFields,
    matchedSkills,
    departmentMatch,
    locationMatch,
  };
}
