import { lazy, Suspense, useEffect, useState } from "react";
import { api } from "./api.js";
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

export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
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

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [publicProfiles] = await Promise.all([
          api.profiles({ limit: 100 }),
        ]);
        if (active) setProfiles(publicProfiles);
        if (!api.hasSession()) return;

        const currentUser = await api.me();
        if (!active) return;
        setUser(currentUser);
        const [profile, userRequests, favorites] = await Promise.all([
          currentUser.role === "freelancer" ? api.myProfile() : null,
          api.requests(),
          api.saved(),
        ]);
        if (!active) return;
        setMyProfile(profile);
        setRequests(userRequests);
        setSavedIds(favorites);
      } catch (error) {
        if (!active) return;
        if (error.status === 401) api.clearSession();
        setToast(`Could not load KaziLink data: ${error.message}`);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (view !== "search") return undefined;
    let active = true;
    const filters = {
      q: query,
      category: filter.category,
      subcategory: filter.subcategory,
      location: filter.location,
      budget: filter.budget,
      availability: filter.availability,
      language: filter.language,
      mpesa: filter.mpesa,
      experience: filter.experience,
      verified: filter.verified ? "true" : "",
      sort: filter.sort,
      limit: 100,
    };
    api.profiles(filters)
      .then((items) => {
        if (active) setProfiles(items);
      })
      .catch((error) => {
        if (active) setToast(`Could not search freelancers: ${error.message}`);
      });
    return () => {
      active = false;
    };
  }, [view, query, filter]);
  useEffect(() => {
    if (view !== "profile" || !selected?.id) return undefined;
    let active = true;
    api.reviews(selected.id)
      .then((items) => {
        if (active) setReviews(items);
      })
      .catch((error) => {
        if (active) setToast(`Could not load reviews: ${error.message}`);
      });
    return () => {
      active = false;
    };
  }, [view, selected?.id]);
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
  const openProfile = async (person) => {
    setSelected(person.name ? person : null);
    setView("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!person.name) {
      try {
        setSelected(await api.profile(person.id));
      } catch (error) {
        setToast(`Could not load freelancer profile: ${error.message}`);
      }
    }
  };
  const activeProfile =
    profiles.find((profile) => profile.id === selected?.id) || selected;
  const myRequests = user?.role === "owner" ? requests : [];
  const incomingRequests = user?.role === "freelancer" ? requests : [];
  const filteredProfiles = profiles;

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
  const toggleSaved = async (id) => {
    if (!user) {
      setToast("Create a free account to save your favourite freelancers.");
      setAuthRole("owner");
      setAuthOpen(true);
      return;
    }
    try {
      const result = await api.toggleSaved(id);
      setSavedIds(result.profileIds);
      setToast(
        result.saved
          ? "Freelancer saved for later."
          : "Removed from your saved freelancers.",
      );
    } catch (error) {
      setToast(`Could not update saved freelancers: ${error.message}`);
    }
  };
  const loadAccountData = async (account) => {
    const [profile, accountRequests, favorites] = await Promise.all([
      account.role === "freelancer" ? api.myProfile() : null,
      api.requests(),
      account.role === "owner" ? api.saved() : [],
    ]);
    setMyProfile(profile);
    setRequests(accountRequests);
    setSavedIds(favorites);
    if (profile) {
      setProfiles((current) => [
        ...current.filter((item) => item.id !== profile.id),
        profile,
      ]);
    }
  };
  const changeRequestStatus = async (requestId, status) => {
    try {
      const updated = await api.updateRequest(requestId, status);
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? updated : request)),
      );
      setToast(
        status === "accepted"
          ? "Request accepted. The business owner will see the update."
          : status === "declined"
            ? "Request declined."
            : "Job marked as complete.",
      );
    } catch (error) {
      setToast(`Could not update the request: ${error.message}`);
    }
  };
  const saveProfile = async (updated) => {
    try {
      const savedProfile = await api.updateProfile(updated);
      setMyProfile(savedProfile);
      setProfiles((current) => {
        const found = current.some((profile) => profile.id === savedProfile.id);
        return found
          ? current.map((profile) =>
              profile.id === savedProfile.id ? savedProfile : profile,
            )
          : [...current, savedProfile];
      });
      setToast("Your profile has been updated.");
    } catch (error) {
      setToast(`Could not save your profile: ${error.message}`);
    }
  };
  const completeAuth = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const identity = String(data.get("identity") || "").trim();
    try {
      const currentUser =
        authMode === "signup"
          ? await api.register({
              identity,
              name: String(data.get("name") || "").trim(),
              password: String(data.get("password") || ""),
              role: authRole,
            })
          : await api.login({
              identity,
              password: String(data.get("password") || ""),
            });
      setUser(currentUser);
      let accountLoadError = "";
      try {
        await loadAccountData(currentUser);
      } catch (error) {
        accountLoadError = error.message;
      }
      setAuthOpen(false);
      setToast(
        accountLoadError
          ? `Signed in, but account data could not load: ${accountLoadError}`
          : `Karibu, ${currentUser.name.split(" ")[0]}!`,
      );
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
    } catch (error) {
      setToast(`Could not sign in: ${error.message}`);
    }
  };
  const submitRequest = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const request = await api.createRequest({
        freelancerId: requestTarget.id,
        service: String(data.get("service")),
        description: String(data.get("description")),
        budget: Number(data.get("budget")),
        deadline: String(data.get("deadline")),
        location: String(data.get("location")),
      });
      setRequests((current) => [request, ...current]);
      setRequestTarget(null);
      navigate("dashboard");
      setToast("Job request sent. You’ll see updates on your dashboard.");
    } catch (error) {
      setToast(`Could not send your request: ${error.message}`);
    }
  };
  const submitReview = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const review = await api.createReview({
        requestId: reviewTarget.id,
        rating: Number(data.get("rating")),
        comment: String(data.get("comment")).trim(),
      });
      setReviews((current) => [review, ...current]);
      setRequests((current) =>
        current.map((request) =>
          request.id === reviewTarget.id
            ? { ...request, reviewed: true }
            : request,
        ),
      );
      const updatedProfiles = await api.profiles({ limit: 100 });
      setProfiles(updatedProfiles);
      setReviewTarget(null);
      setToast("Thanks for sharing your experience.");
    } catch (error) {
      setToast(`Could not post your review: ${error.message}`);
    }
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
                  onClick={async () => {
                    let logoutError;
                    try {
                      await api.logout();
                    } catch (error) {
                      logoutError = error;
                    }
                    setUser(null);
                    setMyProfile(null);
                    setRequests([]);
                    setSavedIds([]);
                    navigate("home");
                    setToast(
                      logoutError
                        ? `Signed out locally; server logout failed: ${logoutError.message}`
                        : "You’re signed out.",
                    );
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
