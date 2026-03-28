"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { RequireRole } from "@/components/layout/RequireRole";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch, resolveMediaUrl, uploadPgImage } from "@/lib/api";

const MAX_PG_IMAGES = 8;

export default function OwnerNewPropertyPage() {
  return (
    <RequireRole role="OWNER">
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rent, setRent] = useState("");
  const [amenities, setAmenities] = useState("WiFi, AC, Laundry");
  const [gender, setGender] = useState<"ANY" | "MALE" | "FEMALE">("ANY");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("4.5");
  const [rentDueDay, setRentDueDay] = useState("5");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-2xl font-semibold text-zinc-900">Add new PG</div>
        <div className="text-sm text-zinc-600">Create a listing visible to tenants.</div>
      </div>

      <div className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          <Input
            label="Rent (monthly)"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            inputMode="numeric"
            placeholder="12000"
            required
          />
          <Input
            label="Listing rating (0–5)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            inputMode="decimal"
            placeholder="4.5"
          />
          <Input
            label="Monthly Rent Due Day (1-28)"
            value={rentDueDay}
            onChange={(e) => setRentDueDay(e.target.value)}
            inputMode="numeric"
            placeholder="5"
          />
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-700">Gender preference</span>
            <select
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
              value={gender}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "ANY" || v === "MALE" || v === "FEMALE") setGender(v);
              }}
            >
              <option value="ANY">Any</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>
        </div>

        <Input
          label="Amenities (comma separated)"
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
          placeholder="WiFi, AC, Meals"
        />

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-700">Description</span>
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="grid gap-2">
          <span className="text-sm text-zinc-700">Photos</span>
          <p className="text-xs text-zinc-500">
            JPEG, PNG, WebP, or GIF — up to {MAX_PG_IMAGES} images, 5MB each.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={uploadingImages || imageUrls.length >= MAX_PG_IMAGES}
            className="text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-yellow-400 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-yellow-300"
            onChange={async (e) => {
              const files = e.target.files;
              if (!files?.length) return;
              setErr(null);
              setUploadingImages(true);
              try {
                const next: string[] = [...imageUrls];
                for (const file of Array.from(files)) {
                  if (next.length >= MAX_PG_IMAGES) break;
                  const url = await uploadPgImage(file);
                  next.push(url);
                }
                setImageUrls(next);
              } catch (errUpload) {
                setErr(errUpload instanceof Error ? errUpload.message : "Upload failed");
              } finally {
                setUploadingImages(false);
                e.target.value = "";
              }
            }}
          />
          {imageUrls.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-3">
              {imageUrls.map((url) => (
                <li key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveMediaUrl(url)}
                    alt=""
                    className="h-24 w-32 rounded-lg border border-zinc-200 object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white shadow hover:bg-zinc-700"
                    onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {uploadingImages ? (
            <p className="text-xs text-zinc-500">Uploading…</p>
          ) : null}
        </div>

        {err ? (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>
        ) : null}

        <div className="flex gap-2">
          <Button
            disabled={loading}
            onClick={async () => {
              setErr(null);
              setLoading(true);
              try {
                await apiFetch("/pg/create", {
                  method: "POST",
                  auth: true,
                  body: JSON.stringify({
                    name,
                    location,
                    rent: Number(rent),
                    rating: rating.trim() === "" ? null : Number(rating),
                    amenities: amenities
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                    gender_preference: gender,
                    description: description || null,
                    rent_due_day: rentDueDay.trim() === "" ? null : Number(rentDueDay),
                    images: imageUrls,
                  }),
                });
                router.push("/owner/properties");
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Creating..." : "Create listing"}
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

