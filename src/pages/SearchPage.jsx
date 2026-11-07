import { categories } from "../data.js";
import { FilterGroup, FreelancerCard, Icon } from "../components/ui.jsx";

export function SearchPage({
  query,
  setSearchInput,
  filter,
  setFilter,
  profiles,
  onOpen,
  savedIds,
  onSave,
  filtersOpen,
  setFiltersOpen,
  onReset,
}) {
  const set = (key, value) =>
    setFilter((current) => ({
      ...current,
      [key]: value,
      ...(key === "category" ? { subcategory: "" } : {}),
    }));
  const category = categories.find((item) => item.name === filter.category);
  const activeCount = [
    filter.category,
    filter.subcategory,
    filter.budget,
    filter.availability,
    filter.language,
    filter.mpesa,
    filter.experience,
    filter.verified,
  ].filter(Boolean).length;
  return (
    <main className="search-page section-wrap">
      <div className="breadcrumb">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Home
        </button>
        <span>/</span>
        <span>Find talent</span>
      </div>
      <div className="search-title-row">
        <div>
          <span className="eyebrow">TAFUTA FUNDI</span>
          <h1>Find the right talent.</h1>
          <p>Skilled freelancers. Real work. Right here in Kenya.</p>
        </div>
        <div className="result-trust">
          <Icon name="shield" size={18} />
          <span>
            Every profile is built around real work
            <br />
            and transparent reviews.
          </span>
        </div>
      </div>
      <form className="search-bar" onSubmit={(event) => event.preventDefault()}>
        <Icon name="search" size={21} />
        <input
          value={query}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="What do you need help with?"
          aria-label="Search freelancers"
        />
        <button className="search-go" type="button">
          <Icon name="arrow" size={18} />
        </button>
      </form>
      <div className="location-bar">
        <span className="location-label">
          <Icon name="pin" size={16} /> Location
        </span>
        <div className="segmented-control">
          {["Remote", "Nairobi", "Anywhere in Kenya"].map((option) => (
            <button
              key={option}
              className={filter.location === option ? "selected" : ""}
              onClick={() => set("location", option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
        <button
          className={`mobile-filter-button ${filtersOpen ? "selected" : ""}`}
          onClick={() => setFiltersOpen((open) => !open)}
          type="button"
        >
          <Icon name="filter" size={17} /> Filters{" "}
          {activeCount > 0 && <span>{activeCount}</span>}
        </button>
      </div>
      <div className="search-layout">
        <aside
          className={`filter-sidebar ${filtersOpen ? "filters-open" : ""}`}
        >
          <div className="filter-title">
            <h3>Filters</h3>
            {activeCount > 0 && <button onClick={onReset}>Clear all</button>}
            <button
              className="filter-close"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <FilterGroup label="Category">
            <select
              value={filter.category}
              onChange={(event) => set("category", event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </FilterGroup>
          {category && (
            <FilterGroup label="Subcategory">
              <select
                value={filter.subcategory}
                onChange={(event) => set("subcategory", event.target.value)}
              >
                <option value="">All services</option>
                {category.subcategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </FilterGroup>
          )}
          <FilterGroup label="Maximum starting price">
            <div className="budget-input">
              <span>KES</span>
              <input
                type="number"
                min="0"
                placeholder="Any budget"
                value={filter.budget}
                onChange={(event) => set("budget", event.target.value)}
              />
            </div>
            <div className="budget-options">
              {[5000, 10000, 20000].map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className={
                    Number(filter.budget) === amount ? "chip-selected" : ""
                  }
                  onClick={() =>
                    set(
                      "budget",
                      filter.budget === String(amount) ? "" : String(amount),
                    )
                  }
                >
                  {amount === 5000
                    ? "Under 5k"
                    : amount === 10000
                      ? "Under 10k"
                      : "Under 20k"}
                </button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup label="Availability">
            {[
              ["this week", "This week"],
              ["this month", "This month"],
              ["flexible", "Flexible"],
            ].map(([value, label]) => (
              <label className="check-row" key={value}>
                <input
                  type="radio"
                  name="availability"
                  checked={filter.availability === value}
                  onChange={() =>
                    set(
                      "availability",
                      filter.availability === value ? "" : value,
                    )
                  }
                />
                {label}
              </label>
            ))}
          </FilterGroup>
          <FilterGroup label="Language">
            <select
              value={filter.language}
              onChange={(event) => set("language", event.target.value)}
            >
              <option value="">Any language</option>
              {["English", "Kiswahili", "Luo", "Arabic"].map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </FilterGroup>
          <FilterGroup label="Accepts M-Pesa">
            <div className="radio-pair">
              {[
                ["", "Any"],
                ["yes", "Yes"],
                ["no", "No"],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => set("mpesa", value)}
                  className={filter.mpesa === value ? "chip-selected" : ""}
                >
                  {label}
                </button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup label="Experience">
            <select
              value={filter.experience}
              onChange={(event) => set("experience", event.target.value)}
            >
              <option value="">Any experience</option>
              <option value="new">New freelancer</option>
              <option value="established">Established</option>
              <option value="expert">Expert</option>
            </select>
          </FilterGroup>
          <label className="verified-filter">
            <input
              type="checkbox"
              checked={filter.verified}
              onChange={(event) => set("verified", event.target.checked)}
            />
            <span>
              <Icon name="shield" size={17} /> Verified freelancers only
            </span>
          </label>
          <button
            className="button button-primary mobile-apply"
            onClick={() => setFiltersOpen(false)}
          >
            Show {profiles.length} results
          </button>
        </aside>
        <section className="results-panel">
          <div className="results-header">
            <div>
              <h2>
                {filter.category ||
                  (query
                    ? `Results for “${query}”`
                    : "Freelancers for your next big idea")}
              </h2>
              <p>
                {profiles.length}{" "}
                {profiles.length === 1 ? "freelancer" : "freelancers"} ready to
                help
              </p>
            </div>
            <label className="sort-select">
              Sort by{" "}
              <select
                value={filter.sort}
                onChange={(event) => set("sort", event.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Highest rated</option>
                <option value="recent">Most recent activity</option>
              </select>
            </label>
          </div>
          {profiles.length ? (
            <div className="talent-grid results-grid">
              {profiles.map((person) => (
                <FreelancerCard
                  key={person.id}
                  person={person}
                  onOpen={onOpen}
                  saved={savedIds.includes(person.id)}
                  onSave={onSave}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Icon name="search" size={25} />
              </div>
              <h3>
                {filter.location === "Nairobi"
                  ? `No ${query || (filter.category || "freelancers").toLowerCase()} in Nairobi yet.`
                  : "No freelancers found just yet."}
              </h3>
              <p>
                Try adjusting your filters, or search across Kenya to find more
                skilled people.
              </p>
              <div className="empty-actions">
                <button
                  className="button button-primary"
                  onClick={() => set("location", "Anywhere in Kenya")}
                >
                  Try anywhere in Kenya <Icon name="arrow" size={16} />
                </button>
                <button className="button button-outline" onClick={onReset}>
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
