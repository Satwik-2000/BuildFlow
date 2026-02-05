import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";
const bucket = process.env.SUPABASE_BUCKET || "documents";

export const supabase = url && key ? createClient(url, key) : null;

export async function uploadFile(
  path: string,
  file: Buffer,
  options?: { contentType?: string }
): Promise<{ url: string; path: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: options?.contentType || "application/octet-stream",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: urlData.publicUrl, path: data.path };
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}
