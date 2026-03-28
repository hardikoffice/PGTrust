"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, resolveMediaUrl } from "@/lib/api";

type PGDetail = {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  rent: number;
  rating: number;
  amenities: string[];
  images: string[];
  description?: string | null;
  gender_preference?: string | null;
  active: boolean;
};

type PGReviewItem = {
  id: string;
  author_display_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

type PGReviewListResponse = {
  reviews: PGReviewItem[];
  average_rating: number | null;
  total: number;
};

export default function PublicPgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  
  const authed = !!profile;
  const isTenant = profile?.role === "TENANT";
  const verified = profile?.tenant_data?.verification_status === "VERIFIED";

  const [pg, setPg] = useState<PGDetail | null>(null);
  const [reviews, setReviews] = useState<PGReviewListResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reviewErr, setReviewErr] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      const res = await apiFetch<PGReviewListResponse>(`/pg/${id}/reviews`);
      setReviews(res);
    } catch {
      setReviews({ reviews: [], average_rating: null, total: 0 });
    }
  }, [id]);

  const loadMyReview = useCallback(async () => {
    if (!authed) return;
    try {
      const mine = await apiFetch<PGReviewItem | null>(`/pg/${id}/reviews/me`, {
        auth: true,
      });
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment ?? "");
      }
    } catch {
      /* no review yet */
    }
  }, [id, authed]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<PGDetail>(`/pg/${id}`);
        setPg(res);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load PG details");
      }
    })();
  }, [id]);

  useEffect(() => {
    if (id) void loadReviews();
  }, [id, loadReviews]);

  useEffect(() => {
    if (id && isTenant) void loadMyReview();
  }, [id, isTenant, loadMyReview]);

  if (err) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-5xl px-4 py-12">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-red-700">
            {err}
          </div>
        </main>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-5xl px-4 py-12">
          <div className="text-sm text-zinc-600">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-zinc-900">{pg.name}</div>
              <div className="text-sm text-zinc-600">{pg.location}</div>
            </div>
            <Link href="/search">
              <Button variant="secondary">Back to search</Button>
            </Link>
          </div>

          {pg.images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
              {pg.images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={resolveMediaUrl(src)}
                  alt=""
                  className="h-64 w-96 shrink-0 rounded-2xl border border-zinc-200 object-cover shadow-sm snap-start"
                />
              ))}
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-sm text-zinc-600 font-medium">Monthly Rent</div>
                    <div className="text-3xl font-bold text-zinc-900">₹{pg.rent}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-600 font-medium">Overall Rating</div>
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-bold text-zinc-900">★ {pg.rating.toFixed(1)}</span>
                       <span className="text-sm text-zinc-400">/ 5</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {pg.amenities.map((a) => (
                      <span key={a} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-zinc-200/50">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {pg.description ? (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">About this PG</h3>
                    <p className="text-base leading-relaxed text-zinc-600">{pg.description}</p>
                  </div>
                ) : null}

                <div className="mt-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">Location on Map</h3>
                  <div className="w-full h-80 rounded-2xl overflow-hidden border border-zinc-200">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(pg.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 -z-10 animate-pulse">
                      <span className="text-sm text-zinc-400">Loading map...</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500 italic">
                    Map location is approximate based on the provided address: {pg.location}
                  </p>
                </div>
              </div>

              <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-zinc-900">Tenant Reviews</h2>
                  {reviews && reviews.total > 0 && reviews.average_rating != null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-amber-700">★ {reviews.average_rating.toFixed(1)}</span>
                      <span className="text-zinc-400">·</span>
                      <span className="text-zinc-600">{reviews.total} reviews</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {!reviews?.reviews.length && (
                    <div className="py-8 text-center text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                      No reviews yet for this PG.
                    </div>
                  )}
                  {reviews?.reviews.map((r) => (
                    <article key={r.id} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-zinc-900">{r.author_display_name}</span>
                        <div className="flex items-center gap-1 text-amber-600">
                          <span className="text-sm font-bold">{r.rating}</span>
                          <span className="text-xs">★</span>
                        </div>
                      </div>
                      <time className="text-xs text-zinc-400 block mb-2">
                        {new Date(r.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      {r.comment && <p className="text-sm text-zinc-700 leading-relaxed">{r.comment}</p>}
                    </article>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-100">
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Write a Review</h3>
                  {!authed ? (
                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
                      <p className="text-sm text-amber-900 mb-3">
                        You must be signed in as a tenant to share your experience.
                      </p>
                      <Link href={`/login?next=/pg/${id}`}>
                        <Button variant="secondary" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100">
                          Sign in to Review
                        </Button>
                      </Link>
                    </div>
                  ) : !isTenant ? (
                    <p className="text-sm text-zinc-500 italic">Only tenants can leave reviews.</p>
                  ) : (
                    <form
                      className="grid gap-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setReviewErr(null);
                        setReviewLoading(true);
                        try {
                          await apiFetch<PGReviewItem>(`/pg/${id}/reviews`, {
                            method: "POST",
                            auth: true,
                            body: JSON.stringify({
                              rating,
                              comment: comment.trim() || null,
                            }),
                          });
                          await loadReviews();
                          await loadMyReview();
                          setComment("");
                        } catch (ex) {
                          setReviewErr(ex instanceof Error ? ex.message : "Failed to submit review");
                        } finally {
                          setReviewLoading(false);
                        }
                      }}
                    >
                      <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                        Rating
                        <select
                          className="h-10 max-w-xs rounded-lg border border-zinc-200 bg-white px-3 text-zinc-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} Stars — {["", "Very poor", "Poor", "Okay", "Good", "Excellent"][n]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                        Comment
                        <textarea
                          placeholder="What was your experience like?"
                          className="min-h-[120px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 focus:ring-2 focus:ring-yellow-400 outline-none"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </label>
                      {reviewErr && <p className="text-sm text-red-600">{reviewErr}</p>}
                      <Button type="submit" disabled={reviewLoading} className="w-fit">
                        {reviewLoading ? "Posting..." : "Post Review"}
                      </Button>
                    </form>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Interested?</h3>
                <div className="space-y-4">
                  {!authed ? (
                    <>
                      <p className="text-sm text-zinc-600">
                        Sign up to send a booking request and verify your reputation with the owner.
                      </p>
                      <Link href={`/signup?next=/pg/${id}`} className="block">
                        <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
                          Sign up to Request
                        </Button>
                      </Link>
                    </>
                  ) : isTenant ? (
                    <>
                      {!verified && (
                        <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-200 mb-4">
                          <p className="text-sm text-zinc-600 mb-3">
                            You need to verify your ID before you can send booking requests.
                          </p>
                          <Link href="/tenant/profile">
                            <Button variant="secondary" className="w-full">
                              Verify ID now
                            </Button>
                          </Link>
                        </div>
                      )}
                      <Button
                        className="w-full"
                        disabled={!verified}
                        onClick={async () => {
                          try {
                            await apiFetch("/requests/create", {
                              method: "POST",
                              auth: true,
                              body: JSON.stringify({
                                pg_id: pg.id,
                                move_in_date: new Date().toISOString().slice(0, 10),
                              }),
                            });
                            router.push("/tenant/requests");
                          } catch (e) {
                            alert(e instanceof Error ? e.message : "Failed to create request");
                          }
                        }}
                      >
                        Request to Book
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-500 italic">
                      Booking requests are only available for tenant accounts.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
