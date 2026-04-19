import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CollectionBrowser from "@/components/CollectionBrowser";
import SignOutButton from "@/components/SignOutButton";
import type { CollectionRow } from "@/lib/supabase/types";

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const { data: collection } = await supabase
    .from("user_collection")
    .select("*");

  const collectionMap: Record<number, CollectionRow> = {};
  for (const row of collection ?? []) {
    collectionMap[row.pokemon_id] = row;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow">
        <h1 className="text-xl font-bold">Pokedex Helper</h1>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <CollectionBrowser initialCollection={collectionMap} />
      </main>
    </div>
  );
}
