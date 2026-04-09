import { supabase } from '@/integrations/supabase/client';

// Fast client-side blocklist for obvious profanity (catches ~95% without API call)
const BLOCKED_WORDS = [
  // English
  'fuck', 'shit', 'ass', 'asshole', 'bitch', 'bastard', 'damn', 'dick', 'cock',
  'pussy', 'cunt', 'whore', 'slut', 'fag', 'faggot', 'nigger', 'nigga', 'retard',
  'retarded', 'tranny', 'kike', 'spic', 'chink', 'wetback', 'cracker',
  'motherfucker', 'twat', 'wanker', 'bollocks', 'prick', 'douche', 'douchebag',
  // Slovenian
  'pizda', 'kurac', 'jebem', 'jebi', 'fukni', 'sranje', 'kurba', 'pizdun',
  'pička', 'prasec', 'govnoriz', 'drek', 'mrš', 'kurčina',
  // German
  'scheiße', 'scheisse', 'arschloch', 'hurensohn', 'wichser', 'fotze', 'schwuchtel',
  // Croatian
  'jebiga', 'majku', 'pičku', 'materinu', 'kurcina',
  // Spanish
  'puta', 'mierda', 'coño', 'maricón', 'pendejo', 'cabron', 'verga',
];

// Build regex patterns for leet-speak substitutions
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i|l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's',
};

function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  // Replace leet speak
  for (const [leet, letter] of Object.entries(LEET_MAP)) {
    normalized = normalized.replace(new RegExp(`\\${leet}`, 'g'), letter.split('|')[0]);
  }
  // Remove repeated characters (e.g., "fuuuck" → "fuck")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  // Remove common separators used to bypass filters
  normalized = normalized.replace(/[_\-.*+~!#%^&()=\[\]{}|\\/<>,;:'"` ]/g, '');
  return normalized;
}

/**
 * Fast client-side check against blocklist.
 * Returns the blocked word if found, null if clean.
 */
export function quickProfanityCheck(text: string): string | null {
  const normalized = normalizeText(text);
  for (const word of BLOCKED_WORDS) {
    if (normalized.includes(word)) {
      return word;
    }
  }
  return null;
}

/**
 * Full moderation via AI (server-side).
 * Use for chat messages and content that passes the quick check.
 */
export async function moderateContent(text: string): Promise<{ allowed: boolean; reason: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: { content: text },
    });
    if (error) throw error;
    return { allowed: data?.allowed !== false, reason: data?.reason || '' };
  } catch (e) {
    console.error('Moderation check failed:', e);
    // Fail open but log
    return { allowed: true, reason: '' };
  }
}

/**
 * Moderate a username: quick blocklist + AI check.
 */
export async function moderateUsername(username: string): Promise<{ allowed: boolean; reason: string }> {
  // Quick local check first
  const blocked = quickProfanityCheck(username);
  if (blocked) {
    return { allowed: false, reason: 'Username contains inappropriate language' };
  }

  // AI check for subtler offensive content
  const result = await moderateContent(username);
  if (!result.allowed) {
    return { allowed: false, reason: 'Username is not allowed' };
  }

  return { allowed: true, reason: '' };
}

/**
 * Moderate a chat message: quick blocklist + AI check.
 */
export async function moderateMessage(message: string): Promise<{ allowed: boolean; reason: string }> {
  if (!message.trim()) return { allowed: true, reason: '' };

  const blocked = quickProfanityCheck(message);
  if (blocked) {
    return { allowed: false, reason: 'Message contains inappropriate language' };
  }

  return moderateContent(message);
}
