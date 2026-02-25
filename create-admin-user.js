require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const MARC_ID = "8fdfef23-8fdf-4268-81bc-c3b9141254ff";
async function main() {
  const { data, error } = await supabase
    .from("inscription_evenements")
    .update({ admin_id: MARC_ID })
    .is("admin_id", null)
    .select("id, nom");
  if (error) console.log("Error:", error.message, JSON.stringify(error));
  else {
    console.log("Updated", data.length, "events to marcmenu707");
    data.forEach(e => console.log(" -", e.nom));
  }
  const { data: check } = await supabase.from("inscription_evenements").select("nom, admin_id").limit(8);
  console.log("\nVerification:");
  check?.forEach(e => console.log("  ", e.admin_id ? e.admin_id.substring(0,8) : "NULL", "|", e.nom));
}
main().catch(console.error);
