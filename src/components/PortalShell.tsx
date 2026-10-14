import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workspace, ModuleId, Persona, DataRecord } from '@/lib/types';
import { updateEphemeralRecord } from '@/lib/sessionStore';
import { TenantBar } from './TenantBar';
import { ModuleRail } from './ModuleRail';
import { InstantScrub } from './InstantScrub';
import { HealthCockpit } from './HealthCockpit';
import { MagicalImport } from './MagicalImport';
import { CleanseStudio } from './CleanseStudio';
import { DedupMatrix } from './DedupMatrix';
import { EnrichSegment } from './EnrichSegment';
import { QuarantineStewardship } from './QuarantineStewardship';
import { RecordDrawer } from './RecordDrawer';

interface PortalShellProps {
  workspace: Workspace;
  records: DataRecord[];
  recentRunId: string | null;
  onRefresh: () => void;
  onExit?: () => void;
}

export function PortalShell({ workspace, records, recentRunId, onRefresh, onExit }: PortalShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>('instant');
  const [persona, setPersona] = useState<Persona>('ops');
  const [drawerRecord, setDrawerRecord] = useState<DataRecord | null>(null);
  const [railExpanded, setRailExpanded] = useState(true);


  const handleApproveQuarantined = async (recordId: string) => {
    if (workspace.id === 'demo-sandbox') {
      updateEphemeralRecord(recordId, { triage_status: 'clean', quarantine_reason: null });
      onRefresh();
      return;
    }
    const { error } = await supabase
      .from('records')
      .update({ triage_status: 'clean', quarantine_reason: null })
      .eq('id', recordId);
    if (error) {
      console.error('Approve failed:', error.message);
      return;
    }
    onRefresh();
  };

  const handleDismissQuarantined = async (recordId: string) => {
    if (workspace.id === 'demo-sandbox') {
      updateEphemeralRecord(recordId, { triage_status: 'quarantined', flag_tags: ['DISMISSED'] });
      onRefresh();
      return;
    }
    const { error } = await supabase
      .from('records')
      .update({ triage_status: 'quarantined', flag_tags: ['DISMISSED'] })
      .eq('id', recordId);
    if (error) {
      console.error('Dismiss failed:', error.message);
      return;
    }
    onRefresh();
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'instant':
        return (
          <InstantScrub
            workspace={workspace}
            records={records}
            onRefresh={onRefresh}
            onRowClick={setDrawerRecord}
            onNavigateToStudio={(tabId) => setActiveModule(tabId as ModuleId)}
          />
        );
      case 'health':
        return <HealthCockpit workspace={workspace} records={records} recentRunId={recentRunId} persona={persona} />;
      case 'import':
        return (
          <MagicalImport
            workspace={workspace}
            records={records}
            onRefresh={onRefresh}
            onNavigateToCleanse={() => setActiveModule('cleanse')}
          />
        );
      case 'cleanse':
        return (
          <CleanseStudio
            workspace={workspace}
            records={records}
            onRowClick={setDrawerRecord}
            onRefresh={onRefresh}
          />
        );
      case 'dedupe':
        return <DedupMatrix workspace={workspace} records={records} onRefresh={onRefresh} />;
      case 'enrich':
        return <EnrichSegment workspace={workspace} records={records} onRowClick={setDrawerRecord} />;
      case 'quarantine':
        return (
          <QuarantineStewardship
            workspace={workspace}
            records={records}
            onRowClick={setDrawerRecord}
            onApprove={handleApproveQuarantined}
            onDismiss={handleDismissQuarantined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <TenantBar
        workspace={workspace}
        persona={persona}
        onPersonaChange={setPersona}
        onRefresh={onRefresh}
        onExit={onExit}
      />
      <div className="flex flex-1 overflow-hidden">
        <ModuleRail
          active={activeModule}
          onChange={setActiveModule}
          expanded={railExpanded}
          onToggle={() => setRailExpanded(!railExpanded)}
        />
        <main className="flex-1 overflow-auto scrollbar-thin">{renderModule()}</main>
      </div>
      {drawerRecord && (
        <RecordDrawer record={drawerRecord} onClose={() => setDrawerRecord(null)} />
      )}
    </div>
  );
}
