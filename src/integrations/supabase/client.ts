// Local preview stand-in. Lovable generates its own src/integrations/supabase/client.ts
// (typed, with auth storage), so this file is NOT carried over.
import { createClient } from "@supabase/supabase-js";

// The publishable key is public by design: it ships in the browser bundle and
// the catalogue tables are read-only to it.
const url = import.meta.env.VITE_SUPABASE_URL ?? "https://dwtwjkvdscaxbuamqpwi.supabase.co";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_vY2cpZidTNKYCr91oDvPuw_aovSLGkL";

export const supabase = createClient(url, key, { auth: { persistSession: false } });
