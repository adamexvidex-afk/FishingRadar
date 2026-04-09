import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Camera, ImagePlus, Share2, Search, ArrowUpDown, Users, Globe, Lock, ShieldCheck, ShieldAlert, Loader2, MapPin, Navigation } from 'lucide-react';
import LocationMapPicker from '@/components/LocationMapPicker';
import ShareCatchCard from '@/components/ShareCatchCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
// Fish suggestions loaded from DB below


interface VerificationResult {
  is_real_fish: boolean;
  detected_species: string | null;
  species_match: boolean;
  confidence: number;
  estimated_length_inches?: number | null;
  reason: string;
}

interface CatchEntry {
  id: string;
  fish: string;
  length: number;
  weight: number;
  water: string;
  bait: string;
  technique: string;
  catch_date: string;
  notes: string;
  photo_url: string | null;
  is_public: boolean;
  verified: boolean;
  verification_result: VerificationResult | null;
  location_lat?: number | null;
  location_lng?: number | null;
}

// Fish suggestions will be loaded from DB
let fishSuggestions: string[] = [];

const baitSuggestions = [
  'Boilie', 'Spinner', 'Artificial Fly', 'Soft Plastic', 'Crankbait', 'Spoon', 'Jig Head',
  'Streamer', 'Nymph', 'Popper', 'Corn', 'Earthworm', 'Maggot', 'Worm', 'Cheese',
  'Dough', 'Bread', 'Pellet', 'Dead Bait', 'Live Bait Fish', 'Soft Shad',
  'Senko Worm', 'Craw Bait', 'Frog Lure', 'Curly Tail Grub',
  'Mini Trout Crankbait', 'Pilker', 'Lead Fish',
  'Chicken Liver', 'Fish Fillet', 'Wheat', 'Barley', 'Hemp Seed',
  'Grasshopper', 'Ant', 'Snail', 'Flavored Sweet Corn', 'Halibut Pellet',
  'Mini Pellet', 'Protein Ball', 'Flavored Paste',
];

const techniqueSuggestions = [
  'Spinning', 'Fly fishing', 'Float fishing', 'Jigging', 'Feeder fishing',
  'Carp fishing', 'Bottom fishing', 'Trolling', 'Ledgering',
  'Catfish fishing', 'Vertical fishing', 'Drop shot', 'Texas rig',
  'Baitcasting',
];

// Max realistic sizes for common species (inches, pounds)
// Source: IGFA world records + reasonable margins
const fishMaxSizes: Record<string, { maxLengthIn: number; maxWeightLb: number }> = {
  'Bluegill': { maxLengthIn: 16, maxWeightLb: 5 },
  'Largemouth Bass': { maxLengthIn: 38, maxWeightLb: 25 },
  'Smallmouth Bass': { maxLengthIn: 28, maxWeightLb: 12 },
  'Striped Bass': { maxLengthIn: 60, maxWeightLb: 85 },
  'Channel Catfish': { maxLengthIn: 52, maxWeightLb: 60 },
  'Flathead Catfish': { maxLengthIn: 61, maxWeightLb: 130 },
  'Rainbow Trout': { maxLengthIn: 45, maxWeightLb: 50 },
  'Brown Trout': { maxLengthIn: 44, maxWeightLb: 45 },
  'Walleye': { maxLengthIn: 42, maxWeightLb: 25 },
  'Northern Pike': { maxLengthIn: 60, maxWeightLb: 55 },
  'Muskie': { maxLengthIn: 65, maxWeightLb: 70 },
  'Crappie': { maxLengthIn: 21, maxWeightLb: 6 },
  'Yellow Perch': { maxLengthIn: 20, maxWeightLb: 5 },
  'Common Carp': { maxLengthIn: 48, maxWeightLb: 80 },
  'Redfish': { maxLengthIn: 60, maxWeightLb: 95 },
};

// General absolute max for any freshwater fish
const ABSOLUTE_MAX_LENGTH_IN = 120; // 10 feet
const ABSOLUTE_MAX_WEIGHT_LB = 300;

function getSizeWarning(fish: string, lengthIn: number, weightLb: number): string | null {
  const warnings: string[] = [];

  // Check absolute limits
  if (lengthIn > ABSOLUTE_MAX_LENGTH_IN) warnings.push(`${lengthIn} in seems unrealistic`);
  if (weightLb > ABSOLUTE_MAX_WEIGHT_LB) warnings.push(`${weightLb} lb seems unrealistic`);

  // Check species-specific limits
  if (warnings.length === 0) {
    const key = Object.keys(fishMaxSizes).find(k => k.toLowerCase() === fish.toLowerCase());
    if (key) {
      const max = fishMaxSizes[key];
      if (lengthIn > max.maxLengthIn) {
        warnings.push(`World record ${key} is ~${max.maxLengthIn} in, you entered ${lengthIn} in`);
      }
      if (weightLb > max.maxWeightLb) {
        warnings.push(`World record ${key} is ~${max.maxWeightLb} lb, you entered ${weightLb} lb`);
      }
    }
  }

  return warnings.length > 0 ? `${warnings.join('. ')} — are you sure?` : null;
}

const CatchLogPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [catches, setCatches] = useState<CatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fish: '', length: '', weight: '', water: '', bait: '', technique: '', date: '', notes: '', isPublic: false, locationLat: null as number | null, locationLng: null as number | null });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [shareCatch, setShareCatch] = useState<CatchEntry | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const [confirmSave, setConfirmSave] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'fish' | 'length' | 'weight'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Handle prefill from AI detection
  useEffect(() => {
    if (searchParams.get('prefill') === '1') {
      const fish = searchParams.get('fish') || '';
      const prefillImage = sessionStorage.getItem('catch-prefill-image');
      
      setForm(prev => ({ ...prev, fish, date: new Date().toISOString().slice(0, 10) }));
      if (prefillImage) {
        setPhotoPreview(prefillImage);
        // Convert base64 to File for upload
        fetch(prefillImage)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'detected-fish.jpg', { type: 'image/jpeg' });
            setPhotoFile(file);
          });
        sessionStorage.removeItem('catch-prefill-image');
      }
      setShowForm(true);
      // Clean URL
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [authLoading, user, navigate]);

  // Load fish suggestions lazily when form opens
  const [fishLoaded, setFishLoaded] = useState(false);
  useEffect(() => {
    if (!showForm || fishLoaded) return;
    const loadFishNames = async () => {
      const { data } = await supabase.from('fish_species').select('name_en').order('name_en');
      if (data) fishSuggestions = data.map(f => f.name_en);
      setFishLoaded(true);
    };
    loadFishNames();
  }, [showForm, fishLoaded]);

  useEffect(() => {
    if (!user) return;
    const fetchCatches = async () => {
      // Fetch all catches in pages of 1000 to bypass default limit
      const allCatches: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('catches')
          .select('id,fish,length,weight,water,bait,technique,catch_date,notes,photo_url,is_public,verified,verification_result,location_lat,location_lng')
          .eq('user_id', user.id)
          .order('catch_date', { ascending: false })
          .range(from, from + pageSize - 1);
        if (error || !data || data.length === 0) break;
        allCatches.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setCatches(allCatches.map((r: any) => ({
        id: r.id,
        fish: r.fish,
        length: Number(r.length),
        weight: Number(r.weight),
        water: r.water || '',
        bait: r.bait || '',
        technique: r.technique || '',
        catch_date: r.catch_date,
        notes: r.notes || '',
        photo_url: r.photo_url || null,
        is_public: r.is_public ?? false,
        verified: r.verified ?? false,
        verification_result: r.verification_result ?? null,
        location_lat: r.location_lat,
        location_lng: r.location_lng,
      })));
      setLoading(false);
    };
    fetchCatches();
  }, [user]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Photo is too large (max 10 MB)', variant: 'destructive' });
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (catchId: string): Promise<string | null> => {
    if (!photoFile || !user) return null;
    const ext = photoFile.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${catchId}.${ext}`;
    const { error } = await supabase.storage.from('catch-photos').upload(path, photoFile, { upsert: true });
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data } = await supabase.storage.from('catch-photos').createSignedUrl(path, 60 * 60 * 24 * 365);
    return data?.signedUrl || null;
  };

  const handleSave = async () => {
    if (!user) return;

    // --- Client-side validation ---
    const trimmedFish = form.fish.trim();
    if (!trimmedFish) {
      toast({ title: 'Missing info', description: 'Please select a fish species.', variant: 'destructive' });
      return;
    }
    if (trimmedFish.length > 100) {
      toast({ title: 'Invalid', description: 'Fish name is too long.', variant: 'destructive' });
      return;
    }

    const lengthIn = parseFloat(form.length) || 0;
    const weightLb = parseFloat(form.weight) || 0;

    // Block negative values
    if (lengthIn < 0 || weightLb < 0) {
      toast({ title: 'Invalid', description: 'Length and weight cannot be negative.', variant: 'destructive' });
      return;
    }

    // Hard-block impossible sizes (absolute max)
    if (lengthIn > ABSOLUTE_MAX_LENGTH_IN) {
      toast({ title: 'Invalid size', description: `${lengthIn} in exceeds maximum realistic length.`, variant: 'destructive' });
      return;
    }
    if (weightLb > ABSOLUTE_MAX_WEIGHT_LB) {
      toast({ title: 'Invalid size', description: `${weightLb} lb exceeds maximum realistic weight.`, variant: 'destructive' });
      return;
    }

    // Text field length limits
    if (form.water.length > 200 || form.bait.length > 100 || form.technique.length > 100 || form.notes.length > 1000) {
      toast({ title: 'Too long', description: 'One of the text fields exceeds the maximum length.', variant: 'destructive' });
      return;
    }

    // Require photo for public catches
    if (form.isPublic && !photoFile && !photoPreview) {
      toast({ title: 'Photo required', description: 'Public catches need a photo for verification. Add a photo or set the catch as private.', variant: 'destructive' });
      return;
    }

    // Size plausibility check (species-specific world record warning)
    if (!confirmSave) {
      const warning = getSizeWarning(trimmedFish, lengthIn, weightLb);
      if (warning) {
        setSizeWarning(warning);
        return;
      }
    }
    setSizeWarning(null);
    setConfirmSave(false);

    setUploading(true);
    const row: any = {
      user_id: user.id,
      fish: trimmedFish,
      length: Math.round(lengthIn * 2.54 * 100) / 100,
      weight: Math.round(weightLb / 2.205 * 1000) / 1000,
      water: form.water.trim(),
      bait: form.bait.trim(),
      technique: form.technique.trim(),
      catch_date: form.date || new Date().toISOString().slice(0, 10),
      notes: form.notes.trim(),
      is_public: form.isPublic,
      location_lat: form.locationLat,
      location_lng: form.locationLng,
    };
    const { data, error } = await supabase.from('catches').insert(row).select().single();
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    let photo_url: string | null = null;
    if (photoFile) {
      photo_url = await uploadPhoto(data.id);
      if (photo_url) {
        await supabase.from('catches').update({ photo_url }).eq('id', data.id);
      }
    }

    const newCatch: CatchEntry = {
      ...row,
      id: data.id,
      length: Number(row.length),
      weight: Number(row.weight),
      photo_url,
      is_public: row.is_public,
      verified: false,
      verification_result: null,
    };

    setCatches(prev => {
      const updated = [newCatch, ...prev];
      // Check catch milestones (fire-and-forget)
      const total = updated.length;
      const milestones = [10, 25, 50, 100, 250, 500, 1000];
      if (milestones.includes(total)) {
        // Find top species
        const speciesCount: Record<string, number> = {};
        updated.forEach(c => { speciesCount[c.fish] = (speciesCount[c.fish] || 0) + 1; });
        const topSpecies = Object.entries(speciesCount).sort((a, b) => b[1] - a[1])[0]?.[0];
        supabase.functions.invoke('send-transactional-email', {
          body: {
            template: 'catch-milestone',
            props: { milestone: total, totalCatches: total, topSpecies },
          },
        }).catch(() => {});
      }
      return updated;
    });
    setForm({ fish: '', length: '', weight: '', water: '', bait: '', technique: '', date: '', notes: '', isPublic: false, locationLat: null, locationLng: null });
    setPhotoFile(null);
    setPhotoPreview(null);
    setShowForm(false);
    setUploading(false);

    // Trigger AI verification if photo was uploaded
    if (photo_url) {
      verifyCatch(data.id, photo_url, row.fish, lengthIn, weightLb);
    }
  };

  const [verifyingIds, setVerifyingIds] = useState<Set<string>>(new Set());

  const verifyCatch = async (catchId: string, photoUrl: string, claimedSpecies: string, lengthIn?: number, weightLb?: number) => {
    setVerifyingIds(prev => new Set(prev).add(catchId));
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('verify-catch', {
        body: { catch_id: catchId, photo_url: photoUrl, claimed_species: claimedSpecies, claimed_length_in: lengthIn, claimed_weight_lb: weightLb },
      });
      if (fnError) throw fnError;
      setCatches(prev =>
        prev.map(c =>
          c.id === catchId
            ? { ...c, verified: fnData.verified, verification_result: fnData.result }
            : c
        )
      );
      toast({
        title: fnData.verified ? '✅ Catch Verified!' : '⚠️ Verification Failed',
        description: fnData.result?.reason || (fnData.verified ? 'AI confirmed your catch.' : 'Could not verify this catch.'),
        variant: fnData.verified ? 'default' : 'destructive',
      });
    } catch (e) {
      console.error('Verification error:', e);
      toast({ title: 'Verification Error', description: 'Could not verify catch. Try again later.', variant: 'destructive' });
    } finally {
      setVerifyingIds(prev => { const s = new Set(prev); s.delete(catchId); return s; });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('catches').delete().eq('id', id);
    if (!error) setCatches(prev => prev.filter(c => c.id !== id));
  };

  const handleShareToCommunity = async (c: CatchEntry) => {
    if (!user) return;
    const lengthIn = (c.length / 2.54).toFixed(1);
    const weightLb = (c.weight * 2.205).toFixed(1);
    const content = `Caught a ${c.fish}! 🎣\n📏 ${lengthIn} in · ⚖️ ${weightLb} lb${c.water ? `\n📍 ${c.water}` : ''}${c.bait ? `\n🪤 ${c.bait}` : ''}`;

    const { error } = await supabase.from('community_posts').insert({
      user_id: user.id,
      content,
      photo_url: c.photo_url,
      fish_species: c.fish,
      location: c.water || null,
      catch_length: c.length,
      catch_weight: c.weight,
      catch_bait: c.bait || null,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to share to community', variant: 'destructive' });
    } else {
      toast({ title: 'Shared! 🎣', description: 'Your catch has been posted to the community feed.' });
    }
  };

  if (authLoading || loading) return <div className="flex justify-center py-20 text-muted-foreground">{t('common.loading')}</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">{t('catchLog.title')}</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> {t('catchLog.addCatch')}
        </Button>
      </div>


      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 rounded-lg border border-border bg-card p-6 shadow-card">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{t('catchLog.addCatch')}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AutocompleteField
              label={t('catchLog.fish')}
              value={form.fish}
              onChange={(v) => setForm({ ...form, fish: v })}
              suggestions={fishSuggestions}
            />
            <Field label={`${t('catchLog.length')} (in)`} value={form.length} onChange={(v) => setForm({ ...form, length: v })} type="number" />
            <Field label={`${t('catchLog.weight')} (lb)`} value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} type="number" />
            <div className="space-y-2">
              <Field label={t('catchLog.water')} value={form.water} onChange={(v) => setForm({ ...form, water: v })} />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setShowMapPicker(true)}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {form.locationLat ? 'Change location' : 'Pick on map'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={gettingLocation}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      toast({ title: 'Geolocation not supported', variant: 'destructive' });
                      return;
                    }
                    setGettingLocation(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setForm(prev => ({ ...prev, locationLat: pos.coords.latitude, locationLng: pos.coords.longitude }));
                        setGettingLocation(false);
                        toast({ title: 'Location set! 📍' });
                      },
                      (err) => {
                        setGettingLocation(false);
                        toast({ title: 'Could not get location', description: err.message, variant: 'destructive' });
                      },
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  }}
                >
                  {gettingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  Use my location
                </Button>
                {form.locationLat && form.locationLng && (
                  <span className="text-[10px] text-muted-foreground">
                    📍 {form.locationLat.toFixed(4)}, {form.locationLng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
            <AutocompleteField
              label={t('catchLog.bait')}
              value={form.bait}
              onChange={(v) => setForm({ ...form, bait: v })}
              suggestions={baitSuggestions}
            />
            <AutocompleteField
              label={t('catchLog.technique')}
              value={form.technique}
              onChange={(v) => setForm({ ...form, technique: v })}
              suggestions={techniqueSuggestions}
            />
            <Field label={t('catchLog.date')} value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
          </div>

          {/* Photo upload */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              {t('catchLog.photo', 'Catch photo')}
            </label>
            <div className="flex flex-wrap gap-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-1.5 h-4 w-4" />
                {t('catchLog.takePhoto', 'Take photo')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="mr-1.5 h-4 w-4" />
                {t('catchLog.uploadPhoto', 'Choose from gallery')}
              </Button>
            </div>
            {photoPreview && (
              <div className="mt-3 relative inline-block">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-32 w-auto rounded-lg border border-border object-cover"
                />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:opacity-80"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-foreground">{t('catchLog.notes')}</label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>

          {/* Public/Private toggle */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                form.isPublic
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {form.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {form.isPublic ? 'Public – visible on your profile' : 'Private – only you can see'}
            </button>
          </div>

          {/* Size warning */}
          {sizeWarning && (
            <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">{sizeWarning}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => { setConfirmSave(true); setSizeWarning(null); setTimeout(() => handleSave(), 50); }}
                    >
                      Save Anyway
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSizeWarning(null)}
                    >
                      Fix Values
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} disabled={uploading}>
              {uploading ? t('common.loading', 'Loading...') : t('catchLog.save')}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>{t('catchLog.cancel')}</Button>
          </div>
          <LocationMapPicker
            open={showMapPicker}
            onOpenChange={setShowMapPicker}
            onLocationSelect={(lat, lng) => setForm(prev => ({ ...prev, locationLat: lat, locationLng: lng }))}
          />
        </motion.div>
      )}


      {/* Search & Sort */}
      {catches.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by species, bait, water..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {([
              { key: 'date' as const, label: 'Date' },
              { key: 'fish' as const, label: 'A–Z' },
              { key: 'length' as const, label: 'Length' },
              { key: 'weight' as const, label: 'Weight' },
            ]).map(opt => (
              <Button
                key={opt.key}
                variant={sortBy === opt.key ? 'default' : 'outline'}
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => {
                  if (sortBy === opt.key) {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortBy(opt.key);
                    setSortAsc(opt.key === 'fish');
                  }
                }}
              >
                {opt.label}
                {sortBy === opt.key && (
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Catch list */}
      {catches.length === 0 ? (
        <p className="text-center text-muted-foreground">{t('catchLog.noCatches')}</p>
      ) : (() => {
        const q = searchQuery.toLowerCase();
        const filtered = catches.filter(c =>
          !q || c.fish.toLowerCase().includes(q) || c.bait.toLowerCase().includes(q) || c.water.toLowerCase().includes(q) || c.technique.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q)
        );
        const sorted = [...filtered].sort((a, b) => {
          let cmp = 0;
          if (sortBy === 'date') cmp = a.catch_date.localeCompare(b.catch_date);
          else if (sortBy === 'fish') cmp = a.fish.localeCompare(b.fish, 'en');
          else if (sortBy === 'length') cmp = a.length - b.length;
          else if (sortBy === 'weight') cmp = a.weight - b.weight;
          return sortAsc ? cmp : -cmp;
        });
        return sorted.length === 0 ? (
          <p className="text-center text-muted-foreground">No results.</p>
        ) : (
        <div className="space-y-3">
          {sorted.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-start gap-3 sm:items-center sm:gap-6">
                {c.photo_url && (
                  <img
                    src={c.photo_url}
                    alt={c.fish}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover border border-border shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-display text-base font-semibold text-foreground truncate">{c.fish}</h4>
                      {c.verified && (
                        <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400" title={c.verification_result?.reason || 'AI Verified'}>
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                      {!c.verified && c.verification_result && (
                        <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive" title={c.verification_result?.reason || 'Not verified'}>
                          <ShieldAlert className="h-3 w-3" /> Unverified
                        </span>
                      )}
                      {verifyingIds.has(c.id) && (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${c.is_public ? 'text-primary' : 'text-muted-foreground'} hover:text-primary`}
                        title={c.is_public ? 'Public catch – click to make private' : 'Private catch – click to make public'}
                        onClick={async () => {
                          const newVal = !c.is_public;
                          const { error } = await supabase.from('catches').update({ is_public: newVal }).eq('id', c.id);
                          if (!error) {
                            setCatches(prev => prev.map(x => x.id === c.id ? { ...x, is_public: newVal } : x));
                            toast({ title: newVal ? 'Catch is now public 🌍' : 'Catch is now private 🔒' });
                          }
                        }}
                      >
                        {c.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      {c.photo_url && !c.verified && !verifyingIds.has(c.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Verify with AI"
                          onClick={() => verifyCatch(c.id, c.photo_url!, c.fish, c.length / 2.54, c.weight * 2.205)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Share to Community" onClick={() => handleShareToCommunity(c)}>
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setShareCatch(c)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
                    <span>{(c.length / 2.54).toFixed(1)} in · {(c.weight * 2.205).toFixed(1)} lb</span>
                    {c.water && <span>{c.water}</span>}
                    {c.bait && <span className="hidden sm:inline">{c.bait}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{c.catch_date}</span>
                    {c.bait && <span className="sm:hidden">· {c.bait}</span>}
                  </div>
                </div>
              </div>
              {c.notes && <p className="mt-2 text-sm text-muted-foreground">{c.notes}</p>}
            </motion.div>
          ))}
        </div>
        );
      })()}

      <ShareCatchCard
        catchData={shareCatch || { fish: '', length: 0, weight: 0, water: '', bait: '', catch_date: '', photo_url: null }}
        profile={profile}
        open={!!shareCatch}
        onClose={() => setShareCatch(null)}
      />
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
    <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const AutocompleteField = ({
  label,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => { if (filtered.length > 0) setOpen(true); }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s);
                setOpen(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatchLogPage;
