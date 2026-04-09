import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, MapPin, BookOpen, Bot, Users } from 'lucide-react';

const tabs = [
  { key: 'conditions', path: '/conditions', icon: Activity },
  { key: 'hotspots', path: '/hotspots', icon: MapPin },
  { key: 'assistant', path: '/assistant', icon: Bot },
  { key: 'community', path: '/community', icon: Users },
  { key: 'catchLog', path: '/catch-log', icon: BookOpen },
];

const BottomTabBar = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.path.includes('?') ? false : location.pathname === tab.path;
          const isCenter = tab.key === 'assistant';

          if (isCenter) {
            return (
              <Link
                key={tab.key}
                to={tab.path}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className={`flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground scale-105 shadow-primary/30'
                    : 'bg-primary text-primary-foreground shadow-primary/20'
                }`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-primary">
                  {t(`nav.${tab.key}`)}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.key}
              to={tab.path}
              className="flex flex-col items-center justify-center py-1.5 px-3 min-w-[60px] transition-all duration-200"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                active ? 'bg-primary/10' : ''
              }`}>
                <Icon className={`h-5 w-5 transition-all duration-200 ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`mt-0.5 text-[10px] transition-colors duration-200 ${
                active ? 'font-bold text-primary' : 'font-medium text-muted-foreground'
              }`}>
                {t(`nav.${tab.key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
