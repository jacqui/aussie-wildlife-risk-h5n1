# aussie wildlife risk tracker

h5n1 has arrived in australia. australia is home to many species of wildlife found nowhere else. the government is [investing money to protect native species](https://www.dcceew.gov.au/about/news/11-2m-safeguard-native-species-from-h5-bird-flu). so what animals are at risk?

this hobby project aims to answer:

- which are the native species most at risk?
- tell a bit about each
- what's their conservation status before h5n1 runs its course?
- are any infected with bird flu?
- where do each live typically?
- why should we care?

## data sources

- [the official list of risk scores for birds and mammals](https://www.dcceew.gov.au/sites/default/files/documents/national-risk-scores-h5-bird-flu-native-birds-mammals.pdf) - pdf, last update 04 Aug 2026

## to-do

I'd like to track bird flu detection events, but tbh, that's already being done by the fine person/people behind [https://www.birdflutracker.org/](https://www.birdflutracker.org/).

- [x] build out simple frontend table of species with basic info
- [x] create card-like components able to reuse in different contexts
- populate full set of at-risk birds and mammals
- track actual containment efforts
- map showing species habitat(s)

## Getting Started

First, create a new project in [neon](https://console.neon.tech/), store the connection string in `.env.local` (`DATABASE_URL=xyz). Setup your local development server and the neon database:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```
