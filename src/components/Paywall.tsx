import { Lock, Mail, ArrowRight } from 'lucide-react';

interface PaywallProps {
  companyName: string;
  onContact: () => void;
}

export function Paywall({ companyName, onContact }: PaywallProps) {
  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Subscription Expired</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Your monthly data intelligence subscription for <span className="font-semibold text-slate-700">{companyName}</span> has expired.
          Please contact your account representative to renew access.
        </p>
        <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500">All upload and download features are currently locked. Your data is preserved and will be available immediately upon renewal.</p>
        </div>
        <button
          onClick={onContact}
          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" /> Contact Account Representative
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[10px] text-slate-400 mt-4 font-mono">Billing Inactive — Portal Locked</p>
      </div>
    </div>
  );
}
