/* global React, ReactDOM, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor, useTweaks */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   Tweak defaults — host rewrites this JSON block on persist
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "coffee",
  "background": "warm-white",
  "headingFont": "playfair",
  "heroLayout": "split",
  "showLaunchStrip": true,
  "demoSpeed": "normal"
}/*EDITMODE-END*/;

const ACCENTS = {
  coffee: {
    label: "Coffee",
    color: "#5C4438",
    soft: "#EDE6DD",
  },
  cardboard: {
    label: "Cardboard",
    color: "#756049",
    soft: "#E8E2D8",
  },
  "warm-ochre": { hue: 75, label: "Black & beige", mono: true },
  "ink-purple": { hue: 300, label: "Ink purple" },
  "forest":     { hue: 155, label: "Forest" },
  "mono":       { hue: 0,   label: "Monochrome", mono: true },
};

const BG_TONES = {
  "warm-white": { fg: "#FFFFFF", cream: "#F7F5F0" },
  "pure-white": { fg: "#FFFFFF", cream: "#F7F5F0" },
  "cool":       { fg: "#FFFFFF", cream: "#F4F3F0" },
};

const FONT_PAIRS = {
  "playfair": { heading: "'Playfair Display', Georgia, serif", label: "Playfair + Inter" },
  "fraunces": { heading: "'Fraunces', Georgia, serif", label: "Fraunces + Inter" },
  "instrument": { heading: "'Instrument Serif', Georgia, serif", label: "Instrument + Inter" },
};

/* ============================================================
   Shared icon/glyph
   ============================================================ */
const Sparkle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor"/>
  </svg>
);

const Dot = ({ live }) => (
  <span className={`live-dot ${live ? "is-live" : ""}`} aria-hidden="true"/>
);

/* ============================================================
   HERO — left: copy + email capture. right: animated brief→form
   ============================================================ */
