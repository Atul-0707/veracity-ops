import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workspace } from '@/lib/types';
import { statusBadge } from '@/lib/badges';
import { Activity, Plus, Search, Power, PowerOff, Calendar, DollarSign, Database, Users, ArrowLeft, X } from 'lucide-react';

interface AdminCockpitProps {
  onExit: () => void;
}

export function AdminCockpit({ onExit }: AdminCockpitProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showProvision, setShowProvision] = useState(false);
  const [selectedWs, setSelectedWs] = useState<Workspace | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false });
    setWorkspaces(data || []);
    setLoading(false);
  };

  const toggleStatus = async (ws: Workspace) => {
    const newStatus = ws.status === 'active' ? 'suspended' : 'active';
    await supabase
      .from('workspaces')
      .update({
        status: newStatus,
        valid_until: newStatus === 'active' ? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) : ws.valid_until,
      })
      .eq('id', ws.id);

    await supabase.from('audit_log').insert({
      workspace_id: ws.id,
      action: newStatus === 'active' ? 'WORKSPACE_ACTIVATED' : 'WORKSPACE_SUSPENDED',
      actor: 'admin@platform',
      details: { slug: ws.slug, previous: ws.status },
    });

    loadWorkspaces();
  };

  const filtered = workspaces.filter((w) =>
    w.company_name.toLowerCase().includes(search.toLowerCase()) ||
    w.slug.includes(search.toLowerCase())
  );

  const activeCount = workspaces.filter((w) => w.status === 'active').length;
  const totalMrr = workspaces.filter((w) => w.status === 'active').reduce((s, w) => s + w.monthly_fee, 0);
  const totalQuotaUsed = workspaces.reduce((s, w) => s + w.quota_used, 0);
  const totalQuotaLimit = workspaces.reduce((s, w) => s + w.quota_limit, 0);

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      {/* Admin header */}
      <header className="bg-slate-900 text-slate-100 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-sm">Master Admin Cockpit</span>
            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ADMIN
            </span>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit to Portal
        </button>
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AdminStat icon={Users} label="Total Clients" value={workspaces.length.toString()} color="text-sky-600" bg="bg-sky-50" />
          <AdminStat icon={Power} label="Active Subscriptions" value={activeCount.toString()} color="text-emerald-600" bg="bg-emerald-50" />
          <AdminStat icon={DollarSign} label="Monthly Recurring Revenue" value={`$${totalMrr.toFixed(0)}`} color="text-emerald-600" bg="bg-emerald-50" />
          <AdminStat icon={Database} label="Quota Utilization" value={`${(totalQuotaUsed / 1000).toFixed(1)}k / ${(totalQuotaLimit / 1000).toFixed(0)}k`} color="text-violet-600" bg="bg-violet-50" />
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name or slug..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-300 focus:ring-1 focus:ring-sky-200"
            />
          </div>
          <button
            onClick={() => setShowProvision(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Provision Client
          </button>
        </div>

        {/* Client table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CRM</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quota</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MRR</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Paid Until</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-400">No clients found.</td></tr>
              ) : (
                filtered.map((ws) => {
                  const status = statusBadge(ws.status);
                  const quotaPct = (ws.quota_used / ws.quota_limit) * 100;
                  return (
                    <tr key={ws.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedWs(ws)} className="text-left">
                          <span className="text-sm font-medium text-slate-900 hover:text-sky-600 transition-colors">{ws.company_name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">/portal/{ws.slug}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{ws.crm_target}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="text-[10px] font-mono text-slate-500 mb-0.5">{ws.quota_used.toLocaleString()}/{ws.quota_limit.toLocaleString()}</div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${quotaPct < 60 ? 'bg-sky-500' : quotaPct < 85 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${quotaPct}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-700">${ws.monthly_fee.toFixed(0)}/mo</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        <span className={`flex items-center gap-1 ${new Date(ws.valid_until) < new Date() ? 'text-rose-600 font-medium' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(ws.valid_until).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleStatus(ws)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                            ws.status === 'active'
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {ws.status === 'active' ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                          {ws.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision modal */}
      {showProvision && (
        <ProvisionModal
          onClose={() => setShowProvision(false)}
          onCreated={() => { setShowProvision(false); loadWorkspaces(); }}
        />
      )}

      {/* Client detail modal */}
      {selectedWs && (
        <ClientDetailModal workspace={selectedWs} onClose={() => setSelectedWs(null)} onUpdated={() => { setSelectedWs(null); loadWorkspaces(); }} />
      )}
    </div>
  );
}

function AdminStat({ icon: Icon, label, value, color, bg }: { icon: typeof Users; label: string; value: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-bold mt-1 ${color} font-mono`}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function ProvisionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');
  const [crm, setCrm] = useState('Salesforce');
  const [fee, setFee] = useState('99');
  const [quota, setQuota] = useState('25000');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!companyName || !slug) {
      setError('Company name and slug are required');
      return;
    }
    const { error: insertError } = await supabase.from('workspaces').insert({
      company_name: companyName,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      crm_target: crm,
      status: 'active',
      monthly_fee: parseFloat(fee),
      quota_limit: parseInt(quota),
      quota_used: 0,
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await supabase.from('audit_log').insert({
      action: 'WORKSPACE_PROVISIONED',
      actor: 'admin@platform',
      details: { company_name: companyName, slug },
    });

    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Provision New Client</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Enterprise Corp" />
          <Field label="URL Slug" value={slug} onChange={setSlug} placeholder="acme-corp" mono />
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">CRM Target</label>
            <select value={crm} onChange={(e) => setCrm(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-sky-300">
              <option>Salesforce</option>
              <option>HubSpot</option>
              <option>Pipedrive</option>
              <option>Zoho CRM</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Fee ($)" value={fee} onChange={setFee} placeholder="99" mono />
            <Field label="Quota (rows/mo)" value={quota} onChange={setQuota} placeholder="25000" mono />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex items-center gap-2 pt-2">
            <button onClick={onClose} className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 px-3 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors">Provision</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientDetailModal({ workspace, onClose, onUpdated }: { workspace: Workspace; onClose: () => void; onUpdated: () => void }) {
  const [fee, setFee] = useState(workspace.monthly_fee.toString());
  const [quota, setQuota] = useState(workspace.quota_limit.toString());
  const [validUntil, setValidUntil] = useState(workspace.valid_until);

  const handleSave = async () => {
    await supabase.from('workspaces').update({
      monthly_fee: parseFloat(fee),
      quota_limit: parseInt(quota),
      valid_until: validUntil,
      updated_at: new Date().toISOString(),
    }).eq('id', workspace.id);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{workspace.company_name}</h3>
            <p className="text-[10px] text-slate-400 font-mono">/portal/{workspace.slug}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Monthly Fee ($)" value={fee} onChange={setFee} mono />
          <Field label="Quota Limit (rows/mo)" value={quota} onChange={setQuota} mono />
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Valid Until</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-sky-300 font-mono" />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button onClick={onClose} className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 px-3 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-sky-300 ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}
