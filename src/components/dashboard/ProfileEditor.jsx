import { categories } from "../../data.js";
import { Avatar, Icon, KES, titleCase } from "../ui.jsx";

export function ProfileEditor({ profile, editing, setEditing, onSaveProfile, onOpen }) {
  const saveEdits = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const service = String(data.get("service")).trim();
    const saved = await onSaveProfile({
      ...profile,
      name: String(data.get("name")).trim(),
      role: String(data.get("role")).trim(),
      bio: String(data.get("bio")).trim(),
      service,
      category: String(data.get("category")),
      price: Number(data.get("price")),
      location: String(data.get("location")).trim(),
      availability: String(data.get("availability")),
      acceptsMpesa: data.get("acceptsMpesa") === "on",
      subcategories: service ? [service] : [],
      portfolio: (profile.portfolio || []).map((item, index) => ({
        ...item,
        title: String(data.get(`portfolio-title-${index}`) || item.title),
        description: String(
          data.get(`portfolio-description-${index}`) || item.description,
        ),
      })),
    });
    if (saved) setEditing(false);
  };

  return (
    <div className="profile-editor-wrap">
      <section className="dashboard-panel profile-editor">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">YOUR PUBLIC PROFILE</span>
            <h2>{editing ? "Edit your details" : "Your profile details"}</h2>
          </div>
          {!editing && (
            <button
              className="button button-outline"
              onClick={() => setEditing(true)}
            >
              Edit profile
            </button>
          )}
        </div>
        {profile && editing ? (
          <form className="edit-profile-form" onSubmit={saveEdits}>
            <div className="edit-grid">
              <label>
                Display name
                <input name="name" defaultValue={profile.name} required />
              </label>
              <label>
                What do you do?
                <input name="role" defaultValue={profile.role} required />
              </label>
              <label>
                Main service
                <input name="service" defaultValue={profile.service} required />
              </label>
              <label>
                Category
                <select name="category" defaultValue={profile.category}>
                  {categories.map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Starting price (KES)
                <input
                  type="number"
                  name="price"
                  min="500"
                  defaultValue={profile.price}
                  required
                />
              </label>
              <label>
                Location
                <input name="location" defaultValue={profile.location} required />
              </label>
              <label>
                Availability
                <select
                  name="availability"
                  defaultValue={profile.availability}
                >
                  <option value="this week">This week</option>
                  <option value="this month">This month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </label>
              <label className="check-edit">
                <input
                  type="checkbox"
                  name="acceptsMpesa"
                  defaultChecked={profile.acceptsMpesa}
                />{" "}
                I accept M-Pesa
              </label>
            </div>
            <label>
              About you
              <textarea
                name="bio"
                defaultValue={profile.bio}
                rows="4"
                required
                minLength="20"
              />
            </label>
            <div className="editor-portfolio">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">PORTFOLIO</span>
                  <h3>Show your work</h3>
                </div>
                <button
                  className="add-sample-button"
                  type="button"
                  onClick={() =>
                    onSaveProfile({
                      ...profile,
                      portfolio: [
                        ...(profile.portfolio || []),
                        {
                          image:
                            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=720&q=82",
                          title: "New portfolio sample",
                          description: "Add a short description of the work.",
                        },
                      ],
                    })
                  }
                >
                  <Icon name="plus" size={14} /> Add sample
                </button>
              </div>
              {profile.portfolio?.length ? (
                profile.portfolio.map((item, index) => (
                  <div
                    className="portfolio-edit-row"
                    key={`${item.title}-${index}`}
                  >
                    <img src={item.image} alt="" />
                    <div>
                      <label>
                        Sample title
                        <input
                          name={`portfolio-title-${index}`}
                          defaultValue={item.title}
                          required
                        />
                      </label>
                      <label>
                        Description
                        <input
                          name={`portfolio-description-${index}`}
                          defaultValue={item.description}
                          required
                        />
                      </label>
                    </div>
                    <button
                      className="remove-sample"
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() =>
                        onSaveProfile({
                          ...profile,
                          portfolio: profile.portfolio.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        })
                      }
                    >
                      <Icon name="close" size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted-copy">
                  Add portfolio samples to your profile soon.
                </p>
              )}
            </div>
            <div className="editor-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button className="button button-primary" type="submit">
                Save changes <Icon name="arrow" size={15} />
              </button>
            </div>
          </form>
        ) : (
          profile && (
            <div className="profile-read-view">
              <Avatar person={profile} size="lg" />
              <div>
                <div className="name-line">
                  <h3>{profile.name}</h3>
                  {profile.verified && (
                    <span className="verified-mark">
                      <Icon name="check" size={13} />
                    </span>
                  )}
                </div>
                <p>
                  {profile.role} · {profile.location}
                </p>
                <p>{profile.bio}</p>
                <div className="read-tags">
                  <span>{profile.category}</span>
                  <span>From {KES(profile.price)}</span>
                  <span>{titleCase(profile.availability)}</span>
                </div>
              </div>
            </div>
          )
        )}
      </section>
      <aside className="profile-editor-aside">
        <div className="dashboard-panel">
          <span className="eyebrow">YOUR PUBLIC VIEW</span>
          <h3>What clients see</h3>
          <p>
            Your profile brings together your story, services, reviews and
            portfolio.
          </p>
          <button
            className="button button-outline button-full"
            onClick={() => profile && onOpen(profile)}
          >
            Preview profile <Icon name="arrow" size={15} />
          </button>
        </div>
        <div className="verified-note">
          <Icon name="shield" size={19} />
          <p>
            <strong>Earn a trusted badge</strong>
            <br />
            Add your business details to get your profile verified.
          </p>
        </div>
      </aside>
    </div>
  );
}
