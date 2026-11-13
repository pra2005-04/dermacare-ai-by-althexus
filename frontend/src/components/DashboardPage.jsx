
import { useEffect, useState } from 'react';
import '../styles/index.css';
import logoImage from '../assets/logo.jpeg';
import skinImage from '../assets/women-image.png';
import { apiRequest } from '../lib/api';

const homePath = import.meta.env.BASE_URL;
const analyzePath = `${homePath}analyze`;
const reportPath = `${homePath}report`;
const profilePath = `${homePath}profile`;

const navigation = [
  { label: 'Dashboard', icon: 'grid', href: '#dashboard', active: true },
  { label: 'Analysis', icon: 'scan', href: analyzePath },
  { label: 'Reports', icon: 'file', href: reportPath },
  { label: 'Profile', icon: 'user', href: profilePath },
  { label: 'AI Assistant', icon: 'sparkles', href: '#' },
  { label: 'Settings', icon: 'settings', href: '#' },
];

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><circle cx="12" cy="12" r="3" /><path d="M12 9v6M9 12h6" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1zM5 3l.8 2.2L8 6l-2.2.8L5 9l-.8-2.2L2 6l2.2-.8z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9z" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  logout: (
  <>
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
  </>
),
  check: <path d="m5 12 4 4L19 6" />,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
};

function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconPaths[name] || iconPaths.grid}
    </svg>
  );
}

