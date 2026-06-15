import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function IconBase() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="7" cy="21" r="2" />
      <circle cx="17" cy="21" r="2" />
      <path d="M12 11V4M8 7l4-4 4 4" />
    </svg>
  );
}

function IconArm() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 6l-3 5M9 11l3 2M12 13l3-2M15 11l-3-5" />
      <circle cx="12" cy="2" r="1.5" />
      <circle cx="9" cy="11" r="1.5" />
      <circle cx="15" cy="11" r="1.5" />
      <circle cx="12" cy="13" r="1.5" />
      <path d="M12 13v5" />
      <circle cx="12" cy="20" r="2" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { path: "/",             label: "Manipulator",  description: "Forward Kinematics",  icon: <IconArm />  },
  { path: "/mobile-base",  label: "Mobile Base",  description: "Differential Drive",  icon: <IconBase /> },
];

export function Navbar() {
  return (
    <nav
      className="relative z-50 flex items-center justify-between px-6 h-14 border-b"
      style={{
        background: "rgba(8,12,18,0.96)",
        borderColor: "rgba(0,212,255,0.08)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(0,212,255,0.06), 0 4px 20px rgba(0,0,0,0.6)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,212,255,0.05))",
            border: "1px solid rgba(0,212,255,0.4)",
            boxShadow: "0 0 12px rgba(0,212,255,0.2)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#00d4ff" strokeWidth="2" strokeLinecap="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="leading-none">
          <div className="font-bold text-sm tracking-tight" style={{ color: "var(--text)" }}>RoboSim</div>
          <div className="text-xs mt-0.5 opacity-60" style={{ color: "var(--muted)" }}>Robotics Platform</div>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive ? "" : "opacity-60 hover:opacity-90"
              }`
            }
            style={{ color: "var(--text)" }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "rgba(0,212,255,0.08)",
                      border: "1px solid rgba(0,212,255,0.25)",
                    }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10" style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}>
                  {item.icon}
                </span>
                <div className="relative z-10 leading-none">
                  <div className="text-sm leading-tight" style={{ color: isActive ? "var(--accent)" : "var(--text)" }}>
                    {item.label}
                  </div>
                  <div className="text-xs leading-tight mt-0.5 hidden md:block" style={{ color: "var(--muted)", opacity: 0.7 }}>
                    {item.description}
                  </div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--success)", boxShadow: "0 0 6px var(--success)", animation: "pulse 3s ease-in-out infinite" }}
        />
        <span className="text-xs font-mono tracking-widest" style={{ color: "var(--muted)" }}>LIVE</span>
      </div>
    </nav>
  );
}
