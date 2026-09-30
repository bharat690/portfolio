import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { artifacts, achievementDetails, contactDetails, educationDetails, projectDetails, sectionCopy, skillDetails, type ArtifactId, type SectionId } from '../data/portfolio';
import { useReducedMotion } from '../state/useReducedMotion';

const PortfolioScene = lazy(() => import('../scene/PortfolioScene').then((module) => ({ default: module.PortfolioScene })));

const navigation: Array<{ section: SectionId; label: string }> = [
  { section: 'home', label: 'HOME' },
  { section: 'projects', label: 'PROJECTS' },
  { section: 'skills', label: 'SKILLS' },
  { section: 'about', label: 'ABOUT' },
  { section: 'contact', label: 'CONTACT' },
  { section: 'achievements', label: 'CITATIONS' },
];

function SectionContent({ section }: { section: SectionId }) {
  if (section === 'projects' && projectDetails.length > 0) {
    return <div className="content-list">{projectDetails.map((project) => (
      <article className="content-entry" key={project.name}>
        <h3>{project.name}</h3>
        <p>{project.summary}</p>
        <p className="tech-line">{project.technologies.join(' / ')}</p>
        <div className="entry-links">
          {project.github && <a href={project.github} target="_blank" rel="noreferrer">GITHUB ↗</a>}
          {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">LIVE DEMO ↗</a>}
        </div>
      </article>
    ))}</div>;
  }

  if (section === 'skills' && skillDetails.length > 0) {
    return <ul className="detail-list">{skillDetails.map((skill) => <li key={skill}>{skill}</li>)}</ul>;
  }
  if (section === 'achievements' && achievementDetails.length > 0) {
    return <ul className="detail-list">{achievementDetails.map((item) => <li key={item}>{item}</li>)}</ul>;
  }
  if (section === 'about' && educationDetails.length > 0) {
    return <ul className="detail-list">{educationDetails.map((item) => <li key={item}>{item}</li>)}</ul>;
  }
  if (section === 'contact' && contactDetails.length > 0) {
    return <ul className="detail-list">{contactDetails.map((item) => (
      <li key={item.label}>
        <span>{item.label}</span>
        {item.href ? <a href={item.href}>{item.value} ↗</a> : <span>{item.value}</span>}
      </li>
    ))}</ul>;
  }
  return <ul className="detail-list">{sectionCopy[section].details.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactId | null>(null);
  const [hoveredArtifact, setHoveredArtifact] = useState<ArtifactId | null>(null);
  const reducedMotion = useReducedMotion();
  const homeButton = useRef<HTMLButtonElement>(null);

  const hovered = useMemo(() => artifacts.find((item) => item.id === hoveredArtifact), [hoveredArtifact]);
  const selected = useMemo(() => artifacts.find((item) => item.id === selectedArtifact), [selectedArtifact]);

  const openArtifact = (id: ArtifactId) => {
    const artifact = artifacts.find((item) => item.id === id);
    if (!artifact) return;
    setActiveSection(artifact.section);
    setSelectedArtifact(id);
  };

  const activateSection = (section: SectionId) => {
    setActiveSection(section);
    setSelectedArtifact(artifacts.find((item) => item.section === section)?.id ?? null);
  };

  const closePanel = () => {
    setSelectedArtifact(null);
    setActiveSection('home');
    homeButton.current?.focus();
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedArtifact) closePanel();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedArtifact]);

  return (
    <main className="portfolio" data-reduced-motion={reducedMotion}>
      <Suspense fallback={null}>
        <PortfolioScene
          hoveredArtifact={hoveredArtifact}
          selectedArtifact={selectedArtifact}
          onHoverArtifact={setHoveredArtifact}
          onSelectArtifact={openArtifact}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      <div className="grain" aria-hidden="true" />
      <header className="topbar">
        <div className="identity">
          <span className="wordmark">BR<span className="red-dot">.</span></span>
          <span className="identity-caption">BHARAT RAI <i>//</i> PERSONAL ARCHIVE</span>
        </div>
        <div className="system-state"><span className="status-light" /> SYSTEM ONLINE</div>
      </header>

      <section className="intro" aria-label="Portfolio introduction">
        <p className="eyebrow"><span className="crosshair">+</span> FIELD RECORD // 0001</p>
        <h1>BHARAT<br />RAI<span className="red-dot">.</span></h1>
        <p className="role">AI / ML ENGINEER<br />BACKEND ENGINEER</p>
        <div className="intro-rule" />
        <p className="tagline">Build intelligent systems.<br />Build backend infrastructure.</p>
      </section>

      <div className="scene-caption" aria-hidden="true">
        <span>FIG. 01</span><span>ATTENTION STUDY // 01</span>
      </div>
      <div className="interaction-hint">
        <span className="hint-mark">⌖</span>
        <span>{hovered ? `${hovered.label} // ${hovered.category}` : 'MOVE // LOOK // INTERACT'}</span>
        <span className="hint-line" />
      </div>
      <p className="keyboard-hint">TAB TO NAVIGATE <span>·</span> ENTER TO OPEN <span>·</span> ESC TO CLOSE</p>

      {selected && (
        <aside className="artifact-panel" aria-labelledby="panel-title" aria-live="polite">
          <div className="panel-header">
            <div>
              <p className="panel-code">{selected.category} <span>// {selected.index}</span></p>
              <h2 id="panel-title">{sectionCopy[activeSection].title}</h2>
            </div>
            <button className="close-button" type="button" onClick={closePanel} aria-label="Close portfolio panel">
              <span aria-hidden="true">×</span><small>ESC</small>
            </button>
          </div>
          <p className="panel-description">{sectionCopy[activeSection].description}</p>
          <SectionContent section={activeSection} />
          <div className="panel-footer"><span>BHARAT RAI</span><span>END OF RECORD <b>■</b></span></div>
        </aside>
      )}

      <nav className="navigation" aria-label="Portfolio artifacts and sections">
        {navigation.map((item, index) => {
          const artifact = artifacts.find((entry) => entry.section === item.section);
          const active = activeSection === item.section;
          return (
            <button
              key={item.section}
              type="button"
              className={`nav-item${active ? ' active' : ''}`}
              onClick={() => activateSection(item.section)}
              onMouseEnter={() => artifact && setHoveredArtifact(artifact.id)}
              onMouseLeave={() => artifact && setHoveredArtifact(null)}
              aria-pressed={active}
              ref={item.section === 'home' ? homeButton : undefined}
            >
              <span className="nav-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="nav-label">{item.label}</span>
              {active && <span className="nav-indicator" />}
            </button>
          );
        })}
      </nav>
      <div className="edge-coordinate edge-left">SIGNAL // 01<br />MODE // ACTIVE</div>
      <div className="edge-coordinate edge-right">ENVIRONMENT<br />STABLE / 01</div>
    </main>
  );
}
