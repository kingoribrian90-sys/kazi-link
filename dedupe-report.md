# Frontend deduplication report

Scan scope: project files outside `node_modules`, `.git`, `dist`, `build`,
`.next`, `vendor`, and minified libraries. The inventory is the pre-API-wiring
snapshot; text content was SHA-256 hashed after normalizing line endings to LF.

## Inventory

| Path | Bytes | SHA-256 |
|---|---:|---|
| `index.html` | 792 | `b889542634f68bffe3d8b35d3d70d39b05d574f7c7ac18907b12b007b7d7be16` |
| `package-lock.json` | 26749 | `ae98eb51e4614de0718e1b7e0bcc672433d1df1b6568c5a099950effbc28a1a2` |
| `package.json` | 353 | `29baf84cb90a0280369eda7f59b5488820bcad80099b5d96f7fd18cbe1c624cf` |
| `src/App.jsx` | 18695 | `2c7a8bd312e53568000ab174db40ae3c29791038ec963e73627bdf552e9f3744` |
| `src/data.js` | 17130 | `8f08d190d5382450d802f81df96fe93e2c169463db061cf9f16744278544f7ac` |
| `src/main.jsx` | 225 | `38cc9e15aca811fae9cd8880dc51be1752f8b708e1a4f29b8ffa4ef1de7c5761` |
| `src/styles.css` | 72726 | `328ee2b83a8b6e0b48645ffa05b8d0ebf06ba44c0f2346f2a532d39f8afdb8da` |
| `src/components/AppDialogs.jsx` | 7588 | `0c48d9d40cb3f04ba46a5c7b04dba1e20422d75191d63e2fbb0cf0b51a3cb797` |
| `src/components/ui.jsx` | 10161 | `7263be40322170e301f70e5b59df769814833203d2095d94b30dc5ebabfc3992` |
| `src/components/dashboard/DashboardWidgets.jsx` | 3749 | `e4aa745855426aa52697fea792980a9fbc669370eeca9ce80c9340a94b1d5d4f` |
| `src/components/dashboard/ProfileEditor.jsx` | 9392 | `0dceebe126384a5cd2654e0edc8aa3bab5bf3bd1d40520e24f3e7c53b6f5e3ac` |
| `src/pages/DashboardPage.jsx` | 9702 | `eefddbe96032ba2ea0295ccf3d9ff4722e35bf311d9eec1bf2c044d256326754` |
| `src/pages/HomePage.jsx` | 9170 | `5c1fdfc1c868e2a38c987d1bce06db775ac901857ea5902e47f4d68af298be44` |
| `src/pages/ProfilePage.jsx` | 8000 | `fe19c6b48b4a2e912a08994dcaf75a67b6be9540389fba2c6bbaf483dd784783` |
| `src/pages/SearchPage.jsx` | 10792 | `5f2c3e8c1194c9a7adf9c3ddea6a9217f4c46b237d3f2fa6ad927e2ee16abe69` |

## Exact duplicates removed

None found. No canonical files were selected and no references needed updates.

## Items needing review

None found among the scanned frontend source files: no comment/whitespace-only
duplicates, 90%+ near-duplicate source pairs, or repeated named JavaScript
functions/components were detected. Only one frontend stylesheet exists, so
there were no cross-file CSS selector/declaration pairs to compare.

## Bytes saved

**0 bytes** (no duplicate files were removed).
