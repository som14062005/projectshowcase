import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const defaultContent = {
  problemStatement: { problemText: '', solutionText: '' },
  techStack: [],
  architecture: { description: '', components: [], diagramUrl: '' },
  demo: { videoUrl: '', liveUrl: '', githubUrl: '' },
  testing: {
    approach: '',
    unitReportUrl: '',
    integrationReportUrl: '',
    e2eReportUrl: '',
    sastReportUrl: '',
    dastReportUrl: '',
    loadTestReportUrl: '',
  },
};

/* ── whitelist-only sanitizer — challenges removed ── */
const sanitizeContent = (raw) => ({
  problemStatement: {
    problemText:  raw.problemStatement?.problemText  || '',
    solutionText: raw.problemStatement?.solutionText || '',
  },
  challenges: [],
  techStack: (raw.techStack || []).map((t) => ({
    name:                   t.name                   || '',
    category:               t.category               || 'Backend',
    justification:          t.justification          || '',
    alternativesConsidered: t.alternativesConsidered || '',
  })),
  architecture: {
    description: raw.architecture?.description || '',
    components:  (raw.architecture?.components || []).map(String),
    diagramUrl:  raw.architecture?.diagramUrl  || '',
  },
  demo: {
    videoUrl:  raw.demo?.videoUrl  || '',
    liveUrl:   raw.demo?.liveUrl   || '',
    githubUrl: raw.demo?.githubUrl || '',
  },
  testing: {
    approach:             raw.testing?.approach             || '',
    unitReportUrl:        raw.testing?.unitReportUrl        || '',
    integrationReportUrl: raw.testing?.integrationReportUrl || '',
    e2eReportUrl:         raw.testing?.e2eReportUrl         || '',
    sastReportUrl:        raw.testing?.sastReportUrl        || '',
    dastReportUrl:        raw.testing?.dastReportUrl        || '',
    loadTestReportUrl:    raw.testing?.loadTestReportUrl    || '',
  },
});

/* ── shared class strings ── */
const inp = 'w-full bg-cli-bg border border-cli-green text-cli-green p-2 outline-none focus:border-cli-green-bright';
const ta  = 'w-full bg-cli-bg border border-cli-green text-cli-green p-3 outline-none focus:border-cli-green-bright';
const lbl = 'block text-sm text-cli-green mb-1';
const sec = 'border-2 border-cli-green p-6 mb-6';
const ttl = 'text-xl font-bold text-cli-green-bright mb-4';

/* ── bullet point textarea helper ──
   Converts plain text into bullet lines on paste/change.
   Each non-empty line that doesn't start with "• " gets prefixed. */
const toBullets = (raw) =>
  raw
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed === '') return '';
      if (trimmed.startsWith('• ')) return line;
      return '• ' + trimmed;
    })
    .join('\n');

/* Strips bullet prefixes to get plain text for display in textarea */
const BulletTextarea = ({ value, onChange, rows = 3, placeholder, className }) => {
  const handleChange = (e) => {
    const raw = e.target.value;
    // Only auto-bullet on Enter key — allow free typing otherwise
    onChange(raw);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const el = e.target;
      const { selectionStart, selectionEnd } = el;
      const before = value.slice(0, selectionStart);
      const after  = value.slice(selectionEnd);
      const newVal = before + '\n• ' + after;
      onChange(newVal);
      // Move cursor after the new bullet
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = selectionStart + 3;
      });
    }
  };

  const handleFocus = (e) => {
    // Auto-add first bullet if field is empty
    if (!value.trim()) onChange('• ');
  };

  return (
    <textarea
      value={value}
      rows={rows}
      className={className}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    />
  );
};

