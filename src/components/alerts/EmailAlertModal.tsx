import React from 'react';
import { Mail, X, CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react';
import { EmailNotification } from '../../types';

interface EmailAlertModalProps {
  email: EmailNotification | null;
  onClose: () => void;
  onViewDiagnostic?: (breachId: string) => void;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({ email, onClose, onViewDiagnostic }) => {
  if (!email) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Email Client Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
              email.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-500'
            }`}>
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Automated Incident Dispatcher
              </span>
              <span className="text-[10px] text-slate-500 block">
                Delivered via Enterprise SMTP Relay
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Envelope Metadata */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 space-y-1.5 text-xs bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {email.subject}
            </h2>
            <span className="font-mono text-[11px] text-slate-400">
              {new Date(email.sentAt).toLocaleString()}
            </span>
          </div>
          <div className="text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>From:</strong> Oracle 11g Real-Time Monitoring &lt;alerts@enterprise.oracle.corp&gt;</span>
            <span><strong>To:</strong> {email.to.join(', ')}</span>
          </div>
        </div>

        {/* Render HTML Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-950">
          <div 
            className="prose dark:prose-invert max-w-none text-xs"
            dangerouslySetInnerHTML={{ __html: email.htmlPreview }}
          />
        </div>

        {/* Email Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Delivered to registered admin email addresses</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
