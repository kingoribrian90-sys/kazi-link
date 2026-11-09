import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { categories } from "./data.js";
import { Avatar, Brand, Footer, Icon } from "./components/ui.jsx";
import { AppDialogs } from "./components/AppDialogs.jsx";
import { supabase } from "./lib/supabaseClient.js";
import {
  fetchProfileReviews,
  fetchPublicProfiles,
  fetchRequests,
  fetchSavedProfileIds,
  mapProfile,
  mapRequest,
  mapReview,
} from "./lib/marketplace.js";

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
  const [authUser, setAuthUser] = useState(null);
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
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) throw error;
        setAuthUser(data.session?.user || null);
      })
      .catch((error) => {
        if (active) setToast(`Could not restore your session: ${error.message}`);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(session?.user || null);
      if (event === "PASSWORD_RECOVERY") {
        setAuthMode("recovery");
        setAuthOpen(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    let active = true;
    fetchPublicProfiles()
      .then((items) => {
        if (active) setProfiles(items);
      })
      .catch((error) => {
        if (active) setToast(`Could not load freelancers: ${error.message}`);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!authUser) {
      setUser(null);
      setMyProfile(null);
      setRequests([]);
      setSavedIds([]);
      return () => {
        active = false;
      };
    }

    const loadAccount = async () => {
      try {
        const [profileResult, accountRequests, favorites] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single(),
          fetchRequests(),
          fetchSavedProfileIds(authUser.id),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (!active) return;

        const profile = profileResult.data;
        setUser({
          id: profile.id,
          name: profile.name,
          role: profile.role,
          email: authUser.email,
          avatar: profile.avatar_url || "",
        });
        const freelancerProfile =
          profile.role === "freelancer" ? mapProfile(profile) : null;
        setMyProfile(freelancerProfile);
        if (freelancerProfile) {
          setProfiles((current) => {
            const exists = current.some((item) => item.id === profile.id);
            return exists
              ? current.map((item) =>
                  item.id === profile.id ? freelancerProfile : item,
                )
              : [freelancerProfile, ...current];
          });
        }
        setRequests(accountRequests);
        setSavedIds(favorites);
      } catch (error) {
        if (active) setToast(`Could not load your account: ${error.message}`);
      }
    };
    loadAccount();
    return () => {
      active = false;
    };
  }, [authUser]);
  useEffect(() => {
    if (view !== "profile" || !selected?.id) return undefined;
    let active = true;
    fetchProfileReviews(selected.id)
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
    if (!user || !pendingFreelancerId) return;
    if (user.role === "owner") {
      const target = profiles.find(
        (profile) => profile.id === pendingFreelancerId,
      );
      if (!target) return;
      setRequestTarget(target);
    } else {
      setToast("Sign in as a business owner to send a job request.");
      navigate("dashboard");
    }
    setPendingFreelancerId(null);
  }, [user, pendingFreelancerId, profiles]);
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
  const toggleSaved = async (id) => {
    if (!user) {
      setToast("Create a free account to save your favourite freelancers.");
      setAuthRole("owner");
      setAuthOpen(true);
      return;
    }
    try {
      if (savedIds.includes(id)) {
        const { error } = await supabase
          .from("saved_profiles")
          .delete()
          .eq("user_id", user.id)
          .eq("profile_id", id);
        if (error) throw error;
        setSavedIds((current) => current.filter((savedId) => savedId !== id));
        setToast("Removed from your saved freelancers.");
      } else {
        const { error } = await supabase
          .from("saved_profiles")
          .insert({ user_id: user.id, profile_id: id });
        if (error) throw error;
        setSavedIds((current) => [...current, id]);
        setToast("Freelancer saved for later.");
      }
    } catch (error) {
      setToast(`Could not update your saved freelancers: ${error.message}`);
    }
  };
  const changeRequestStatus = async (requestId, status) => {
    try {
      const { data, error } = await supabase
        .from("job_requests")
        .update({ status })
        .eq("id", requestId)
        .eq("freelancer_id", user.id)
        .select("*")
        .single();
      if (error) throw error;
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? mapRequest(data, request.reviewed)
            : request,
        ),
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
      const { data, error } = await supabase
        .from("profiles")
        .update({
          name: updated.name,
          title: updated.role,
          service: updated.service,
          category: updated.category,
          subcategories: updated.subcategories,
          price: updated.price,
          location: updated.location,
          languages: updated.languages,
          availability: updated.availability,
          accepts_mpesa: updated.acceptsMpesa,
          online: updated.online,
          bio: updated.bio,
          avatar_url: updated.avatar,
          portfolio: updated.portfolio,
        })
        .eq("id", user.id)
        .select("*")
        .single();
      if (error) throw error;
      const savedProfile = mapProfile(data);
      setMyProfile(savedProfile);
      setProfiles((current) =>
        current.some((profile) => profile.id === savedProfile.id)
          ? current.map((profile) =>
              profile.id === savedProfile.id ? savedProfile : profile,
            )
          : [savedProfile, ...current],
      );
      setToast("Your profile has been updated.");
      return true;
    } catch (error) {
      setToast(`Could not update your profile: ${error.message}`);
      return false;
    }
  };
  const completeAuth = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("identity") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setAuthOpen(false);
        navigate("dashboard");
        setToast("Welcome back to KaziLink.");
        return;
      }

      const name = String(data.get("name") || "").trim();
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: authRole },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setAuthOpen(false);
      if (!result.session) {
        setAuthMode("login");
        setToast("Check your email to confirm your KaziLink account.");
        return;
      }
      navigate("dashboard");
      setToast(`Karibu, ${name.split(" ")[0]}!`);
    } catch (error) {
      setToast(`Could not ${authMode === "login" ? "log in" : "sign up"}: ${error.message}`);
    }
  };
  const requestPasswordReset = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("identity") || "").trim().toLowerCase();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setAuthMode("login");
      setToast("If an account exists for that email, a reset link is on its way.");
    } catch (error) {
      setToast(`Could not send a password reset email: ${error.message}`);
    }
  };
  const updatePassword = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setAuthOpen(false);
      setAuthMode("login");
      setToast("Your password has been updated.");
    } catch (error) {
      setToast(`Could not update your password: ${error.message}`);
    }
  };
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("home");
      setToast("You’re signed out.");
    } catch (error) {
      setToast(`Could not sign out: ${error.message}`);
    }
  };
  const submitRequest = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const { data: request, error } = await supabase
        .from("job_requests")
        .insert({
          client_id: user.id,
          freelancer_id: requestTarget.id,
          service: String(data.get("service")),
          description: String(data.get("description")),
          budget: Number(data.get("budget")),
          deadline: String(data.get("deadline")),
          location: String(data.get("location")),
        })
        .select("*")
        .single();
      if (error) throw error;
      setRequests((current) => [mapRequest(request), ...current]);
      setRequestTarget(null);
      navigate("dashboard");
      setToast("Job request sent. You’ll see updates on your dashboard.");
    } catch (error) {
      setToast(`Could not send the job request: ${error.message}`);
    }
  };
  const submitReview = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rating = Number(data.get("rating"));
    try {
      const { data: review, error } = await supabase
        .from("reviews")
        .insert({
          request_id: reviewTarget.id,
          client_id: user.id,
          freelancer_id: reviewTarget.freelancerId,
          rating,
          comment: String(data.get("comment")).trim(),
        })
        .select("*")
        .single();
      if (error) throw error;
      setReviews((current) => [mapReview(review), ...current]);
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
                    (profile.rating * profile.reviews + rating) /
                    (profile.reviews + 1)
                  ).toFixed(2),
                ),
                reviews: profile.reviews + 1,
              }
            : profile,
        ),
      );
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
                  onClick={logout}
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
        requestPasswordReset={requestPasswordReset}
        updatePassword={updatePassword}
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
