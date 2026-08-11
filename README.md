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
- ALA search by species scientific name: `bie.ala.org.au/ws/search.json?q="{scientificName}"` (guid, conservationStatus, commonName, isAustralian)
- ALA species profile: `bie.ala.org.au/ws/species/{guid}.json` (bio, image)
- FAO Empres-i+ for flu status (disease events, filtered to australia by date range):

```
https://api.data.apps.fao.org/api/v2/bigquery?sql_url=https://data.apps.fao.org/catalog/dataset/96641600-b15c-493e-8e8d-6c22f145a960/resource/2fc21534-05da-4c58-b773-93a0f28bd1f6/download/avian-influenza-parameterized-query.sql&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&diagnosis_status=all&animal_type=all&disease=Influenza%20-%20Avian&country=Australia
```

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
