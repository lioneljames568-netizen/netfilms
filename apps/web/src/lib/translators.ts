export type DemoTranslator = {
  slug: string;
  name: string;
  bio: string;
  initials: string;
};

export const demoTranslators: DemoTranslator[] = [
  { slug: "netfilms-studio", name: "NetFilms Studio", bio: "The NetFilms translation team bringing selected stories to Kinyarwanda audiences.", initials: "NF" },
  { slug: "aline-uwase", name: "Aline Uwase", bio: "Translator and language contributor.", initials: "AU" },
  { slug: "jean-claude", name: "Jean Claude", bio: "Translator and language contributor.", initials: "JC" },
  { slug: "mutesi-diane", name: "Mutesi Diane", bio: "Translator and language contributor.", initials: "MD" },
  { slug: "eric-n", name: "Eric N.", bio: "Translator and language contributor.", initials: "EN" },
];
