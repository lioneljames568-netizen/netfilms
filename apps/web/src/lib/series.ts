export type DemoEpisode = { number: number; title: string; duration: string };
export type DemoSeason = { number: number; title: string; episodes: DemoEpisode[] };
export type DemoSeries = {
  slug: string;
  title: string;
  year: number;
  genre: string;
  synopsis: string;
  translator: string;
  poster: string;
  seasons: DemoSeason[];
};

// Illustrative records only. Replace with approved catalogue data from the API.
export const demoSeries: DemoSeries[] = [
  {
    slug: "city-of-promises",
    title: "City of Promises",
    year: 2024,
    genre: "Drama · Mystery",
    synopsis: "A family returns to their hometown and uncovers secrets that connect generations.",
    translator: "NetFilms Studio",
    poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
    seasons: [
      { number: 1, title: "A New Beginning", episodes: [
        { number: 1, title: "The Return", duration: "42 min" },
        { number: 2, title: "Old Promises", duration: "39 min" },
        { number: 3, title: "The Letter", duration: "44 min" }
      ]},
      { number: 2, title: "The Truth", episodes: [
        { number: 1, title: "What Remains", duration: "45 min" },
        { number: 2, title: "Crossroads", duration: "41 min" }
      ]}
    ]
  },
  {
    slug: "wild-roads",
    title: "Wild Roads",
    year: 2023,
    genre: "Adventure · Action",
    synopsis: "Two unlikely partners cross unfamiliar territory in search of a missing expedition.",
    translator: "Aline Uwase",
    poster: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85",
    seasons: [
      { number: 1, title: "The Expedition", episodes: [
        { number: 1, title: "Departure", duration: "38 min" },
        { number: 2, title: "Into the Unknown", duration: "40 min" }
      ]}
    ]
  }
];
