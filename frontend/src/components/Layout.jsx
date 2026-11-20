import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Film, ListChecks, Ticket, Menu, X, Sparkles, Clock, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/', label: 'What’s On / Films', short: 'Films' },
  { to: '/rewatch', label: 'Rewatch Roadmap', short: 'Roadmap' },
  { to: '/booking', label: 'Watch-Party Booking', short: 'Booking' },
];

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-[#1c1917] font-sans selection:bg-[#cba158]/30 selection:text-stone-900">
      {/* Top Doomsday Ready Clean White Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Doomsday Ready Wordmark */}
          <div
            onClick={() => navigate('/')}
            className="flex flex-col cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-wider text-xl sm:text-2xl text-stone-900 group-hover:text-[#b48937] transition-colors uppercase">
                DOOMSDAY READY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#cba158]" />
            </div>
            <span className="text-[9px] font-mono tracking-widest uppercase text-stone-500 -mt-0.5">
              MCU REWATCH &amp; WATCH-PARTY PLANNER
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Button & Mobile Burger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/booking')}
              className="hidden sm:inline-flex items-center gap-2 bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 font-extrabold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:scale-[1.02]"
            >
              <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
              Book Watch-Party
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-2 animate-fade-in shadow-lg">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="pt-2">
              <button
                onClick={() => navigate('/booking')}
                className="w-full bg-[#cba158] hover:bg-[#b88e3b] text-stone-950 font-extrabold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-sm"
              >
                Book Watch-Party Tickets
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>

      {/* Clean White/Stone Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 mt-16 py-10 sm:py-14 text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif font-black tracking-wider text-lg text-stone-900 uppercase">
                  DOOMSDAY READY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#cba158]" />
                <span className="text-xs text-stone-500 font-mono tracking-widest">MCU PORTAL</span>
              </div>
              <p className="text-xs text-stone-500 max-w-md mt-1 leading-relaxed">
                Curating the definitive MCU canonical journey before Avengers: Doomsday. Hand-crafted directed acyclic graph algorithms &amp; optimal watch-party bundle booking.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-stone-600">
              <span className="hover:text-stone-900 transition-colors">Stark Tower IMAX</span>
              <span>•</span>
              <span className="hover:text-stone-900 transition-colors">Sanctum Sanctorum</span>
              <span>•</span>
              <span className="hover:text-stone-900 transition-colors">Wakanda Royal Dolby</span>
              <span>•</span>
              <span className="hover:text-stone-900 transition-colors">Avengers Compound</span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-stone-500">
            <div>
              © 2027 DOOMSDAY READY • BLINTO TALENT ACCELERATOR FULL-STACK ASSESSMENT
            </div>
            <div className="flex items-center gap-4">
              <span>ZERO SOLVER LIBRARIES</span>
              <span>•</span>
              <span>KAHN'S BFS TOPOLOGICAL SORT</span>
              <span>•</span>
              <span>COIN-CHANGE DP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
