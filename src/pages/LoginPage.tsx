import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Eye, EyeOff, Camera, User, Mail } from 'lucide-react';
import logoImg from '@/assets/fishingradar-logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AvatarCropper from '@/components/AvatarCropper';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { moderateUsername } from '@/lib/moderation';

const LoginPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'check-email'>('login');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Signup profile fields
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const checkProfile = async () => {
      // Check for pending profile from signup
      const pending = localStorage.getItem('fr_pending_profile');
      if (pending) {
        try {
          const { username: pendingUsername, avatarBase64 } = JSON.parse(pending);
          if (pendingUsername) {
            const payload: { id: string; username: string; avatar_url?: string } = { id: user.id, username: pendingUsername };

            // Upload avatar if stored
            if (avatarBase64) {
              const blob = await fetch(avatarBase64).then(r => r.blob());
              const path = `${user.id}/avatar.png`;
              const { error: upErr } = await supabase.storage.from('catch-photos').upload(path, blob, { upsert: true, contentType: 'image/png' });
              if (!upErr) {
                const { data: urlData } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
                if (urlData?.signedUrl) payload.avatar_url = urlData.signedUrl;
              }
            }

            await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
            supabase.functions.invoke('send-transactional-email', { body: { template: 'welcome' } }).catch(() => {});
          }
        } catch { /* ignore parse errors */ }
        localStorage.removeItem('fr_pending_profile');
        navigate('/', { replace: true });
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (!data?.username) {
        navigate('/profile-setup', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    };
    checkProfile();
  }, [user, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.imageTooLarge'));
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropped = (blob: Blob) => {
    setCroppedBlob(blob);
    setCroppedPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const handleEmailLogin = async () => {
    if (!emailOrUsername || !password) return;
    setLoading(true);
    try {
      let loginEmail = emailOrUsername;
      // If it doesn't look like an email, look up by username
      if (!emailOrUsername.includes('@')) {
        const { data, error } = await supabase.rpc('get_email_by_username', { _username: emailOrUsername });
        if (error || !data) {
          toast.error(t('login.userNotFound'));
          setLoading(false);
          return;
        }
        loginEmail = data as string;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) {
        toast.error(error.message);
      }
    } catch {
      toast.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupStep1 = () => {
    if (!email || !password) return;
    if (password.length < 8) {
      toast.error(t('login.passwordMin'));
      return;
    }
    setSignupStep(2);
  };

  const handleSignupComplete = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 3) { setUsernameError(t('profile.tooShort')); return; }
    if (trimmed.length > 30) { setUsernameError(t('profile.tooLong')); return; }
    if (!/^[a-zA-Z0-9_čšžČŠŽ ]+$/.test(trimmed)) { setUsernameError(t('profile.invalidChars')); return; }

    setLoading(true);
    setUsernameError('');

    const modResult = await moderateUsername(trimmed);
    if (!modResult.allowed) {
      setUsernameError(modResult.reason || 'This username is not allowed');
      setLoading(false);
      return;
    }

    // Check username uniqueness
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', trimmed).maybeSingle();
    if (existing) { setUsernameError(t('profile.taken')); setLoading(false); return; }

    try {
      // Use the published web URL for redirect — Capacitor App Links / Universal Links
      const redirectUrl = 'https://fishingradar.lovable.app/verified';
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Supabase returns a user with empty identities when email is already taken
      if (signUpData.user && signUpData.user.identities?.length === 0) {
        toast.error(t('login.emailTaken'));
        setLoading(false);
        return;
      }

      // Store pending profile for after email verification
      const pendingData: { username: string; avatarBase64?: string } = { username: trimmed };
      if (croppedBlob) {
        const reader = new FileReader();
        reader.onloadend = () => {
          pendingData.avatarBase64 = reader.result as string;
          localStorage.setItem('fr_pending_profile', JSON.stringify(pendingData));
        };
        reader.readAsDataURL(croppedBlob);
      } else {
        localStorage.setItem('fr_pending_profile', JSON.stringify(pendingData));
      }

      setMode('check-email');
    } catch {
      toast.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error(t('login.enterEmail'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://fishingradar.lovable.app/reset-password',
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t('login.resetSent'));
        setMode('login');
      }
    } catch {
      toast.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <img src={logoImg} alt="FishingRadar" className="mx-auto h-16 w-16 rounded-2xl" />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">
            {mode === 'signup' ? t('login.createFRAccount') : t('nav.login')}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === 'signup' ? t('login.createFRAccountDesc') : t('login.signInDesc')}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-3">
          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div className="space-y-2 text-left">
                <Label htmlFor="login-id">{t('login.emailOrUsername')}</Label>
                <Input
                  id="login-id" type="text" value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  placeholder={t('login.emailOrUsernamePlaceholder')}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">{t('login.password')}</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={loading} onClick={handleEmailLogin}>
                {loading ? '...' : t('login.signInFR')}
              </Button>

              <button onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                {t('login.forgotPassword')}
              </button>

              <div className="text-sm text-muted-foreground">
                {t('login.noAccount')}{' '}
                <button onClick={() => { setMode('signup'); setSignupStep(1); }} className="text-primary hover:underline font-medium">
                  {t('login.createFRAccount')}
                </button>
              </div>
            </>
          )}

          {/* ── SIGNUP STEP 1: Email + Password ── */}
          {mode === 'signup' && signupStep === 1 && (
            <>
              <div className="space-y-2 text-left">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoComplete="email"
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="signup-password">{t('login.password')}</Label>
                <div className="relative">
                  <Input
                    id="signup-password" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="new-password"
                    onKeyDown={e => e.key === 'Enter' && handleSignupStep1()}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{t('login.passwordMin')}</p>
              </div>

              <Button className="w-full" size="lg" onClick={handleSignupStep1}>
                {t('login.continue')}
              </Button>

              <div className="text-sm text-muted-foreground">
                {t('login.hasAccount')}{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                  {t('login.signInFR')}
                </button>
              </div>
            </>
          )}

          {/* ── SIGNUP STEP 2: Username + Avatar ── */}
          {mode === 'signup' && signupStep === 2 && (
            <>
              <div className="flex flex-col items-center gap-3">
                <button type="button" onClick={() => fileRef.current?.click()} className="group relative">
                  <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                    {croppedPreview ? (
                      <AvatarImage src={croppedPreview} alt="Avatar" />
                    ) : (
                      <AvatarFallback className="bg-muted">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <span className="text-xs text-muted-foreground">{t('profile.selectPhoto')}</span>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="username">{t('profile.username')}</Label>
                <Input
                  id="username" placeholder={t('profile.placeholder')}
                  value={username} onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
                  maxLength={30}
                />
                {usernameError && <p className="text-sm text-destructive">{usernameError}</p>}
              </div>

              <Button className="w-full" size="lg" disabled={loading} onClick={handleSignupComplete}>
                {loading ? '...' : t('login.createAccount')}
              </Button>

              <button onClick={() => setSignupStep(1)} className="text-xs text-muted-foreground hover:underline">
                ← {t('login.back')}
              </button>
            </>
          )}

          {/* ── CHECK EMAIL ── */}
          {mode === 'check-email' && (
            <>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-4 ring-primary/10">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <h2 className="font-display text-xl font-extrabold text-foreground">{t('login.verifyTitle')}</h2>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 w-full">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 text-center">
                    ⚠️ {t('login.verifyDesc', { email })}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {t('login.checkSpam')}
                </p>
              </div>
              <Button className="w-full" variant="outline" onClick={() => { setMode('login'); setSignupStep(1); }}>
                {t('login.backToLogin')}
              </Button>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <p className="text-sm text-muted-foreground">{t('login.forgotDesc')}</p>
              <div className="space-y-2 text-left">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button className="w-full" size="lg" disabled={loading} onClick={handleForgotPassword}>
                {loading ? '...' : t('login.sendReset')}
              </Button>
              <button onClick={() => setMode('login')} className="text-xs text-muted-foreground hover:underline">
                ← {t('login.back')}
              </button>
            </>
          )}
        </div>
      </div>

      {cropSrc && (
        <AvatarCropper imageSrc={cropSrc} open={!!cropSrc} onClose={() => setCropSrc(null)} onCrop={handleCropped} />
      )}
    </div>
  );
};

export default LoginPage;
