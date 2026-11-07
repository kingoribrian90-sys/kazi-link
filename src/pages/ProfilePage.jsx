import { Avatar, Icon, KES, titleCase } from "../components/ui.jsx";

export function ProfilePage({ profile, reviews, onBack, onRequest, saved, onSave }) {
  return (
    <main className="profile-page section-wrap">
      <div className="breadcrumb">
        <button onClick={onBack}>Find talent</button>
        <span>/</span>
        <span>{profile.name}</span>
      </div>
      <div className="profile-cover"></div>
      <section className="profile-head">
        <Avatar person={profile} size="xl" />
        <div className="profile-head-info">
          <div className="profile-name-row">
            <div>
              <div className="name-line">
                <h1>{profile.name}</h1>
                {profile.verified && (
                  <span
                    className="verified-mark verified-large"
                    title="Verified freelancer"
                  >
                    <Icon name="check" size={14} />
                  </span>
                )}
              </div>
              <p>{profile.role}</p>
            </div>
            <div className="profile-actions">
              <button
                className={`button button-outline save-profile ${saved ? "saved" : ""}`}
                onClick={onSave}
              >
                <Icon name="heart" size={17} />
                {saved ? "Saved" : "Save"}
              </button>
              <button className="button button-primary" onClick={onRequest}>
                Send job request <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
          <div className="profile-facts">
            <span className="rating">
              <Icon name="star" size={16} />{" "}
              {Number(profile.rating || 0).toFixed(1)}{" "}
              <small>({profile.reviews || 0} reviews)</small>
            </span>
            <span>
              <Icon name="pin" size={15} /> {profile.location}
            </span>
            <span>
              <Icon name="globe" size={15} /> {profile.languages.join(", ")}
            </span>
            <span
              className={`availability ${profile.online ? "availability-online" : ""}`}
            >
              {profile.online ? (
                <>
                  <i></i> Available now
                </>
              ) : (
                <>
                  <Icon name="clock" size={14} />
                  {titleCase(profile.availability)}
                </>
              )}
            </span>
          </div>
        </div>
      </section>
      <div className="profile-content">
        <div className="profile-main-column">
          <section className="profile-block">
            <span className="eyebrow">A LITTLE ABOUT ME</span>
            <h2>Let's make something good.</h2>
            <p className="profile-bio">{profile.bio}</p>
          </section>
          <section className="profile-block">
            <div className="block-heading">
              <div>
                <span className="eyebrow">SELECTED WORK</span>
                <h2>Things I’ve made.</h2>
              </div>
              <span className="sample-count">
                {profile.portfolio?.length || 0} samples
              </span>
            </div>
            {profile.portfolio?.length ? (
              <div className="portfolio-grid">
                {profile.portfolio.map((item, index) => (
                  <article
                    className="portfolio-item"
                    key={`${item.title}-${index}`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(event) => {
                        event.currentTarget.style.opacity = ".15";
                      }}
                    />
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mini-empty">Portfolio samples coming soon.</div>
            )}
          </section>
          <section className="profile-block reviews-block">
            <div className="block-heading">
              <div>
                <span className="eyebrow">KIND WORDS</span>
                <h2>Reviews from clients.</h2>
              </div>
              <span className="overall-rating">
                <Icon name="star" size={17} />
                {Number(profile.rating || 0).toFixed(1)}{" "}
                <small>({profile.reviews || 0})</small>
              </span>
            </div>
            {reviews.length ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <article className="review-item" key={review.id}>
                    <div className="review-avatar">
                      {review.client
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="review-content">
                      <div className="review-top">
                        <strong>{review.client}</strong>
                        <span>{review.date}</span>
                      </div>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        <span>{"★".repeat(5 - review.rating)}</span>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted-copy">
                Reviews will appear here after a completed job.
              </p>
            )}
          </section>
        </div>
        <aside className="profile-side">
          <div className="service-box">
            <span className="eyebrow">WORK WITH ME</span>
            <h3>Services & starting prices</h3>
            {(profile.subcategories?.length
              ? profile.subcategories
              : [profile.service]
            ).map((service, index) => (
              <div className="service-row" key={service}>
                <span>{service}</span>
                <strong>{KES(profile.price + index * 1500)}</strong>
              </div>
            ))}
            <button
              className="button button-primary button-full"
              onClick={onRequest}
            >
              Send a job request <Icon name="arrow" size={16} />
            </button>
            <p className="service-footnote">
              <Icon name="shield" size={14} /> You’ll agree on the details
              together.
            </p>
          </div>
          <div className="profile-quick-facts">
            <h3>At a glance</h3>
            <div>
              <span>Location</span>
              <strong>
                <Icon name="pin" size={14} />
                {profile.location}
              </strong>
            </div>
            <div>
              <span>Languages</span>
              <strong>{profile.languages.join(", ")}</strong>
            </div>
            <div>
              <span>Experience</span>
              <strong>{titleCase(profile.experience)}</strong>
            </div>
            <div>
              <span>M-Pesa</span>
              <strong>
                {profile.acceptsMpesa ? "Accepted" : "Not listed"}
              </strong>
            </div>
            <div>
              <span>Profile</span>
              <strong>
                {profile.verified ? (
                  <>
                    <Icon name="shield" size={14} /> Verified
                  </>
                ) : (
                  "Community member"
                )}
              </strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
