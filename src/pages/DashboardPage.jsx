import { useState } from "react";
import { FreelancerCard, Icon, titleCase } from "../components/ui.jsx";
import {
  EmptyDashboard,
  RequestList,
} from "../components/dashboard/DashboardWidgets.jsx";
import { ProfileEditor } from "../components/dashboard/ProfileEditor.jsx";

export function DashboardPage({
  user,
  profile,
  profiles,
  requests,
  savedIds,
  onOpen,
  onToggleSaved,
  onSaveProfile,
  onStatus,
  onReview,
  onExplore,
}) {
  const freelancer = user.role === "freelancer";
  const [tab, setTab] = useState(freelancer ? "overview" : "requests");
  const [editing, setEditing] = useState(false);
  const savedProfiles = profiles.filter((person) =>
    savedIds.includes(person.id),
  );
  const pending = requests.filter(
    (request) => request.status === "pending",
  ).length;
  return (
    <main className="dashboard-page section-wrap">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">
            {freelancer ? "FREELANCER SPACE" : "BUSINESS OWNER SPACE"}
          </span>
          <h1>
            Habari, {user.name.split(" ")[0]} <span className="wave">✳</span>
          </h1>
          <p>
            {freelancer
              ? "Make a little space for more good work."
              : "Here’s where your next good connection begins."}
          </p>
        </div>
        {freelancer && profile && (
          <button
            className="button button-outline"
            onClick={() => {
              setEditing((value) => !value);
              setTab("profile");
            }}
          >
            <Icon name="sparkle" size={16} />
            {editing ? "Close editor" : "Edit my profile"}
          </button>
        )}
      </div>
      <div className="dashboard-tabs">
        {(freelancer
          ? [
              ["overview", "Overview"],
              ["requests", `Job requests${pending ? ` (${pending})` : ""}`],
              ["profile", "My profile"],
            ]
          : [
              ["requests", "My requests"],
              [
                "saved",
                `Saved freelancers${savedProfiles.length ? ` (${savedProfiles.length})` : ""}`,
              ],
            ]
        ).map(([key, label]) => (
          <button
            className={tab === key ? "tab-active" : ""}
            onClick={() => {
              setTab(key);
              setEditing(false);
            }}
            key={key}
          >
            {label}
          </button>
        ))}
      </div>
      {freelancer && tab === "overview" && (
        <>
          <div className="dashboard-metrics">
            <div className="metric-card">
              <span className="metric-icon metric-views">
                <Icon name="eye" size={18} />
              </span>
              <div>
                <strong>{(profile?.reviews || 12) * 13 + 18}</strong>
                <span>Profile views</span>
              </div>
              <small>this month</small>
            </div>
            <div className="metric-card">
              <span className="metric-icon metric-requests">
                <Icon name="message" size={18} />
              </span>
              <div>
                <strong>{requests.length}</strong>
                <span>Job requests</span>
              </div>
              <small>all time</small>
            </div>
            <div className="metric-card">
              <span className="metric-icon metric-availability">
                <i className={profile?.online ? "online-dot" : ""}></i>
              </span>
              <div>
                <strong>
                  {profile?.online
                    ? "Available now"
                    : titleCase(profile?.availability || "Flexible")}
                </strong>
                <span>Your availability</span>
              </div>
              <button
                onClick={() =>
                  onSaveProfile({ ...profile, online: !profile.online })
                }
              >
                Change
              </button>
            </div>
          </div>
          <div className="dashboard-columns">
            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">INCOMING</span>
                  <h2>Latest job requests</h2>
                </div>
                <button
                  className="section-link"
                  onClick={() => setTab("requests")}
                >
                  View all <Icon name="arrow" size={15} />
                </button>
              </div>
              {requests.length ? (
                <RequestList
                  requests={requests.slice(0, 3)}
                  freelancer
                  onStatus={onStatus}
                />
              ) : (
                <EmptyDashboard
                  icon="message"
                  title="Your next job starts here."
                  text="Keep your profile fresh so businesses can find the right person for the job."
                  action="Edit my profile"
                  onClick={() => {
                    setTab("profile");
                    setEditing(true);
                  }}
                />
              )}
            </section>
            <section className="dashboard-panel profile-strength">
              <span className="eyebrow">YOUR PROFILE</span>
              <h2>Show them what you do best.</h2>
              <p>
                Add work samples and tell your story to help good clients find
                you.
              </p>
              <div className="strength-progress">
                <span
                  style={{ width: `${profile?.portfolio?.length ? 84 : 44}%` }}
                ></span>
              </div>
              <small>
                {profile?.portfolio?.length
                  ? "Profile looking good"
                  : "A few more details will help"}
              </small>
              <button
                className="button button-outline"
                onClick={() => {
                  setTab("profile");
                  setEditing(true);
                }}
              >
                Add to your profile <Icon name="arrow" size={15} />
              </button>
            </section>
          </div>
        </>
      )}
      {freelancer && tab === "requests" && (
        <section className="dashboard-panel dashboard-full-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR INBOX</span>
              <h2>Job requests</h2>
            </div>
            <span className="panel-count">{requests.length} total</span>
          </div>
          {requests.length ? (
            <RequestList requests={requests} freelancer onStatus={onStatus} />
          ) : (
            <EmptyDashboard
              icon="message"
              title="No requests just yet."
              text="You’ll see new requests here when a business reaches out. Make sure your profile shows the services you offer."
              action="View my profile"
              onClick={() => setTab("profile")}
            />
          )}
        </section>
      )}
      {freelancer && tab === "profile" && (
        <ProfileEditor
          profile={profile}
          editing={editing}
          setEditing={setEditing}
          onSaveProfile={onSaveProfile}
          onOpen={onOpen}
        />
      )}
      {!freelancer && tab === "requests" && (
        <section className="dashboard-panel dashboard-full-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR PROJECTS</span>
              <h2>Sent job requests</h2>
            </div>
            <button className="button button-primary" onClick={onExplore}>
              Find talent <Icon name="arrow" size={15} />
            </button>
          </div>
          {requests.length ? (
            <RequestList
              requests={requests}
              freelancer={false}
              onReview={onReview}
              onOpen={onOpen}
            />
          ) : (
            <EmptyDashboard
              icon="briefcase"
              title="A good connection is waiting."
              text="Find a freelancer who understands what your business needs. Send a request when you’re ready."
              action="Explore freelancers"
              onClick={onExplore}
            />
          )}
        </section>
      )}
      {!freelancer && tab === "saved" && (
        <section className="dashboard-panel dashboard-full-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR SHORTLIST</span>
              <h2>Saved freelancers</h2>
            </div>
            <span className="panel-count">{savedProfiles.length} saved</span>
          </div>
          {savedProfiles.length ? (
            <div className="talent-grid results-grid">
              {savedProfiles.map((person) => (
                <FreelancerCard
                  key={person.id}
                  person={person}
                  onOpen={onOpen}
                  saved
                  onSave={onToggleSaved}
                />
              ))}
            </div>
          ) : (
            <EmptyDashboard
              icon="heart"
              title="Keep good people close."
              text="Save freelancers you’d like to come back to. They’ll be waiting here when you need them."
              action="Explore freelancers"
              onClick={onExplore}
            />
          )}
        </section>
      )}
    </main>
  );
}
