"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { fetchAllPokemon, formatPokemonName, type PokemonListItem } from "@/lib/pokeapi";
import type { CollectionRow, CollectionFlag } from "@/lib/supabase/types";

const FLAGS: { key: CollectionFlag; label: string; color: string }[] = [
  { key: "has_regular", label: "Regular", color: "bg-gray-200 text-gray-800" },
  { key: "has_shiny", label: "Shiny", color: "bg-yellow-200 text-yellow-800" },
  { key: "has_xxl", label: "XXL", color: "bg-blue-200 text-blue-800" },
  { key: "has_xxl_shiny", label: "XXL Shiny", color: "bg-purple-200 text-purple-800" },
];

interface Props {
  initialCollection: Record<number, CollectionRow>;
}

export default function CollectionBrowser({ initialCollection }: Props) {
  const supabase = createClient();
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [collection, setCollection] = useState<Record<number, CollectionRow>>(initialCollection);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CollectionFlag>("all");
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetchAllPokemon()
      .then(setAllPokemon)
      .finally(() => setLoadingPokemon(false));
  }, []);

  const filtered = useMemo(() => {
    let list = allPokemon;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.includes(q) || String(p.id).includes(q)
      );
    }
    if (filter !== "all") {
      list = list.filter((p) => collection[p.id]?.[filter] === true);
    }
    return list;
  }, [allPokemon, search, filter, collection]);

  async function toggleFlag(pokemon: PokemonListItem, flag: CollectionFlag) {
    const current = collection[pokemon.id];
    const newValue = !(current?.[flag] ?? false);

    // Optimistic update
    setCollection((prev) => ({
      ...prev,
      [pokemon.id]: {
        ...(current ?? {
          id: "",
          user_id: "",
          pokemon_id: pokemon.id,
          has_regular: false,
          has_shiny: false,
          has_xxl: false,
          has_xxl_shiny: false,
          updated_at: "",
        }),
        [flag]: newValue,
      },
    }));

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (current?.id) {
        await supabase
          .from("user_collection")
          .update({ [flag]: newValue })
          .eq("id", current.id);
      } else {
        const { data } = await supabase
          .from("user_collection")
          .insert({
            user_id: user.id,
            pokemon_id: pokemon.id,
            [flag]: newValue,
          })
          .select()
          .single();
        if (data) {
          setCollection((prev) => ({ ...prev, [pokemon.id]: data }));
        }
      }
    });
  }

  const caughtCount = useMemo(
    () =>
      allPokemon.filter(
        (p) =>
          collection[p.id]?.has_regular ||
          collection[p.id]?.has_shiny ||
          collection[p.id]?.has_xxl ||
          collection[p.id]?.has_xxl_shiny
      ).length,
    [allPokemon, collection]
  );

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <span>
          <strong>{caughtCount}</strong> / {allPokemon.length} caught
        </span>
        {FLAGS.map((f) => (
          <span key={f.key}>
            <strong>{allPokemon.filter((p) => collection[p.id]?.[f.key]).length}</strong>{" "}
            {f.label}
          </span>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          placeholder="Search by name or #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 flex-1 min-w-40"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Pokemon</option>
          {FLAGS.map((f) => (
            <option key={f.key} value={f.key}>
              Have: {f.label}
            </option>
          ))}
        </select>
      </div>

      {loadingPokemon ? (
        <div className="text-center py-16 text-gray-400">Loading Pokemon…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              row={collection[pokemon.id]}
              onToggle={(flag) => toggleFlag(pokemon, flag)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              No Pokemon found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PokemonCard({
  pokemon,
  row,
  onToggle,
}: {
  pokemon: PokemonListItem;
  row: CollectionRow | undefined;
  onToggle: (flag: CollectionFlag) => void;
}) {
  const [showShiny, setShowShiny] = useState(false);
  const hasSomething =
    row?.has_regular || row?.has_shiny || row?.has_xxl || row?.has_xxl_shiny;

  return (
    <div
      className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 bg-white transition-colors ${
        hasSomething ? "border-red-400" : "border-gray-200"
      }`}
    >
      <button
        onClick={() => setShowShiny((s) => !s)}
        className="relative w-16 h-16 hover:scale-110 transition-transform"
        title={showShiny ? "Showing shiny — click for normal" : "Click for shiny preview"}
      >
        <Image
          src={showShiny ? pokemon.shinySpriteUrl : pokemon.sprite}
          alt={pokemon.name}
          fill
          className="object-contain"
          unoptimized
        />
      </button>

      <div className="text-center">
        <div className="text-xs text-gray-400">#{String(pokemon.id).padStart(3, "0")}</div>
        <div className="text-xs font-medium leading-tight">{formatPokemonName(pokemon.name)}</div>
      </div>

      <div className="flex flex-wrap justify-center gap-1 w-full">
        {FLAGS.map((f) => {
          const active = row?.[f.key] ?? false;
          return (
            <button
              key={f.key}
              onClick={() => onToggle(f.key)}
              className={`text-xs px-1.5 py-0.5 rounded font-medium transition-opacity border ${
                active
                  ? `${f.color} border-transparent`
                  : "bg-white text-gray-400 border-gray-200 opacity-60 hover:opacity-100"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
