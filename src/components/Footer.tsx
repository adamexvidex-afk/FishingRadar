import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ExternalLink, Fish } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Fish className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-foreground tracking-tight">FishingRadar</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('app.tagline')}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footer.dataSources')}
            </p>
            <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              Open-Meteo (Global) <ExternalLink className="h-3 w-3" />
            </a>
            <br />
            <a href="https://waterservices.usgs.gov" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1.5">
              USGS Water Services (US) <ExternalLink className="h-3 w-3" />
            </a>
            <br />
            <a href="https://www.weather.gov" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1.5">
              weather.gov (US) <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footer.permits')}
            </p>
            <a href="https://www.takemefishing.org/fishing/fishing-license/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              TakeMeFishing.org <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-2">
            <Link to="/legal" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.legal')}
            </Link>
            <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.gdpr')}
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FishingRadar. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;