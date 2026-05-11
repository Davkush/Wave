import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Zap, Shield, Globe } from 'lucide-react';
import { Agent } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onUpdateAgent: (id: string, updates: Partial<Agent>) => void;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Fast)', provider: 'gemini' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Heavy)', provider: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Balanced)', provider: 'gemini' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'OpenRouter: Gemini 2.0 Flash (Free)', provider: 'openrouter' },
  { id: 'anthropic/claude-3-sonnet', name: 'OpenRouter: Claude 3 Sonnet', provider: 'openrouter' }
];

export default function SettingsModal({ isOpen, onClose, agents, onUpdateAgent }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white serif italic">Node Configuration</h2>
                <p className="text-[10px] uppercase tracking-widest text-accent-gold/60 mt-1">System Preferences & Model Orchestration</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
              <section className="space-y-4">
                 <h3 className="text-[10px] font-mono text-white/30 uppercase">Provider Credentials</h3>
                 <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-accent-gold" />
                        <span className="text-xs font-bold text-white">OpenRouter Gateway</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/20 italic">v1.2.0-secure</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={agents[0]?.apiKey || ''} // Reusing first agent's apiKey as a placeholder or managing globally
                        onChange={(e) => agents.forEach(a => onUpdateAgent(a.id, { apiKey: e.target.value }))}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent-gold/40 transition-all font-mono"
                      />
                      <p className="mt-2 text-[9px] text-white/20 italic">Key is stored in browser session. For persistent server-side use, add OPENROUTER_API_KEY to your platform Secrets.</p>
                    </div>
                 </div>
              </section>

              {agents.map((agent) => (
                <section key={agent.id} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
                    <h3 className="text-sm font-bold tracking-[0.1em] uppercase text-white/90">{agent.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-white/30 uppercase">Inference Engine</label>
                      <select 
                        value={agent.model || 'gemini-2.0-flash'}
                        onChange={(e) => {
                          const model = AVAILABLE_MODELS.find(m => m.id === e.target.value);
                          onUpdateAgent(agent.id, { 
                            model: e.target.value,
                            provider: model?.provider as any || 'gemini'
                          });
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent-gold/40 transition-all font-mono"
                      >
                        {AVAILABLE_MODELS.map(m => (
                          <option key={m.id} value={m.id} className="bg-surface-dark">{m.name}</option>
                        ))}
                        <option value="custom" className="bg-surface-dark">-- CUSTOM MODEL --</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-white/30 uppercase">Provider</label>
                      <select 
                        value={agent.provider || 'gemini'}
                        onChange={(e) => onUpdateAgent(agent.id, { provider: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent-gold/40 transition-all font-mono"
                      >
                        <option value="gemini" className="bg-surface-dark">Google Gemini</option>
                        <option value="openrouter" className="bg-surface-dark">OpenRouter</option>
                      </select>
                    </div>

                    <div className="space-y-3 col-span-full">
                      <label className="text-[10px] font-mono text-white/30 uppercase">Custom Model Identifier / API Key</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="e.g. google/gemini-robotics-er-1.6-preview"
                          value={agent.model || ''}
                          onChange={(e) => onUpdateAgent(agent.id, { model: e.target.value })}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent-gold/40 transition-all font-mono"
                        />
                        <input 
                          type="password"
                          placeholder="Provider API Key (Optional Override)"
                          value={agent.apiKey || ''}
                          onChange={(e) => onUpdateAgent(agent.id, { apiKey: e.target.value })}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-accent-gold/40 transition-all font-mono"
                        />
                      </div>
                      <p className="text-[9px] text-white/20 italic">Override keys are stored in memory and local session. Use .env for production keys.</p>
                    </div>
                  </div>
                </section>
              ))}

              <section className="pt-6 border-t border-white/5 space-y-4">
                 <h3 className="text-[10px] font-mono text-white/30 uppercase">Global Integrations</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4">
                      <Globe className="w-5 h-5 text-accent-gold" />
                      <div>
                        <p className="text-xs font-bold text-white">Google Search</p>
                        <p className="text-[10px] text-white/30">Enabled via Grounding</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 opacity-50">
                      <Cpu className="w-5 h-5 text-white/40" />
                      <div>
                        <p className="text-xs font-bold text-white">OpenRouter</p>
                        <p className="text-[10px] text-white/30">Expansion Available</p>
                      </div>
                    </div>
                 </div>
              </section>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center">
              <button 
                onClick={() => {
                  if (confirm('Are you sure? This will wipe all messages and agent configurations.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-[10px] font-mono text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                [ FORCE_SYSTEM_PURGE ]
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-accent-gold text-bg-dark text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
              >
                Apply Protocols
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
