/**
 * Supabase Storage — photo upload service
 * Used for check-in photos. Uploads to the "checkins" bucket
 * and returns a public CDN URL.
 */
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";

const SUPABASE_URL = "https://fuevosmyabttixlmevex.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x53g-xVmICLLRcpom1xVsw_QNLgpBFY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upload a local file URI to Supabase Storage.
 * Returns the public CDN URL.
 */
export async function uploadPhoto(
  localUri: string,
  bucket: string = "checkins",
  folder: string = "checkins"
): Promise<string> {
  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const ext = localUri.split(".").pop()?.toLowerCase() ?? "jpg";
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  // Decode base64 to ArrayBuffer
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, bytes.buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
