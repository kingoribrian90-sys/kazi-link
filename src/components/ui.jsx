import { useEffect } from "react";

export const KES = (amount) => `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
export const titleCase = (value = "") =>
  value.replace(/\b\w/g, (letter) => letter.toUpperCase());

export function Icon({ name, size = 20, stroke = 1.8 }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.8 4.8 0 0 1 8.8-2.5 4.8 4.8 0 0 1 8.8 2.5Z" />
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10M10 17h4" />
        <circle cx="8" cy="7" r="2" fill="currentColor" />
        <circle cx="15" cy="12" r="2" fill="currentColor" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    message: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    chevron: <path d="m7 10 5 5 5-5" />,
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
        <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.sparkle}
    </svg>
  );
}

export function Brand({ onClick }) {
  return (
    <button className="brand" onClick={onClick} aria-label="KaziLink home">
      <span className="brand-mark">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span>
        Kazi<span>Link</span>
      </span>
    </button>
  );
}

export function Avatar({ person, size = "md" }) {
  const initials = (person?.name || "K")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <div className={`avatar avatar-${size}`}>
      {person?.avatar ? (
        <>
          <img
            src={person.avatar}
            alt={person.name}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling.style.display = "grid";
            }}
          />
          <span className="avatar-fallback">{initials}</span>
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function FreelancerCard({ person, onOpen, saved, onSave, compact = false }) {
  const preview = person.portfolio?.[0];
  return (
    <article className={`talent-card ${compact ? "talent-card-compact" : ""}`}>
      <button
        className={`save-button ${saved ? "save-active" : ""}`}
        aria-label={saved ? "Remove saved freelancer" : "Save freelancer"}
        onClick={(event) => {
          event.stopPropagation();
          onSave?.(person.id);
        }}
      >
        <Icon name="heart" size={19} />
        <span className="sr-only">{saved ? "Saved" : "Save"}</span>
      </button>
      <button className="talent-main" onClick={() => onOpen(person)}>
        <div className="talent-top">
          <Avatar person={person} />
          <div className="talent-identity">
            <div className="name-line">
              <h3>{person.name}</h3>
              {person.verified && (
                <span className="verified-mark" title="Verified freelancer">
                  <Icon name="check" size={13} />
                </span>
              )}
            </div>
            <p>{person.role}</p>
          </div>
        </div>
        <div className="talent-offer">
          <span className="offer-dot"></span>
          {person.service}
        </div>
        <div className="talent-meta">
          <span className="rating">
            <Icon name="star" size={15} />{" "}
            {Number(person.rating || 0).toFixed(1)}{" "}
            <small>({person.reviews || 0})</small>
          </span>
          <span className="meta-location">
            <Icon name="pin" size={14} /> {person.location || "Kenya"}
          </span>
        </div>
        <div className="talent-preview">
          <img
            src={preview?.image}
            alt={preview?.title || "Portfolio sample"}
            onError={(event) => {
              event.currentTarget.style.opacity = ".16";
            }}
          />
          <span className="preview-label">
            {preview?.title || "Portfolio sample"}
          </span>
        </div>
      </button>
      <div className="talent-bottom">
        <span className="starting-price">
          <small>Starting at</small>
          <strong>{KES(person.price)}</strong>
        </span>
        <span
          className={`availability ${person.online ? "availability-online" : ""}`}
        >
          {person.online ? (
            <>
              <i></i> Available now
            </>
          ) : (
            <>
              <Icon name="clock" size={14} />{" "}
              {titleCase(person.availability || "flexible")}
            </>
          )}
        </span>
      </div>
      <button className="card-link" onClick={() => onOpen(person)}>
        View profile <Icon name="arrow" size={15} />
      </button>
    </article>
  );
}

export function Modal({ title, subtitle, onClose, children, wide = false }) {
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
        {title && (
          <div className="modal-heading">
            <span className="eyebrow">KAZILINK</span>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}
        {children}
      </section>
    </div>
  );
}

export function FilterGroup({ label, children }) {
  return (
    <div className="filter-group">
      <h4>{label}</h4>
      {children}
    </div>
  );
}

export function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-main section-wrap">
        <div className="footer-brand-col">
          <Brand onClick={() => onNavigate("home")} />
          <p>
            Good people. Good work.
            <br />
            Right here in Kenya.
          </p>
          <div className="footer-local">
            <Icon name="pin" size={15} /> Made for Kenya <span>·</span> Built on
            trust
          </div>
        </div>
        <div className="footer-col">
          <strong>Discover</strong>
          <button onClick={() => onNavigate("search")}>Find freelancers</button>
          <button onClick={() => onNavigate("home")}>Browse categories</button>
          <button
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            How it works
          </button>
        </div>
        <div className="footer-col">
          <strong>Join the community</strong>
          <button onClick={() => onNavigate("dashboard")}>
            Business owners
          </button>
          <button onClick={() => onNavigate("dashboard")}>Freelancers</button>
          <button onClick={() => onNavigate("dashboard")}>
            Your dashboard
          </button>
        </div>
        <div className="footer-note">
          <span className="footer-note-icon">
            <Icon name="sparkle" size={19} />
          </span>
          <p>Making room for good work, in every corner of Kenya.</p>
          <span className="footer-kiswahili">Kazi nzuri, pamoja.</span>
        </div>
      </div>
      <div className="footer-bottom section-wrap">
        <span>© 2026 KaziLink. Made with care in Kenya.</span>
        <span>
          Prices in KES <span className="footer-dot">·</span> Karibu sana.
        </span>
      </div>
    </footer>
  );
}
