import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, BookOpen, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Diary' },
  { path: '/add-food', icon: Search, label: 'Add' },
  { path: '/recipes', icon: BookOpen, label: 'Recipes' },
  { path: '/progress', icon: TrendingUp, label: 'Progress' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}