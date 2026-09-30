export type ArtifactId = 'medal' | 'badge' | 'magazine' | 'knife' | 'radio';
export type SectionId = 'home' | 'projects' | 'skills' | 'about' | 'contact' | 'achievements';

export interface Project {
  name: string;
  stage: string;
  summary: string;
  technologies: string[];
  demo?: string;
  result?: string;
  featured?: boolean;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Artifact {
  id: ArtifactId;
  label: string;
  section: SectionId;
  category: string;
  index: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export const profile = {
  name: 'Bharat Rai',
  primaryTitle: 'AI/ML ENGINEER',
  secondaryTitle: 'BACKEND ENGINEER',
  status: '3RD YEAR B.TECH CSE STUDENT',
  specialization: 'Artificial Intelligence & Machine Learning',
  university: 'COER University',
  degree: 'B.Tech in Computer Science Engineering · AI & ML Specialization',
  educationPeriod: '2024 — 2028',
  cgpa: '9.1 / 10',
  location: 'India',
  email: 'brai65917@gmail.com',
  website: 'https://bharatrai.online',
  github: 'https://github.com/bharat690',
  statement: 'I build intelligent systems, backend infrastructure, and AI-powered applications.',
  about: 'I am a Computer Science engineering student specializing in Artificial Intelligence and Machine Learning, with a focus on backend engineering and intelligent systems. I build applications that combine APIs, databases, machine-learning models, and AI systems into usable products. My current direction sits at the intersection of AI/ML, backend engineering, databases, system design, and software architecture.',
};

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
    description: 'AI/ML engineer · backend engineer · 3rd year B.Tech CSE student',
    details: [profile.statement],
  },
  projects: {
    eyebrow: 'ARCHIVE // PROJECTS',
    title: 'SELECTED PROJECTS',
    description: 'AI applications, backend systems, and work in progress.',
    details: [],
  },
  skills: {
    eyebrow: 'LOADOUT // SKILLS',
    title: 'TOOLS & SYSTEMS',
    description: 'Current stack, areas of focus, and technologies I am strengthening.',
    details: [],
  },
  about: {
    eyebrow: 'IDENTITY // 02',
    title: 'ABOUT',
    description: 'Computer Science student at COER University, focused on AI/ML, backend systems, and intelligent applications.',
    details: [],
  },
  contact: {
    eyebrow: 'COMMS // 05',
    title: 'OPEN CHANNEL',
    description: 'Open to software engineering internships, backend engineering opportunities, AI/ML projects, and technical collaborations.',
    details: [],
  },
  achievements: {
    eyebrow: 'ACHIEVEMENTS // 01',
    title: 'ACHIEVEMENTS',
    description: 'Verified milestones and engineering work.',
    details: [],
  },
};

export const projectDetails: Project[] = [
  {
    name: 'MEDTRACE',
    stage: 'FLAGSHIP',
    summary: 'A full-stack AI application for organizing patient reports and enabling contextual interaction with medical information over time. It explores document processing, retrieval-augmented generation, vector retrieval, and graph relationships. It does not diagnose or provide medical advice.',
    technologies: ['FastAPI', 'React', 'RAG', 'LLM', 'Neo4j', 'Vector Search', 'Document Processing', 'REST APIs', 'Cloud Deployment'],
    demo: 'https://medtrace.bharatrai.online/',
    featured: true,
  },
  {
    name: 'FLOWML',
    stage: 'CONCEPT',
    summary: 'A visual machine-learning workflow concept covering dataset preparation, model selection, training, evaluation, and export.',
    technologies: ['React', 'FastAPI', 'Python', 'Scikit-learn'],
  },
  {
    name: 'READFLOW',
    stage: 'IN PROGRESS',
    summary: 'An intelligent document-research project exploring document ingestion, embeddings, retrieval, and grounded answers. Listed technologies describe its direction, not a claim that every part is complete.',
    technologies: ['FastAPI', 'RAG', 'LLMs', 'Vector Search', 'PostgreSQL'],
  },
  {
    name: 'FULL-STACK AI PREDICTOR',
    stage: 'PROJECT',
    summary: 'A machine-learning application exposing a Random Forest prediction model through FastAPI, with Gemini-generated natural-language explanations.',
    technologies: ['Python', 'FastAPI', 'Pydantic', 'Random Forest', 'Gemini API', 'TypeScript'],
  },
  {
    name: 'AI PLACEMENT DASHBOARD',
    stage: 'PROJECT',
    summary: 'An interactive placement-data dashboard with hiring-trend analysis, resume-based readiness insights, and skill-gap analysis.',
    technologies: ['Python', 'Streamlit', 'Pandas', 'Gemini API'],
    result: 'Reported result: the skill-gap workflow reduced manual evaluation time by 70%.',
  },
  {
    name: 'TASK ORGANIZER & VISUALIZER',
    stage: 'PROJECT',
    summary: 'A productivity application for task and deadline tracking, automated SMS reminders, and weekly and monthly analytics.',
    technologies: ['Python', 'Flask', 'SQL', 'Matplotlib', 'Twilio API'],
  },
  {
    name: 'TEACHER ARRANGEMENT MANAGER',
    stage: 'PROJECT',
    summary: 'A Python and MySQL application for teacher-arrangement and scheduling workflows.',
    technologies: ['Python', 'Tkinter', 'MySQL', 'Database Design'],
  },
];

