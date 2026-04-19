import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/collection");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-2">Pokedex Helper</h1>
        <p className="text-gray-600 text-lg">Track your Pokemon Go collection</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/auth/signin"
          className="w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="w-full text-center bg-white hover:bg-gray-50 text-red-600 font-semibold py-3 px-6 rounded-lg border-2 border-red-600 transition-colors"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
