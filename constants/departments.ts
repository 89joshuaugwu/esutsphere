/**
 * Full ESUT department → faculty mapping.
 * Used in onboarding step-1, filters, and admin panels.
 */

export interface DepartmentInfo {
  name: string;
  faculty: string;
  emoji: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  // Faculty of Physical Sciences
  { name: 'Computer Science', faculty: 'Physical Sciences', emoji: '💻' },
  { name: 'Industrial Chemistry', faculty: 'Physical Sciences', emoji: '🧪' },
  { name: 'Industrial Physics', faculty: 'Physical Sciences', emoji: '⚛️' },
  { name: 'Industrial Mathematics', faculty: 'Physical Sciences', emoji: '📐' },
  { name: 'Industrial Statistics', faculty: 'Physical Sciences', emoji: '📊' },
  { name: 'Geology and Mining', faculty: 'Physical Sciences', emoji: '⛏️' },
  // Faculty of Applied Natural Sciences
  { name: 'Applied Biology', faculty: 'Applied Natural Sciences', emoji: '🧬' },
  { name: 'Applied Biochemistry', faculty: 'Applied Natural Sciences', emoji: '🧫' },
  { name: 'Applied Microbiology', faculty: 'Applied Natural Sciences', emoji: '🔬' },
  // Faculty of Engineering
  { name: 'Electrical Engineering', faculty: 'Engineering', emoji: '⚡' },
  { name: 'Mechanical Engineering', faculty: 'Engineering', emoji: '⚙️' },
  { name: 'Civil Engineering', faculty: 'Engineering', emoji: '🏗️' },
  { name: 'Agricultural Engineering', faculty: 'Engineering', emoji: '🌾' },
  { name: 'Materials & Metallurgical Engineering', faculty: 'Engineering', emoji: '🔧' },
  // Faculty of Environmental Sciences
  { name: 'Architecture', faculty: 'Environmental Sciences', emoji: '🏛️' },
  { name: 'Urban & Regional Planning', faculty: 'Environmental Sciences', emoji: '🗺️' },
  { name: 'Estate Management', faculty: 'Environmental Sciences', emoji: '🏠' },
  { name: 'Surveying & Geoinformatics', faculty: 'Environmental Sciences', emoji: '📍' },
  { name: 'Building Technology', faculty: 'Environmental Sciences', emoji: '🧱' },
  // Faculty of Management Sciences
  { name: 'Business Administration', faculty: 'Management Sciences', emoji: '💼' },
  { name: 'Accounting', faculty: 'Management Sciences', emoji: '💰' },
  { name: 'Banking & Finance', faculty: 'Management Sciences', emoji: '🏦' },
  { name: 'Marketing', faculty: 'Management Sciences', emoji: '📢' },
  { name: 'Public Administration', faculty: 'Management Sciences', emoji: '🏛️' },
  // Faculty of Social Sciences
  { name: 'Economics', faculty: 'Social Sciences', emoji: '📈' },
  { name: 'Mass Communication', faculty: 'Social Sciences', emoji: '📺' },
  { name: 'Political Science', faculty: 'Social Sciences', emoji: '🗳️' },
  { name: 'Sociology', faculty: 'Social Sciences', emoji: '👥' },
  // Faculty of Law
  { name: 'Law', faculty: 'Law', emoji: '⚖️' },
  // Faculty of Pharmaceutical Sciences
  { name: 'Pharmacy', faculty: 'Pharmaceutical Sciences', emoji: '💊' },
  // Faculty of Education
  { name: 'Science Education', faculty: 'Education', emoji: '🎓' },
  { name: 'Arts Education', faculty: 'Education', emoji: '📚' },
  // College of Medicine
  { name: 'Medicine and Surgery', faculty: 'College of Medicine', emoji: '🩺' },
  { name: 'Nursing', faculty: 'College of Medicine', emoji: '👩‍⚕️' },
  { name: 'Medical Laboratory Science', faculty: 'College of Medicine', emoji: '🔬' },
  // Information Technology
  { name: 'Information Technology', faculty: 'Physical Sciences', emoji: '🖥️' },
];

export const DEPARTMENT_NAMES = DEPARTMENTS.map(d => d.name);

export const FACULTIES = [...new Set(DEPARTMENTS.map(d => d.faculty))];

export function getFacultyForDepartment(deptName: string): string {
  return DEPARTMENTS.find(d => d.name === deptName)?.faculty ?? '';
}

export function getDepartmentsByFaculty(faculty: string): DepartmentInfo[] {
  return DEPARTMENTS.filter(d => d.faculty === faculty);
}

// ─── LEVELS ──────────────────────────────────────────────────────

export const LEVELS = ['100', '200', '300', '400', '500', '600', 'PG'] as const;
export type Level = typeof LEVELS[number];

// ─── ACADEMIC SESSIONS ──────────────────────────────────────────

export function generateAcademicSessions(): string[] {
  const currentYear = new Date().getFullYear();
  const sessions: string[] = [];
  for (let year = currentYear; year >= 2015; year--) {
    sessions.push(`${year}/${year + 1}`);
  }
  return sessions;
}

export const ACADEMIC_SESSIONS = generateAcademicSessions();

// ─── CONTENT TYPES ──────────────────────────────────────────────

export const CONTENT_TYPES = [
  { value: 'notes', label: 'Notes', emoji: '📝', color: '#A855F7' },
  { value: 'past_questions', label: 'Past Questions', emoji: '📋', color: '#F59E0B' },
  { value: 'research', label: 'Research', emoji: '🔬', color: '#06B6D4' },
  { value: 'assignment', label: 'Assignment', emoji: '✏️', color: '#10B981' },
  { value: 'seminar', label: 'Seminar', emoji: '🎤', color: '#EC4899' },
  { value: 'textbook', label: 'Textbook', emoji: '📚', color: '#F97316' },
  { value: 'project', label: 'Project', emoji: '🛠️', color: '#8B5CF6' },
  { value: 'handout', label: 'Handout', emoji: '📄', color: '#94A3B8' },
] as const;

// ─── POST CATEGORIES ────────────────────────────────────────────

export const POST_CATEGORIES = [
  { value: 'campus_news', label: 'Campus News', emoji: '📰' },
  { value: 'academic', label: 'Academic', emoji: '🎓' },
  { value: 'tech', label: 'Technology', emoji: '💻' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'opinions', label: 'Opinions', emoji: '💭' },
  { value: 'lifestyle', label: 'Lifestyle', emoji: '🌟' },
] as const;

// ─── QUALIFICATION LEVELS ────────────────────────────────────────

export const QUALIFICATIONS = [
  { value: 'bsc', label: 'B.Sc' },
  { value: 'msc', label: 'M.Sc' },
  { value: 'phd', label: 'Ph.D' },
  { value: 'prof', label: 'Professor' },
] as const;

// ─── MATRIC VALIDATION ──────────────────────────────────────────

export const MATRIC_REGEX = /^\d{4}\/\d{6}\/[A-Z]{2,6}$/;

export function validateMatricNumber(matric: string): boolean {
  return MATRIC_REGEX.test(matric);
}

export function calculateLevel(yearOfEntry: string): string {
  const entryYear = parseInt(yearOfEntry.split('/')[0], 10);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  // Academic year starts in September
  const academicYear = currentMonth >= 8 ? currentYear : currentYear - 1;
  const yearsInSchool = academicYear - entryYear + 1;

  if (yearsInSchool <= 0) return '100';
  if (yearsInSchool >= 6) return '600';
  return `${yearsInSchool * 100}`;
}
