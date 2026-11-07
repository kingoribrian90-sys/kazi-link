import { Icon, Modal } from "./ui.jsx";

export function AppDialogs({
  authOpen,
  authMode,
  setAuthMode,
  authRole,
  setAuthRole,
  setAuthOpen,
  setPendingFreelancerId,
  completeAuth,
  requestTarget,
  setRequestTarget,
  submitRequest,
  reviewTarget,
  setReviewTarget,
  submitReview,
  toast,
  setToast,
}) {
  return (
    <>
      {authOpen && (
        <Modal
          title={authMode === "signup" ? "Join KaziLink" : "Welcome back"}
          subtitle={
            authMode === "signup"
              ? "Your next great connection is just around the corner."
              : "Log in to manage your work and requests."
          }
          onClose={() => {
            setAuthOpen(false);
            setPendingFreelancerId(null);
          }}
        >
          <form className="form-stack" onSubmit={completeAuth}>
            {authMode === "signup" && (
              <>
                <div className="role-switch">
                  <button
                    type="button"
                    className={authRole === "owner" ? "role-active" : ""}
                    onClick={() => setAuthRole("owner")}
                  >
                    <Icon name="briefcase" size={17} /> I need a freelancer
                  </button>
                  <button
                    type="button"
                    className={authRole === "freelancer" ? "role-active" : ""}
                    onClick={() => setAuthRole("freelancer")}
                  >
                    <Icon name="sparkle" size={17} /> I offer services
                  </button>
                </div>
                <label>
                  Full name
                  <input
                    name="name"
                    placeholder="e.g. Wanjiku Njeri"
                    required
                    minLength="2"
                  />
                </label>
              </>
            )}
            <label>
              Email or phone number
              <input
                name="identity"
                placeholder="you@example.com or 07XX XXX XXX"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder="At least 6 characters"
                minLength="6"
                autoComplete={
                  authMode === "signup" ? "new-password" : "current-password"
                }
                required
              />
            </label>
            <button className="button button-primary button-full" type="submit">
              {authMode === "signup" ? "Create free account" : "Log in"}{" "}
              <Icon name="arrow" size={17} />
            </button>
            <p className="form-switch">
              {authMode === "signup"
                ? "Already have an account?"
                : "New to KaziLink?"}{" "}
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "signup" ? "login" : "signup")
                }
              >
                {authMode === "signup" ? "Log in" : "Create an account"}
              </button>
            </p>
            <p className="form-note">
              <Icon name="shield" size={14} /> Your details are kept private and
              secure.
            </p>
          </form>
        </Modal>
      )}
      {requestTarget && (
        <Modal
          title="Send a job request"
          subtitle={`Tell ${requestTarget.name.split(" ")[0]} what you need. They’ll get back to you with next steps.`}
          onClose={() => setRequestTarget(null)}
        >
          <form className="form-stack" onSubmit={submitRequest}>
            <label>
              Service needed
              <select
                name="service"
                required
                defaultValue={requestTarget.service}
              >
                <option value={requestTarget.service}>
                  {requestTarget.service}
                </option>
                {requestTarget.subcategories
                  ?.filter((service) => service !== requestTarget.service)
                  .map((service) => (
                    <option key={service}>{service}</option>
                  ))}
              </select>
            </label>
            <label>
              Project description
              <textarea
                name="description"
                placeholder="Share a few details about your project and what success looks like…"
                rows="4"
                required
                minLength="12"
              />
            </label>
            <div className="form-row">
              <label>
                Budget (KES)
                <input
                  name="budget"
                  type="number"
                  min="500"
                  placeholder="e.g. 8,000"
                  required
                />
              </label>
              <label>
                Deadline
                <input
                  name="deadline"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>
            </div>
            <label>
              Location
              <input
                name="location"
                placeholder="e.g. Remote, Nairobi"
                required
              />
            </label>
            <button className="button button-primary button-full" type="submit">
              Send job request <Icon name="arrow" size={17} />
            </button>
            <p className="form-note">
              <Icon name="shield" size={14} /> No payment is taken. You’ll agree
              on the details together.
            </p>
          </form>
        </Modal>
      )}
      {reviewTarget && (
        <Modal
          title="How did the job go?"
          subtitle={`Leave a review for ${reviewTarget.freelancerName}. Your feedback helps the community.`}
          onClose={() => setReviewTarget(null)}
        >
          <form className="form-stack" onSubmit={submitReview}>
            <label>
              Your rating
              <select name="rating" defaultValue="5">
                <option value="5">★★★★★ — Excellent</option>
                <option value="4">★★★★☆ — Good</option>
                <option value="3">★★★☆☆ — It was okay</option>
                <option value="2">★★☆☆☆ — Needs improvement</option>
                <option value="1">★☆☆☆☆ — Poor</option>
              </select>
            </label>
            <label>
              Your review
              <textarea
                name="comment"
                rows="4"
                placeholder="What was it like working together?"
                required
                minLength="10"
              />
            </label>
            <button className="button button-primary button-full" type="submit">
              Post review <Icon name="arrow" size={17} />
            </button>
          </form>
        </Modal>
      )}
      {toast && (
        <div className="toast">
          <span className="toast-check">
            <Icon name="check" size={15} />
          </span>
          {toast}
          <button onClick={() => setToast("")} aria-label="Dismiss">
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </>
  );
}
