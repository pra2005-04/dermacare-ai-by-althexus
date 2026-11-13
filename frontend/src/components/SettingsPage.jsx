
import { useEffect, useRef, useState } from 'react';
import '../styles/index.css';
import { apiRequest } from '../lib/api';
import logoImage from '../assets/logo.jpeg';
import skinImage from '../assets/women-image.png';

const base = import.meta.env.BASE_URL;
const dashboardPath = `${base}dashboard`;
const analyzePath = `${base}analyze`;
const reportPath = `${base}report`;
const profilePath = `${base}profile`;

const appNavigation = [
  { label: 'Dashboard', icon: 'grid', href: dashboardPath },
  { label: 'Analysis', icon: 'scan', href: analyzePath },
  { label: 'Reports', icon: 'file', href: reportPath },
  { label: 'Profile', icon: 'user', href: profilePath },
  { label: 'AI Assistant', icon: 'sparkles', href: '#' },
 { label: 'Settings', icon: 'settings', href: `${base}settings` },
];
const loginPath = `${base}login`;

const sections = [
  { id: 'account', label: 'My Account', icon: 'user' },
  { id: 'security', label: 'Security & Login', icon: 'shield' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'privacy', label: 'Privacy & Data', icon: 'lock' },
  { id: 'help', label: 'Help & About', icon: 'help' },
];

