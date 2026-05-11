import { Agent, AgentStatus, Mission, Message } from '../types';
import { Settings, Plus, Activity, X, MessageSquare, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import WaveVisualizer from './WaveVisualizer';

interface SidebarProps {
  agents: Agent[];
  missions: Mission[];
  messages: Message[];
  activeAgentId: string | null;
  activeMissionId: string | null;
  onSelectAgent: (id: string) => void;
  onSelectMission: (id: string) => void;
  onNewMission: () => void;
  onDeleteMission: (id: string) => void;
  onSendMessage: (content: string) => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ 
  agents, 
  missions, 
  messages,
  activeAgentId, 
  activeMissionId,
  onSelectAgent, 
  onSelectMission,
  onNewMission,
  onDeleteMission,
  onSendMessage,
  onOpenSettings 
}: SidebarProps) {
  return (
    <aside className="w-80 h-full bg-[#0d0d0f] border-r border-white/5 flex flex-col" id="sidebar">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-accent-gold flex items-center justify-center">
            <div className="w-3 h-3 bg-accent-gold rounded-full glow-gold" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs font-bold tracking-widest uppercase text-accent-gold italic serif">Wave Agent</h1>
            <p className="text-[9px] opacity-30 tracking-tighter font-mono">PROTOCOL: IDX-36198192</p>
          </div>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-white/5 rounded-full transition-colors group"
        >
          <Settings className="w-4 h-4 text-white/20 group-hover:text-accent-gold transition-colors" />
        </button>
      </div>

      <div className="overflow-y-auto px-4 py-6 space-y-8" id="agent-list">
        <section>
          <p className="text-[10px] uppercase tracking-widest opacity-30 ml-2 mb-4 font-semibold">Deployment Nodes</p>
          <div className="space-y-2">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                whileHover={{ x: 4 }}
                onClick={() => onSelectAgent(agent.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                  activeAgentId === agent.id
                    ? 'bg-surface-dark border-accent-gold/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-1.5 h-1.5 rounded-full ${agent.status === AgentStatus.THINKING ? 'animate-pulse' : ''}`} 
                      style={{ 
                        backgroundColor: agent.color,
                        boxShadow: (activeAgentId === agent.id || agent.status === AgentStatus.THINKING) ? `0 0 8px ${agent.color}` : 'none'
                      }} 
                    />
                    <h3 className={`text-xs font-medium tracking-wide ${activeAgentId === agent.id ? 'text-white' : 'text-white/60'}`}>
                      {agent.name}
                    </h3>
                  </div>
                </div>
                
                {activeAgentId === agent.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <WaveVisualizer 
                        isThinking={agent.status === AgentStatus.THINKING} 
                        color={agent.color} 
                      />
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                        agent.status === AgentStatus.THINKING ? 'text-accent-gold' : 'text-white/20'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-mono tracking-widest text-white/20 uppercase">Mission_Logs</h3>
            <button 
              onClick={onNewMission}
              className="flex items-center gap-2 px-2 py-1 bg-white/5 hover:bg-accent-gold/20 text-[9px] font-mono text-accent-gold rounded transition-all group"
            >
              <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
              NEW_LINK
            </button>
          </div>

          <div className="space-y-2">
            {missions.length === 0 ? (
              <div className="px-3 py-6 rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center text-center opacity-20">
                <Activity className="w-4 h-4 mb-2" />
                <p className="text-[9px] font-mono uppercase tracking-tighter">no_history_detected</p>
              </div>
            ) : (
              missions.map((mission) => {
                const agent = agents.find(a => a.id === mission.agentId);
                const isActive = activeMissionId === mission.id;
                
                return (
                  <div
                    key={mission.id}
                    className="w-full group/item"
                  >
                    <div
                      onClick={() => onSelectMission(mission.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col cursor-pointer ${
                        isActive 
                          ? 'bg-accent-gold/5 border-accent-gold/20' 
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className={`w-3 h-3 ${isActive ? 'text-accent-gold' : 'text-white/10'}`} />
                          <span className={`text-[9px] font-mono uppercase tracking-tighter ${isActive ? 'text-accent-gold' : 'text-white/20'}`}>
                            {agent?.name || 'Unknown'}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-white/10">
                          {new Date(mission.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-[11px] font-light leading-snug line-clamp-1 flex-1 transition-colors ${
                          isActive ? 'text-white' : 'text-white/40 group-hover/item:text-white/60'
                        }`}>
                          {mission.title}
                        </p>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAgent(mission.agentId);
                            const firstMsg = messages.find(m => m.missionId === mission.id && m.role === 'user');
                            if (firstMsg) onSendMessage(firstMsg.content);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded hover:bg-accent-gold/10 text-accent-gold/40 hover:text-accent-gold transition-all"
                          title="Restart Mission (Clone first directive)"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMission(mission.id);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all"
                          title="Redact Mission"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="mt-auto p-6">
        <div className="p-4 rounded-lg bg-black/40 border border-white/5">
          <p className="text-[9px] serif italic text-accent-gold mb-1">System Status:</p>
          <div className="flex items-center justify-between text-[10px] font-mono opacity-40">
            <span>UPLINK: ACTIVE</span>
            <span>SECURE: AES-256</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
