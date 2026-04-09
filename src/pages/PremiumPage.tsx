import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Check,
  Sparkles,
  Brain,
  BarChart3,
  Loader2,
  Activity,
  MapPin,
  CloudSun,
  TrendingUp,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { toast } from 'sonner';

const PremiumPage = () => {
  const navigate = useNavigate();
  const { user, isPremium, subscriptionEnd, subscriptionLoading, checkSubscription } = useAuth();

  const {
    isNative,
    monthlyPackage,
    annualPackage,
    purchasing,
    purchasePackage,
    restorePurchases,
    loading: rcLoading,
  } = useRevenueCat();

  const handlePurchase = async (pkg: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!pkg) {
      toast.error('Subscription package is still loading. Please wait a moment and try again.');
      return;
    }

    const success = await purchasePackage(pkg);

    if (success) {
      await checkSubscription();
      toast.success('Premium activated! Welcome aboard 🎉');
    } else {
      toast.error('Purchase failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();

    if (success) {
      await checkSubscription();
      toast.success('Purchases restored! Premium is active 🎉');
    } else {
      toast.info('No previous purchases found');
    }
  };

  const features = [
    { icon: Activity, label: 'Fishing Conditions', desc: 'Real-time water temp, flow, pressure & smart recommendations' },
    { icon: MapPin, label: 'Fishing Hotspots', desc: '1,000+ premium fishing locations with species details' },
    { icon: Brain, label: 'CastMate AI', desc: 'Unlimited conversations with your personal AI fishing guide' },
    { icon: BarChart3, label: 'Advanced Statistics', desc: 'Deep insights, trends & analytics on your catches' },
    { icon: CloudSun, label: '7-Day Fishing Forecast', desc: 'Weather-based fishing predictions with best day recommendations' },
    { icon: TrendingUp, label: 'Catch Trends & Graphs', desc: 'Monthly comparisons, species breakdown & personal records' },
    { icon: Download, label: 'Offline Fish Catalog', desc: 'Access 1,000+ fish species data without internet connection' },
  ];

  const isLoading = subscriptionLoading || rcLoading;

  return (
    <div className="min-h-screen pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Crown className="h-4 w-4" />
            Premium
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Unlock Your Full Fishing Potential
          </h1>
          <p className="mt-3 text-muted-foreground">
            Get AI-powered insights and advanced analytics to catch more fish.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-nature/10 px-4 py-2 text-sm font-semibold text-nature">
            <Sparkles className="h-4 w-4" />
            Start with a 3-day free trial — no charge until day 4
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {isPremium && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">You're a Premium member!</p>
                  {subscriptionEnd && (
                    <p className="text-sm text-muted-foreground">
                      Renews {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isPremium && (
          <div className="mb-10 grid gap-6 sm:grid-cols-2">
            <Card className="relative border-border/50">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Monthly</CardTitle>
                <CardDescription>Flexible, cancel anytime</CardDescription>
                <div className="mt-4">
                  {monthlyPackage ? (
                    <>
                      <span className="text-4xl font-bold">{monthlyPackage.product.priceString}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Loading price...</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f.label}
                  </div>
                ))}
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() =>
                    isNative
                      ? handlePurchase(monthlyPackage)
                      : !user
                        ? navigate('/login')
                        : toast.info('Download the app to subscribe')
                  }
                  disabled={purchasing || isLoading || !monthlyPackage}
                >
                  {purchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : !monthlyPackage ? (
                    'Loading...'
                  ) : (
                    'Start Free Trial'
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary/30 shadow-lg shadow-primary/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Save 48%
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Annual</CardTitle>
                <CardDescription>Best value</CardDescription>
                <div className="mt-4">
                  {annualPackage ? (
                    <>
                      <span className="text-4xl font-bold">{annualPackage.product.priceString}</span>
                      <span className="text-muted-foreground">/yr</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Loading price...</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f.label}
                  </div>
                ))}
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    isNative
                      ? handlePurchase(annualPackage)
                      : !user
                        ? navigate('/login')
                        : toast.info('Download the app to subscribe')
                  }
                  disabled={purchasing || isLoading || !annualPackage}
                >
                  {purchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : !annualPackage ? (
                    'Loading...'
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />
                      Start Free Trial
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {!isPremium && isNative && (
          <div className="mb-6 text-center">
            <Button variant="ghost" onClick={handleRestore} disabled={purchasing} className="text-muted-foreground">
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Purchases
            </Button>
          </div>
        )}

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.label} className="border-border/50">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{f.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;