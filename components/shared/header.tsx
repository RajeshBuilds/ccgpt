import { ThemeToggle } from '@/components/theme-toggle';
import { Landmark } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a
              className="font-bold text-primary text-xl hover:text-primary/90 flex items-center gap-2"
              href="/"
            >
              <div className="bg-black dark:bg-white p-2 rounded-lg">
                <Landmark className="h-5 w-5 text-white dark:text-black" />
              </div>
              <span className="font-bold">Citi Wealth</span>
              <span className="font-normal"> | Customer Support</span>
            </a>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