const EditProjectPage = () => {
  const { projectId } = useParams();
  const navigate      = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [project, setProject] = useState(null);
  const [content, setContent] = useState(defaultContent);
  const [drivePreviewError, setDrivePreviewError] = useState(false);

  useEffect(() => { fetchProjectContent(); }, [projectId]);

  /* ── fetch ── */
  const fetchProjectContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res   = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/projects/${projectId}/content`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject(res.data.project);
      if (res.data.content) setContent(sanitizeContent(res.data.content));
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  /* ── save ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/projects/${projectId}/content`,
        sanitizeContent(content),
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert('✅ Content saved successfully!');
    } catch (err) {
      console.error('Save error:', err.response?.data);
      alert('❌ Error: ' + JSON.stringify(err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  /* ── tech stack helpers ── */
  const addTech = () => setContent({ ...content, techStack: [...content.techStack, { name: '', category: 'Frontend', justification: '', alternativesConsidered: '' }] });
  const updTech = (i, k, v) => { const a = [...content.techStack]; a[i] = { ...a[i], [k]: v }; setContent({ ...content, techStack: a }); };
  const delTech = (i) => setContent({ ...content, techStack: content.techStack.filter((_, x) => x !== i) });

  /* ── component helpers ── */
  const addComp = () => setContent({ ...content, architecture: { ...content.architecture, components: [...(content.architecture.components || []), ''] } });
  const updComp = (i, v) => { const a = [...content.architecture.components]; a[i] = v; setContent({ ...content, architecture: { ...content.architecture, components: a } }); };
  const delComp = (i) => setContent({ ...content, architecture: { ...content.architecture, components: content.architecture.components.filter((_, x) => x !== i) } });

  /* ── arch helper ── */
  const updArch = (k, v) => setContent({ ...content, architecture: { ...content.architecture, [k]: v } });

  /* ── testing helper ── */
  const updTest = (k, v) => setContent({ ...content, testing: { ...content.testing, [k]: v } });

  /* ── drive URL → thumbnail src ── */
const extractDriveId = (raw) => {
  if (!raw) return null;
  const fileMatch = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return null;
};

const isDriveUrl = (raw) =>
  !!(raw?.includes('drive.google.com') || raw?.includes('docs.google.com'));

  

  /* ── reusable save button ── */
  const SaveBtn = ({ big = false }) => (
    <button
      onClick={handleSave}
      disabled={saving}
      className={`font-bold transition-all ${big ? 'px-8 py-4 text-lg' : 'px-6 py-3'} ${
        saving ? 'bg-cli-green-dim text-cli-bg cursor-not-allowed' : 'bg-cli-green text-cli-bg hover:bg-cli-green-bright'
      }`}
    >
      {saving ? '⟳ SAVING...' : '💾 SAVE ALL'}
    </button>
  );

  /* ── loading ── */
  if (loading) return (
    <div className="min-h-screen bg-cli-bg text-cli-green font-mono flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-4 animate-pulse">Loading...</div>
        <div className="text-cli-green-dim">Fetching project data...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cli-bg text-cli-green font-mono p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="border-2 border-cli-green p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button onClick={() => navigate('/admin')} className="text-cli-green-dim hover:text-cli-green mb-2 text-sm">
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-cli-green-bright mb-1">Edit: {project?.projectName}</h1>
              <p className="text-sm text-cli-green-dim">Slug: {project?.slug}</p>
            </div>
            <SaveBtn />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            1. Problem & Solution
        ══════════════════════════════════════════ */}
        <div className={sec}>
          <h2 className={ttl}>📋 Problem & Solution</h2>
          <p className="text-xs text-cli-green-dim mb-4">
            Each line becomes a bullet point on the portfolio. Press <kbd className="border border-cli-green-dim px-1">Enter</kbd> to add a new bullet.
          </p>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Problem *</label>
              <BulletTextarea
                value={content.problemStatement.problemText}
                rows={4}
                className={ta}
                placeholder="• What problem does this project solve?"
                onChange={(v) => setContent({ ...content, problemStatement: { ...content.problemStatement, problemText: v } })}
              />
            </div>
            <div>
              <label className={lbl}>Solution *</label>
              <BulletTextarea
                value={content.problemStatement.solutionText}
                rows={4}
                className={ta}
                placeholder="• How did you solve it?"
                onChange={(v) => setContent({ ...content, problemStatement: { ...content.problemStatement, solutionText: v } })}
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            2. Tech Stack
        ══════════════════════════════════════════ */}
        <div className={sec}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={ttl}>⚙️ Tech Stack</h2>
            <button onClick={addTech} className="px-4 py-2 bg-cli-green text-cli-bg font-bold hover:bg-cli-green-bright">
              + ADD TECH
            </button>
          </div>
          <p className="text-xs text-cli-green-dim mb-4">
            Justification & alternatives use bullet points — press <kbd className="border border-cli-green-dim px-1">Enter</kbd> for a new bullet.
          </p>
          <div className="space-y-4">
            {content.techStack.map((tech, i) => (
              <div key={i} className="border border-cli-green-dim p-4">
                <div className="flex justify-between mb-3">
                  <span className="text-cli-green-dim text-sm">Tech #{i + 1}</span>
                  <button onClick={() => delTech(i)} className="text-red-500 hover:text-red-400 text-sm">✕ Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input type="text" value={tech.name} className={inp} placeholder="Tech name (e.g. Express.js)"
                    onChange={(e) => updTech(i, 'name', e.target.value)} />
                  <select value={tech.category} className={inp} onChange={(e) => updTech(i, 'category', e.target.value)}>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Testing">Testing</option>
                    <option value="Security">Security</option>
                    <option value="Caching">Caching</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {/* Justification — bullet textarea */}
                <div className="mb-3">
                  <label className={lbl}>Justification</label>
                  <BulletTextarea
                    value={tech.justification}
                    rows={3}
                    className={ta}
                    placeholder="• Why did you choose this?"
                    onChange={(v) => updTech(i, 'justification', v)}
                  />
                </div>
                {/* Alternatives — bullet textarea */}
                <div>
                  <label className={lbl}>Alternatives Considered</label>
                  <BulletTextarea
                    value={tech.alternativesConsidered || ''}
                    rows={2}
                    className={ta}
                    placeholder="• e.g. Considered Fastify but chose Express because..."
                    onChange={(v) => updTech(i, 'alternativesConsidered', v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            3. Architecture
        ══════════════════════════════════════════ */}
        <div className={sec}>
          <h2 className={ttl}>🏗️ Architecture</h2>
          <div className="space-y-4">

            {/* 3a. Diagram URL */}
            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">🗺️ Architecture Diagram</span>
                <span className="text-xs text-cli-green-dim">Google Drive share link or any public image URL</span>
              </div>
              <input
                type="url"
                value={content.architecture.diagramUrl || ''}
                className={`${inp} mb-3`}
                placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
                onChange={(e) => {
                  setDrivePreviewError(false);
                  updArch('diagramUrl', e.target.value);
                }}
              />

              {/* Live preview */}
              {/* Live preview */}
{content.architecture.diagramUrl && (
  <div className="mt-3">
    <p className="text-xs text-cli-green-dim mb-2">PREVIEW</p>
    {(() => {
      const url = content.architecture.diagramUrl;
      const driveId = extractDriveId(url);

      // Google Drive file → iframe embed (bypasses CORS)
      if (driveId && isDriveUrl(url)) {
        return (
          <div className="border border-cli-green-dim overflow-hidden" style={{ height: '320px' }}>
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              title="Architecture diagram preview"
              className="w-full h-full"
              style={{ border: 'none', background: '#000' }}
              allow="autoplay"
            />
          </div>
        );
      }

      // Direct image URL (imgur, S3, etc.) → regular <img>
      return !drivePreviewError ? (
        <div className="border border-cli-green-dim overflow-hidden" style={{ maxHeight: '320px' }}>
          <img
            src={url}
            alt="Architecture diagram preview"
            className="w-full object-contain bg-black"
            style={{ maxHeight: '320px' }}
            onError={() => setDrivePreviewError(true)}
          />
        </div>
      ) : (
        <div className="border border-red-800 bg-red-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-red-400 text-sm font-bold mb-1">Image failed to load</p>
            <p className="text-xs text-cli-green-dim">Check that the URL is a public direct image link.</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-2 border border-cli-green text-cli-green hover:bg-cli-green hover:text-cli-bg transition-all whitespace-nowrap">
            Open URL ↗
          </a>
        </div>
      );
    })()}
  </div>
)}

              {/* Instructions */}
              <div className="mt-3 border border-cli-green-dim p-3 text-xs text-cli-green-dim space-y-1">
                <p className="text-cli-green font-bold mb-1">How to get the Google Drive link:</p>
                <p>1. Upload your diagram image to Google Drive</p>
                <p>2. Right-click the file → <span className="text-cli-green">"Share"</span></p>
                <p>3. Set access to <span className="text-cli-green">"Anyone with the link → Viewer"</span></p>
                <p>4. Click <span className="text-cli-green">"Copy link"</span> and paste it above</p>
                <p className="mt-2">Accepted formats: <span className="text-cli-green">drive.google.com/file/d/…/view</span> or any direct image URL</p>
              </div>
            </div>

            {/* 3b. Description — bullet textarea */}
            <div>
              <label className={lbl}>Description</label>
              <p className="text-xs text-cli-green-dim mb-1">
                Press <kbd className="border border-cli-green-dim px-1">Enter</kbd> for a new bullet point.
              </p>
              <BulletTextarea
                value={content.architecture.description}
                rows={5}
                className={ta}
                placeholder="• Describe your system architecture, services, data flow..."
                onChange={(v) => updArch('description', v)}
              />
            </div>

            {/* 3c. Components */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={lbl}>Components</label>
                <button onClick={addComp} className="px-3 py-1 bg-cli-green text-cli-bg text-xs font-bold">
                  + Add Component
                </button>
              </div>
              <div className="space-y-2">
                {(content.architecture.components || []).map((comp, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={comp} className={inp}
                      placeholder="e.g. Express REST API, MongoDB Atlas, JWT Auth"
                      onChange={(e) => updComp(i, e.target.value)} />
                    <button onClick={() => delComp(i)} className="px-3 text-red-500 hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            4. Demo & Links
        ══════════════════════════════════════════ */}
        <div className={sec}>
          <h2 className={ttl}>🎥 Demo & Links</h2>
          <div className="space-y-4">
            <div>
              <label className={lbl}>Live URL</label>
              <input type="url" value={content.demo.liveUrl} className={inp}
                placeholder="https://your-app.vercel.app"
                onChange={(e) => setContent({ ...content, demo: { ...content.demo, liveUrl: e.target.value } })} />
            </div>
            <div>
              <label className={lbl}>GitHub Repository URL</label>
              <input type="url" value={content.demo.githubUrl} className={inp}
                placeholder="https://github.com/username/repo"
                onChange={(e) => setContent({ ...content, demo: { ...content.demo, githubUrl: e.target.value } })} />
            </div>
            <div>
              <label className={lbl}>Demo Video URL</label>
              <input type="url" value={content.demo.videoUrl} className={inp}
                placeholder="https://youtube.com/watch?v=your-demo"
                onChange={(e) => setContent({ ...content, demo: { ...content.demo, videoUrl: e.target.value } })} />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            5. Testing & Security Reports
        ══════════════════════════════════════════ */}
        <div className={sec}>
          <h2 className={ttl}>🧪 Testing & Security Reports</h2>
          <p className="text-xs text-cli-green-dim mb-5">
            Paste public report / dashboard URLs — these become clickable links on your portfolio.
          </p>
          <div className="space-y-4">

            <div>
              <label className={lbl}>Testing Approach</label>
              <p className="text-xs text-cli-green-dim mb-1">
                Press <kbd className="border border-cli-green-dim px-1">Enter</kbd> for a new bullet point.
              </p>
              <BulletTextarea
                value={content.testing.approach}
                rows={3}
                className={ta}
                placeholder="• Unit & integration with Jest + Supertest&#10;• E2E with Playwright&#10;• SAST via SonarCloud"
                onChange={(v) => updTest('approach', v)}
              />
            </div>

            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">🔬 Unit Tests</span>
                <span className="text-xs text-cli-green-dim">Tool: Jest &nbsp;|&nbsp; Report: Codecov dashboard</span>
              </div>
              <input type="url" value={content.testing.unitReportUrl} className={inp}
                placeholder="https://codecov.io/gh/yourusername/yourrepo"
                onChange={(e) => updTest('unitReportUrl', e.target.value)} />
            </div>

            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">🔗 Integration Tests</span>
                <span className="text-xs text-cli-green-dim">Tool: Supertest + Jest &nbsp;|&nbsp; Report: Codecov dashboard</span>
              </div>
              <input type="url" value={content.testing.integrationReportUrl} className={inp}
                placeholder="https://codecov.io/gh/yourusername/yourrepo"
                onChange={(e) => updTest('integrationReportUrl', e.target.value)} />
            </div>

            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">🌐 E2E Tests</span>
                <span className="text-xs text-cli-green-dim">Tool: Playwright &nbsp;|&nbsp; Report: GitHub Pages HTML</span>
              </div>
              <input type="url" value={content.testing.e2eReportUrl} className={inp}
                placeholder="https://yourusername.github.io/yourrepo/playwright-report"
                onChange={(e) => updTest('e2eReportUrl', e.target.value)} />
            </div>

            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">🔍 SAST — Static Analysis</span>
                <span className="text-xs text-cli-green-dim">Tool: SonarCloud &nbsp;|&nbsp; Report: Live dashboard</span>
              </div>
              <input type="url" value={content.testing.sastReportUrl} className={inp}
                placeholder="https://sonarcloud.io/project/overview?id=yourproject"
                onChange={(e) => updTest('sastReportUrl', e.target.value)} />
            </div>

            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">🛡️ DAST — Dynamic Security</span>
                <span className="text-xs text-cli-green-dim">Tool: OWASP ZAP &nbsp;|&nbsp; Report: GitHub Pages HTML</span>
              </div>
              <input type="url" value={content.testing.dastReportUrl} className={inp}
                placeholder="https://yourusername.github.io/yourrepo/zap-report.html"
                onChange={(e) => updTest('dastReportUrl', e.target.value)} />
            </div>

            <div className="border border-cli-green-dim p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cli-green-bright font-bold">⚡ Load Testing</span>
                <span className="text-xs text-cli-green-dim">Tool: k6 &nbsp;|&nbsp; Report: k6 Cloud dashboard</span>
              </div>
              <input type="url" value={content.testing.loadTestReportUrl} className={inp}
                placeholder="https://app.k6.io/runs/yourrunid"
                onChange={(e) => updTest('loadTestReportUrl', e.target.value)} />
            </div>

          </div>
        </div>

        {/* ── Bottom Save ── */}
        <div className="flex justify-between items-center border-t-2 border-cli-green pt-6 mb-6">
          <button onClick={() => navigate('/admin')}
            className="px-6 py-3 border border-cli-green-dim text-cli-green-dim hover:border-cli-green hover:text-cli-green transition-all">
            ← CANCEL
          </button>
          <SaveBtn big />
        </div>

      </div>
    </div>
  );
};

export default EditProjectPage;