function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-[#e9edf3] bg-white shadow-[0_4px_22px_rgba(16,36,92,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-[#16264a]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-[#8792a5]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, color, href }) {
  const content = (
    <div className="flex h-full items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#8590a2]">{title}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-[#16264a]">{value}</p>
        <p className="mt-2 text-[11px] text-[#8792a5]">{subtitle}</p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon name={icon} size={21} />
      </div>
    </div>
  );

  return (
    <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {href ? <a href={href} className="block h-full">{content}</a> : content}
    </Card>
  );
}

function StatusBadge({ children, tone = 'good' }) {
  const styles = tone === 'good'
    ? 'bg-[#e7f7ef] text-[#21845a]'
    : 'bg-[#fff3df] text-[#ad7823]';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function WeeklyActivity({ analyses }) {
  const today = new Date();

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    const count = analyses.filter((analysis) => {
      const createdAt = new Date(analysis.createdAt);
      return !Number.isNaN(createdAt.getTime()) && dateKey(createdAt) === dateKey(date);
    }).length;

    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      count,
      isToday: index === 6,
    };
  });

  const maxCount = Math.max(...days.map((day) => day.count), 1);
  const hasActivity = days.some((day) => day.count > 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#16264a]">Analysis activity</p>
          <p className="mt-1 text-[11px] text-[#8792a5]">Your saved analyses over the last 7 days</p>
        </div>
        <span className="rounded-lg bg-[#edf9f8] px-3 py-2 text-xs font-bold text-[#168b8b]">
          {days.reduce((sum, day) => sum + day.count, 0)} analyses
        </span>
      </div>

      <div className="flex h-[155px] items-end justify-around gap-3 border-b border-[#edf0f5] px-2">
        {days.map((day) => (
          <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-semibold text-[#64748b]">
              {day.count || ''}
            </span>
            <div className="flex h-[112px] w-full items-end justify-center">
              <div
                className={`w-full max-w-8 rounded-t-lg transition-all ${
                  day.isToday ? 'bg-[#0da9a6]' : 'bg-[#bce9e5]'
                }`}
                style={{
                  height: day.count
                    ? `${Math.max(12, (day.count / maxCount) * 100)}%`
                    : '4px',
                }}
                title={`${day.label}: ${day.count} analyses`}
              />
            </div>
            <span className={`pb-2 text-[10px] ${day.isToday ? 'font-bold text-[#168b8b]' : 'text-[#8792a5]'}`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {!hasActivity && (
        <p className="mt-3 text-xs text-[#8792a5]">Your activity will appear here after an analysis is saved.</p>
      )}
    </div>
  );
}

function QualityMetric({ label, value, unit = '' }) {
  return (
    <div className="rounded-xl border border-[#edf0f5] bg-[#fafbfd] p-4">
      <p className="text-[11px] font-medium text-[#8792a5]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[#16264a]">
        {value ?? '—'} <span className="text-xs font-medium text-[#8792a5]">{unit}</span>
      </p>
    </div>
  );
}

function getPredictionPercentage(score) {
  const value = Number(score);
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';
}

export default function DashboardPage() {
  const [userName, setUserName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('dermacare-user') || 'null');
      return typeof user?.name === 'string' && user.name.trim()
        ? user.name.trim()
        : 'there';
    } catch {
      return 'there';
    }
  });

  const [analyses, setAnalyses] = useState([]);
  const [historyError, setHistoryError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('dermacare-auth-token')) {
      window.location.href = `${homePath}login`;
      return;
    }

    let active = true;

    Promise.all([apiRequest('/api/profile'), apiRequest('/api/analyses')])
      .then(([profile, history]) => {
        if (!active) return;

        if (profile.user?.name) setUserName(profile.user.name);

        const records = Array.isArray(history.analyses) ? history.analyses : [];
        records.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAnalyses(records);
      })
      .catch((error) => {
        if (active) setHistoryError(error.message || 'Analysis history could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestAnalysis = analyses[0];
  const latestResult = latestAnalysis?.analysisResult || {};
  const quality = latestResult.quality || {};
  const predictions = latestResult.classifier?.predictions || [];
  const classifierAvailable = latestResult.classifier?.status === 'available';

  const now = new Date();
  const thisMonthCount = analyses.filter((analysis) => {
    const date = new Date(analysis.createdAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const latestDate = latestAnalysis?.createdAt
    ? new Date(latestAnalysis.createdAt).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'No analyses yet';

  const handleLogout = () => {
    localStorage.removeItem('dermacare-auth-token');
    localStorage.removeItem('dermacare-user');
    window.location.href = `${homePath}login`;
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#16264a] lg:flex">

      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col bg-[#09234e] px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-[250px] lg:px-5">
       <a href="#dashboard" className="mb-7 flex items-center gap-3 px-2">
          <img src={logoImage} alt="DermaCare AI" className="h-11 w-11 rounded-xl bg-white object-cover p-1" />
          <div>
            <strong className="block text-[18px] leading-tight tracking-tight">
              DermaCare <span className="text-[#42d5cb]">AI</span>
            </strong>
            <span className="mt-1 block text-[10px] text-white/60">AI-Powered Skin Analysis</span>
          </div>
        </a>

        <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[2px] text-white/40">
          Workspace
        </p>

        <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1" aria-label="Dashboard navigation">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={`flex min-h-[45px] shrink-0 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition ${
                item.active
                  ? 'bg-[#0da9a6] text-white shadow-lg shadow-[#0da9a6]/20'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 pt-4 lg:block">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123866] text-[#49d5cd]">
              <Icon name="activity" size={19} />
            </div>
            <div>
              <p className="text-xs font-semibold">Analysis Workspace</p>
              <p className="mt-1 text-[10px] text-white/45">Informational insights</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="dashboard" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-8">

        {/* Header */}
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#159d9b]">
              Personal overview
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#14264d] sm:text-[30px]">
              Welcome back, {userName} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-[#8590a2]">
              Your analysis activity and image-quality overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge tone="good">
              {classifierAvailable ? 'AI Classifier Ready' : 'Analysis Workspace'}
            </StatusBadge>
            <a
              href={analyzePath}
              className="flex items-center gap-2 rounded-xl bg-[#0b9f9d] px-4 py-3 text-xs font-bold text-white shadow-lg shadow-[#0b9f9d]/15 transition hover:bg-[#078a88]"
            >
              <Icon name="plus" size={16} />
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">New</span>
            </a>
            <a href={profilePath} aria-label="Open profile">
              <img
                src={skinImage}
                alt={`${userName} profile`}
                className="h-10 w-10 rounded-full border-2 border-white object-cover object-[48%_35%] shadow-sm"
              />
            </a>
          </div>
        </header>

        {historyError && (
          <p role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {historyError}
          </p>
        )}

        {/* KPI Cards */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Analyses"
            value={loading ? '—' : analyses.length}
            subtitle="All saved image reports"
            icon="scan"
            color="bg-[#e7f7f5] text-[#159b96]"
            href={reportPath}
          />
          <MetricCard
            title="This Month"
            value={loading ? '—' : thisMonthCount}
            subtitle="Analyses completed this month"
            icon="calendar"
            color="bg-[#edf2ff] text-[#5573c6]"
          />
          <MetricCard
            title="Latest Analysis"
            value={latestAnalysis ? 'Saved' : '—'}
            subtitle={latestAnalysis ? latestDate : 'No saved report yet'}
            icon="clock"
            color="bg-[#fff5e8] text-[#ce9345]"
            href={latestAnalysis ? `${reportPath}?analysis=${latestAnalysis._id}` : analyzePath}
          />
          <MetricCard
            title="Classifier Status"
            value={loading ? '—' : classifierAvailable ? 'Ready' : 'Not configured'}
            subtitle="Experimental 7-category classifier"
            icon="activity"
            color="bg-[#f2edff] text-[#8765c7]"
          />
        </section>

        {/* Activity + Predictions */}
        <section className="mb-6 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
          <Card className="p-5 sm:p-6">
            <SectionTitle
              title="Your activity"
              subtitle="A quick view of your recent analysis history"
              action={<StatusBadge>7-day overview</StatusBadge>}
            />
            <WeeklyActivity analyses={analyses} />
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionTitle
              title="Latest model predictions"
              subtitle="Experimental category scores from your latest report"
              action={
                <span className="rounded-lg bg-[#f1f8fa] px-2.5 py-1.5 text-[10px] font-bold text-[#168c91]">
                  Top 3
                </span>
              }
            />

            {predictions.length > 0 ? (
              <div className="space-y-5">
                {predictions.slice(0, 3).map((prediction, index) => {
                  const percentage = Math.min(100, Math.max(0, Number(prediction.score) * 100 || 0));
                  return (
                    <div key={`${prediction.label}-${index}`}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-[#34435e]">
                          {prediction.label}
                        </span>
                        <span className="text-xs font-bold text-[#16264a]">
                          {getPredictionPercentage(prediction.score)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            index === 0 ? 'bg-[#0ca7a2]' : index === 1 ? 'bg-[#7896d1]' : 'bg-[#a4b4ce]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[130px] flex-col items-center justify-center text-center">
                <Icon name="scan" size={28} className="text-[#a8b2c2]" />
                <p className="mt-3 text-xs font-semibold text-[#68758a]">No prediction available</p>
                <p className="mt-1 text-[11px] text-[#9aa4b2]">
                  Run an analysis to see experimental model predictions.
                </p>
              </div>
            )}

            {latestAnalysis && (
              <a
                href={`${reportPath}?analysis=${latestAnalysis._id}`}
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#138f90] hover:text-[#087776]"
              >
                View latest report <Icon name="arrow" size={15} />
              </a>
            )}
          </Card>
        </section>

        {/* Image Quality + Recent Analysis */}
        <section className="mb-6 grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
          <Card className="p-5 sm:p-6">
            <SectionTitle
              title="Latest image quality"
              subtitle="Measurements from the most recent uploaded image"
            />

            {latestAnalysis && latestResult.quality ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <QualityMetric label="Brightness" value={quality.brightness} />
                  <QualityMetric label="Sharpness" value={quality.sharpness} />
                  <QualityMetric label="Color spread" value={quality.colorSpread} />
                  <QualityMetric label="Mean hue" value={latestResult.visualMeasurements?.meanHue} />
                </div>
                {Array.isArray(quality.notes) && quality.notes.length > 0 && (
                  <div className="mt-4 rounded-xl bg-[#fff8e9] p-3">
                    <p className="text-[10px] font-bold text-[#986b2b]">Image quality notes</p>
                    {quality.notes.slice(0, 2).map((note, index) => (
                      <p key={index} className="mt-1 text-[11px] leading-5 text-[#987b50]">{note}</p>
                    ))}
                  </div>
                )}
                <a
                  href={`${reportPath}?analysis=${latestAnalysis._id}`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#138f90]"
                >
                  Open full report <Icon name="arrow" size={15} />
                </a>
              </>
            ) : (
              <div className="rounded-xl bg-[#f7f9fc] px-4 py-8 text-center">
                <Icon name="image" size={27} className="mx-auto text-[#9ba7b8]" />
                <p className="mt-3 text-xs text-[#8792a5]">Image measurements will appear after your first analysis.</p>
              </div>
            )}
          </Card>

          <Card id="reports" className="p-5 sm:p-6">
            <SectionTitle
              title="Recent analyses"
              subtitle="Your previously saved image analysis reports"
              action={
                <a href={reportPath} className="inline-flex items-center gap-1 text-xs font-bold text-[#138f90]">
                  View all <Icon name="arrow" size={14} />
                </a>
              }
            />

            {analyses.length > 0 ? (
              <div className="divide-y divide-[#edf0f5]">
                {analyses.slice(0, 5).map((analysis) => {
                  const result = analysis.analysisResult || {};
                  const topPrediction = result.classifier?.predictions?.[0];

                  return (
                    <a
                      key={analysis._id}
                      href={`${reportPath}?analysis=${analysis._id}`}
                      className="group flex items-center gap-3 py-3 transition hover:bg-[#f9fbfd]"
                    >
                      <img
                        src={skinImage}
                        alt="Skin analysis"
                        className="h-11 w-11 shrink-0 rounded-xl border border-[#edf0f5] object-cover object-[48%_35%]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#263753]">
                          {new Date(analysis.createdAt).toLocaleString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-[#8792a5]">
                          {topPrediction
                            ? `Top prediction: ${topPrediction.label} (${getPredictionPercentage(topPrediction.score)})`
                            : 'Informational image analysis'}
                        </p>
                      </div>
                      <span className="hidden rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[9px] font-bold text-[#21845a] sm:inline-flex">
                        Saved
                      </span>
                      <span className="text-lg text-[#a0aabb] transition group-hover:translate-x-1 group-hover:text-[#159d9b]">›</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="py-9 text-center">
                <Icon name="file" size={27} className="mx-auto text-[#a3adbd]" />
                <p className="mt-3 text-xs font-semibold text-[#65738a]">
                  {loading ? 'Loading your reports...' : 'No saved analyses yet'}
                </p>
                <p className="mt-1 text-[11px] text-[#9aa4b2]">
                  Your completed analysis reports will appear here.
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* Quick Actions + Disclaimer */}
        <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Card className="p-5 sm:p-6">
            <SectionTitle
              title="Quick actions"
              subtitle="Continue with your DermaCare workspace"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={analyzePath}
                className="group flex items-center gap-3 rounded-xl border border-[#dcefed] bg-[#f3fbfa] p-4 transition hover:border-[#0da9a6] hover:bg-[#eaf8f6]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#149795] shadow-sm">
                  <Icon name="plus" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#203451]">New analysis</p>
                  <p className="mt-1 text-[10px] text-[#8491a3]">Upload a skin image</p>
                </div>
                <Icon name="arrow" size={16} className="text-[#168f8c] transition group-hover:translate-x-1" />
              </a>

              <a
                href={reportPath}
                className="group flex items-center gap-3 rounded-xl border border-[#e8eefa] bg-[#f7f9fd] p-4 transition hover:border-[#809cd2]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#6882bb] shadow-sm">
                  <Icon name="file" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#203451]">View reports</p>
                  <p className="mt-1 text-[10px] text-[#8491a3]">Access saved analyses</p>
                </div>
                <Icon name="arrow" size={16} className="text-[#6882bb] transition group-hover:translate-x-1" />
              </a>
            </div>
          </Card>

          <Card className="flex flex-col justify-between bg-[#f1faf9] p-5 sm:p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#168e8b]">
                <Icon name="sparkles" size={20} />
              </div>
              <h2 className="mt-4 text-sm font-bold text-[#203451]">About your analysis</h2>
              <p className="mt-2 text-[11px] leading-5 text-[#728195]">
                DermaCare AI provides informational image-quality measurements and experimental machine-learning category predictions.
                These results are not a medical diagnosis.
              </p>
            </div>
            <a href={analyzePath} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#138f90]">
              Start a new analysis <Icon name="arrow" size={15} />
            </a>
          </Card>
        </section>

        <footer className="mt-8 border-t border-[#e7ebf2] py-5 text-center text-[10px] text-[#9aa4b2]">
          © {new Date().getFullYear()} DermaCare AI. Informational skin image analysis.
        </footer>
      </main>
    </div>
  );
}