function Hero({ accent, onSubmit, submitted }) {
  const [email, setEmail] = useState("");
  const handle = (e) => {
    e.preventDefault();
    if (email.trim()) onSubmit(email);
  };
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkle size={11}/> Introducing Solyns AI
          </span>
          <h1 className="display">
            Forms that feel like a <em>conversation</em>, not a chore.
          </h1>
          <p className="lede">
            Describe what you want to learn. Solyns drafts a conversational form, adapts follow-ups in real time, and hands you the themes!
          </p>
          <form className="email-capture" onSubmit={handle}>
            <input
              type="email"
              name="email"
              placeholder="you@work.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Work email"
            />
            <button type="submit" className="btn btn-primary btn-lg">
              Get early access
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
          {submitted && (
            <p className="capture-success">
              <span className="check">✓</span> You're on the list. We'll be in touch.
            </p>
          )}
          <p className="capture-fine">
            Free during beta
          </p>
        </div>
        <div className="hero-visual">
          <HeroDemo accent={accent}/>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HERO demo — animated: prompt types, then form questions appear
   ============================================================ */
const DEMO_PROMPT = "8-min customer discovery for a B2B analytics tool. Friendly tone.";
const DEMO_QUESTIONS = [
  { q: "What should we call you?",              a: "Alex Rivera" },
  { q: "What team do you run at Lattice?",      a: "Product analytics — 6 people" },
  { q: "What's been the hardest part this quarter?", a: "Onboarding — it's messy" },
  { q: "Which part of onboarding feels messiest?",   a: "", followup: true },
];

function HeroDemo({ accent }) {
  const [phase, setPhase] = useState(0);
  // phase 0: typing prompt. 1: compiling. 2-5: questions appearing. loop.
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (phase !== 0) return;
    if (typed.length < DEMO_PROMPT.length) {
      const t = setTimeout(() => setTyped(DEMO_PROMPT.slice(0, typed.length + 1)), 38);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase(1), 650);
    return () => clearTimeout(t);
  }, [typed, phase]);

  useEffect(() => {
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 900);
      return () => clearTimeout(t);
    }
    if (phase >= 2 && phase < 2 + DEMO_QUESTIONS.length) {
      const t = setTimeout(() => setPhase((p) => p + 1), 1100);
      return () => clearTimeout(t);
    }
    if (phase >= 2 + DEMO_QUESTIONS.length) {
      const t = setTimeout(() => {
        setPhase(0);
        setTyped("");
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const visibleQs = Math.max(0, phase - 1);

  return (
    <div className="demo-card">
      <div className="demo-head">
        <div className="demo-dots">
          <span></span><span></span><span></span>
        </div>
        <div className="demo-label">
          <Dot live={phase >= 1}/> solyns.ai / draft
        </div>
      </div>

      <div className="demo-body">
        <div className="demo-prompt-row">
          <div className="demo-chip"><Sparkle size={10}/> Brief</div>
          <div className="demo-prompt">
            {typed}
            {phase === 0 && <span className="caret">▏</span>}
          </div>
        </div>

        <div className="demo-divider">
          <span className="demo-divider-line"/>
          <span className="demo-divider-label">
            {phase === 0 && "waiting…"}
            {phase === 1 && <><span className="spinner"/> Composing flow</>}
            {phase >= 2 && <>✓ Flow ready · {Math.min(visibleQs, DEMO_QUESTIONS.length)}/{DEMO_QUESTIONS.length} questions</>}
          </span>
          <span className="demo-divider-line"/>
        </div>

        <div className="demo-questions">
          {DEMO_QUESTIONS.slice(0, visibleQs).map((item, i) => (
            <div key={i} className={`demo-q ${item.followup ? "is-followup" : ""}`}>
              <div className="demo-q-label">
                <span className="q-num">Q{i + 1}</span>
                {item.followup && <span className="q-tag">follow-up</span>}
              </div>
              <div className="demo-q-text">{item.q}</div>
              {item.a && <div className="demo-a-text">{item.a}</div>}
            </div>
          ))}
          {/* placeholder slots */}
          {Array.from({ length: Math.max(0, DEMO_QUESTIONS.length - visibleQs) }).map((_, i) => (
            <div key={"ph" + i} className="demo-q demo-q-ghost"/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Launch strip — scarcity + trust
   ============================================================ */
function LaunchStrip() {
  return (
    <div className="launch-strip">
      <div className="container launch-strip-inner">
        <span className="strip-item"><span className="strip-pulse"/> Launching Q3 2026</span>
        <span className="strip-sep">·</span>
        <span className="strip-item">Limited beta spots</span>
        <span className="strip-sep">·</span>
        <span className="strip-item">Built for teams running research, intake & feedback</span>
      </div>
    </div>
  );
}

/* ============================================================
   Problem / Solution
   ============================================================ */
function ProblemSolution() {
  return (
    <section className="ps-section">
      <div className="container">
        <div className="section-head">
          <p className="section-label">Why we're building this</p>
          <h2 className="h2">Surveys are noisy. Conversations aren't.</h2>
        </div>
        <div className="ps-grid">
          <article className="ps-card ps-card--problem">
            <div className="ps-tag">Today</div>
            <h3>A pile of half-answers</h3>
            <ul className="ps-list ps-list--x">
              <li>Hours spent wiring branching logic you'll rewrite in a week</li>
              <li>40% drop-off by question ten</li>
              <li>Open-ends no one reads because there are 800 of them</li>
              <li>Exports to five tools to find one theme</li>
            </ul>
            <div className="ps-visual ps-visual--mess">
              <div className="mess-stack">
                <span className="mess-row m1"/>
                <span className="mess-row m2"/>
                <span className="mess-row m3"/>
                <span className="mess-row m4"/>
                <span className="mess-row m5"/>
              </div>
              <div className="mess-label">Form.v12_FINAL_final.xlsx</div>
            </div>
          </article>

          <div className="ps-arrow" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M12 24h24M28 14l10 10-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <article className="ps-card ps-card--solution">
            <div className="ps-tag ps-tag--accent">With Solyns</div>
            <h3>Real answers, gently drawn out</h3>
            <ul className="ps-list ps-list--check">
              <li>Brief to flow in under a minute — edit in plain English</li>
              <li>Follow-ups appear when answers are thin</li>
              <li>Themes and sentiment summarized as responses arrive</li>
              <li>Ask your results a question; get the quote that answers it</li>
            </ul>
            <div className="ps-visual ps-visual--clean">
              <div className="clean-node">
                <span className="node-label">Brief</span>
              </div>
              <div className="clean-line"/>
              <div className="clean-node clean-node--ai">
                <Sparkle size={12}/>
              </div>
              <div className="clean-line"/>
              <div className="clean-out">
                <span className="clean-chip">Flow</span>
                <span className="clean-chip">Insight</span>
                <span className="clean-chip">Quote</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Product preview — three-tab platform mockup
   ============================================================ */
function ProductPreview() {
  const [tab, setTab] = useState("build");
  return (
    <section className="preview-section">
      <div className="container">
        <div className="section-head">
          <p className="section-label">A sneak peek</p>
          <h2 className="h2">One brief. Three layers of AI.</h2>
          <p className="section-sub">The build surface, the live conversation, and the insight view — all share the same calm editorial feel.</p>
        </div>

        <div className="preview-tabs">
          {[
            { id: "build", label: "Build", sub: "Brief → flow" },
            { id: "flow",  label: "Flow",  sub: "Live adaptive" },
            { id: "learn", label: "Learn", sub: "Themes & quotes" },
          ].map((t) => (
            <button
              key={t.id}
              className={`preview-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
            >
              <span className="tab-label">{t.label}</span>
              <span className="tab-sub">{t.sub}</span>
            </button>
          ))}
        </div>

        <div className="preview-stage">
          {tab === "build" && <BuildPreview/>}
          {tab === "flow"  && <FlowPreview/>}
          {tab === "learn" && <LearnPreview/>}
        </div>
      </div>
    </section>
  );
}

function BuildPreview() {
  return (
    <div className="mockup mockup-build">
      <aside className="mock-side">
        <div className="mock-side-head">
          <Sparkle size={11}/> Prompt
        </div>
        <div className="mock-prompt">
          Discovery flow for <strong>product managers</strong> at B2B analytics cos. Capture role, stack, hardest recent problem.
          <em>8 minutes max. Friendly, curious tone.</em>
        </div>
        <button className="mock-refine">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 20v-6h-6M4 4v6h6M4 14l6-6M20 10l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Regenerate
        </button>
        <div className="mock-suggestions">
          <div className="sug-head">Suggestions</div>
          <div className="sug-chip">Shorter opening question</div>
          <div className="sug-chip">Add role probe</div>
          <div className="sug-chip">Skip NPS</div>
        </div>
      </aside>
      <div className="mock-canvas">
        <div className="mock-canvas-head">
          <span className="mock-file">Discovery · PM · Draft 3</span>
          <span className="mock-meta">8m · 9 questions · English</span>
        </div>
        <div className="mock-flow">
          {[
            { n: "01", t: "Opening", q: "Thanks for stopping by. What should we call you?" },
            { n: "02", t: "Context", q: "What team do you run, and at which company?" },
            { n: "03", t: "Probe",   q: "Walk me through the hardest thing this quarter.", tag: "adaptive" },
            { n: "04", t: "Stack",   q: "Which tools are in your daily rotation?" },
            { n: "05", t: "Close",   q: "Would a 20-min follow-up help you more than a survey?" },
          ].map((step, i) => (
            <div key={i} className={`flow-step ${step.tag ? "has-tag" : ""}`}>
              <div className="flow-num">{step.n}</div>
              <div className="flow-body">
                <div className="flow-t">
                  {step.t}
                  {step.tag && <span className="flow-tag">{step.tag}</span>}
                </div>
                <div className="flow-q">{step.q}</div>
              </div>
            </div>
          ))}
          <div className="flow-add">+ Add question</div>
        </div>
      </div>
    </div>
  );
}

function FlowPreview() {
  return (
    <div className="mockup mockup-flow">
      <div className="phone-frame">
        <div className="phone-bar"/>
        <div className="phone-body">
          <div className="phone-progress"><span style={{ width: "60%" }}/></div>
          <div className="phone-step">Q3 of 5</div>
          <div className="phone-question">Walk me through the hardest thing this quarter.</div>
          <div className="phone-input">
            <span className="phone-input-text">Onboarding — it's messy.</span>
            <span className="caret">▏</span>
          </div>
          <div className="phone-followup">
            <div className="fu-label"><Sparkle size={10}/> Follow-up just added</div>
            <div className="fu-q">Which part of onboarding feels messiest — first login, invites, or something else?</div>
          </div>
        </div>
      </div>
      <div className="flow-sidepanel">
        <div className="sp-head">Live adapt</div>
        <div className="sp-item">
          <span className="sp-dot"/> Thin answer detected
          <span className="sp-val">"messy"</span>
        </div>
        <div className="sp-item">
          <span className="sp-dot"/> Added clarifying probe
          <span className="sp-val">1 of 2 allowed</span>
        </div>
        <div className="sp-item">
          <span className="sp-dot"/> Tone matched
          <span className="sp-val">curious, warm</span>
        </div>
        <div className="sp-quote">
          "Keeps conversations going without feeling like a script."
        </div>
      </div>
    </div>
  );
}

function LearnPreview() {
  return (
    <div className="mockup mockup-learn">
      <div className="learn-main">
        <div className="learn-head">
          <div className="learn-q">
            <span className="learn-q-label">Ask your results</span>
            <span className="learn-q-text">What's the biggest onboarding friction for teams under 20?</span>
          </div>
        </div>
        <div className="learn-answer">
          <div className="la-summary">
            <strong>Invite flow</strong> is the clearest pattern — <strong>11 of 18</strong> respondents in this segment mentioned losing teammates at the seat-assignment step.
          </div>
          <div className="la-quotes">
            <blockquote>"Had to re-invite half the team because the email link expired."<cite>— PM, Series A</cite></blockquote>
            <blockquote>"We gave up and shared a password for week one."<cite>— Head of Ops</cite></blockquote>
          </div>
        </div>
      </div>
      <aside className="learn-side">
        <div className="ls-head">Themes</div>
        <div className="ls-theme">
          <div className="ls-theme-name">Onboarding friction</div>
          <div className="ls-bar"><span style={{ width: "78%" }}/></div>
          <div className="ls-theme-meta">14 mentions · positive trend</div>
        </div>
        <div className="ls-theme">
          <div className="ls-theme-name">Reporting depth</div>
          <div className="ls-bar"><span style={{ width: "52%" }}/></div>
          <div className="ls-theme-meta">9 mentions · mixed</div>
        </div>
        <div className="ls-theme">
          <div className="ls-theme-name">Integrations</div>
          <div className="ls-bar"><span style={{ width: "34%" }}/></div>
          <div className="ls-theme-meta">6 mentions · positive</div>
        </div>
        <div className="ls-theme">
          <div className="ls-theme-name">Pricing clarity</div>
          <div className="ls-bar"><span style={{ width: "22%" }}/></div>
          <div className="ls-theme-meta">4 mentions · needs work</div>
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   Pillars (Builder / Flow / Insight)
   ============================================================ */
function Pillars() {
  const items = [
    {
      tag: "Builder",
      title: "Compose faster.",
      body: "Brief to questions, tone, and structure — then refine with prompts instead of dragging fields.",
    },
    {
      tag: "Flow",
      title: "Adapt live.",
      body: "Follow up when answers are vague. Skip noise. Conversational depth without a branch for every path.",
    },
    {
      tag: "Insight",
      title: "Understand answers.",
      body: "Themes, sentiment, and highlights from qualitative and quantitative replies — ready to share.",
    },
  ];
  return (
    <section className="pillars-section">
      <div className="container">
        <div className="section-head">
          <p className="section-label">Three layers of AI</p>
          <h2 className="h2">Built for teams who need real answers.</h2>
        </div>
        <div className="pillars-grid">
          {items.map((p, i) => (
            <article key={i} className="pillar">
              <div className="pillar-num">0{i + 1}</div>
              <p className="pillar-tag">{p.tag}</p>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-body">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   What you get (benefits)
   ============================================================ */
function WhatYouGet() {
  const items = [
    { k: "01", t: "First in line", d: "Early access the moment we open the beta — ahead of the public queue." },
    { k: "02", t: "Founding pricing", d: "50% off the first year, locked in for as long as you stay on the plan." },
    { k: "03", t: "Direct line to the team", d: "Slack-level support from the people building it. Your feedback ships." },
    { k: "04", t: "Shape the roadmap", d: "Monthly founder calls. First vote on what we build next." },
  ];
  return (
    <section className="benefits-section">
      <div className="container">
        <div className="section-head">
          <p className="section-label">What you get</p>
          <h2 className="h2">More than early access.</h2>
          <p className="section-sub">Waitlist members aren't a lead list. You're the reason the product gets good.</p>
        </div>
        <div className="benefits-grid">
          {items.map((b) => (
            <article key={b.k} className="benefit">
              <div className="benefit-k">{b.k}</div>
              <h3 className="benefit-t">{b.t}</h3>
              <p className="benefit-d">{b.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Repeat CTA
   ============================================================ */
function RepeatCta({ onSubmit, submitted }) {
  const [email, setEmail] = useState("");
  const handle = (e) => {
    e.preventDefault();
    if (email.trim()) onSubmit(email);
  };
  return (
    <section className="repeat-cta">
      <div className="container repeat-cta-inner">
        <p className="section-label section-label--light">Early access</p>
        <h2 className="h2 repeat-h2">Get on the list.</h2>
        <p className="repeat-sub">Be first to try Solyns AI forms and help shape what we ship. Updates only — no filler.</p>
        <form className="email-capture email-capture--dark" onSubmit={handle}>
          <input
            type="email"
            placeholder="you@work.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Work email"
          />
          <button type="submit" className="btn btn-primary btn-lg btn-invert">
            Join waitlist
          </button>
        </form>
        {submitted && (
          <p className="capture-success capture-success--light">
            <span className="check">✓</span> You're on the list.
          </p>
        )}
        <p className="capture-fine capture-fine--light">
          By joining, you agree we may contact you about Solyns. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Header + Footer
   ============================================================ */
function Header() {
  return (
    <header className="site-header">
      <nav className="site-nav container">
        <a href="#top" className="logo">Solyns <em>AI</em></a>
        <div className="nav-right">
          <ul className="nav-links">
            <li><a href="#preview">Preview</a></li>
            <li><a href="#benefits">Waitlist</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a href="#cta" className="btn btn-primary btn-nav">Get early access</a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <a href="#top" className="logo">Solyns <em>AI</em></a>
          <p className="footer-tag">Forms that feel like a conversation.</p>
        </div>
        <div className="footer-cols">
          <div>
            <div className="footer-h">Product</div>
            <a href="#preview">Preview</a>
            <a href="#benefits">Waitlist benefits</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <div className="footer-h">Company</div>
            <a href="mailto:hello@solyns.ai">hello@solyns.ai</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
          <div>
            <div className="footer-h">Follow</div>
            <div className="socials">
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="YouTube">YT</a>
              <a href="#" aria-label="X">X</a>
            </div>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Solyns Labs, Inc.</span>
        <span>Launching Q3 2026</span>
      </div>
    </footer>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
function Faq() {
  const items = [
    { q: "What is Solyns AI?", a: "AI across build, live conversation, and analysis — so you spend less time wiring forms and more time using what you learn." },
    { q: "How is this different from a basic form builder?", a: "Static fields and fixed branches are the baseline. Solyns adds adaptive follow-ups and insight on top — closer to a conversation than a survey." },
    { q: "When will it launch?", a: "Beta opens in waves through Q3 2026. Waitlist members get invited first, in order of signup." },
    { q: "Will my data train public models?", a: "No. We're designing for minimal retention, encryption in transit, and no training on your respondents' data." },
    { q: "What does early access cost?", a: "Free during beta. Founding members get 50% off their first year when we launch paid plans." },
  ];
  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="section-head">
          <p className="section-label">FAQ</p>
          <h2 className="h2">Questions, answered.</h2>
        </div>
        <div className="faq-wrap">
          {items.map((item, i) => (
            <details className="faq-item" key={i} open={i === 0}>
              <summary>
                {item.q}
                <span className="faq-plus" aria-hidden="true"/>
              </summary>
              <div className="faq-body">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   App
   ============================================================ */
function App() {
  const { values, set } = useTweaks(TWEAK_DEFAULTS);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (email) => {
    console.log("Waitlist signup:", email);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  // Apply theme vars
  const accent = ACCENTS[values.accent] || ACCENTS.coffee;
  const bg = BG_TONES[values.background] || BG_TONES["warm-white"];
  const font = FONT_PAIRS[values.headingFont] || FONT_PAIRS["playfair"];

  const themeVars = useMemo(() => {
    let accentCol;
    let accentSoft;
    if (accent.mono) {
      accentCol = "#0B0B0A";
      accentSoft = "#F7F5F0";
    } else if (accent.color) {
      accentCol = accent.color;
      accentSoft = accent.soft;
    } else {
      accentCol = `oklch(0.62 0.13 ${accent.hue})`;
      accentSoft = `oklch(0.94 0.04 ${accent.hue})`;
    }
    return {
      "--bg": bg.fg,
      "--cream": bg.cream,
      "--accent": accentCol,
      "--accent-soft": accentSoft,
      "--font-serif": font.heading,
    };
  }, [values.accent, values.background, values.headingFont]);

  return (
    <div className="page" style={themeVars} id="top">
      <Header/>
      <main>
        <Hero accent={accent} onSubmit={onSubmit} submitted={submitted}/>
        {values.showLaunchStrip && <LaunchStrip/>}
        <ProblemSolution/>
        <div id="preview"><ProductPreview/></div>
        <Pillars/>
        <div id="benefits"><WhatYouGet/></div>
        <div id="cta"><RepeatCta onSubmit={onSubmit} submitted={submitted}/></div>
        <Faq/>
      </main>
      <Footer/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Accent color">
          <TweakRadio
            value={values.accent}
            onChange={(v) => set("accent", v)}
            options={Object.entries(ACCENTS).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </TweakSection>
        <TweakSection title="Background">
          <TweakRadio
            value={values.background}
            onChange={(v) => set("background", v)}
            options={[
              { value: "warm-white", label: "Warm white" },
              { value: "pure-white", label: "Pure white" },
              { value: "cool",       label: "Cool gray" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Heading font">
          <TweakRadio
            value={values.headingFont}
            onChange={(v) => set("headingFont", v)}
            options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))}
          />
        </TweakSection>
        <TweakSection title="Options">
          <TweakToggle
            label="Launch-date strip"
            checked={values.showLaunchStrip}
            onChange={(v) => set("showLaunchStrip", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
