import { createClient } from "@supabase/supabase-js";

// Cliente único — funciona en Client Components, Server Components y API routes
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
