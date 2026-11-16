export type DemoMovie = {
  id: string;
  title: string;
  year: number;
  genre: string;
  quality: string;
  translator: string;
  poster: string;
  accent: string;
  label?: string;
};

export const demoMovies: DemoMovie[] = [
  { id: "m1", title: "The Last Kingdom", year: 2024, genre: "Action", quality: "HD", translator: "NetFilms Studio", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=85", accent: "#563c32", label: "TRENDING" },
  { id: "m2", title: "Beyond the Horizon", year: 2023, genre: "Adventure", quality: "4K", translator: "Aline Uwase", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=700&q=85", accent: "#33465a" },
  { id: "m3", title: "Silent Promise", year: 2024, genre: "Drama", quality: "HD", translator: "Jean Claude", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=85", accent: "#493a40", label: "NEW" },
  { id: "m4", title: "Shadow Protocol", year: 2022, genre: "Thriller", quality: "FHD", translator: "NetFilms Studio", poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85", accent: "#3e473c" },
  { id: "m5", title: "A Place to Begin", year: 2024, genre: "Romance", quality: "HD", translator: "Mutesi Diane", poster: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=85", accent: "#40566a" },
  { id: "m6", title: "Into the Wild", year: 2023, genre: "Adventure", quality: "4K", translator: "Eric N.", poster: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=700&q=85", accent: "#304737" },
];

export const featuredMovie = {
  title: "THE LAST FRONTIER",
  description: "In a world where every choice has a price, one journey will test the limits of courage, loyalty and hope.",
  year: 2025,
  genre: "Action · Adventure",
  quality: "4K ULTRA HD",
  translator: "NetFilms Studio",
};
