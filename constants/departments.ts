/**
 * Full ESUT department → faculty mapping.
 * Based on 2025/2026 supplementary admission list.
 * Used in onboarding step-1, filters, and admin panels.
 */

export interface DepartmentInfo {
  name: string;
  faculty: string;
  emoji: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  // Faculty of Agriculture and Natural Resource Management
  { name: 'Agronomy & Ecological Management', faculty: 'Agriculture and Natural Resource Management', emoji: '🌱' },
  { name: 'Animal Science & Fish Management', faculty: 'Agriculture and Natural Resource Management', emoji: '🐄' },
  { name: 'Agricultural Economics & Extension', faculty: 'Agriculture and Natural Resource Management', emoji: '🌾' },
  { name: 'Food Science and Technology', faculty: 'Agriculture and Natural Resource Management', emoji: '🍽️' },

  // Faculty of Physical Sciences
  { name: 'Computer Science', faculty: 'Physical Sciences', emoji: '💻' },
  { name: 'Industrial Physics', faculty: 'Physical Sciences', emoji: '⚛️' },
  { name: 'Mathematics', faculty: 'Physical Sciences', emoji: '📐' },
  { name: 'Statistics', faculty: 'Physical Sciences', emoji: '📊' },
  { name: 'Industrial Chemistry', faculty: 'Physical Sciences', emoji: '🧪' },
  { name: 'Geology & Mining', faculty: 'Physical Sciences', emoji: '⛏️' },

  // Faculty of Engineering
  { name: 'Agricultural Engineering', faculty: 'Engineering', emoji: '🚜' },
  { name: 'Chemical Engineering', faculty: 'Engineering', emoji: '⚗️' },
  { name: 'Metallurgical & Materials Engineering', faculty: 'Engineering', emoji: '🔧' },
  { name: 'Mechatronics Engineering', faculty: 'Engineering', emoji: '🤖' },
  { name: 'Biomedical Engineering', faculty: 'Engineering', emoji: '🏥' },

  // Faculty of Environmental Sciences
  { name: 'Architecture', faculty: 'Environmental Sciences', emoji: '🏛️' },
  { name: 'Building Technology', faculty: 'Environmental Sciences', emoji: '🧱' },
  { name: 'Quantity Surveying', faculty: 'Environmental Sciences', emoji: '📏' },
  { name: 'Surveying and Geoinformatics', faculty: 'Environmental Sciences', emoji: '📍' },
  { name: 'Environmental Management', faculty: 'Environmental Sciences', emoji: '🌍' },
  { name: 'Estate Management', faculty: 'Environmental Sciences', emoji: '🏠' },
  { name: 'Geography/Meteorology', faculty: 'Environmental Sciences', emoji: '🌦️' },
  { name: 'Urban & Regional Planning', faculty: 'Environmental Sciences', emoji: '🗺️' },

  // Faculty of Education
  { name: 'Biology Education', faculty: 'Education', emoji: '🧬' },
  { name: 'Physics Education', faculty: 'Education', emoji: '⚛️' },
  { name: 'Chemistry Education', faculty: 'Education', emoji: '🧪' },
  { name: 'Integrated Science Education', faculty: 'Education', emoji: '🔬' },
  { name: 'Agricultural Science Education', faculty: 'Education', emoji: '🌾' },
  { name: 'Technology & Vocational Education', faculty: 'Education', emoji: '🔩' },
  { name: 'Building/Woodwork Education', faculty: 'Education', emoji: '🪵' },
  { name: 'Electrical/Electronics Technology Education', faculty: 'Education', emoji: '⚡' },
  { name: 'Mechanical Technology Education', faculty: 'Education', emoji: '⚙️' },
  { name: 'Mathematics Education', faculty: 'Education', emoji: '📐' },
  { name: 'Computer Science Education', faculty: 'Education', emoji: '💻' },
  { name: 'Library and Information Science', faculty: 'Education', emoji: '📚' },
  { name: 'Human Kinetics and Health Education', faculty: 'Education', emoji: '🏃' },
  { name: 'Continuing Education and Development Studies', faculty: 'Education', emoji: '📖' },
  { name: 'Educational Foundation', faculty: 'Education', emoji: '🎓' },
  { name: 'Education Management', faculty: 'Education', emoji: '🏫' },
  { name: 'Guidance and Counselling', faculty: 'Education', emoji: '🤝' },
  { name: 'Educational Administration and Supervision', faculty: 'Education', emoji: '📋' },
  { name: 'Business and Entrepreneurship Education', faculty: 'Education', emoji: '💼' },

  // Faculty of Management Sciences
  { name: 'Banking and Finance', faculty: 'Management Sciences', emoji: '🏦' },
  { name: 'Marketing', faculty: 'Management Sciences', emoji: '📢' },
  { name: 'Cooperative Economics and Management', faculty: 'Management Sciences', emoji: '🤝' },
  { name: 'Insurance and Risk Management', faculty: 'Management Sciences', emoji: '🛡️' },

  // Faculty of Social Sciences & Humanities
  { name: 'History and International Studies', faculty: 'Social Sciences & Humanities', emoji: '📜' },
  { name: 'Sociology and Anthropology', faculty: 'Social Sciences & Humanities', emoji: '👥' },
  { name: 'Psychology', faculty: 'Social Sciences & Humanities', emoji: '🧠' },
  { name: 'English and Literary Studies', faculty: 'Social Sciences & Humanities', emoji: '✍️' },
  { name: 'Economics', faculty: 'Social Sciences & Humanities', emoji: '📈' },

  // Other Departments
  { name: 'Human Nutrition and Dietetics', faculty: 'Other', emoji: '🥗' },
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
// No regex restriction — ESUT has changed matric formats multiple times.
// Just validate it's not empty and is unique (checked in Firestore).

export function validateMatricNumber(matric: string): boolean {
  return matric.trim().length >= 3;
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
