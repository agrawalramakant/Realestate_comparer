import Link from 'next/link';
import { Home } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Home className="h-5 w-5 text-primary" />
            <span>Real Estate Analyzer</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
