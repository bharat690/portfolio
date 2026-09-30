export type ArtifactId = 'medal' | 'badge' | 'magazine' | 'knife' | 'radio';
export type SectionId = 'home' | 'projects' | 'skills' | 'about' | 'contact' | 'achievements';

export interface Artifact {
  id: ArtifactId;
  label: string;
  section: SectionId;
  category: string;
  index: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export const artifacts: Artifact[] = [
  {
    id: 'medal',
    label: 'MEDAL',
    section: 'achievements',
    category: 'ACHIEVEMENTS',
    index: '01',
    position: [3.05, 1.95, -0.48],
    rotation: [0, 0, -0.12],
  },
  {
    id: 'badge',
    label: 'BADGE',
    section: 'about',
    category: 'IDENTITY // EDUCATION',
    index: '02',
    position: [-2.55, -1.55, -0.18],
    rotation: [0, -0.12, 0.1],
  },
  {
    id: 'radio',
    label: 'RADIO',
    section: 'contact',
    category: 'CONTACT',
    index: '05',
    position: [3.1, 0.65, 0.28],
    rotation: [0, -0.2, -0.08],
  },
  {
    id: 'magazine',
    label: 'FIELD NOTES',
    section: 'projects',
    category: 'PROJECTS',
    index: '03',
    position: [2.8, -1.7, -0.7],
    rotation: [0.08, 0.1, 0.18],
  },
  {
    id: 'knife',
    label: 'KNIFE',
    section: 'skills',
    category: 'SKILLS // TOOLS',
    index: '04',
    position: [3.1, -0.65, 0.45],
    rotation: [0, -0.08, -0.48],
  },
];

export const sectionCopy: Record<SectionId, { eyebrow: string; title: string; description: string; details: string[] }> = {
  home: {
    eyebrow: 'FIELD RECORD // 0001',
    title: 'BHARAT RAI',
    description: 'AI / ML ENGINEER  ·  BACKEND ENGINEER',
    details: ['Build intelligent systems.', 'Build backend infrastructure.'],
  },
  projects: {
    eyebrow: 'ARCHIVE // PROJECTS',
    title: 'ENGINEERING WORK',
    description: 'Project details have not been added yet.',
    details: ['Add project names, summaries, technologies, and links in src/data/portfolio.ts.'],
  },
  skills: {
    eyebrow: 'LOADOUT // SKILLS',
    title: 'TOOLS & SYSTEMS',
    description: 'Technical skills have not been added yet.',
    details: ['Add technologies and tools in src/data/portfolio.ts.'],
  },
  about: {
    eyebrow: 'IDENTITY // 02',
    title: 'ABOUT',
    description: 'Education and biography details have not been added yet.',
    details: ['Add a short biography and education history in src/data/portfolio.ts.'],
  },
  contact: {
    eyebrow: 'COMMS // 05',
    title: 'OPEN CHANNEL',
    description: 'Contact details have not been added yet.',
    details: ['Add an email address and preferred contact links in src/data/portfolio.ts.'],
  },
  achievements: {
    eyebrow: 'CITATIONS // 01',
    title: 'ACHIEVEMENTS',
    description: 'Achievement details have not been added yet.',
    details: ['Add awards, certifications, or accomplishments in src/data/portfolio.ts.'],
  },
};

export const projectDetails: Array<{ name: string; summary: string; technologies: string[]; github?: string; demo?: string }> = [];
export const skillDetails: string[] = [];
export const achievementDetails: string[] = [];
export const educationDetails: string[] = [];
export const contactDetails: Array<{ label: string; value: string; href?: string }> = [];
