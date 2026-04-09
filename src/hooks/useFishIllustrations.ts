import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

function sanitizeId(id: string): string {
  return id
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function useFishIllustrations(fishIds: string[]) {
  const [illustrations, setIllustrations] = useState<Record<string, string>>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || fishIds.length === 0) return;
    loadedRef.current = true;

    const loadExisting = async () => {
      const { data: files } = await supabase.storage
        .from('fish-illustrations')
        .list('', { limit: 500 });

      const existingFiles = new Set(
        (files || []).map((f) => f.name.replace('.png', ''))
      );

      const found: Record<string, string> = {};
      for (const id of fishIds) {
        const safeId = sanitizeId(id);
        if (existingFiles.has(safeId)) {
          const { data } = supabase.storage
            .from('fish-illustrations')
            .getPublicUrl(`${safeId}.png`);
          found[id] = data.publicUrl;
        }
      }
      setIllustrations(found);
    };
    loadExisting();
  }, [fishIds]);

  return { illustrations };
}
