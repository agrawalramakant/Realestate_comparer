import Link from 'next/link';
import { Home } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-5 w-5" />
            <span>Real Estate Analyzer</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/properties/new"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              + New Property
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
