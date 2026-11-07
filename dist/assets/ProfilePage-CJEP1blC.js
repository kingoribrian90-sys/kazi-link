import { a as e, i as t, o as n, s as r, t as i } from "./index-qjJLXzTP.js";
var a = r();
function o({
  profile: r,
  reviews: o,
  onBack: s,
  onRequest: c,
  saved: l,
  onSave: u,
}) {
  return (0, a.jsxs)(`main`, {
    className: `profile-page section-wrap`,
    children: [
      (0, a.jsxs)(`div`, {
        className: `breadcrumb`,
        children: [
          (0, a.jsx)(`button`, { onClick: s, children: `Find talent` }),
          (0, a.jsx)(`span`, { children: `/` }),
          (0, a.jsx)(`span`, { children: r.name }),
        ],
      }),
      (0, a.jsx)(`div`, { className: `profile-cover` }),
      (0, a.jsxs)(`section`, {
        className: `profile-head`,
        children: [
          (0, a.jsx)(i, { person: r, size: `xl` }),
          (0, a.jsxs)(`div`, {
            className: `profile-head-info`,
            children: [
              (0, a.jsxs)(`div`, {
                className: `profile-name-row`,
                children: [
                  (0, a.jsxs)(`div`, {
                    children: [
                      (0, a.jsxs)(`div`, {
                        className: `name-line`,
                        children: [
                          (0, a.jsx)(`h1`, { children: r.name }),
                          r.verified &&
                            (0, a.jsx)(`span`, {
                              className: `verified-mark verified-large`,
                              title: `Verified freelancer`,
                              children: (0, a.jsx)(t, {
                                name: `check`,
                                size: 14,
                              }),
                            }),
                        ],
                      }),
                      (0, a.jsx)(`p`, { children: r.role }),
                    ],
                  }),
                  (0, a.jsxs)(`div`, {
                    className: `profile-actions`,
                    children: [
                      (0, a.jsxs)(`button`, {
                        className: `button button-outline save-profile ${l ? `saved` : ``}`,
                        onClick: u,
                        children: [
                          (0, a.jsx)(t, { name: `heart`, size: 17 }),
                          l ? `Saved` : `Save`,
                        ],
                      }),
                      (0, a.jsxs)(`button`, {
                        className: `button button-primary`,
                        onClick: c,
                        children: [
                          `Send job request `,
                          (0, a.jsx)(t, { name: `arrow`, size: 16 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, a.jsxs)(`div`, {
                className: `profile-facts`,
                children: [
                  (0, a.jsxs)(`span`, {
                    className: `rating`,
                    children: [
                      (0, a.jsx)(t, { name: `star`, size: 16 }),
                      ` `,
                      Number(r.rating || 0).toFixed(1),
                      ` `,
                      (0, a.jsxs)(`small`, {
                        children: [`(`, r.reviews || 0, ` reviews)`],
                      }),
                    ],
                  }),
                  (0, a.jsxs)(`span`, {
                    children: [
                      (0, a.jsx)(t, { name: `pin`, size: 15 }),
                      ` `,
                      r.location,
                    ],
                  }),
                  (0, a.jsxs)(`span`, {
                    children: [
                      (0, a.jsx)(t, { name: `globe`, size: 15 }),
                      ` `,
                      r.languages.join(`, `),
                    ],
                  }),
                  (0, a.jsx)(`span`, {
                    className: `availability ${r.online ? `availability-online` : ``}`,
                    children: r.online
                      ? (0, a.jsxs)(a.Fragment, {
                          children: [(0, a.jsx)(`i`, {}), ` Available now`],
                        })
                      : (0, a.jsxs)(a.Fragment, {
                          children: [
                            (0, a.jsx)(t, { name: `clock`, size: 14 }),
                            n(r.availability),
                          ],
                        }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      (0, a.jsxs)(`div`, {
        className: `profile-content`,
        children: [
          (0, a.jsxs)(`div`, {
            className: `profile-main-column`,
            children: [
              (0, a.jsxs)(`section`, {
                className: `profile-block`,
                children: [
                  (0, a.jsx)(`span`, {
                    className: `eyebrow`,
                    children: `A LITTLE ABOUT ME`,
                  }),
                  (0, a.jsx)(`h2`, { children: `Let's make something good.` }),
                  (0, a.jsx)(`p`, {
                    className: `profile-bio`,
                    children: r.bio,
                  }),
                ],
              }),
              (0, a.jsxs)(`section`, {
                className: `profile-block`,
                children: [
                  (0, a.jsxs)(`div`, {
                    className: `block-heading`,
                    children: [
                      (0, a.jsxs)(`div`, {
                        children: [
                          (0, a.jsx)(`span`, {
                            className: `eyebrow`,
                            children: `SELECTED WORK`,
                          }),
                          (0, a.jsx)(`h2`, { children: `Things I’ve made.` }),
                        ],
                      }),
                      (0, a.jsxs)(`span`, {
                        className: `sample-count`,
                        children: [r.portfolio?.length || 0, ` samples`],
                      }),
                    ],
                  }),
                  r.portfolio?.length
                    ? (0, a.jsx)(`div`, {
                        className: `portfolio-grid`,
                        children: r.portfolio.map((e, t) =>
                          (0, a.jsxs)(
                            `article`,
                            {
                              className: `portfolio-item`,
                              children: [
                                (0, a.jsx)(`img`, {
                                  src: e.image,
                                  alt: e.title,
                                  onError: (e) => {
                                    e.currentTarget.style.opacity = `.15`;
                                  },
                                }),
                                (0, a.jsxs)(`div`, {
                                  children: [
                                    (0, a.jsx)(`h3`, { children: e.title }),
                                    (0, a.jsx)(`p`, {
                                      children: e.description,
                                    }),
                                  ],
                                }),
                              ],
                            },
                            `${e.title}-${t}`,
                          ),
                        ),
                      })
                    : (0, a.jsx)(`div`, {
                        className: `mini-empty`,
                        children: `Portfolio samples coming soon.`,
                      }),
                ],
              }),
              (0, a.jsxs)(`section`, {
                className: `profile-block reviews-block`,
                children: [
                  (0, a.jsxs)(`div`, {
                    className: `block-heading`,
                    children: [
                      (0, a.jsxs)(`div`, {
                        children: [
                          (0, a.jsx)(`span`, {
                            className: `eyebrow`,
                            children: `KIND WORDS`,
                          }),
                          (0, a.jsx)(`h2`, {
                            children: `Reviews from clients.`,
                          }),
                        ],
                      }),
                      (0, a.jsxs)(`span`, {
                        className: `overall-rating`,
                        children: [
                          (0, a.jsx)(t, { name: `star`, size: 17 }),
                          Number(r.rating || 0).toFixed(1),
                          ` `,
                          (0, a.jsxs)(`small`, {
                            children: [`(`, r.reviews || 0, `)`],
                          }),
                        ],
                      }),
                    ],
                  }),
                  o.length
                    ? (0, a.jsx)(`div`, {
                        className: `reviews-list`,
                        children: o.map((e) =>
                          (0, a.jsxs)(
                            `article`,
                            {
                              className: `review-item`,
                              children: [
                                (0, a.jsx)(`div`, {
                                  className: `review-avatar`,
                                  children: e.client
                                    .split(` `)
                                    .map((e) => e[0])
                                    .slice(0, 2)
                                    .join(``),
                                }),
                                (0, a.jsxs)(`div`, {
                                  className: `review-content`,
                                  children: [
                                    (0, a.jsxs)(`div`, {
                                      className: `review-top`,
                                      children: [
                                        (0, a.jsx)(`strong`, {
                                          children: e.client,
                                        }),
                                        (0, a.jsx)(`span`, {
                                          children: e.date,
                                        }),
                                      ],
                                    }),
                                    (0, a.jsxs)(`div`, {
                                      className: `review-stars`,
                                      children: [
                                        `★`.repeat(e.rating),
                                        (0, a.jsx)(`span`, {
                                          children: `★`.repeat(5 - e.rating),
                                        }),
                                      ],
                                    }),
                                    (0, a.jsx)(`p`, { children: e.comment }),
                                  ],
                                }),
                              ],
                            },
                            e.id,
                          ),
                        ),
                      })
                    : (0, a.jsx)(`p`, {
                        className: `muted-copy`,
                        children: `Reviews will appear here after a completed job.`,
                      }),
                ],
              }),
            ],
          }),
          (0, a.jsxs)(`aside`, {
            className: `profile-side`,
            children: [
              (0, a.jsxs)(`div`, {
                className: `service-box`,
                children: [
                  (0, a.jsx)(`span`, {
                    className: `eyebrow`,
                    children: `WORK WITH ME`,
                  }),
                  (0, a.jsx)(`h3`, { children: `Services & starting prices` }),
                  (r.subcategories?.length ? r.subcategories : [r.service]).map(
                    (t, n) =>
                      (0, a.jsxs)(
                        `div`,
                        {
                          className: `service-row`,
                          children: [
                            (0, a.jsx)(`span`, { children: t }),
                            (0, a.jsx)(`strong`, {
                              children: e(r.price + n * 1500),
                            }),
                          ],
                        },
                        t,
                      ),
                  ),
                  (0, a.jsxs)(`button`, {
                    className: `button button-primary button-full`,
                    onClick: c,
                    children: [
                      `Send a job request `,
                      (0, a.jsx)(t, { name: `arrow`, size: 16 }),
                    ],
                  }),
                  (0, a.jsxs)(`p`, {
                    className: `service-footnote`,
                    children: [
                      (0, a.jsx)(t, { name: `shield`, size: 14 }),
                      ` You’ll agree on the details together.`,
                    ],
                  }),
                ],
              }),
              (0, a.jsxs)(`div`, {
                className: `profile-quick-facts`,
                children: [
                  (0, a.jsx)(`h3`, { children: `At a glance` }),
                  (0, a.jsxs)(`div`, {
                    children: [
                      (0, a.jsx)(`span`, { children: `Location` }),
                      (0, a.jsxs)(`strong`, {
                        children: [
                          (0, a.jsx)(t, { name: `pin`, size: 14 }),
                          r.location,
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsxs)(`div`, {
                    children: [
                      (0, a.jsx)(`span`, { children: `Languages` }),
                      (0, a.jsx)(`strong`, {
                        children: r.languages.join(`, `),
                      }),
                    ],
                  }),
                  (0, a.jsxs)(`div`, {
                    children: [
                      (0, a.jsx)(`span`, { children: `Experience` }),
                      (0, a.jsx)(`strong`, { children: n(r.experience) }),
                    ],
                  }),
                  (0, a.jsxs)(`div`, {
                    children: [
                      (0, a.jsx)(`span`, { children: `M-Pesa` }),
                      (0, a.jsx)(`strong`, {
                        children: r.acceptsMpesa ? `Accepted` : `Not listed`,
                      }),
                    ],
                  }),
                  (0, a.jsxs)(`div`, {
                    children: [
                      (0, a.jsx)(`span`, { children: `Profile` }),
                      (0, a.jsx)(`strong`, {
                        children: r.verified
                          ? (0, a.jsxs)(a.Fragment, {
                              children: [
                                (0, a.jsx)(t, { name: `shield`, size: 14 }),
                                ` Verified`,
                              ],
                            })
                          : `Community member`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { o as ProfilePage };
