import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Award, Binary, BookOpen, Braces, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, Code2, Command, Cpu, Database,
  FileCode2, GitBranch, Globe2, GraduationCap, History, Lightbulb, ListChecks,
  Menu, PanelsTopLeft, Play, Plus, Repeat2, RotateCcw, Search,
  Send, ShieldCheck, Sigma, Sparkles, Terminal, Variable, Workflow, X, Zap
} from 'lucide-react';
import { chapters, visualCopy } from './data.js';
import { visualArabic } from './visualArabic.js';
import './style.css';

const iconMap = { Sparkles, History, Cpu, Binary, PanelsTopLeft, Blocks: Braces, Database, Globe2, Workflow, Code2, Variable, Sigma, GitBranch, Repeat2 };
const iconFor = (name, props = {}) => {
  const Icon = iconMap[name] || Code2;
  return <Icon size={18} strokeWidth={1.8} {...props} />;
};

function starterFor(chapter) {
  const extra = chapter.id === 4 ? '#include <bitset>\n' : chapter.id === 7 ? '#include <vector>\n' : '';
  const body = chapter.id === 9 || chapter.id === 15 ? '// Define your helper function above main' : '// Write your solution here';
  return `#include <iostream>\n${extra}\nusing namespace std;\n\nint main() {\n    ${body}\n    return 0;\n}`;
}

const solutions = {
  1: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << 6 + 4 << endl;\n    return 0;\n}`,
  2: `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        cout << i << endl;\n    }\n    return 0;\n}`,
  3: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int ramGB = 16;\n    cout << ramGB << endl;\n    return 0;\n}`,
  4: `#include <iostream>\n#include <bitset>\nusing namespace std;\n\nint main() {\n    bitset<8> b(42);\n    cout << b << endl;\n    return 0;\n}`,
  5: `#include <iostream>\nusing namespace std;\n\nint main() {\n    bool processAvailable = true;\n    if (processAvailable) {\n        cout << "READY" << endl;\n    } else {\n        cout << "WAIT" << endl;\n    }\n    return 0;\n}`,
  6: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n > 0) {\n        cout << "Positive" << endl;\n    } else {\n        cout << "Not positive" << endl;\n    }\n    return 0;\n}`,
  7: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> scores;\n    scores.push_back(85);\n    scores.push_back(90);\n    cout << scores.size() << endl;\n    return 0;\n}`,
  8: `#include <iostream>\n#include <string>\nusing namespace std;\n\nstruct Packet {\n    string destination;\n};\n\nint main() {\n    Packet p;\n    p.destination = "192.168.1.1";\n    cout << p.destination << endl;\n    return 0;\n}`,
  9: `#include <iostream>\nusing namespace std;\n\nint square(int n) {\n    return n * n;\n}\n\nint main() {\n    cout << square(4) << endl;\n    return 0;\n}`,
  10: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}`,
  11: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 20;\n    cout << age << endl;\n    return 0;\n}`,
  12: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << 17 % 5 << endl;\n    return 0;\n}`,
  13: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 50;\n    if (score >= 50) {\n        cout << "Pass" << endl;\n    } else {\n        cout << "Try again" << endl;\n    }\n    return 0;\n}`,
  14: `#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 5; i++) {\n        cout << i << endl;\n    }\n    return 0;\n}`,
  15: `#include <iostream>\nusing namespace std;\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    cout << add(3, 4) << endl;\n    return 0;\n}`,
};

function inspectAnswer(chapter, source) {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const issues = [];
  if (!code.trim()) issues.push({ en: 'Write a solution before checking.', ar: 'اكتب حلًا قبل التحقق.' });
  const counts = (a, b) => (code.match(new RegExp(`\\${a}`, 'g')) || []).length - (code.match(new RegExp(`\\${b}`, 'g')) || []).length;
  if (counts('{', '}') !== 0) issues.push({ en: 'Check that every { has a matching }.', ar: 'تأكد من وجود قوس } مقابل كل قوس {.' });
  if (counts('(', ')') !== 0) issues.push({ en: 'Check that parentheses are balanced.', ar: 'تأكد من توازن الأقواس الدائرية.' });
  const missing = chapter.exercise.checks.filter((item) => !item.re.test(code));
  return { passed: issues.length === 0 && missing.length === 0, issues, missing };
}

