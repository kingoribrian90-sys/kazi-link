import { Icon, KES } from "../ui.jsx";

export function RequestList({
  requests,
  freelancer,
  onStatus,
  onReview,
  onOpen,
}) {
  const statusText = {
    pending: "Awaiting response",
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
  };
  return (
    <div className="request-list">
      {requests.map((request) => (
        <article className="request-item" key={request.id}>
          <div className="request-icon">
            <Icon name="briefcase" size={18} />
          </div>
          <div className="request-info">
            <div className="request-top">
              <strong>
                {freelancer ? request.clientName : request.freelancerName}
              </strong>
              <span className={`status-pill status-${request.status}`}>
                {statusText[request.status]}
              </span>
            </div>
            <h3>{request.service}</h3>
            <p>{request.description}</p>
            <div className="request-meta">
              <span>
                <Icon name="pin" size={14} />
                {request.location}
              </span>
              <span>
                <Icon name="clock" size={14} />
                {request.deadline
                  ? new Date(`${request.deadline}T12:00:00`).toLocaleDateString(
                      "en-KE",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "Flexible deadline"}
              </span>
              <strong>{KES(request.budget)}</strong>
            </div>
          </div>
          <div className="request-actions">
            {freelancer && request.status === "pending" && (
              <>
                <button
                  className="button button-outline button-small"
                  onClick={() => onStatus(request.id, "declined")}
                >
                  Decline
                </button>
                <button
                  className="button button-primary button-small"
                  onClick={() => onStatus(request.id, "accepted")}
                >
                  Accept
                </button>
              </>
            )}
            {freelancer && request.status === "accepted" && (
              <button
                className="button button-primary button-small"
                onClick={() => onStatus(request.id, "completed")}
              >
                Mark complete
              </button>
            )}
            {!freelancer &&
              request.status === "completed" &&
              !request.reviewed && (
                <button
                  className="button button-primary button-small"
                  onClick={() => onReview(request)}
                >
                  Leave a review
                </button>
              )}
            {!freelancer && (
              <button
                className="link-button"
                onClick={() => onOpen?.({ id: request.freelancerId })}
              >
                View freelancer <Icon name="arrow" size={14} />
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function EmptyDashboard({ icon, title, text, action, onClick }) {
  return (
    <div className="dashboard-empty">
      <div className="empty-icon">
        <Icon name={icon} size={23} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="button button-outline" onClick={onClick}>
          {action} <Icon name="arrow" size={15} />
        </button>
      )}
    </div>
  );
}
