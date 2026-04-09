import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, ImageIcon } from 'lucide-react';

const BATCH_SIZE = 3;
const DELAY_BETWEEN_BATCHES_MS = 5000;

interface BatchResult {
  name: string;
  success: boolean;
  error?: string;
  url?: string;
}

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [totalMissing, setTotalMissing] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [processed, setProcessed] = useState(0);
  const [succeeded, setSucceeded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const stopRef = useRef(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // Check admin status server-side
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-admin');
        if (error) {
          setIsAdmin(false);
          return;
        }
        setIsAdmin(data?.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  // Fetch initial count
  useEffect(() => {
    if (!isAdmin) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from('fish_species')
        .select('*', { count: 'exact', head: true })
        .is('image_url', null);
      setTotalMissing(count ?? 0);
      setRemaining(count ?? 0);
    };
    fetchCount();
  }, [isAdmin]);

  const runLoop = useCallback(async () => {
    stopRef.current = false;
    setRunning(true);
    setProcessed(0);
    setSucceeded(0);
    setFailed(0);
    setLog([]);
    addLog(`Starting batch generation (batch size: ${BATCH_SIZE})...`);

    let batchNum = 0;

    while (!stopRef.current) {
      batchNum++;
      addLog(`Batch #${batchNum} — calling edge function...`);

      try {
        const { data, error } = await supabase.functions.invoke('batch-generate-fish-illustrations', {
          body: { batchSize: BATCH_SIZE },
        });

        if (error) {
          addLog(`❌ Error: ${error.message}`);
          break;
        }

        const rem = data?.remaining ?? 0;
        const results: BatchResult[] = data?.results ?? [];

        setRemaining(rem);
        setProcessed(prev => prev + (data?.processed ?? 0));
        setSucceeded(prev => prev + (data?.successful ?? 0));
        setFailed(prev => prev + (data?.failed ?? 0));

        results.forEach((r: BatchResult) => {
          if (r.success) {
            addLog(`✅ ${r.name}`);
          } else {
            addLog(`❌ ${r.name}: ${r.error}`);
          }
        });

        addLog(`Batch #${batchNum} done. Remaining: ${rem}`);

        if (rem === 0) {
          addLog('🎉 All fish illustrations generated!');
          break;
        }

        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
      } catch (err) {
        addLog(`❌ Unexpected error: ${String(err)}`);
        break;
      }
    }

    if (stopRef.current) {
      addLog('⏹ Stopped by user.');
    }

    setRunning(false);
  }, [addLog]);

  const handleStop = () => {
    stopRef.current = true;
    addLog('Stopping after current batch...');
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  const progress = totalMissing && totalMissing > 0 && remaining !== null
    ? Math.round(((totalMissing - remaining) / totalMissing) * 100)
    : 0;

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ImageIcon className="h-6 w-6" />
        Fish Illustration Generator
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Badge variant="outline">Missing: {remaining ?? '...'}</Badge>
            <Badge variant="secondary">Processed: {processed}</Badge>
            <Badge className="bg-green-600">Success: {succeeded}</Badge>
            {failed > 0 && <Badge variant="destructive">Failed: {failed}</Badge>}
          </div>

          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground">{progress}% complete</p>

          <div className="flex gap-3">
            {!running ? (
              <Button onClick={runLoop} className="gap-2">
                <Play className="h-4 w-4" />
                Start Generating
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-md p-3 h-80 overflow-y-auto font-mono text-xs space-y-0.5">
            {log.length === 0 && <p className="text-muted-foreground">Press Start to begin...</p>}
            {log.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            <div ref={logEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
