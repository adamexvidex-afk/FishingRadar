import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Fish, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password.length < 8) {
      toast.error(t('login.passwordMin'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t('resetPassword.success'));
        navigate('/', { replace: true });
      }
    } catch {
      toast.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-muted-foreground">{t('resetPassword.invalid')}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Fish className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-foreground">{t('resetPassword.title')}</h1>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
          <div className="space-y-2 text-left">
            <Label htmlFor="new-password">{t('resetPassword.newPassword')}</Label>
            <div className="relative">
              <Input
                id="new-password" type={showPassword ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full" size="lg" disabled={loading} onClick={handleReset}>
            {loading ? '...' : t('resetPassword.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
