import { supabase } from "@/integrations/supabase/client";
import type { PlannerInput } from "@/lib/plan";

export interface SavedPlan {
  id: string;
  name: string;
  season_year: number;
  input: PlannerInput;
  notes: string | null;
  updated_at: string;
}

export async function listPlans(): Promise<SavedPlan[]> {
  const { data, error } = await supabase
    .from("garden_plans")
    .select("id,name,season_year,input,notes,updated_at")
    .order("season_year", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SavedPlan[];
}

export async function getPlan(id: string): Promise<SavedPlan> {
  const { data, error } = await supabase
    .from("garden_plans")
    .select("id,name,season_year,input,notes,updated_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as SavedPlan;
}

export async function savePlan(p: {
  id?: string;
  name: string;
  season_year: number;
  input: PlannerInput;
  notes?: string | null;
}): Promise<string> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in");
  const row = {
    name: p.name,
    season_year: p.season_year,
    input: p.input as unknown as never,
    notes: p.notes ?? null,
  };
  if (p.id) {
    const { error } = await supabase.from("garden_plans").update(row).eq("id", p.id);
    if (error) throw error;
    return p.id;
  }
  const { data, error } = await supabase
    .from("garden_plans")
    .insert({ ...row, user_id: u.user.id })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function deletePlan(id: string) {
  const { error } = await supabase.from("garden_plans").delete().eq("id", id);
  if (error) throw error;
}

export interface Profile {
  id: string;
  display_name: string | null;
  location_name: string | null;
  hemisphere: string;
  climate: string;
}

export async function getProfile(): Promise<Profile | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
  return (data as Profile) ?? null;
}

export async function updateProfile(p: Omit<Profile, "id">) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in");
  const { error } = await supabase.from("profiles").upsert({ id: u.user.id, ...p });
  if (error) throw error;
}
