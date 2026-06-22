import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

function profileFromUser(user: User) {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? null,
    full_name:
      (metadata.full_name as string | undefined) ??
      (metadata.name as string | undefined) ??
      null,
    avatar_url:
      (metadata.avatar_url as string | undefined) ??
      (metadata.picture as string | undefined) ??
      null,
  };
}

export async function ensureProfileForUser(user: User) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .upsert(profileFromUser(user), { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await ensureProfileForUser(user);
}
