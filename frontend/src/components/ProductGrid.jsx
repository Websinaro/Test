import ProductCard from "@/components/ProductCard";

export default function ProductGrid({ products, emptyMessage = "No products found." }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-muted py-20 border border-dashed border-ink-border rounded-xl2">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr items-stretch">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-card-in h-full"
          style={{ animationDelay: `${Math.min(i, 11) * 45}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
