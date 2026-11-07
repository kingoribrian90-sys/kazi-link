import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { categories, seedFreelancers, seedReviews } from "./data.js";
import { Avatar, Brand, Footer, Icon } from "./components/ui.jsx";
import { AppDialogs } from "./components/AppDialogs.jsx";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage.jsx").then((module) => ({
    default: module.DashboardPage,
  })),
);
const HomePage = lazy(() =>
  import("./pages/HomePage.jsx").then((module) => ({
    default: module.HomePage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage.jsx").then((module) => ({
    default: module.ProfilePage,
  })),
);
const SearchPage = lazy(() =>
  import("./pages/SearchPage.jsx").then((module) => ({
    default: module.SearchPage,
  })),
);

const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(`kazilink-${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`kazilink-${key}`, JSON.stringify(value));
    } catch {
      /* local storage may be unavailable */
    }
  },
};

export default function App() {
  const [profiles, setProfiles] = useState(() =>
    storage.get("profiles", seedFreelancers),
  );
  const [requests, setRequests] = useState(() => storage.get("requests", []));
  const [reviews, setReviews] = useState(() =>
    storage.get("reviews", seedReviews),
  );
  const [users, setUsers] = useState(() => storage.get("users", []));
  const [user, setUser] = useState(() => storage.get("user", null));
  const [savedIds, setSavedIds] = useState(() => storage.get("saved", []));
  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filter, setFilter] = useState({
    category: "",
    subcategory: "",
    location: "Anywhere in Kenya",
    budget: "",
    availability: "",
    language: "",
    mpesa: "",
    experience: "",
    verified: false,
    sort: "relevance",
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [authRole, setAuthRole] = useState("owner");
  const [pendingFreelancerId, setPendingFreelancerId] = useState(null);
  const [requestTarget, setRequestTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => storage.set("profiles", profiles), [profiles]);
  useEffect(() => storage.set("requests", requests), [requests]);
  useEffect(() => storage.set("reviews", reviews), [reviews]);
  useEffect(() => storage.set("users", users), [users]);
  useEffect(() => storage.set("user", user), [user]);
  useEffect(() => storage.set("saved", savedIds), [savedIds]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3400);
    return () => clearTimeout(timeout);
  }, [toast]);

  const navigate = (next) => {
    setView(next);
    setSelected(null);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goSearch = (term = "", category = "") => {
    setQuery(term);
    setSearchInput(term);
    setFilter((current) => ({ ...current, category, subcategory: "" }));
    setView("search");
    setSelected(null);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openProfile = (person) => {
    setSelected(person);
    setView("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const activeProfile =
    profiles.find((profile) => profile.id === selected?.id) || selected;
  const myProfile = profiles.find((profile) => profile.id === user?.id);
  const myRequests = requests.filter(
    (request) => request.clientId === user?.id,
  );
  const incomingRequests = requests.filter(
    (request) => request.freelancerId === user?.id,
  );

  const filteredProfiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let matching = profiles.filter((profile) => {
      const searchable = [
        profile.name,
        profile.role,
        profile.service,
        profile.category,
        ...(profile.subcategories || []),
      ]
        .join(" ")
        .toLowerCase();
      if (needle && !searchable.includes(needle)) return false;
      if (filter.category && profile.category !== filter.category) return false;
      if (
        filter.subcategory &&
        !(profile.subcategories || []).includes(filter.subcategory) &&
        profile.service !== filter.subcategory
      )
        return false;
      if (filter.location === "Nairobi" && profile.location !== "Nairobi")
        return false;
      if (filter.budget && Number(profile.price) > Number(filter.budget))
        return false;
      if (filter.availability && profile.availability !== filter.availability)
        return false;
      if (
        filter.language &&
        !(profile.languages || []).includes(filter.language)
      )
        return false;
      if (filter.mpesa === "yes" && !profile.acceptsMpesa) return false;
      if (filter.mpesa === "no" && profile.acceptsMpesa) return false;
      if (filter.experience && profile.experience !== filter.experience)
        return false;
      if (filter.verified && !profile.verified) return false;
      return true;
    });
    if (filter.sort === "rating")
      matching = [...matching].sort(
        (a, b) => Number(b.rating) - Number(a.rating),
      );
    else if (filter.sort === "recent")
      matching = [...matching].sort(
        (a, b) => Number(b.joined || 0) - Number(a.joined || 0),
      );
    else if (needle)
      matching = [...matching].sort(
        (a, b) =>
          Number(
            b.name.toLowerCase().includes(needle) ||
              b.service.toLowerCase().includes(needle),
          ) -
          Number(
            a.name.toLowerCase().includes(needle) ||
              a.service.toLowerCase().includes(needle),
          ),
      );
    return matching;
  }, [profiles, query, filter]);

  const startRequest = (profile) => {
    if (!user) {
      setPendingFreelancerId(profile.id);
      setAuthRole("owner");
      setAuthMode("signup");
      setAuthOpen(true);
      return;
    }
    if (user.role !== "owner") {
      setToast("A business owner account is needed to send a job request.");
      return;
    }
    setRequestTarget(profile);
  };
  const toggleSaved = (id) => {
    if (!user) {
      setToast("Create a free account to save your favourite freelancers.");
      setAuthRole("owner");
      setAuthOpen(true);
      return;
    }
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id],
    );
    setToast(
      savedIds.includes(id)
        ? "Removed from your saved freelancers."
        : "Freelancer saved for later.",
    );
  };
  const changeRequestStatus = (requestId, status) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status } : request,
      ),
    );
    setToast(
      status === "accepted"
        ? "Request accepted. The business owner will see the update."
        : status === "declined"
          ? "Request declined."
          : "Job marked as complete.",
    );
  };
  const saveProfile = (updated) => {
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === updated.id ? { ...profile, ...updated } : profile,
      ),
    );
    setToast("Your profile has been updated.");
  };
  const completeAuth = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const identity = String(data.get("identity") || "").trim();
    const isEmail = identity.includes("@");
    let currentUser = users.find(
      (item) => item.email === identity || item.phone === identity,
    );
    if (authMode === "login" && !currentUser) {
      setToast(
        "We couldn’t find that account. Create a new account to get started.",
      );
      return;
    }
    if (authMode === "signup" || !currentUser) {
      const name = String(data.get("name") || "").trim();
      currentUser = {
        id: `u-${Date.now()}`,
        name,
        role: authRole,
        email: isEmail ? identity : "",
        phone: isEmail ? "" : identity,
        location: "Nairobi",
        languages: ["English", "Kiswahili"],
        verified: false,
      };
      setUsers((current) => [...current, currentUser]);
      if (currentUser.role === "freelancer")
        setProfiles((current) => [
          ...current,
          {
            id: currentUser.id,
            name,
            role: "Digital freelancer",
            service: "Digital services",
            category: "Design and Creative",
            subcategories: [],
            price: 2500,
            rating: 0,
            reviews: 0,
            location: currentUser.location,
            languages: currentUser.languages,
            verified: false,
            experience: "new",
            availability: "flexible",
            acceptsMpesa: true,
            online: false,
            bio: "Tell local businesses a little about what you do and how you can help.",
            avatar: "",
            portfolio: [],
            joined: 11,
          },
        ]);
    }
    setUser(currentUser);
    setAuthOpen(false);
    setToast(`Karibu, ${currentUser.name.split(" ")[0]}!`);
    if (pendingFreelancerId && currentUser.role === "owner") {
      setRequestTarget(
        profiles.find((profile) => profile.id === pendingFreelancerId),
      );
      setPendingFreelancerId(null);
    } else if (pendingFreelancerId) {
      setPendingFreelancerId(null);
      setToast("Sign in as a business owner to send a job request.");
      navigate("dashboard");
    } else navigate("dashboard");
  };
  const submitRequest = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const request = {
      id: `job-${Date.now()}`,
      clientId: user.id,
      clientName: user.name,
      freelancerId: requestTarget.id,
      freelancerName: requestTarget.name,
      service: String(data.get("service")),
      description: String(data.get("description")),
      budget: Number(data.get("budget")),
      deadline: String(data.get("deadline")),
      location: String(data.get("location")),
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewed: false,
    };
    setRequests((current) => [request, ...current]);
    setRequestTarget(null);
    navigate("dashboard");
    setToast("Job request sent. You’ll see updates on your dashboard.");
  };
  const submitReview = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rating = Number(data.get("rating"));
    const review = {
      id: `review-${Date.now()}`,
      freelancerId: reviewTarget.freelancerId,
      client: user.name,
      rating,
      comment: String(data.get("comment")).trim(),
      date: new Date().toLocaleDateString("en-KE", {
        month: "short",
        year: "numeric",
      }),
    };
    setReviews((current) => [review, ...current]);
    setRequests((current) =>
      current.map((request) =>
        request.id === reviewTarget.id
          ? { ...request, reviewed: true }
          : request,
      ),
    );
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === reviewTarget.freelancerId
          ? {
              ...profile,
              rating: Number(
                (
                  (Number(profile.rating || 0) * Number(profile.reviews || 0) +
                    rating) /
                  (Number(profile.reviews || 0) + 1)
                ).toFixed(1),
              ),
              reviews: Number(profile.reviews || 0) + 1,
            }
          : profile,
      ),
    );
    setReviewTarget(null);
    setToast("Thanks for sharing your experience.");
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Brand onClick={() => navigate("home")} />
          <nav className={`main-nav ${mobileMenu ? "nav-open" : ""}`}>
            <button
              className={view === "search" ? "nav-active" : ""}
              onClick={() => goSearch()}
            >
              Find talent
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How it works
            </button>
            <button
              className="mobile-nav-cta"
              onClick={() => {
                setAuthRole("freelancer");
                setAuthMode("signup");
                setAuthOpen(true);
              }}
            >
              Become a freelancer
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="text-cta"
              onClick={() => {
                setAuthRole("freelancer");
                setAuthMode("signup");
                setAuthOpen(true);
              }}
            >
              Become a freelancer <Icon name="arrow" size={15} />
            </button>
            {user ? (
              <div className="user-actions">
                <button
                  className="avatar-button"
                  onClick={() => navigate("dashboard")}
                >
                  <Avatar person={user} size="sm" />
                  <span>{user.name.split(" ")[0]}</span>
                  <Icon name="chevron" size={15} />
                </button>
                <button
                  className="logout-button"
                  title="Sign out"
                  onClick={() => {
                    setUser(null);
                    navigate("home");
                    setToast("You’re signed out.");
                  }}
                >
                  <Icon name="logout" size={17} />
                </button>
              </div>
            ) : (
              <button
                className="login-button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthOpen(true);
                }}
              >
                Log in
              </button>
            )}
            <button
              className="mobile-menu-button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenu((open) => !open)}
            >
              <Icon name={mobileMenu ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="section-wrap" role="status">
            Loading page…
          </div>
        }
      >
      {view === "home" && (
        <HomePage
          onSearch={(term) => goSearch(term)}
          onCategory={(category) => goSearch("", category)}
          onOpen={openProfile}
          profiles={profiles}
          savedIds={savedIds}
          onSave={toggleSaved}
          onJoin={() => {
            setAuthRole("freelancer");
            setAuthMode("signup");
            setAuthOpen(true);
          }}
        />
      )}
      {view === "search" && (
        <SearchPage
          query={searchInput}
          setSearchInput={(value) => {
            setSearchInput(value);
            setQuery(value);
          }}
          filter={filter}
          setFilter={setFilter}
          profiles={filteredProfiles}
          onOpen={openProfile}
          savedIds={savedIds}
          onSave={toggleSaved}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          onReset={() => {
            setQuery("");
            setSearchInput("");
            setFilter({
              category: "",
              subcategory: "",
              location: "Anywhere in Kenya",
              budget: "",
              availability: "",
              language: "",
              mpesa: "",
              experience: "",
              verified: false,
              sort: "relevance",
            });
          }}
        />
      )}
      {view === "profile" && activeProfile && (
        <ProfilePage
          profile={activeProfile}
          reviews={reviews.filter(
            (review) => review.freelancerId === activeProfile.id,
          )}
          onBack={() => navigate("search")}
          onRequest={() => startRequest(activeProfile)}
          saved={savedIds.includes(activeProfile.id)}
          onSave={() => toggleSaved(activeProfile.id)}
        />
      )}
      {view === "dashboard" && user && (
        <DashboardPage
          user={user}
          profile={myProfile}
          profiles={profiles}
          requests={user.role === "freelancer" ? incomingRequests : myRequests}
          savedIds={savedIds}
          onOpen={openProfile}
          onToggleSaved={toggleSaved}
          onSaveProfile={saveProfile}
          onStatus={changeRequestStatus}
          onReview={setReviewTarget}
          onExplore={() => goSearch()}
        />
      )}
      {view === "dashboard" && !user && (
        <div className="access-page">
          <span className="eyebrow">YOUR KAZILINK</span>
          <h1>Good work starts with a good connection.</h1>
          <p>Log in or create your free account to see your dashboard.</p>
          <button
            className="button button-primary"
            onClick={() => {
              setAuthMode("login");
              setAuthOpen(true);
            }}
          >
            Log in to KaziLink <Icon name="arrow" size={17} />
          </button>
        </div>
      )}
      </Suspense>

      <Footer onNavigate={navigate} />
      <AppDialogs
        authOpen={authOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authRole={authRole}
        setAuthRole={setAuthRole}
        setAuthOpen={setAuthOpen}
        setPendingFreelancerId={setPendingFreelancerId}
        completeAuth={completeAuth}
        requestTarget={requestTarget}
        setRequestTarget={setRequestTarget}
        submitRequest={submitRequest}
        reviewTarget={reviewTarget}
        setReviewTarget={setReviewTarget}
        submitReview={submitReview}
        toast={toast}
        setToast={setToast}
      />
    </div>
  );
}
