import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Fish, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AvatarCropper from '@/components/AvatarCropper';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { moderateUsername } from '@/lib/moderation';

const ProfileSetupPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('profile.imageTooLarge'), description: t('profile.imageTooLargeDesc'), variant: 'destructive' });
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropped = (blob: Blob) => {
    setCroppedBlob(blob);
    setCroppedPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const handleSave = async () => {
    if (!user) return;
    const trimmed = username.trim();
    if (trimmed.length < 3) { setUsernameError(t('profile.tooShort')); return; }
    if (trimmed.length > 30) { setUsernameError(t('profile.tooLong')); return; }
    if (!/^[a-zA-Z0-9_čšžČŠŽ ]+$/.test(trimmed)) { setUsernameError(t('profile.invalidChars')); return; }

    setSaving(true);
    setUsernameError('');

    const modResult = await moderateUsername(trimmed);
    if (!modResult.allowed) {
      setUsernameError(modResult.reason || 'This username is not allowed');
      setSaving(false);
      return;
    }

    const { data: existing } = await supabase.from('profiles').select('id').eq('username', trimmed).neq('id', user.id).maybeSingle();
    if (existing) { setUsernameError(t('profile.taken')); setSaving(false); return; }

    let avatar_url: string | null = null;
    if (croppedBlob) {
      const path = `${user.id}/avatar.png`;
      const { error: upErr } = await supabase.storage.from('catch-photos').upload(path, croppedBlob, { upsert: true, contentType: 'image/png' });
      if (!upErr) {
        const { data: urlData } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
        avatar_url = urlData?.signedUrl || '';
      }
    }

    const payload: { id: string; username: string; avatar_url?: string } = { id: user.id, username: trimmed };
    if (avatar_url) payload.avatar_url = avatar_url;

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) { toast({ title: t('common.error'), description: error.message, variant: 'destructive' }); setSaving(false); return; }

    toast({ title: t('profile.profileSaved') });

    supabase.functions.invoke('send-transactional-email', {
      body: { template: 'welcome' },
    }).catch(() => {});

    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Fish className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-foreground">{t('profile.setupTitle')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('profile.setupDesc')}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
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

          <div className="space-y-2">
            <Label htmlFor="username">{t('profile.username')}</Label>
            <Input id="username" placeholder={t('profile.placeholder')} value={username} onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }} maxLength={30} />
            {usernameError && <p className="text-sm text-destructive">{usernameError}</p>}
          </div>

          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : t('profile.saveProfile')}
          </Button>
        </div>
      </div>

      {cropSrc && (
        <AvatarCropper imageSrc={cropSrc} open={!!cropSrc} onClose={() => setCropSrc(null)} onCrop={handleCropped} />
      )}
    </div>
  );
};

export default ProfileSetupPage;
