import { db } from "./index";
import { species, sources } from "./schema";

async function seed() {
  const [littlePenguin] = await db
    .insert(species)
    .values({
      slug: "little-penguin",
      commonName: "Little Penguin",
      scientificName: "Eudyptula minor",
      taxonGroup: "bird",
      endemic: true, // only Australia and NZ
      conservationStatus: "least_concern",
      fluRisk: "high",
      fluStatus: "at_risk",
      fluStatusUpdatedAt: new Date("2026-08-04"),
      regions: ["Victoria", "Tasmania", "South Australia", "New Zealand"],
      bio: "Colonial breeder; St Kilda colony (~1,400 birds) flagged by Earthcare St Kilda as likely to be reached by H5 bird flu, with modelled losses of 20-40% of the population.",
    })
    .returning();

  await db.insert(sources).values({
    speciesId: littlePenguin.id,
    url: "https://www.dailyadvertiser.com.au/story/9323196/grim-news-penguin-alert-as-bird-flu-outbreak-worsens/",
    publisher: "Australian Associated Press",
    title: "'Grim news': Penguin alert as bird flu outbreak worsens",
    sourceType: "news",
    supportsField: "flu_risk",
    publishedAt: new Date("2026-08-04"),
  });

  const [blackSwan] = await db
    .insert(species)
    .values({
      slug: "black-swan",
      commonName: "Black Swan",
      scientificName: "Cygnus atratus",
      taxonGroup: "bird",
      endemic: false,
      conservationStatus: "least_concern",
      fluRisk: "high",
      fluStatus: "at_risk",
      regions: ["Nationwide wetlands"],
      bio: "Named by the Australian Conservation Foundation among birds more susceptible to H5N1.",
    })
    .returning();

  await db.insert(sources).values({
    speciesId: blackSwan.id,
    url: "https://www.acf.org.au/news/h5n1-bird-flu-what-you-need-to-know",
    publisher: "Australian Conservation Foundation",
    title: "H5N1 bird flu: what you need to know",
    sourceType: "ngo",
    supportsField: "flu_risk",
  });

  const [crestedTern] = await db
    .insert(species)
    .values({
      slug: "greater-crested-tern",
      commonName: "Greater Crested Tern",
      scientificName: "Thalasseus bergii",
      taxonGroup: "bird",
      endemic: false,
      fluRisk: "high",
      fluStatus: "confirmed_infected",
      fluStatusUpdatedAt: new Date("2026-08-04"),
      regions: ["South Australia", "Victoria", "Western Australia"],
      bio: "Colonial seabird; multiple confirmed H5N1 detections including a large mortality event at Baudin Rocks, SA.",
    })
    .returning();

  await db.insert(sources).values([
    {
      speciesId: crestedTern.id,
      url: "https://www.dailyadvertiser.com.au/story/9323196/grim-news-penguin-alert-as-bird-flu-outbreak-worsens/",
      publisher: "Australian Associated Press",
      title: "'Grim news': Penguin alert as bird flu outbreak worsens",
      sourceType: "news",
      supportsField: "flu_status",
      publishedAt: new Date("2026-08-04"),
    },
    {
      speciesId: crestedTern.id,
      url: "https://empres-i.apps.fao.org",
      publisher: "FAO EMPRES-i+",
      title: "Animal Disease Events — Australia, Influenza-Avian",
      sourceType: "government",
      supportsField: "flu_status",
    },
  ]);

  const [seaLion] = await db
    .insert(species)
    .values({
      slug: "australian-sea-lion",
      commonName: "Australian Sea Lion",
      scientificName: "Neophoca cinerea",
      taxonGroup: "seal_sea_lion",
      endemic: true,
      conservationStatus: "endangered",
      fluRisk: "high",
      fluStatus: "at_risk",
      regions: ["South Australia", "Western Australia"],
      bio: "Named explicitly by DCCEEW as high risk due to threatened status; dense haul-out colonies raise cross-species spillover concern from infected seabirds.",
    })
    .returning();

  await db.insert(sources).values({
    speciesId: seaLion.id,
    url: "https://www.dcceew.gov.au/environment/invasive-species/diseases-fungi-and-parasites/birdflu/native-species",
    publisher: "DCCEEW",
    title: "H5 bird flu and native species",
    sourceType: "government",
    supportsField: "flu_risk",
  });

  console.log("Seeded 4 species with sources.");
}

seed();
