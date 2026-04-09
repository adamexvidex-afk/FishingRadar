import { useState, useCallback, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import '@/i18n';
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import SplashScreen from "./components/SplashScreen";
import Layout from "./components/Layout";

// Lazy load all pages for code splitting
const OnboardingScreens = lazy(() => import("./components/OnboardingScreens"));
const Index = lazy(() => import("./pages/Index"));
const ConditionsPage = lazy(() => import("./pages/ConditionsPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const BaitsPage = lazy(() => import("./pages/BaitsPage"));
const AssistantPage = lazy(() => import("./pages/AssistantPage"));
const CatchLogPage = lazy(() => import("./pages/CatchLogPage"));
const HotspotsPage = lazy(() => import("./pages/HotspotsPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfileSetupPage = lazy(() => import("./pages/ProfileSetupPage"));
const ProfileEditPage = lazy(() => import("./pages/ProfileEditPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const TrendsPage = lazy(() => import("./pages/TrendsPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const CommunityGuidelinesPage = lazy(() => import("./pages/CommunityGuidelinesPage"));
const JoinGroupPage = lazy(() => import("./pages/JoinGroupPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,     // 2 min — avoid refetching on every mount
      gcTime: 10 * 60 * 1000,        // 10 min garbage collection
      refetchOnWindowFocus: false,    // prevent refetch on tab switch
      retry: 1,
    },
  },
});

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const LegalConsentScreen = lazy(() => import("./components/LegalConsentScreen"));

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showLegalConsent, setShowLegalConsent] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
    if (!localStorage.getItem('fr_legal_accepted')) {
      setShowLegalConsent(true);
    } else if (!localStorage.getItem('fr_onboarded')) {
      setShowOnboarding(true);
    }
  }, []);
  const handleLegalAccepted = useCallback(() => {
    setShowLegalConsent(false);
    if (!localStorage.getItem('fr_onboarded')) {
      setShowOnboarding(true);
    }
  }, []);
  const handleOnboardingDone = useCallback(() => setShowOnboarding(false), []);

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {showLegalConsent && (
        <Suspense fallback={null}>
          <LegalConsentScreen onAccept={handleLegalAccepted} />
        </Suspense>
      )}
      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingScreens onDone={handleOnboardingDone} />
        </Suspense>
      )}
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* OAuth callback — render nothing, let the auth library handle it */}
            <Route path="/~oauth" element={<PageLoader />} />

            {/* Public routes */}
            <Route element={<Layout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
            </Route>

            {/* Full-screen routes (no layout chrome) */}
            <Route path="/hotspots" element={<RequireAuth><HotspotsPage /></RequireAuth>} />

            {/* Protected routes */}
            <Route element={<RequireAuth><Layout /></RequireAuth>}>
              <Route path="/" element={<Index />} />
              <Route path="/conditions" element={<ConditionsPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/baits" element={<BaitsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/catch-log" element={<CatchLogPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/profile/:userId" element={<UserProfilePage />} />
              
              <Route path="/profile-setup" element={<ProfileSetupPage />} />
              <Route path="/profile-edit" element={<ProfileEditPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/join-group" element={<JoinGroupPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
