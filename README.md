# Sahayak AI — Your Guide to Public Welfare

Sahayak AI is a lightweight, accessible web application that helps people discover government welfare and public-support resources that may be relevant to their circumstances. It is designed around a simple principle: **make public information easier to navigate without pretending to make official eligibility decisions.**

## Why this vertical?

Public-benefit information can be fragmented across portals, departments, and state-specific processes. People may not know which schemes to investigate or what documents to prepare. Sahayak provides an accessible starting point, explains why a resource appeared, lists common document categories to verify, and links directly to official sources.

## What it does

- Collects a small profile through a responsive, accessible form.
- Uses transparent, explicit rules rather than opaque or fabricated AI-generated eligibility decisions.
- Shows potential matches, matched signposts, items to verify, and document checklists.
- Links to official portals for users to confirm current rules.
- Validates submitted data on the server and responds with safe error messages.
- Uses no database, account system, external AI API, or secret key for core functionality.

## Tech stack

- Node.js (ES modules)
- Express
- Plain HTML, CSS, and browser JavaScript
- JSON curated dataset
- Node.js built-in test runner (`node:test`)

## Project structure

```text
sahayak-ai/
├── data/
│   └── schemes.json        # Curated scheme/resource descriptions and matching rules
├── lib/
│   └── matcher.js          # Explainable matching and result scoring
├── public/
│   ├── app.js              # Form handling and safe result rendering
│   ├── index.html          # Accessible page structure
│   └── styles.css          # Responsive visual system and reduced-motion support
├── test/
│   ├── matcher.test.js     # Matching logic tests
│   └── server.test.js      # API and validation tests
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js               # Express API, validation, and static file hosting
```

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm test
npm start
```

Then open <http://localhost:3000>.

For development with automatic server restarts:

```bash
npm run dev
```

## How matching works

1. The browser sends the submitted profile to `POST /api/matches`.
2. The server validates field types, ranges, and allowed values.
3. `lib/matcher.js` evaluates explicit rules for each entry in `data/schemes.json`.
4. The response includes a transparent signpost score, matched criteria, unmet criteria, document checklist, explanatory notes, and an official source URL.
5. The browser renders the result using DOM text nodes and `textContent`, rather than inserting user input as HTML.

The percentage displayed is the proportion of the resource's configured *signpost rules* that matched. It is **not** a probability of eligibility, a confidence score, or an approval likelihood. A result marked “Potential fit” means only that all the small set of demo signposts matched.

## Data sources and scope

The initial dataset is intentionally small and uses official starting portals:

- PM-KISAN: <https://pmkisan.gov.in/>
- Ayushman Bharat PM-JAY: <https://pmjay.gov.in/>
- National Scholarship Portal: <https://scholarships.gov.in/>
- National Social Assistance Programme: <https://nsap.nic.in/>
- India Post (Sukanya Samriddhi account information): <https://www.indiapost.gov.in/>
- Department of Empowerment of Persons with Disabilities: <https://depwd.gov.in/>
- myScheme national discovery portal: <https://www.myscheme.gov.in/>

The entries are broad signposts, not a comprehensive or live-verified catalogue. Official pages, eligibility rules, application windows, documents, and state implementation can change. The app does not scrape these sites or verify the user's records. Before a public launch, maintainers should review every entry against current official scheme guidelines, record a `lastReviewed` date and source document for each rule, and add a process for keeping information current.

## Assumptions and limitations

- The demo is intended for India and currently includes a limited selection of central-government/public-support starting points.
- It does not store profiles in a database. Data is sent to the app's own API for the current request; do not deploy this demo with sensitive data collection without a privacy and security review.
- The current scoring is explanatory navigation, not an official eligibility assessment.
- Some criteria are intentionally omitted because official eligibility can depend on verified records, household definitions, scheme exclusions, state rules, or changing policy.
- The health-cover answer is a navigation hint only; it is not used as a PM-JAY eligibility rule.
- The rural-residence, gender, social-category, and income answers are collected for future refinement but are not used to assert eligibility where the current rules do not support it.
- No account, payment, or paid AI API is required.

## Security, accessibility, and efficiency

- Server-side allowlist validation and request-size limit.
- Security headers for MIME sniffing, framing, referrer policy, and unused device permissions.
- No secrets, tracking scripts, user accounts, or persistent profile storage.
- Minimal runtime dependency footprint; small static assets and a compact JSON dataset.
- Semantic headings, labels, fieldsets, visible focus, skip link, status announcements, keyboard-friendly controls, and reduced-motion support.
- External links use `rel="noopener noreferrer"`.

## Tests

Run:

```bash
npm test
```

The tests cover matcher behavior, source/document presence, the health endpoint, invalid payloads, and a valid API request.

## Disclaimer

Sahayak AI is an independent demo and is not affiliated with, endorsed by, or operated by any government department. It provides general information and navigation only, not legal advice or official eligibility decisions. Always confirm current rules and application instructions through official sources.
