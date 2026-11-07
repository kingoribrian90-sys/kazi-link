import { useState } from "react";
import { categories } from "../data.js";
import { Avatar, FreelancerCard, Icon } from "../components/ui.jsx";

export function HomePage({
  onSearch,
  onCategory,
  onOpen,
  profiles,
  savedIds,
  onSave,
  onJoin,
}) {
  const [term, setTerm] = useState("");
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-star">
                <Icon name="sparkle" size={15} />
              </span>{" "}
              GOOD PEOPLE. GOOD WORK. RIGHT HERE.
            </div>
            <h1>
              Find trusted digital talent <span>for your business.</span>
            </h1>
            <p className="hero-lede">
              Meet skilled Kenyan freelancers who can help you build, grow, and
              get more done.
            </p>
            <form
              className="hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                onSearch(term);
              }}
            >
              <Icon name="search" size={21} />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="What do you need help with?"
                aria-label="What do you need help with?"
              />
              <button className="button button-primary" type="submit">
                Find a freelancer <Icon name="arrow" size={16} />
              </button>
            </form>
            <div className="popular-searches">
              <span>Popular:</span>
              {["Logo design", "Social media", "Website"].map((item) => (
                <button key={item} onClick={() => onSearch(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                <Avatar person={profiles[0]} size="xs" />
                <Avatar person={profiles[2]} size="xs" />
                <Avatar person={profiles[7]} size="xs" />
                <span>+</span>
              </div>
              <p>
                <strong>Local talent, real reviews.</strong>
                <br />
                Made for Kenyan businesses.
              </p>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>
            <div className="hero-photo-wrap">
              <img
                className="hero-photo"
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=85"
                alt="Small business owners planning their next big idea"
              />
              <div className="hero-photo-tag">
                <span className="tag-spark">
                  <Icon name="sparkle" size={17} />
                </span>
                <span>
                  <strong>Made for your next big idea</strong>
                  <small>Skilled freelancers, close to home</small>
                </span>
              </div>
              <div className="floating-card float-top">
                <span className="float-icon">
                  <Icon name="check" size={15} />
                </span>
                <span>
                  <strong>Trusted & verified</strong>
                  <small>Meet your next collaborator</small>
                </span>
              </div>
              <div className="floating-card float-bottom">
                <span className="float-rating">
                  <Icon name="star" size={15} />
                </span>
                <span>
                  <strong>Good work, well reviewed</strong>
                  <small>Real feedback from real clients</small>
                </span>
              </div>
            </div>
            <div className="art-confetti confetti-a">✳</div>
            <div className="art-confetti confetti-b">✦</div>
          </div>
        </div>
        <div className="hero-bottom-line">
          <span>
            <Icon name="shield" size={16} /> Profiles you can trust
          </span>
          <span>
            <Icon name="globe" size={16} /> Talent across Kenya
          </span>
          <span>
            <Icon name="briefcase" size={16} /> Work that moves you forward
          </span>
        </div>
      </section>
      <section className="category-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">WHAT CAN WE HELP WITH?</span>
            <h2>Find your kind of help.</h2>
          </div>
          <button className="section-link" onClick={() => onCategory("")}>
            Explore all talent <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <button
              className={`category-card category-${category.tint}`}
              key={category.name}
              onClick={() => onCategory(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-number">0{index + 1}</span>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span className="category-arrow">
                <Icon name="arrow" size={16} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="how-section" id="how-it-works">
        <div className="section-wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SIMPLE BY DESIGN</span>
              <h2>Good work starts here.</h2>
            </div>
            <p>
              Three simple steps to turn your to-do list
              <br className="desktop-only" /> into a done list.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-no">01</span>
              <div className="step-icon step-search">
                <Icon name="search" size={25} />
              </div>
              <h3>Search</h3>
              <p>
                Tell us what you need. Browse skilled freelancers from your town
                and across Kenya.
              </p>
              <span className="step-line"></span>
            </div>
            <div className="step-card">
              <span className="step-no">02</span>
              <div className="step-icon step-compare">
                <Icon name="eye" size={25} />
              </div>
              <h3>Compare</h3>
              <p>
                See real reviews, past work and starting prices to find the
                right fit for your budget.
              </p>
              <span className="step-line"></span>
            </div>
            <div className="step-card">
              <span className="step-no">03</span>
              <div className="step-icon step-send">
                <Icon name="message" size={25} />
              </div>
              <h3>Send a job request</h3>
              <p>
                Share your project details. Your chosen freelancer will respond
                with next steps.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="featured-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A FEW GOOD PEOPLE</span>
            <h2>Meet your next collaborator.</h2>
          </div>
          <button className="section-link" onClick={() => onCategory("")}>
            See all freelancers <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="talent-grid">
          {profiles.slice(0, 3).map((person) => (
            <FreelancerCard
              key={person.id}
              person={person}
              onOpen={onOpen}
              saved={savedIds.includes(person.id)}
              onSave={onSave}
            />
          ))}
        </div>
      </section>
      <section className="join-banner section-wrap">
        <div className="join-pattern">✳</div>
        <div className="join-content">
          <span className="eyebrow">YOUR SKILLS HAVE A PLACE HERE</span>
          <h2>Are you a freelancer?</h2>
          <p>
            Get discovered by Kenyan businesses looking for exactly what you do.
          </p>
          <button className="button button-light" onClick={onJoin}>
            Create your freelancer profile <Icon name="arrow" size={17} />
          </button>
        </div>
        <div className="join-illustration">
          <div className="join-circle">
            <Icon name="sparkle" size={44} />
          </div>
          <span className="join-star">✦</span>
          <span className="join-cross">+</span>
        </div>
      </section>
    </main>
  );
}