function BilingualText({ en, ar, className = '' }) {
  return <div className={`bilingual ${className}`}>
    <p className="english-copy">{en}</p>
    <p className="arabic-copy" lang="ar" dir="rtl">{ar}</p>
  </div>;
}

function Brand({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="CodeCraft home">
    <span className="brand-mark"><span>C</span><b>++</b></span>
    <span className="brand-name">code<span>craft</span><small>LEARN BY BUILDING</small></span>
  </button>;
}

function Topbar({ setView, mobileOpen, setMobileOpen, completedCount }) {
  return <header className="topbar">
    <div className="topbar-left">
      <button className="mobile-menu icon-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      <Brand onClick={() => setView('overview')} />
    </div>
    <div className="topbar-center"><span className="breadcrumb-muted">LEARNING PATH</span><ChevronRight size={14} /><span>Introduction to C++</span></div>
    <div className="topbar-right">
      <span className="streak"><Zap size={15} fill="currentColor" /> {completedCount} <span>chapters done</span></span>
      <button className="avatar" title="Learner profile">A</button>
    </div>
  </header>;
}

function Sidebar({ activeId, view, setView, chooseChapter, completed, filter, setFilter, mobileOpen }) {
  const shown = chapters.filter((chapter) => `${chapter.title} ${chapter.ar} ${chapter.area}`.toLowerCase().includes(filter.toLowerCase()));
  return <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
    <div className="course-mini">
      <div className="course-mini-icon"><Code2 size={18} /></div>
      <div><span className="eyebrow">YOUR COURSE</span><strong>Computer Science<br />+ C++</strong></div>
      <ChevronDown size={15} className="course-chevron" />
    </div>
    <div className="side-label">WORKSPACE</div>
    <button className={`nav-item ${view === 'overview' ? 'selected' : ''}`} onClick={() => setView('overview')}><PanelsTopLeft size={17} /> Overview <span className="nav-live-dot" /></button>
    <button className={`nav-item ${view === 'curriculum' ? 'selected' : ''}`} onClick={() => setView('curriculum')}><BookOpen size={17} /> Learning path <span className="nav-count">15</span></button>
    <button className={`nav-item ${view === 'practice' ? 'selected' : ''}`} onClick={() => setView('practice')}><Terminal size={17} /> Code practice <span className="nav-new">LAB</span></button>
    <div className="chapter-heading"><div className="side-label">COURSE CONTENT</div><span>{completed.size}/15</span></div>
    <label className="side-search"><Search size={14} /><input aria-label="Search chapters" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a chapter" /></label>
    <div className="chapter-nav">
      {shown.map((chapter) => <button key={chapter.id} className={`chapter-nav-item ${activeId === chapter.id && view === 'lesson' ? 'active' : ''}`} onClick={() => chooseChapter(chapter.id)}>
        <span className={`chapter-check ${completed.has(chapter.id) ? 'is-done' : ''}`}>{completed.has(chapter.id) ? <Check size={11} /> : String(chapter.id).padStart(2, '0')}</span>
        <span className="chapter-nav-copy"><span>{chapter.title}</span><small>{chapter.area}</small></span>
        <ChevronRight size={13} className="chapter-arrow" />
      </button>)}
      {shown.length === 0 && <p className="search-empty">No chapters match that search.</p>}
    </div>
    <div className="sidebar-bottom"><div className="daily-card"><span className="daily-orbit"><Sparkles size={15} /></span><div><strong>Keep your momentum</strong><p>One small concept at a time.</p></div><ArrowUpRight size={15} /></div><div className="sidebar-version"><span className="online-dot" /> COURSE EDITION <b>2025 / 26</b></div></div>
  </aside>;
}

function HeroArt() {
  return <div className="hero-art" aria-label="Animated three-dimensional programming concept illustration">
    <div className="art-glow" />
    <div className="orbit orbit-one"><i /><i /><i /></div><div className="orbit orbit-two"><i /><i /></div>
    <div className="hero-cube"><div className="cube-face cube-front"><span className="cube-brace">{'{ }'}</span><small>IDEA</small></div><div className="cube-face cube-right"><span>01</span><small>STEP</small></div><div className="cube-face cube-top"><Code2 size={23} /></div></div>
    <div className="float-chip chip-code"><span className="chip-pip" /> <code>cout &lt;&lt; idea;</code></div>
    <div className="float-chip chip-flow"><span>01</span><div><b>Logic unlocked</b><small>Input → process → output</small></div><CheckCircle2 size={17} /></div>
    <div className="art-caption"><span className="caption-line" /><span>THINK · BUILD · REPEAT</span></div>
  </div>;
}

function ProgressRing({ value }) {
  return <div className="progress-ring" style={{ '--progress': `${value}%` }}><div><strong>{value}%</strong><small>COMPLETE</small></div></div>;
}

function Dashboard({ completed, chooseChapter, setView }) {
  const percent = Math.round(completed.size / chapters.length * 100);
  const next = chapters.find((chapter) => !completed.has(chapter.id)) || chapters[0];
  return <div className="page dashboard-page">
    <div className="hero-card">
      <div className="hero-content">
        <div className="hero-kicker"><span className="kicker-dot" /> THE COMPLETE BEGINNER PATH <span className="hero-edition">2025 / 26</span></div>
        <h1>Think in steps.<br /><em>Build in C++.</em></h1>
        <BilingualText en="A guided journey from how computers think to how you write real C++ programs. Fifteen chapters, practical checkpoints, and visual explanations that make the abstract feel tangible." ar="رحلة تعليمية تبدأ من طريقة تفكير الحاسوب وتنتهي بكتابة برامج C++ بنفسك. خمسة عشر فصلًا وتدريبات عملية ورسوم توضيحية تجعل المفاهيم المجردة أقرب للفهم." className="hero-copy" />
        <div className="hero-actions"><button className="primary-button" onClick={() => chooseChapter(next.id)}>Continue learning <ArrowRight size={16} /></button><button className="text-button" onClick={() => setView('curriculum')}>Explore all chapters <ArrowDownRight size={16} /></button></div>
        <div className="hero-footnote"><span><ShieldCheck size={14} /> Beginner friendly</span><span><Globe2 size={14} /> English + Arabic</span><span><Clock3 size={14} /> Learn at your pace</span></div>
      </div>
      <HeroArt />
      <div className="hero-index">01 <span>/</span> 15</div>
    </div>
    <section className="dashboard-stats" aria-label="Course details">
      <div className="stat-card"><div className="stat-icon lime"><BookOpen size={17} /></div><div><strong>15</strong><span>connected chapters</span></div><small>01 → 15</small></div>
      <div className="stat-card"><div className="stat-icon blue"><Code2 size={17} /></div><div><strong>15</strong><span>hands-on challenges</span></div><small>TRY IT</small></div>
      <div className="stat-card"><div className="stat-icon violet"><Globe2 size={17} /></div><div><strong>2</strong><span>languages, side by side</span></div><small>EN + AR</small></div>
      <div className="stat-card progress-stat"><ProgressRing value={percent} /><div><strong>Your progress</strong><span>{completed.size} of 15 chapters completed</span><button onClick={() => setView('curriculum')}>View learning path <ArrowRight size={13} /></button></div></div>
    </section>
    <section className="next-up-section">
      <div className="section-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Your next step</h2></div><button className="view-link" onClick={() => setView('curriculum')}>Full curriculum <ArrowRight size={15} /></button></div>
      <button className="next-up-card" onClick={() => chooseChapter(next.id)}>
        <div className="next-number">{String(next.id).padStart(2, '0')}</div><div className="next-main"><span className="lesson-label"><span className="pulse-dot" /> NEXT CHAPTER · {next.area.toUpperCase()}</span><h3>{next.title}</h3><span className="next-ar" lang="ar" dir="rtl">{next.ar}</span></div><div className="next-meta"><span><ListChecks size={15} /> Lesson + challenge</span><span><Clock3 size={15} /> 8 min</span></div><span className="next-arrow"><ArrowRight size={19} /></span>
      </button>
    </section>
    <section className="roadmap-preview">
      <div className="section-heading"><div><span className="eyebrow">A CLEAR ROUTE THROUGH THE SUBJECT</span><h2>From first principles to functions</h2></div><button className="view-link" onClick={() => setView('curriculum')}>See all 15 chapters <ArrowRight size={15} /></button></div>
      <div className="roadmap-track"><div className="roadmap-line" />{chapters.slice(0, 6).map((chapter) => <button key={chapter.id} className={`roadmap-stop ${completed.has(chapter.id) ? 'complete' : ''}`} onClick={() => chooseChapter(chapter.id)}><span className="roadmap-dot">{completed.has(chapter.id) ? <Check size={12} /> : String(chapter.id).padStart(2, '0')}</span><span className="roadmap-title">{chapter.title}</span><small>{chapter.area}</small></button>)}<button className="roadmap-more" onClick={() => setView('curriculum')}>+9<br /><small>more</small></button></div>
    </section>
  </div>;
}

function ConceptVisual({ chapter }) {
  const visual = visualCopy[chapter.visual];
  return <section className={`concept-panel visual-${chapter.visual}`}>
    <div className="concept-panel-head"><div><span className="eyebrow">INTERACTIVE CONCEPT MAP</span><h3>{visual.title}</h3><p>{visual.eyebrow}</p></div><span className="motion-badge"><span className="pulse-dot" /> LIVE VISUAL</span></div>
    <div className="concept-stage" aria-label={`${visual.title}: ${visual.stages.join(', ')}`}>
      <div className="concept-grid" />
      <div className="concept-beam" />
      <div className="stage-connector"><span /><span /><span /></div>
      <div className="concept-nodes">{visual.stages.map((stage, index) => <div className={`concept-node node-${index + 1}`} key={stage}><span className="node-index">0{index + 1}</span><strong>{stage}</strong><span className="node-icon">{index === 0 ? <ArrowRight size={17} /> : index === 1 ? <Cpu size={17} /> : <Zap size={17} />}</span></div>)}</div>
      <div className="concept-orb orb-a" /><div className="concept-orb orb-b" />
    </div>
    <div className="concept-caption"><div className="concept-caption-copy"><span><Lightbulb size={15} /> {visual.note}</span><span className="visual-note-ar" lang="ar" dir="rtl">{visualArabic[chapter.visual]}</span></div><span className="caption-chapter">CHAPTER {String(chapter.id).padStart(2, '0')}</span></div>
  </section>;
}

function CodeExercise({ chapter, completed, markComplete }) {
  const [code, setCode] = useState(() => starterFor(chapter));
  const [result, setResult] = useState(null);
  useEffect(() => { setCode(starterFor(chapter)); setResult(null); }, [chapter.id]);
  const review = () => {
    const result = inspectAnswer(chapter, code);
    setResult(result);
    if (result.passed) markComplete(chapter.id);
  };
  const showSolution = () => {
    setCode(solutions[chapter.id] || starterFor(chapter));
    setResult(null);
  };
  return <section className="exercise-card" id="practice">
    <div className="exercise-heading"><div><span className="eyebrow">CHAPTER {String(chapter.id).padStart(2, '0')} · CODE LAB</span><h3>{chapter.exercise.title}</h3></div><span className="exercise-badge"><Terminal size={14} /> C++ PRACTICE</span></div>
    <BilingualText en={chapter.exercise.prompt} ar={chapter.exercise.promptAr} className="exercise-prompt" />
    <div className="exercise-note"><ShieldCheck size={15} /><span><strong>Requirement check, not compilation.</strong> This exercise checks visible learning criteria; it does not compile or execute native C++.</span></div>
    <div className="editor-wrap">
      <div className="editor-toolbar"><div className="editor-file"><span className="file-dot" /><FileCode2 size={15} /> solution.cpp <span className="editor-unsaved">●</span></div><div className="editor-tools"><span>UTF-8</span><span>C++</span><button onClick={() => { setCode(starterFor(chapter)); setResult(null); }} title="Reset code" aria-label="Reset code"><RotateCcw size={14} /></button></div></div>
      <label className="sr-only" htmlFor={`code-${chapter.id}`}>Write your C++ solution</label>
      <textarea id={`code-${chapter.id}`} className="code-editor" spellCheck="false" autoCapitalize="off" autoCorrect="off" autoComplete="off" value={code} onChange={(e) => { setCode(e.target.value); setResult(null); }} />
      <div className="editor-footer"><span><span className="editor-status-dot" /> Ready for your idea</span><span>{code.split('\n').length} lines <span className="editor-divider">·</span> {code.length} chars</span></div>
    </div>
    <div className="exercise-actions"><button className="primary-button check-button" onClick={review}><Play size={15} fill="currentColor" /> Check my answer</button><button className="solution-button" onClick={showSolution}><Lightbulb size={15} /> Show solution <ArrowDownRight size={14} /></button></div>
    {result && <div className={`check-result ${result.passed ? 'result-pass' : 'result-incomplete'}`} role="status">
      <div className="result-icon">{result.passed ? <CheckCircle2 size={19} /> : <CircleHelp size={19} />}</div>
      <div className="result-copy"><strong>{result.passed ? 'Correct — you met the exercise requirements.' : 'Not quite yet — keep building.'}</strong><p>{result.passed ? 'Nice work. Your visible solution includes all the key pieces for this challenge.' : 'Use the checklist below to see which pieces are still missing.'}</p>
        {!result.passed && <ul>{result.issues.map((item, i) => <li key={`i${i}`}>{item.en}<span lang="ar" dir="rtl">{item.ar}</span></li>)}{result.missing.map((item, i) => <li key={`m${i}`}>{item.en}<span lang="ar" dir="rtl">{item.ar}</span></li>)}</ul>}
        {result.passed && <div className="result-ar" lang="ar" dir="rtl">إجابة صحيحة — لقد استوفيت متطلبات التمرين.</div>}
      </div>
    </div>}
    <div className="hint-box"><div className="hint-icon"><Lightbulb size={17} /></div><div><strong>Need a nudge?</strong><p>{chapter.exercise.hint}</p><p className="arabic-copy" lang="ar" dir="rtl">{chapter.exercise.hintAr}</p></div></div>
    <p className="completion-note">{completed.has(chapter.id) ? <><CheckCircle2 size={14} /> This chapter is marked complete.</> : <><Award size={14} /> Pass the requirement check to mark this chapter complete.</>}</p>
  </section>;
}

function LessonPage({ chapter, completed, chooseChapter, markComplete, setView }) {
  const next = chapters[chapter.id] || null;
  return <div className="page lesson-page">
    <div className="lesson-topline"><button onClick={() => setView('curriculum')}><ArrowLeft size={15} /> Learning path</button><div><span>CHAPTER {String(chapter.id).padStart(2, '0')}</span><span className="topline-sep">/</span><span>{chapter.area.toUpperCase()}</span></div><span className="lesson-estimate"><Clock3 size={14} /> 8 min</span></div>
    <div className="lesson-title-block"><div className="lesson-title-number">{String(chapter.id).padStart(2, '0')}<span> / 15</span></div><div><div className="lesson-kicker">{iconFor(chapter.icon, { size: 15 })}<span>YOUR NEXT BIG IDEA</span></div><h1>{chapter.title}</h1><p className="lesson-title-ar" lang="ar" dir="rtl">{chapter.ar}</p></div><span className={`complete-pill ${completed.has(chapter.id) ? 'done' : ''}`}>{completed.has(chapter.id) ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}{completed.has(chapter.id) ? 'COMPLETED' : 'IN PROGRESS'}</span></div>
    <div className="lesson-intro"><div className="section-label"><span className="section-number">01</span><span>THE BIG PICTURE</span><i /></div><div className="lesson-paragraphs">{chapter.lesson.map((paragraph, i) => <BilingualText key={i} en={paragraph.en} ar={paragraph.ar} className="lesson-paragraph" />)}</div></div>
    <ConceptVisual chapter={chapter} />
    <section className="takeaways"><div className="section-label"><span className="section-number">02</span><span>WHAT YOU'LL TAKE AWAY</span><i /></div><div className="takeaway-grid">{chapter.concepts.map(([en, ar], i) => <div className="takeaway" key={en}><span className="takeaway-check">{String(i + 1).padStart(2, '0')}</span><div><strong>{en}</strong><span lang="ar" dir="rtl">{ar}</span></div></div>)}</div></section>
    <CodeExercise chapter={chapter} completed={completed} markComplete={markComplete} />
    <div className="lesson-next-row"><div><span className="eyebrow">ONE STEP AT A TIME</span><p>Ready to keep going?</p><span className="next-ar-small" lang="ar" dir="rtl">كل مفهوم جديد يبني على ما تعلمته.</span></div>{next ? <button className="next-chapter-button" onClick={() => chooseChapter(next.id)}><span>NEXT CHAPTER · {String(next.id).padStart(2, '0')}</span><strong>{next.title}</strong><ArrowRight size={18} /></button> : <button className="next-chapter-button" onClick={() => setView('curriculum')}><span>COURSE COMPLETE</span><strong>Review the learning path</strong><Award size={18} /></button>}</div>
  </div>;
}

function CurriculumPage({ completed, chooseChapter }) {
  const groups = ['Foundations', 'Systems', 'Programming', 'C++ Core'];
  return <div className="page curriculum-page">
    <div className="curriculum-hero"><div><div className="hero-kicker"><span className="kicker-dot" /> YOUR ROADMAP · 15 CHAPTERS</div><h1>A path that builds<br /><em>one idea at a time.</em></h1><BilingualText en="Start with the big picture, then bring every idea to life in C++. Each chapter pairs a clear lesson with an animated concept map and a hands-on challenge." ar="ابدأ بالصورة الكبيرة، ثم حوّل كل فكرة إلى تطبيق بلغة C++. يجمع كل فصل بين شرح واضح وخريطة مفاهيم متحركة وتدريب عملي." /></div><div className="curriculum-side-art"><div className="orbit-number">15<span>CHAPTERS</span><small>ONE JOURNEY</small></div><div className="mini-loop loop-a" /><div className="mini-loop loop-b" /><Sparkles className="curriculum-spark" size={18} /></div></div>
    <div className="curriculum-summary"><span><CheckCircle2 size={15} /> {completed.size} chapters complete</span><span><BookOpen size={15} /> 15 lessons</span><span><Code2 size={15} /> 15 code labs</span><span><Globe2 size={15} /> English + Arabic</span></div>
    {groups.map((group) => <section className="curriculum-group" key={group}><div className="curriculum-group-head"><span>{group}</span><i /><small>{chapters.filter(c => c.area === group).length} CHAPTERS</small></div><div className="chapter-card-grid">{chapters.filter(c => c.area === group).map((chapter) => <button className="chapter-card" key={chapter.id} onClick={() => chooseChapter(chapter.id)}><div className="chapter-card-top"><span className="chapter-card-index">{String(chapter.id).padStart(2, '0')}</span><span className={`chapter-card-icon ${completed.has(chapter.id) ? 'icon-done' : ''}`}>{completed.has(chapter.id) ? <Check size={17} /> : iconFor(chapter.icon)}</span></div><strong>{chapter.title}</strong><span className="chapter-card-ar" lang="ar" dir="rtl">{chapter.ar}</span><span className="chapter-card-bottom"><span>{completed.has(chapter.id) ? 'COMPLETED' : 'LESSON + CODE LAB'}</span><ArrowUpRight size={15} /></span></button>)}</div></section>)}
    <div className="curriculum-callout"><div className="callout-icon"><Sparkles size={18} /></div><div><strong>Learning clicks when you connect the dots.</strong><p>Each chapter builds on the last — but you can revisit any concept whenever you need.</p><p className="arabic-copy" lang="ar" dir="rtl">يرتبط كل فصل بما قبله، ويمكنك العودة لأي مفهوم وقتما تحتاج.</p></div></div>
  </div>;
}

function PracticePage({ activeChapter, chooseChapter, completed, markComplete }) {
  const [selected, setSelected] = useState(activeChapter.id);
  const chapter = chapters.find((item) => item.id === selected) || activeChapter;
  useEffect(() => setSelected(activeChapter.id), [activeChapter.id]);
  return <div className="page practice-page"><div className="practice-hero"><div className="practice-orb"><div className="orb-inner"><Terminal size={33} /><span>IDE</span></div></div><div><div className="hero-kicker"><span className="kicker-dot" /> CODE LAB · LEARN BY TRYING</div><h1>Make the idea<br /><em>work in code.</em></h1><BilingualText en="Choose a chapter challenge, write your solution, and check the concepts it includes. CodeCoach can add a gentle bilingual review." ar="اختر تدريبًا من أحد الفصول، واكتب الحل، ثم تحقق من المفاهيم التي يتضمنها. ويمكن لـCodeCoach تقديم مراجعة ثنائية اللغة." /></div></div>
    <div className="practice-select-row"><div><span className="eyebrow">SELECT A CHALLENGE</span><strong>Pick a chapter to practice</strong></div><label className="select-wrap"><span className="sr-only">Choose chapter</span><select value={selected} onChange={(e) => setSelected(Number(e.target.value))}>{chapters.map((item) => <option value={item.id} key={item.id}>Chapter {String(item.id).padStart(2, '0')} — {item.title}</option>)}</select><ChevronDown size={15} /></label></div>
    <CodeExercise key={chapter.id} chapter={chapter} completed={completed} markComplete={markComplete} />
    <div className="practice-note-card"><div className="callout-icon"><ShieldCheck size={18} /></div><div><strong>Built for learning, not just passing.</strong><p>Checks match the visible requirements for each challenge. Use hints to reason it through; native compilation is not performed in this browser lab.</p><p className="arabic-copy" lang="ar" dir="rtl">تطابق الفحوص متطلبات التمرين الظاهرة. استخدم التلميحات للتفكير، ولا تتم ترجمة C++ أو تشغيلها داخل هذا المختبر.</p></div></div>
  </div>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-brand">
      <span className="brand-mark footer-mark"><span>C</span><b>++</b></span>
      <div className="footer-brand-copy"><strong>Built for curious minds.</strong><small>A step-by-step introduction to computer science &amp; C++.</small></div>
      <div className="footer-signature-wrap"><span className="signature-rail" aria-hidden="true" /><img className="footer-signature" src="/Sign.jpg" alt="Signature" onError={(event) => { event.currentTarget.hidden = true; }} /></div>
    </div>
    <div className="footer-bottom"><span>CODECRAFT <i>×</i> INTRO TO C++</span><span>Learn the logic. Build the thing.</span><span>© 2025–26</span></div>
  </footer>;
}

function App() {
  const [view, setView] = useState('overview');
  const [activeId, setActiveId] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [completedIds, setCompletedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('codecraft-completed') || '[]'); } catch { return []; }
  });
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const activeChapter = chapters.find((item) => item.id === activeId) || chapters[0];
  useEffect(() => { localStorage.setItem('codecraft-completed', JSON.stringify(completedIds)); }, [completedIds]);
  const chooseChapter = (id) => { setActiveId(id); setView('lesson'); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const markComplete = (id) => setCompletedIds((previous) => previous.includes(id) ? previous : [...previous, id]);
  const changeView = (next) => { setView(next); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <div className="app-shell">
    <Topbar setView={changeView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} completedCount={completed.size} />
    <div className="app-layout">
      {mobileOpen && <button aria-label="Close navigation" className="mobile-backdrop" onClick={() => setMobileOpen(false)} />}
      <Sidebar activeId={activeId} view={view} setView={changeView} chooseChapter={chooseChapter} completed={completed} filter={filter} setFilter={setFilter} mobileOpen={mobileOpen} />
      <main className="main-content" id="main-content">
        {view === 'overview' && <Dashboard completed={completed} chooseChapter={chooseChapter} setView={changeView} />}
        {view === 'curriculum' && <CurriculumPage completed={completed} chooseChapter={chooseChapter} />}
        {view === 'lesson' && <LessonPage chapter={activeChapter} completed={completed} chooseChapter={chooseChapter} markComplete={markComplete} setView={changeView} />}
        {view === 'practice' && <PracticePage activeChapter={activeChapter} chooseChapter={chooseChapter} completed={completed} markComplete={markComplete} />}
      </main>
    </div>
    <Footer />
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
