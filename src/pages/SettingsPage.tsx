import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, User, Trash2, ArrowLeft, ChevronRight, LogOut, Mail, HelpCircle, Shield, FileText, ExternalLink, Crown, CreditCard, Users, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AvatarCropper from '@/components/AvatarCropper';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { moderateUsername } from '@/lib/moderation';
import LanguagePicker from '@/components/LanguagePicker';
import { languages } from '@/i18n';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut, isPremium } = useAuth();
  const { profile, loading, refetch } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [loading, user]);

  const compressImage = (file: File, maxSizeKB = 800): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob && (blob.size / 1024 > maxSizeKB) && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(blob || file);
            }
          }, 'image/jpeg', quality);
        };
        tryCompress();
      };
      img.src = url;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 50 MB', variant: 'destructive' });
      return;
    }
    // Compress if over 2MB
    if (file.size > 2 * 1024 * 1024) {
      const compressed = await compressImage(file);
      setCropSrc(URL.createObjectURL(compressed));
    } else {
      setCropSrc(URL.createObjectURL(file));
    }
  };

  const handleCropped = (blob: Blob) => {
    setCroppedBlob(blob);
    setCroppedPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const handleSaveAvatar = async () => {
    if (!user || !croppedBlob) return;
    setSaving(true);
    const path = `${user.id}/avatar.png`;
    const { error: upErr } = await supabase.storage.from('catch-photos').upload(path, croppedBlob, { upsert: true, contentType: 'image/png' });
    if (upErr) { toast({ title: t('common.error'), description: upErr.message, variant: 'destructive' }); setSaving(false); return; }
    const { data: urlData } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
    const avatar_url = (urlData?.signedUrl || '') + '&t=' + Date.now();
    const { error } = await supabase.from('profiles').upsert({ id: user.id, avatar_url }, { onConflict: 'id' });
    if (error) { toast({ title: t('common.error'), description: error.message, variant: 'destructive' }); setSaving(false); return; }
    toast({ title: t('profile.photoUpdated') });
    await refetch();
    setCroppedBlob(null);
    setCroppedPreview(null);
    setSaving(false);
  };

  const handleSaveName = async () => {
    if (!user) return;
    const trimmed = newUsername.trim();
    if (trimmed.length < 3) { setUsernameError(t('profile.tooShort')); return; }
    if (trimmed.length > 30) { setUsernameError(t('profile.tooLong')); return; }
    if (!/^[a-zA-Z0-9_čšžČŠŽ ]+$/.test(trimmed)) { setUsernameError(t('profile.invalidChars')); return; }
    setSaving(true);
    setUsernameError('');

    // Check for offensive username
    const modResult = await moderateUsername(trimmed);
    if (!modResult.allowed) {
      setUsernameError(modResult.reason || 'This username is not allowed');
      setSaving(false);
      return;
    }

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', trimmed).neq('id', user.id).maybeSingle();
    if (existing) { setUsernameError(t('profile.taken')); setSaving(false); return; }
    const { error } = await supabase.from('profiles').upsert({ id: user.id, username: trimmed }, { onConflict: 'id' });
    if (error) { toast({ title: t('common.error'), description: error.message, variant: 'destructive' }); setSaving(false); return; }
    toast({ title: t('profile.nameUpdated') });
    await refetch();
    setSaving(false);
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: t('profile.profileDeleted') });
      await signOut();
      navigate('/', { replace: true });
    } catch (e: any) {
      toast({ title: t('common.error'), description: e.message || 'Failed to delete account', variant: 'destructive' });
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">{t('common.loading')}</div>;

  const fallbackAvatar = (user?.user_metadata?.avatar_url as string | undefined) || (user?.user_metadata?.picture as string | undefined) || null;
  const fallbackUsername = (user?.user_metadata?.full_name as string | undefined) || (user?.user_metadata?.name as string | undefined) || user?.email?.split('@')[0] || null;
  const displayAvatar = croppedPreview || profile?.avatar_url || fallbackAvatar;
  const displayUsername = profile?.username || fallbackUsername || '—';

  return (
    <div className="min-h-[60vh] px-4 py-6">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">{t('settings.title')}</h1>
        </div>

        {/* Profile Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">{t('settings.profile')}</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <button type="button" onClick={() => fileRef.current?.click()} className="group relative shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                {displayAvatar ? (
                  <AvatarImage src={displayAvatar} alt="Avatar" />
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
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{displayUsername}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email || '—'}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold text-primary hover:underline mt-1"
              >
                {t('profile.changePhoto')}
              </button>
            </div>
          </div>
          {croppedPreview && (
            <Button size="sm" onClick={handleSaveAvatar} disabled={saving} className="mb-4">
              {saving ? t('common.saving') : t('profile.saveNewPhoto')}
            </Button>
          )}

          {/* Profile details card */}
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
              onClick={() => {
                setEditingName(true);
                setNewUsername(profile?.username || fallbackUsername || '');
                setUsernameError('');
              }}
            >
              <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">{t('profile.username')}</span>
              <span className="flex-1 text-sm font-semibold text-foreground truncate">{displayUsername}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
            </button>
            <div className="flex items-center px-5 py-4">
              <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">E-mail</span>
              <span className="flex-1 text-sm text-foreground truncate">{user?.email || '—'}</span>
            </div>
          </div>
        </section>

        {/* Language Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            {t('settings.language', 'Language')}
          </h2>
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLanguagePicker(true)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Globe className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t('settings.chooseLanguage', 'Choose Language')}</p>
                  <p className="text-xs text-muted-foreground">
                    {languages.find(l => l.code === i18n.language)?.flag} {languages.find(l => l.code === i18n.language)?.name || 'English'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </section>

        {/* Subscription Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">{t('settings.subscription')}</h2>
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
            <button
              type="button"
              onClick={() => navigate('/premium')}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Crown className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-foreground">{isPremium ? t('settings.premiumActive') : t('settings.upgradePremium')}</p>
                   <p className="text-xs text-muted-foreground">{isPremium ? t('settings.premiumActiveDesc') : t('settings.upgradePremiumDesc')}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </section>

        {/* Help & Support Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">{t('settings.helpSupport')}</h2>
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
            <a
              href="mailto:fishing-radar-help@utiliora.com"
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t('settings.contactSupport')}</p>
                  <p className="text-xs text-muted-foreground">fishing-radar-help@utiliora.com</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </a>
            <a
              href="mailto:fishing-radar-help@utiliora.com?subject=Bug%20Report"
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm/10">
                  <HelpCircle className="h-4.5 w-4.5 text-warm" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-foreground">{t('settings.reportBug')}</p>
                   <p className="text-xs text-muted-foreground">{t('settings.reportBugDesc')}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </a>
            <a
              href="mailto:fishing-radar-help@utiliora.com?subject=Feature%20Request"
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nature/10">
                  <FileText className="h-4.5 w-4.5 text-nature" />
                </div>
                <div>
                   <p className="text-sm font-semibold text-foreground">{t('settings.featureRequest')}</p>
                   <p className="text-xs text-muted-foreground">{t('settings.featureRequestDesc')}</p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            </a>
          </div>
        </section>

        {/* Legal Section */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">{t('settings.legal')}</h2>
          <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Shield className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">{t('settings.privacyPolicy')}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/legal')}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">{t('settings.legalInfo')}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/community-guidelines')}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Users className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">{t('settings.communityGuidelines')}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        </section>


        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            await signOut();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t('profile.signOut', 'Sign Out')}
        </Button>


        {/* Delete account */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="w-full text-center text-xs text-muted-foreground/60 hover:text-destructive transition-colors py-1">
               {t('settings.deleteAccount')}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>{t('settings.deleteAccountTitle')}</AlertDialogTitle>
               <AlertDialogDescription>
                 {t('settings.deleteAccountDesc')}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
               <AlertDialogAction
                 onClick={handleDelete}
                 disabled={deleting}
                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               >
                 {deleting ? t('profile.deleting') : t('settings.deleteEverything')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-center text-xs text-muted-foreground pb-4">{t('app.version')}</p>
      </div>

      {/* Edit username dialog */}
      <Dialog open={editingName} onOpenChange={(v) => { if (!v) setEditingName(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('profile.changeName')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              value={newUsername}
              onChange={(e) => { setNewUsername(e.target.value); setUsernameError(''); }}
              maxLength={30}
              placeholder={t('profile.placeholder')}
              autoFocus
            />
            {usernameError && <p className="text-sm text-destructive">{usernameError}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingName(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveName} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language picker dialog */}
      <Dialog open={showLanguagePicker} onOpenChange={(v) => { if (!v) setShowLanguagePicker(false); }}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('settings.chooseLanguage', 'Choose Language')}</DialogTitle>
          </DialogHeader>
          <LanguagePicker onSelect={() => setShowLanguagePicker(false)} />
        </DialogContent>
      </Dialog>

      {/* Cropper dialog */}
      {cropSrc && (
        <AvatarCropper imageSrc={cropSrc} open={!!cropSrc} onClose={() => setCropSrc(null)} onCrop={handleCropped} />
      )}
    </div>
  );
};

export default SettingsPage;
