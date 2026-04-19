export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  shinySpriteUrl: string;
}

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function getPokemonSprite(id: number) {
  return `${SPRITE_BASE}/${id}.png`;
}

export function getPokemonShinySprite(id: number) {
  return `${SPRITE_BASE}/shiny/${id}.png`;
}

export function formatPokemonName(name: string) {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Fetch the full list of Pokemon from PokeAPI (first 1025 — all main-series Pokemon)
export async function fetchAllPokemon(): Promise<PokemonListItem[]> {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0", {
    next: { revalidate: 86400 }, // revalidate daily
  });
  if (!res.ok) throw new Error("Failed to fetch Pokemon list");
  const data = await res.json();

  return (data.results as { name: string; url: string }[]).map((p, i) => {
    const id = i + 1;
    return {
      id,
      name: p.name,
      sprite: getPokemonSprite(id),
      shinySpriteUrl: getPokemonShinySprite(id),
    };
  });
}
