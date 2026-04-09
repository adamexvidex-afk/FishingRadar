import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const LegalConsentScreen = ({ onAccept }: { onAccept: () => void }) => {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('fr_legal_accepted', '1');
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Shield className="h-7 w-7 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-xl font-bold text-foreground">
            Welcome to FishingRadar
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Before you get started, please review and accept our policies.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card text-left space-y-4">
          <div className="space-y-3">
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/legal"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              Terms of Service
            </a>
          </div>

          <div className="h-px bg-border" />

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground leading-snug">
              I have read and agree to the{' '}
              <span className="font-medium">Privacy Policy</span> and{' '}
              <span className="font-medium">Terms of Service</span>
            </span>
          </label>
        </div>

        <Button
          size="lg"
          disabled={!accepted}
          onClick={handleAccept}
          className="w-full text-base font-semibold h-14 rounded-2xl"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default LegalConsentScreen;
