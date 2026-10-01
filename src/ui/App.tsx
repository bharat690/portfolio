import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  artifacts,
  achievementDetails,
  contactDetails,
  currentStack,
  educationDetails,
  engineeringJourney,
  focusAreas,
  learningFocus,
  philosophy,
  profile,
  projectDetails,
  sectionCopy,
  type ArtifactId,
  type SectionId,
} from '../data/portfolio';
import { useReducedMotion } from '../state/useReducedMotion';

const PortfolioScene = lazy(() => import('../scene/PortfolioScene').then((module) => ({ default: module.PortfolioScene })));

const navigation: Array<{ section: SectionId; label: string }> = [
  { section: 'home', label: 'HOME' },
  { section: 'projects', label: 'PROJECTS' },
  { section: 'skills', label: 'SKILLS' },
  { section: 'about', label: 'ABOUT' },
  { section: 'contact', label: 'CONTACT' },
  { section: 'achievements', label: 'ACHIEVEMENTS' },
];

function SectionContent({ section }: { section: SectionId }) {
  if (section === 'projects' && projectDetails.length > 0) {
    return <div className="content-list">{projectDetails.map((project) => (
      <article className={`content-entry${project.featured ? ' featured-project' : ''}`} key={project.name}>
        <div className="project-heading">
          <h3>{project.name}</h3>
          <span className="project-stage">{project.stage}</span>
        </div>
        <p>{project.summary}</p>
        <p className="tech-line">{project.technologies.join(' / ')}</p>
        {project.result && <p className="project-result">{project.result}</p>}
        <div className="entry-links">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${project.name} live demo in a new tab`}
            >
              LIVE DEMO ↗
            </a>
          )}
        </div>
      </article>
    ))}</div>;
  }

  if (section === 'skills') {
    return (
      <div className="skills-content">
        <h3 className="stack-heading">CURRENT STACK</h3>
        <div className="skill-groups">
          {currentStack.map((group) => (
            <section className="skill-group" key={group.category}>
              <h3>{group.category}</h3>
              <p>{group.items.join(' · ')}</p>
            </section>
          ))}
        </div>
        <section className="learning-group">
          <h3>CURRENTLY LEARNING</h3>
          <p>{learningFocus.join(' · ')}</p>
        </section>
        <section className="focus-group">
          <h3>ENGINEERING FOCUS</h3>
          <p>{focusAreas.join(' · ')}</p>
        </section>
      </div>
    );
  }
  if (section === 'achievements') {
    return <ul className="detail-list">{achievementDetails.map((item) => <li key={item}>{item}</li>)}</ul>;
  }
  if (section === 'about') {
    return (
      <div className="about-content">
        <p className="about-summary">{profile.about}</p>
        <ul className="detail-list">{educationDetails.map((item) => <li key={item}>{item}</li>)}</ul>
        <section className="journey">
          <h3>ENGINEERING JOURNEY</h3>
          {engineeringJourney.map((step) => (
            <p key={`${step.phase}-${step.focus}`}><span>{step.phase}</span>{step.focus}</p>
          ))}
        </section>
        <section className="philosophy">
          <h3>{philosophy.statement}</h3>
          <p>{philosophy.description}</p>
        </section>
      </div>
    );
  }
  if (section === 'contact') {
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
  const cursorRef = useRef<HTMLDivElement>(null);
  const panelDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelPointerInside = useRef(false);
  const selectedFromArtifact = useRef(false);

  const hovered = useMemo(() => artifacts.find((item) => item.id === hoveredArtifact), [hoveredArtifact]);
  const selected = useMemo(() => artifacts.find((item) => item.id === selectedArtifact), [selectedArtifact]);
  const cursorArtifact = selected ?? hovered;

  const cancelPanelDismiss = () => {
    if (panelDismissTimer.current !== null) {
      clearTimeout(panelDismissTimer.current);
      panelDismissTimer.current = null;
    }
  };

  const dismissPanelSoon = () => {
    cancelPanelDismiss();
    panelDismissTimer.current = setTimeout(() => {
      panelDismissTimer.current = null;
      if (!panelPointerInside.current) closePanel(false);
    }, 450);
  };

  useEffect(() => () => {
    if (panelDismissTimer.current !== null) clearTimeout(panelDismissTimer.current);
  }, []);

  const handleArtifactHover = (id: ArtifactId | null) => {
    setHoveredArtifact(id);
    if (id === selectedArtifact) cancelPanelDismiss();
    else if (id === null && selectedFromArtifact.current) dismissPanelSoon();
  };

  useEffect(() => {
    const followPointer = (event: PointerEvent) => {
      cursorRef.current?.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursorRef.current?.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', followPointer, { passive: true });
    return () => window.removeEventListener('pointermove', followPointer);
  }, []);

  const openArtifact = (id: ArtifactId) => {
    const artifact = artifacts.find((item) => item.id === id);
    if (!artifact) return;
    cancelPanelDismiss();
    selectedFromArtifact.current = true;
    setActiveSection(artifact.section);
    setSelectedArtifact(id);
  };

  const activateSection = (section: SectionId) => {
    cancelPanelDismiss();
    selectedFromArtifact.current = false;
    setActiveSection(section);
    setSelectedArtifact(artifacts.find((item) => item.section === section)?.id ?? null);
  };

  const closePanel = (restoreFocus = true) => {
    cancelPanelDismiss();
    panelPointerInside.current = false;
    selectedFromArtifact.current = false;
    setSelectedArtifact(null);
    setActiveSection('home');
    if (restoreFocus) homeButton.current?.focus();
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
          onHoverArtifact={handleArtifactHover}
          onSelectArtifact={openArtifact}
          reducedMotion={reducedMotion}
        />
      </Suspense>
      <div className="grain" aria-hidden="true" />
      <div
        ref={cursorRef}
        className={`attention-cursor${cursorArtifact ? ' is-targeted' : ''}`}
        aria-hidden="true"
      >
        <span className="cursor-glyph">{cursorArtifact ? '◉' : '+'}</span>
        {cursorArtifact && <span className="cursor-label">{cursorArtifact.label}</span>}
      </div>
      <header className="topbar">
        <div className="identity">
          <a className="wordmark" href={profile.website} aria-label="Bharat Rai portfolio home">
            BR<span className="red-dot">.</span>
          </a>
          <span className="identity-caption">{profile.name.toUpperCase()} <i>//</i> PERSONAL ARCHIVE</span>
        </div>
        <div className="system-state"><span className="status-light" /> SYSTEM ONLINE</div>
      </header>

      <section className="intro" aria-label="Portfolio introduction">
        <p className="eyebrow"><span className="crosshair">+</span> FIELD RECORD // 0001</p>
        <h1>BHARAT<br />RAI<span className="red-dot">.</span></h1>
        <p className="role">{profile.primaryTitle}<br />{profile.secondaryTitle}</p>
        <p className="student-status">{profile.status} · {profile.specialization}</p>
        <div className="intro-rule" />
        <p className="tagline">{profile.statement}</p>
      </section>

      <div className="scene-caption" aria-hidden="true">
        <span>FIG. 01</span><span>ATTENTION STUDY // 01</span>
      </div>
      <div className="interaction-hint">
        <span className="hint-mark">⌖</span>
        <span>{cursorArtifact ? `${cursorArtifact.label} // ${cursorArtifact.category}` : 'MOVE // LOOK // INTERACT'}</span>
        <span className="hint-line" />
      </div>
      <p className="keyboard-hint">TAB TO NAVIGATE <span>·</span> ENTER TO OPEN <span>·</span> ESC TO CLOSE</p>

      {selected && (
        <aside
          id="artifact-panel"
          className={`artifact-panel${selected.position[0] > 0 ? ' panel-left' : ''}${selected.position[1] < 0 ? ' panel-top' : ''}`}
          aria-labelledby="panel-title"
          aria-live="polite"
          onPointerEnter={() => {
            panelPointerInside.current = true;
            cancelPanelDismiss();
          }}
          onPointerLeave={() => {
            panelPointerInside.current = false;
            if (selectedFromArtifact.current) dismissPanelSoon();
            else closePanel(false);
          }}
        >
          <div className="panel-header">
            <div>
              <p className="panel-code">{selected.category} <span>// {selected.index}</span></p>
              <h2 id="panel-title">{sectionCopy[activeSection].title}</h2>
            </div>
            <button className="close-button" type="button" onClick={() => closePanel()} aria-label="Close portfolio panel">
              <span aria-hidden="true">×</span><small>ESC</small>
            </button>
          </div>
          <p className="panel-description">{sectionCopy[activeSection].description}</p>
          <SectionContent section={activeSection} />
          <div className="panel-footer"><span>{profile.name.toUpperCase()} · 2026</span><span>END OF RECORD <b>■</b></span></div>
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
              onMouseEnter={() => artifact && handleArtifactHover(artifact.id)}
              onMouseLeave={() => artifact && handleArtifactHover(null)}
              aria-pressed={active}
              aria-label={item.section === 'home'
                ? 'Return to home'
                : `Open ${artifact?.label.toLowerCase() ?? item.label.toLowerCase()} artifact${item.section === 'projects' ? ' and MedTrace project' : ` for ${item.label.toLowerCase()}`}`}
              aria-controls={activeSection === item.section && selectedArtifact ? 'artifact-panel' : undefined}
              ref={item.section === 'home' ? homeButton : undefined}
            >
              <span className="nav-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="nav-label">{item.section === 'achievements' ? 'ACHIEVEMENTS' : item.label}</span>
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