function Icon({ name, size = 20 }) {
  const paths = {
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><path d="m9 12 2 2 4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    palette: <><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-2c-1.2 0-2 .8-2 2 0 1.7-1.3 3-3 3z" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    camera: <><path d="M14 4H10L8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" /><circle cx="12" cy="13" r="3" /></>,
grid: <>
  <rect x="3" y="3" width="7" height="7" rx="1.5" />
  <rect x="14" y="3" width="7" height="7" rx="1.5" />
  <rect x="3" y="14" width="7" height="7" rx="1.5" />
  <rect x="14" y="14" width="7" height="7" rx="1.5" />
</>,
scan: <>
  <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
  <circle cx="12" cy="12" r="3" />
</>,
file: <>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <path d="M14 2v6h6M8 13h8M8 17h8" />
</>,
sparkles: <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
settings: <>
  <circle cx="12" cy="12" r="3" />
  <path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.5-2.3 1a7 7 0 0 0-2.5-1.5L14 3h-4l-.2 2a7 7 0 0 0-2.5 1.5L5 5.5 3 9l2 1.5a7 7 0 0 0 0 3L3 15l2 3.5 2.3-1a7 7 0 0 0 2.5 1.5l.2 2h4l.2-2a7 7 0 0 0 2.5-1.5l2.3 1 2-3.5z" />
</>,
logout: <>
  <path d="M10 17l5-5-5-5M15 12H3" />
  <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
</>,
};

  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-[#e8edf3] bg-white p-5 shadow-[0_4px_20px_rgba(16,36,92,0.04)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    email: '',
    avatar: null,
  });
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('dermacare-auth-token')) {
      window.location.href = loginPath;
      return;
    }

    let active = true;

    apiRequest('/api/profile')
      .then(({ user }) => {
        if (!active) return;
        setProfile({
          name: user.name || '',
          age: user.age ?? '',
          email: user.email || '',
          avatar: user.avatar || null,
        });
      })
      .catch((error) => {
        if (active) {
          setMessage({
            type: 'error',
            text: error.message || 'Unable to load your account.',
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ type: 'error', text: 'Choose a JPG, PNG, or WEBP image.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 2 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((previous) => ({ ...previous, avatar: reader.result }));
      setAvatarChanged(true);
      setMessage({ type: '', text: '' });
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!profile.name.trim()) {
      setMessage({ type: 'error', text: 'Full name is required.' });
      return;
    }

    const body = { name: profile.name.trim() };

    if (profile.age !== '') {
      const age = Number(profile.age);
      if (!Number.isInteger(age) || age < 1 || age > 120) {
        setMessage({ type: 'error', text: 'Age must be between 1 and 120.' });
        return;
      }
      body.age = age;
    }

    if (avatarChanged) {
      body.avatarDataUrl = profile.avatar || null;
    }

    setSaving(true);

    try {
      const { user } = await apiRequest('/api/profile', {
        method: 'PUT',
        body,
      });

      setProfile({
        name: user.name || '',
        age: user.age ?? '',
        email: user.email || '',
        avatar: user.avatar || null,
      });

      setAvatarChanged(false);
      setMessage({ type: 'success', text: 'Account details saved successfully.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Changes could not be saved.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dermacare-auth-token');
    localStorage.removeItem('dermacare-user');
    localStorage.removeItem('dermacare-user-id');
    window.location.href = loginPath;
  };

  const currentSection = sections.find((item) => item.id === activeSection);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#182440] lg:flex">


{/* Main Application Sidebar */}
<aside className="flex w-full shrink-0 flex-col bg-[#09234e] px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-[250px] lg:px-5">

  <a href={dashboardPath} className="mb-7 flex items-center gap-3 px-2">
    <img src={logoImage} alt="DermaCare AI"
      className="h-11 w-11 rounded-xl bg-white object-cover p-1" />
    <div>
      <strong className="block text-[18px] leading-tight tracking-tight">
        DermaCare <span className="text-[#42d5cb]">AI</span>
      </strong>
      <span className="mt-1 block text-[10px] text-white/60">
        AI-Powered Skin Analysis
      </span>
    </div>
  </a>

  <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[2px] text-white/40">
    Workspace
  </p>

  <nav className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1"
    aria-label="Dashboard navigation">

    {appNavigation.map((item) => (
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


      {/* Main */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#159d9b]">
              Account preferences
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#14264d]">
              Settings
            </h1>
            <p className="mt-1 text-sm text-[#8590a2]">
              Manage your account and application preferences.
            </p>
          </div>

          <a href={dashboardPath}
            className="rounded-xl border border-[#dfe6ef] bg-white px-4 py-3 text-xs font-bold text-[#34435e] hover:bg-[#f7fafc]">
            Back to Dashboard
          </a>
        </header>
        {/* Settings Section Navigation */}
<nav className="mb-6 flex flex-wrap gap-2">
  {sections.map((item) => (
    <button
      key={item.id}
      type="button"
      onClick={() => {
        setActiveSection(item.id);
        setMessage({ type: '', text: '' });
      }}
      className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
        activeSection === item.id
          ? 'bg-[#0da9a6] text-white shadow-sm'
          : 'border border-[#e1e7ef] bg-white text-[#526078] hover:bg-[#edf8f7]'
      }`}
    >
      {item.label}
    </button>
  ))}
</nav>

        <div className="mb-5 flex items-center gap-2 text-xs text-[#8792a5]">
          <span>Settings</span>
          <span>/</span>
          <span className="font-semibold text-[#168f90]">{currentSection.label}</span>
        </div>

        {activeSection === 'account' && (
          <Card>
            <div className="mb-6 border-b border-[#edf0f5] pb-5">
              <h2 className="text-base font-bold text-[#16264a]">Personal Information</h2>
              <p className="mt-1 text-xs text-[#8792a5]">
                Update your name, age and profile picture.
              </p>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-[#8792a5]">Loading account details...</p>
            ) : (
              <form onSubmit={saveProfile}>
                <div className="mb-7 flex flex-wrap items-center gap-5">
                  <img
                    src={profile.avatar || skinImage}
                    alt="Profile"
                    className="h-20 w-20 rounded-full border-4 border-[#e8f7f5] object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-[#263753]">Profile Photo</p>
                    <p className="mt-1 text-[11px] text-[#8792a5]">JPG, PNG or WEBP. Maximum 2 MB.</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="mt-3 rounded-lg border border-[#cce7e5] px-3 py-2 text-xs font-bold text-[#168f90] hover:bg-[#f0faf9]"
                    >
                      <span className="inline-flex items-center gap-2"><Icon name="camera" size={15} /> Change Photo</span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="settings-name" className="mb-2 block text-xs font-bold text-[#34435e]">Full Name</label>
                    <input
                      id="settings-name"
                      type="text"
                      maxLength={120}
                      value={profile.name}
                      onChange={(e) => setProfile((old) => ({ ...old, name: e.target.value }))}
                      disabled={loading}
                      className="w-full rounded-xl border border-[#e1e7ef] bg-[#f9fafc] px-4 py-3 text-sm outline-none transition focus:border-[#0da9a6] focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="settings-age" className="mb-2 block text-xs font-bold text-[#34435e]">Age</label>
                    <input
                      id="settings-age"
                      type="number"
                      min="1"
                      max="120"
                      value={profile.age}
                      onChange={(e) => setProfile((old) => ({ ...old, age: e.target.value }))}
                      className="w-full rounded-xl border border-[#e1e7ef] bg-[#f9fafc] px-4 py-3 text-sm outline-none transition focus:border-[#0da9a6] focus:bg-white"
                      placeholder="Enter your age"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="settings-email" className="mb-2 block text-xs font-bold text-[#34435e]">Email Address</label>
                    <input
                      id="settings-email"
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-[#e1e7ef] bg-[#f0f2f6] px-4 py-3 text-sm text-[#8792a5]"
                    />
                    <p className="mt-1.5 text-[10px] text-[#9aa4b2]">Email address cannot be changed from this section.</p>
                  </div>
                </div>

                {message.text && (
                  <div role="status" className={`mt-5 rounded-xl px-4 py-3 text-xs font-medium ${
                    message.type === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-[#e7f7ef] text-[#21845a]'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f5] pt-5">
                  <p className="text-[10px] text-[#9aa4b2]">Your changes are saved to your account.</p>
                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="rounded-xl bg-[#09275d] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#0b2c78] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </Card>
        )}

        {activeSection !== 'account' && (
          <Card className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f7f5] text-[#159d9b]">
              <Icon name={currentSection.icon} size={27} />
            </div>
            <h2 className="mt-5 text-lg font-bold text-[#16264a]">{currentSection.label}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#8792a5]">
              This section is planned for DermaCare AI. Its controls will be enabled after the required functionality is connected.
            </p>
            <button
              type="button"
              onClick={() => setActiveSection('account')}
              className="mt-5 rounded-xl border border-[#dce8ed] px-4 py-2.5 text-xs font-bold text-[#168f90] hover:bg-[#f0faf9]"
            >
              Back to My Account
            </button>
          </Card>
        )}

        <footer className="mt-8 border-t border-[#e7ebf2] pt-5 text-center text-[10px] text-[#9aa4b2]">
          © {new Date().getFullYear()} DermaCare AI · Account Settings
        </footer>
      </main>
    </div>
  );
}
