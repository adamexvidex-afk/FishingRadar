import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BaitInfo {
  id: string;
}

export function useBaitIllustrations(baitList: BaitInfo[]) {
  const [illustrations, setIllustrations] = useState<Record<string, string>>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || baitList.length === 0) return;
    loadedRef.current = true;

    const loadExisting = async () => {
      const { data: files } = await supabase.storage
        .from('bait-illustrations')
        .list('', { limit: 500 });

      let allFiles = files || [];
      if (allFiles.length === 500) {
        const { data: more } = await supabase.storage
          .from('bait-illustrations')
          .list('', { limit: 500, offset: 500 });
        if (more) allFiles = [...allFiles, ...more];
      }

      const existingFiles = new Set(allFiles.map((f) => f.name.replace('.png', '')));

      const found: Record<string, string> = {};
      for (const bait of baitList) {
        if (existingFiles.has(bait.id)) {
          const { data } = supabase.storage
            .from('bait-illustrations')
            .getPublicUrl(`${bait.id}.png`);
          found[bait.id] = data.publicUrl;
        }
      }
      setIllustrations(found);
    };
    loadExisting();
  }, [baitList]);

  return { illustrations };
}
