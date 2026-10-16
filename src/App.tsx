import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workspace, DataRecord } from '@/lib/types';
import { PortalShell } from '@/components/PortalShell';
import { AdminCockpit } from '@/components/AdminCockpit';
import { Paywall } from '@/components/Paywall';
import { DEMO_WORKSPACE, getEphemeralRecords, clearEphemeralSession } from '@/lib/sessionStore';

// Marketing Website Components
import Header from '@/components/marketing/Header';
import Hero from '@/components/marketing/Hero';
import AgencyGTM from '@/components/marketing/AgencyGTM';
import FeatureTabs from '@/components/marketing/FeatureTabs';
import InfoZones from '@/components/marketing/InfoZones';
import StatsTestimonials from '@/components/marketing/StatsTestimonials';
import AboutUs from '@/components/marketing/AboutUs';
import Pricing from '@/components/marketing/Pricing';
import CTA from '@/components/marketing/CTA';
import Footer from '@/components/marketing/Footer';

type View = 'landing' | 'portal' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [recentRunId, setRecentRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Opens the Ephemeral Public Demo Sandbox (Zero-login, strictly browser tab isolated)
  const openDemoSandbox = useCallback(() => {
    setWorkspace(DEMO_WORKSPACE);
    const demoRecs = getEphemeralRecords();
    setRecords(demoRecs);
    setRecentRunId('run-demo-sandbox');
    setView('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loadWorkspaceData = useCallback(async (ws: Workspace) => {
    try {
      const { data: runs } = await supabase
        .from('execution_runs')
        .select('*')
        .eq('workspace_id', ws.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (runs && runs.length > 0) {
        setRecentRunId(runs[0].id);
        const { data: recs } = await supabase
          .from('data_records')
          .select('*')
          .eq('workspace_id', ws.id)
          .eq('run_id', runs[0].id);

        if (recs && recs.length > 0) {
          setRecords(recs);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load workspace records:', err);
    }
    setRecords(getEphemeralRecords());
  }, []);

  const openPortal = useCallback(async (slug: string) => {
    if (slug === 'demo' || slug === 'sandbox' || slug === 'default_client') {
      openDemoSandbox();
      return;
    }

    setLoading(true);
    try {
      const { data: wsData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (wsData) {
        setWorkspace(wsData);
        await loadWorkspaceData(wsData);
        setView('portal');
      } else {
        alert(`Workspace '/portal/${slug}' not found. Opening the Unlimited Client-Side Portal instead.`);
        openDemoSandbox();
      }
    } catch (err) {
      console.warn('Supabase workspace lookup failed, opening demo sandbox:', err);
      openDemoSandbox();
    }
    setLoading(false);
  }, [openDemoSandbox, loadWorkspaceData]);

  // Deep URL Routing: /demo, /admin, and /portal/:slug
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (params.get('admin') === 'true' || path === '/admin' || hash === '#admin') {
      setView('admin');
      return;
    }

    if (params.get('demo') === 'true' || path === '/demo' || hash === '#demo') {
      openDemoSandbox();
      return;
    }

    if (path.startsWith('/portal/')) {
      const slug = path.replace('/portal/', '').trim();
      if (slug) {
        openPortal(slug);
        return;
      }
    }

    if (params.get('portal')) {
      const slug = params.get('portal')!.trim();
      if (slug) {
        openPortal(slug);
      }
    }
  }, [openDemoSandbox, openPortal]);

  const handleRefresh = useCallback(async () => {
    if (!workspace) return;
    if (workspace.id === 'demo-sandbox') {
      const demoRecs = getEphemeralRecords();
      setRecords(demoRecs);
      return;
    }
    await loadWorkspaceData(workspace);
  }, [workspace, loadWorkspaceData]);

  // Determine portal state
  const isSuspended = workspace?.status === 'suspended' || (workspace && new Date(workspace.valid_until) < new Date());

  if (view === 'admin') {
    return <AdminCockpit onExit={() => setView('landing')} />;
  }

  if (view === 'portal' && workspace) {
    if (isSuspended && workspace.id !== 'demo-sandbox') {
      return <Paywall companyName={workspace.company_name} onContact={() => setView('landing')} />;
    }
    return (
      <PortalShell
        workspace={workspace}
        records={records}
        recentRunId={recentRunId}
        onRefresh={handleRefresh}
        onExit={() => {
          setView('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <LandingPage
      onOpenDemoSandbox={openDemoSandbox}
    />
  );
}

function LandingPage({
  onOpenDemoSandbox,
}: {
  onOpenDemoSandbox: () => void;
}) {
  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-800">
      <Header onOpenDemoSandbox={onOpenDemoSandbox} />
      <main>
        <Hero onOpenDemoSandbox={onOpenDemoSandbox} />
        <AgencyGTM onOpenDemoSandbox={onOpenDemoSandbox} />
        <FeatureTabs />
        <InfoZones />
        <StatsTestimonials />
        <AboutUs />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
