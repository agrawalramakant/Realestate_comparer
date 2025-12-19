import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Link
          href="/properties/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Property
        </Link>
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
        <p className="text-muted-foreground mb-4">
          Start by adding your first property to analyze
        </p>
        <Link
          href="/properties/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Add First Property
        </Link>
      </div>
    </div>
  );
}
