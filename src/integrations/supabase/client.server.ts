// LOCAL STAND-IN ONLY. Lovable generates its own src/integrations/supabase/client.server.ts (typed, service
// role); never upload this file to Lovable. It exists so the local typecheck and build resolve the import.
import { createClient } from "@supabase/supabase-js";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const supabaseAdmin = createClient(env.SUPABASE_URL ?? "http://localhost", env.SUPABASE_SERVICE_ROLE_KEY ?? "local", {
  auth: { persistSession: false, autoRefreshToken: false },
});
