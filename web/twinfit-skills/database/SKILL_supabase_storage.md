# SKILL: Supabase Storage
> TwinFit — Pose photos, meal scans, compression

## Bucket Setup (Dashboard)
```
pose-photos/   Public, max 5MB, image/jpeg + image/png
meal-scans/    Public, max 10MB, image/jpeg + image/png
```

## Storage Policies
```sql
create policy "upload_own" on storage.objects
  for insert with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "public_read" on storage.objects
  for select using (bucket_id in ('pose-photos', 'meal-scans'));
```

## Upload Service (services/storage.ts)
```ts
import { supabase } from "./supabase";
import * as ImageManipulator from "expo-image-manipulator";

export async function uploadPosePhoto(userId: string, uri: string): Promise<string> {
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  const blob = await (await fetch(compressed.uri)).blob();
  const filename = userId + "/" + Date.now() + ".jpg";
  const { error } = await supabase.storage.from("pose-photos").upload(filename, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return supabase.storage.from("pose-photos").getPublicUrl(filename).data.publicUrl;
}
```