export const currentStack: SkillGroup[] = [
  { category: 'LANGUAGES', items: ['Python', 'C/C++', 'JavaScript', 'SQL'] },
  { category: 'BACKEND', items: ['FastAPI', 'Flask', 'REST APIs', 'Pydantic'] },
  { category: 'DATABASES', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Neo4j', 'Redis'] },
  { category: 'AI / ML', items: ['Machine Learning', 'Scikit-learn', 'TensorFlow', 'LLM Integration', 'RAG', 'Embeddings', 'Vector Search', 'Computer Vision', 'Gemini API'] },
  { category: 'FRONTEND', items: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Three.js'] },
  { category: 'TOOLS', items: ['Git', 'Linux', 'Docker', 'AWS — Basics'] },
  { category: 'COMPUTER SCIENCE', items: ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Object-Oriented Programming'] },
];

export const learningFocus = [
  'SQLAlchemy',
  'Alembic',
  'JWT Authentication',
  'Async Programming',
  'Docker Compose',
  'Redis Caching',
  'Microservices',
  'AWS',
  'CI/CD',
  'System Design',
  'Distributed Systems',
];

export const focusAreas = [
  'Backend Engineering',
  'AI / Machine Learning',
  'AI Applications',
  'Database Systems',
  'System Design',
  'Software Architecture',
  'Data Structures & Algorithms',
  'Cloud / Deployment',
];

export const engineeringJourney = [
  { phase: 'EARLY', focus: 'Python · SQL · desktop applications · databases' },
  { phase: 'THEN', focus: 'Flask · REST APIs · machine learning · data applications' },
  { phase: 'THEN', focus: 'FastAPI · React · PostgreSQL · backend systems' },
  { phase: 'CURRENT', focus: 'RAG · LLM applications · vector search · Neo4j · AI systems' },
  { phase: 'NEXT', focus: 'Distributed systems · scalable backend architecture · production engineering' },
];

export const philosophy = {
  statement: 'BUILD. BREAK. UNDERSTAND. REBUILD BETTER.',
  description: 'Moving from “I can build it” toward “I understand the system.”',
};

export const achievementDetails = [
  'Solved 180+ LeetCode problems across graphs, dynamic programming, trees, linked lists, stacks, and queues.',
  'Built backend and AI-powered applications using Python, FastAPI, PostgreSQL, and REST APIs.',
  'Participated in HACK’N’TECH — Internal Hackathon 11.0 (2026); no placement claimed.',
  'Built and deployed full-stack AI and backend applications.',
];

export const educationDetails = [
  profile.status,
  profile.degree,
  profile.university,
  `Education period · ${profile.educationPeriod}`,
  `Current CGPA · ${profile.cgpa}`,
  `Location · ${profile.location}`,
];

export const contactDetails = [
  { label: 'EMAIL', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'WEBSITE', value: 'bharatrai.online', href: profile.website },
  { label: 'GITHUB', value: 'github.com/bharat690', href: profile.github },
];
