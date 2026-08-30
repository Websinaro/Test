"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductGrid from "@/components/ProductGrid";

function Stars({ value, size = "text-sm" }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={`text-aurora-gold ${size}`}>
      {"★".repeat(rounded)}
      {"☆".repeat(5 - rounded)}
    </span>
  );
}

const TABS = [
  { id: "description", label: "Description" },
  { id: "reviews", label: "Reviews" },
  { id: "qna", label: "Q&A" },
];

export default function ProductDetailPage() {
  const { id: slug } = useParams();
  const { addItem } = useCart();
  const { firebaseUser, getToken } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Q&A form
  const [questionText, setQuestionText] = useState("");
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionError, setQuestionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setActiveTab("description");

    Promise.all([
      api.getProduct(slug),
      api.getRelatedProducts(slug).catch(() => ({ products: [] })),
      api.getReviews(slug).catch(() => ({ reviews: [] })),
      api.getQna(slug).catch(() => ({ questions: [] })),
    ])
      .then(([productData, relatedData, reviewsData, qnaData]) => {
        if (cancelled) return;
        setProduct(productData.product);
        setRelated(relatedData.products || []);
        setReviews(reviewsData.reviews || []);
        setQuestions(qnaData.questions || []);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    setReviewError("");
    if (!firebaseUser) {
      setReviewError("Sign in to leave a review.");
      return;
    }
    setReviewSaving(true);
    try {
      const token = await getToken();
      const { review } = await api.postReview(token, slug, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviews((r) => [review, ...r]);
      setReviewComment("");
      setReviewRating(5);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSaving(false);
    }
  }

  async function handleSubmitQuestion(e) {
    e.preventDefault();
    setQuestionError("");
    if (!firebaseUser) {
      setQuestionError("Sign in to ask a question.");
      return;
    }
    if (!questionText.trim()) return;
    setQuestionSaving(true);
    try {
      const token = await getToken();
      const { question } = await api.postQuestion(token, slug, { question: questionText });
      setQuestions((q) => [question, ...q]);
      setQuestionText("");
    } catch (err) {
      setQuestionError(err.message);
    } finally {
      setQuestionSaving(false);
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-20 text-center text-muted">Loading…</div>;
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-20 text-center">
        <p className="text-red-300 mb-4">{error || "Product not found."}</p>
        <Link href="/" className="text-aurora-cyan hover:underline">Back to shop</Link>
      </div>
    );
  }

  const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round(100 - (Number(product.price) / Number(product.compare_price)) * 100)
    : null;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : Number(product.rating) || 0;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 animate-fade-in">
      <Link href="/" className="text-sm text-muted hover:text-porcelain transition">← Back to shop</Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div className="relative aspect-square bg-porcelain rounded-xl2 overflow-hidden animate-fade-in-up">
          <Image src={product.image_url} alt={product.name} fill sizes="50vw" className="object-cover" />
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-aurora-gradient text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              -{discountPct}% OFF
            </span>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          {product.category_name && (
            <p className="text-xs uppercase tracking-widest text-aurora-cyan mb-2">{product.category_name}</p>
          )}
          <h1 className="font-display text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-1 mt-3 text-sm">
            <Stars value={avgRating} />
            <span className="text-muted ml-1">
              {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="font-display text-3xl font-bold gradient-text">
              ${Number(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-muted line-through">${Number(product.compare_price).toFixed(2)}</span>
                <span className="text-xs font-semibold text-aurora-gold bg-aurora-gradient-soft border border-aurora-violet/30 rounded-full px-2.5 py-1">
                  Save {discountPct}%
                </span>
              </>
            )}
          </div>

          <p className="text-muted mt-5 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-ink-border rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2.5 hover:bg-ink-soft transition"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-4 font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2.5 hover:bg-ink-soft transition"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                addItem(product, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              className="flex-1 btn-gradient text-white font-semibold py-3 rounded-xl"
            >
              {added ? "Added ✓" : "Add to cart"}
            </button>
          </div>

          <p className="text-xs text-muted mt-4">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"} · Free shipping over $50
          </p>
        </div>
      </div>

      {/* Details / Reviews / Q&A tabs */}
      <div className="mt-16">
        <div className="flex gap-2 border-b border-ink-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition ${
                activeTab === tab.id
                  ? "border-aurora-violet text-porcelain"
                  : "border-transparent text-muted hover:text-porcelain"
              }`}
            >
              {tab.label}
              {tab.id === "reviews" && reviews.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({reviews.length})</span>
              )}
              {tab.id === "qna" && questions.length > 0 && (
                <span className="ml-1.5 text-xs text-muted">({questions.length})</span>
              )}
            </button>
          ))}
        </div>

        <div className="py-8 animate-fade-in" key={activeTab}>
          {activeTab === "description" && (
            <div className="max-w-3xl">
              {product.detailed_description ? (
                <p className="text-muted leading-relaxed whitespace-pre-line">{product.detailed_description}</p>
              ) : (
                <p className="text-muted leading-relaxed">{product.description}</p>
              )}
              <dl className="grid grid-cols-2 gap-4 mt-8 text-sm">
                <div className="bg-ink-soft border border-ink-border rounded-xl p-4">
                  <dt className="text-muted text-xs uppercase tracking-wide">Category</dt>
                  <dd className="mt-1 font-medium">{product.category_name || "General"}</dd>
                </div>
                <div className="bg-ink-soft border border-ink-border rounded-xl p-4">
                  <dt className="text-muted text-xs uppercase tracking-wide">Availability</dt>
                  <dd className="mt-1 font-medium">{product.stock > 0 ? "In stock" : "Out of stock"}</dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="max-w-3xl space-y-8">
              <form
                onSubmit={handleSubmitReview}
                className="bg-ink-soft border border-ink-border rounded-xl2 p-6 space-y-4"
              >
                <h3 className="font-display font-semibold">Write a review</h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setReviewRating(n)}
                      className="text-xl leading-none"
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    >
                      <span className={n <= reviewRating ? "text-aurora-gold" : "text-ink-border"}>★</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience with this product…"
                  className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition resize-none text-sm"
                />
                {reviewError && <p className="text-sm text-red-300">{reviewError}</p>}
                <button
                  type="submit"
                  disabled={reviewSaving}
                  className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {reviewSaving ? "Submitting…" : "Submit review"}
                </button>
              </form>

              {reviews.length === 0 ? (
                <p className="text-muted text-sm">No reviews yet — be the first to share your thoughts.</p>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-ink-border pb-5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{r.author_name}</span>
                        <Stars value={r.rating} size="text-xs" />
                      </div>
                      {r.comment && <p className="text-muted text-sm mt-2 leading-relaxed">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "qna" && (
            <div className="max-w-3xl space-y-8">
              <form
                onSubmit={handleSubmitQuestion}
                className="bg-ink-soft border border-ink-border rounded-xl2 p-6 space-y-4"
              >
                <h3 className="font-display font-semibold">Ask a question</h3>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={2}
                  placeholder="What would you like to know about this product?"
                  className="w-full rounded-xl bg-ink border border-ink-border px-4 py-3 focus:border-aurora-violet outline-none transition resize-none text-sm"
                />
                {questionError && <p className="text-sm text-red-300">{questionError}</p>}
                <button
                  type="submit"
                  disabled={questionSaving}
                  className="btn-gradient text-white font-semibold px-6 py-2.5 rounded-xl text-sm disabled:opacity-60"
                >
                  {questionSaving ? "Submitting…" : "Submit question"}
                </button>
              </form>

              {questions.length === 0 ? (
                <p className="text-muted text-sm">No questions yet — ask the first one.</p>
              ) : (
                <ul className="space-y-5">
                  {questions.map((q) => (
                    <li key={q.id} className="border-b border-ink-border pb-5">
                      <p className="text-sm font-medium">
                        <span className="text-aurora-cyan">Q:</span> {q.question}
                      </p>
                      <p className="text-xs text-muted mt-1">Asked by {q.author_name}</p>
                      {q.answer ? (
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                          <span className="text-aurora-gold font-medium">A:</span> {q.answer}
                        </p>
                      ) : (
                        <p className="text-xs text-muted mt-2 italic">Awaiting an answer…</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* More suggestions */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">You may also like</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
