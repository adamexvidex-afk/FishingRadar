import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, User, LogOut, Crown } from 'lucide-react';
import logoImg from '@/assets/fishingradar-logo.png';
import PremiumCrown from '@/components/PremiumCrown';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useProfile } from '@/hooks/useProfile';


const desktopNavItems = [
  { key: 'conditions', path: '/conditions' },
  { key: 'catalog', path: '/catalog' },
  { key: 'baits', path: '/baits' },
  { key: 'catchLog', path: '/catch-log' },
  { key: 'trends', path: '/trends' },
  { key: 'hotspots', path: '/hotspots' },
  { key: 'community', path: '/community' },
  { key: 'assistant', path: '/assistant' },
];

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, signOut, isPremium } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useProfile();


  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50 pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto flex h-14 lg:h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img src={logoImg} alt="FishingRadar" className="h-9 w-9 rounded-xl shadow-sm" />
          <span className="text-lg font-bold text-foreground tracking-tight">
            FishingRadar
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl bg-muted/50 p-1">
          {desktopNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>


          {/* Premium badge */}
          {user && !isPremium && (
            <Link
              to="/premium"
              className="flex h-9 items-center gap-1.5 rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
            >
              <Crown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Premium</span>
            </Link>
          )}
          {user && isPremium && (
            <Link
              to="/premium"
              className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Crown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PRO</span>
            </Link>
          )}

          {/* Profile / Login */}
          {user ? (
            <Link to="/settings" className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-muted-foreground hover:bg-muted transition-colors">
              <Avatar className="h-7 w-7">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Avatar" />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {profile?.username?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="hidden lg:inline max-w-[80px] truncate text-sm font-medium text-foreground">{profile?.username || 'Profile'}</span>
              <PremiumCrown isPremium={(profile as any)?.is_premium} />
            </Link>
          ) : location.pathname !== '/login' ? (
            <Button asChild size="sm" className="h-9 text-sm px-4 rounded-xl">
              <Link to="/login">{t('nav.login')}</Link>
            </Button>
          ) : null}

          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="hidden lg:flex h-9 text-sm text-muted-foreground rounded-xl">
              <LogOut className="mr-1.5 h-4 w-4" />
              {t('nav.logout')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
