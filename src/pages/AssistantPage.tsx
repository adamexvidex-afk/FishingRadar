import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Loader2, Fish, Trash2, LogOut, History, Plus, ChevronLeft, Search, CheckCircle2, Crown, ImagePlus, BookPlus, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useArsoData } from '@/hooks/useArsoData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type Msg = { role: 'user' | 'assistant'; content: string; imageUrl?: string };
type Conversation = { id: string; title: string; created_at: string; updated_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fishing-assistant`;

const SUGGESTIONS = [
  'What are the best lures for largemouth bass in summer?',
  'How to fly fish for trout in mountain streams?',
  'When is the best time to catch walleye?',
  'What gear do I need for catfish fishing?',
  'Recommend baits based on current conditions',
];

async function streamChat({
  messages,
  conditions,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  conditions?: any;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  // Get user's session token for auth
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ messages, conditions }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Napaka pri povezavi z asistentom');
    return;
  }

  if (!resp.body) {
    onError('No response body');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') { done = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (let raw of buffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const AssistantPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isPremium, subscriptionLoading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [conversationEnded, setConversationEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = SUGGESTIONS;
  const { data: arsoData } = useArsoData();

  // Auto-open camera/file picker when ?detect=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('detect') === '1' && imageInputRef.current) {
      setTimeout(() => imageInputRef.current?.click(), 400);
      // Clean up URL
      window.history.replaceState({}, '', '/assistant');
    }
  }, []);

  // Prefill from navigation state (e.g. "How to catch" from catalog)
  const prefillHandled = useRef(false);
  const pendingPrefill = useRef<string | null>(null);
  useEffect(() => {
    const prefill = (location.state as any)?.prefill;
    if (prefill && !prefillHandled.current) {
      prefillHandled.current = true;
      window.history.replaceState({}, '', '/assistant');
      pendingPrefill.current = prefill;
    }
  }, [location.state]);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('assistant_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load a specific conversation
  const loadConversation = async (convId: string) => {
    const { data } = await supabase
      .from('assistant_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data as Msg[]);
      setCurrentConversationId(convId);
      setShowHistory(false);
    }
  };

  // Auto-save conversation (called after each assistant response)
  const autoSave = useCallback(async (msgs: Msg[], convId: string | null) => {
    if (!user || msgs.length < 2) return convId;

    const firstUserMsg = msgs.find(m => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '')
      : 'New conversation';

    try {
      if (convId) {
        await supabase.from('assistant_messages').delete().eq('conversation_id', convId);
        await supabase.from('assistant_messages').insert(
          msgs.map(m => ({ conversation_id: convId, role: m.role, content: m.content }))
        );
        await supabase.from('assistant_conversations').update({ title, updated_at: new Date().toISOString() }).eq('id', convId);
        return convId;
      } else {
        const { data: conv, error } = await supabase
          .from('assistant_conversations')
          .insert({ user_id: user.id, title })
          .select('id')
          .single();
        if (error || !conv) throw error;
        await supabase.from('assistant_messages').insert(
          msgs.map(m => ({ conversation_id: conv.id, role: m.role, content: m.content }))
        );
        loadConversations();
        return conv.id;
      }
    } catch {
      console.error('Auto-save failed');
      return convId;
    }
  }, [user, loadConversations]);

  // Delete a conversation
  const deleteConversation = async (convId: string) => {
    await supabase.from('assistant_conversations').delete().eq('id', convId);
    if (currentConversationId === convId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    loadConversations();
    toast.success('Conversation deleted');
  };

  // New conversation
  const newConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setShowHistory(false);
    setConversationEnded(false);
  };

  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    const hasImage = !!pendingImage;
    if (!trimmed && !hasImage) return;
    if (isLoading) return;

    const userMsg: Msg = {
      role: 'user',
      content: trimmed || (hasImage ? 'What fish is this?' : ''),
      imageUrl: pendingImage || undefined,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setPendingImage(null);
    setIsLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const conditions = arsoData ? {
        waterTemp: arsoData.waterTemp,
        airTemp: arsoData.airTemp,
        flow: arsoData.flow,
        waterLevel: arsoData.waterLevel,
        pressure: arsoData.pressure,
        humidity: arsoData.humidity,
        moonPhase: arsoData.moonPhase,
        moonIllumination: arsoData.moonIllumination,
        hydroStation: arsoData.hydroStation,
      } : undefined;

      await streamChat({
        messages: newMessages,
        conditions,
        onDelta: upsert,
        onDone: async () => {
          setIsLoading(false);
          if (user) {
            setMessages(prev => {
              autoSave(prev, currentConversationId).then(newId => {
                if (newId && newId !== currentConversationId) {
                  setCurrentConversationId(newId);
                }
                loadConversations();
              });
              return prev;
            });
          }
        },
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error('Connection error');
      setIsLoading(false);
    }
  };

  // Auto-send prefilled question (e.g. "How to catch" from catalog)
  useEffect(() => {
    if (pendingPrefill.current) {
      const q = pendingPrefill.current;
      pendingPrefill.current = null;
      send(q);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // Premium gate
  if (!subscriptionLoading && !isPremium) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="rounded-2xl bg-primary/10 p-4">
          <Bot className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold">CastMate AI is Premium</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Upgrade to Premium to get unlimited access to CastMate AI, your personal fishing guide.
          </p>
        </div>
        <Button onClick={() => navigate('/premium')} className="gap-2">
          <Crown className="h-4 w-4" />
          View Premium Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {showHistory ? (
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="p-1">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-foreground">
              {showHistory ? 'Saved conversations' : 'Fishing Assistant'}
            </h1>
            {!showHistory && (
              <p className="text-xs text-muted-foreground">
                Ask me anything about fishing
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!showHistory && user && (
            <>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={newConversation}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowHistory(!showHistory); loadConversations(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </>
          )}
        </div>
      </div>

      {showHistory ? (
        /* History panel */
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {(() => {
            const q = historySearch.toLowerCase();
            const filtered = q ? conversations.filter(c => c.title.toLowerCase().includes(q)) : conversations;
            if (filtered.length === 0) return (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <History className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {q ? 'No conversations found' : 'No saved conversations'}
                </p>
              </div>
            );
            return filtered.map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-muted'
                }`}
                onClick={() => loadConversation(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.updated_at).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive p-1"
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ));
          })()}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Fish className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">
                    Hello, angler! 🎣
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    I'm your AI fishing assistant. Ask me about baits, techniques, fish species, gear, or anything related to fishing.
                  </p>
                </div>
                {/* Detect fish species CTA */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 w-full max-w-md rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-left hover:bg-primary/10 hover:border-primary/60 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <ImagePlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">🔍 Identify Fish Species</p>
                    <p className="text-xs text-muted-foreground">Upload a photo and AI will identify the fish</p>
                  </div>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="text-left text-xs rounded-xl border border-border bg-card px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => {
                // Check if this assistant message follows a user message with an image (fish detection)
                const isDetectionResult = msg.role === 'assistant' && i > 0 && messages[i - 1]?.role === 'user' && messages[i - 1]?.imageUrl;
                
                // Try to extract species name from the assistant's response
                const extractSpecies = (content: string): string => {
                  // Look for common patterns like "This is a **Rainbow Trout**" or "Species: Rainbow Trout"
                  const patterns = [
                    /\*\*([A-Z][a-z]+(?:\s[A-Z]?[a-z]+)*)\*\*/,
                    /species[:\s]+([A-Z][a-z]+(?:\s[A-Z]?[a-z]+)*)/i,
                    /(?:this (?:is|looks like|appears to be) (?:a|an)\s+)([A-Z][a-z]+(?:\s[A-Z]?[a-z]+)*)/i,
                    /(?:identified as\s+(?:a|an)?\s*)([A-Z][a-z]+(?:\s[A-Z]?[a-z]+)*)/i,
                  ];
                  for (const p of patterns) {
                    const m = content.match(p);
                    if (m?.[1] && m[1].length > 2 && m[1].length < 40) return m[1];
                  }
                  return '';
                };

                return (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Uploaded fish" className="rounded-lg max-w-full max-h-48 mb-2" />
                          )}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </>
                      )}
                    </div>
                    {isDetectionResult && !isLoading && msg.content.length > 20 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="self-start gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          const species = extractSpecies(msg.content);
                          const imageUrl = messages[i - 1]?.imageUrl || '';
                          // Store image in sessionStorage for transfer
                          if (imageUrl) sessionStorage.setItem('catch-prefill-image', imageUrl);
                          navigate(`/catch-log?prefill=1&fish=${encodeURIComponent(species)}`);
                        }}
                      >
                        <BookPlus className="h-4 w-4" />
                        Add to Log
                      </Button>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary mt-0.5">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                );
              })
            )}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {messages.length > 0 && !isLoading && !conversationEnded && (
              <div className="flex justify-center pt-2 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConversationEnded(true);
                  }}
                  className="text-muted-foreground hover:text-destructive hover:border-destructive"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  End conversation
                </Button>
              </div>
            )}
            {conversationEnded && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Conversation has been saved
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={newConversation}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New conversation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowHistory(true); setConversationEnded(false); loadConversations(); }}
                  >
                    <History className="h-4 w-4 mr-1" />
                    Conversation history
                  </Button>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            {pendingImage && (
              <div className="mb-2 relative inline-block">
                <img src={pendingImage} alt="Preview" className="h-20 rounded-lg border border-border" />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture className="hidden" onChange={handleImageSelect} />
            <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="h-8 w-8 shrink-0 rounded-lg p-0 text-muted-foreground hover:text-primary"
                title="Take a photo"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                disabled={isLoading}
                className="h-8 w-8 shrink-0 rounded-lg p-0 text-muted-foreground hover:text-primary"
                title="Upload photo from gallery"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about fishing or send a fish photo..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                style={{ maxHeight: '120px' }}
                onInput={(e) => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
              <Button
                size="sm"
                onClick={() => send(input)}
                disabled={(!input.trim() && !pendingImage) || isLoading}
                className="h-8 w-8 shrink-0 rounded-lg p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssistantPage;
