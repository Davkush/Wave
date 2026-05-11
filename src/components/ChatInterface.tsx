import { useState, useRef, useEffect, FormEvent } from 'react';
import { Agent, Message, AgentStatus, SubAgent, Mission } from '../types';
import { Send, Terminal, Sparkles, Globe, X, Cpu, Activity, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { ArtifactRenderer } from './ArtifactRenderer';

interface ChatInterfaceProps {
  activeAgent: Agent | null;
  activeMissionId: string | null;
  messages: Message[];
  missions: Mission[];
  onSendMessage: (content: string, editId?: string) => void;
  onDeleteMessage: (id: string) => void;
  onStopTask: (agentId: string) => void;
}

export default function ChatInterface({ 
  activeAgent, 
  activeMissionId,
  messages, 
  missions,
  onSendMessage, 
  onDeleteMessage,
  onStopTask 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeAgent || activeAgent.status === AgentStatus.THINKING) return;
    onSendMessage(input, editingId || undefined);
    setInput('');
    setEditingId(null);
  };

  const handleEdit = (msg: Message) => {
    setInput(msg.content);
    setEditingId(msg.id);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeAgent?.status]);

  const currentMission = missions.find(m => m.id === activeMissionId);

  const getSubAgentIcon = (type: SubAgent['type']) => {
    switch (type) {
      case 'ui_worker': return <Cpu className="w-3 h-3" />;
      case 'logic_agent': return <Activity className="w-3 h-3" />;
      case 'integrity_verifier': return <Shield className="w-3 h-3" />;
    }
  };

  if (!activeAgent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-bg-dark">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full border border-accent-gold/20 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-accent-gold/40 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Terminal className="w-10 h-10 text-accent-gold" />
          </div>
        </div>
        <h2 className="text-3xl font-light serif text-white mb-4 italic tracking-tight">System Offline</h2>
        <p className="text-white/30 text-sm max-w-sm font-light leading-relaxed">Select a deployment node from the left manifest to establish a neural hyperlink and begin mission orchestration.</p>
      </div>
    );
  }

  if (!activeMissionId && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-bg-dark relative min-h-0">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 mb-8 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-center rotate-45 group hover:rotate-90 transition-transform duration-500">
            <Sparkles className="w-8 h-8 text-accent-gold -rotate-45 group-hover:-rotate-90 transition-transform duration-500" />
          </div>
          <h2 className="text-2xl font-light serif text-white mb-3 italic tracking-tight">Initial Objective</h2>
          <p className="text-white/30 text-xs max-w-md font-light leading-relaxed mb-12">
            The {activeAgent.name} node is primed. Issue your first strategic directive below to initialize a new mission thread and begin tactical processing.
          </p>
          
          <div className="w-full max-w-lg space-y-4">
            <p className="text-[10px] font-mono text-white/10 uppercase tracking-[0.3em]">Suggested_Operations</p>
            <div className="grid grid-cols-2 gap-4">
              {['Spawn UI Worker: Dashboard', 'Verify Integrity: Neural Link', 'Orchestrate Logic: Payload', 'Synthesize Mission Chronicle'].map(suggestion => (
                <button 
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent-gold/30 hover:bg-accent-gold/5 text-left transition-all group/sug"
                >
                  <p className="text-[11px] text-white/40 group-hover/sug:text-accent-gold transition-colors">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="h-24 border-t border-white/5 bg-surface-dark/80 backdrop-blur-xl flex items-center px-8 gap-6 shrink-0">
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-6">
            <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-full px-6 py-3.5 group focus-within:border-accent-gold/30 transition-all shadow-2xl">
              <div className="w-2 h-2 rounded-full bg-accent-gold mr-4 glow-gold animate-pulse" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Initialize mission protocol..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:opacity-20 text-white"
              />
              <div className="flex gap-3 opacity-20 text-[10px] font-mono group-focus-within:opacity-40 transition-opacity">
                <kbd className="bg-white/10 px-2 py-0.5 rounded-md">CMD</kbd>
                <kbd className="bg-white/10 px-2 py-0.5 rounded-md">ENTER</kbd>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-12 h-12 rounded-full bg-accent-gold flex-shrink-0 flex items-center justify-center hover:scale-105 active:scale-95 disabled:grayscale-100 disabled:opacity-20 disabled:hover:scale-100 transition-all shadow-lg shadow-accent-gold/20"
            >
              <Send className="w-5 h-5 text-bg-dark" strokeWidth={2.5} />
            </button>
          </form>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-dark relative min-h-0" id="chat-interface">
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-surface-dark/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div 
            className="w-3 h-3 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.2)]" 
            style={{ backgroundColor: activeAgent.color, boxShadow: `0 0 15px ${activeAgent.color}40` }}
          />
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em]">{activeAgent.name}</h2>
            <p className="text-[9px] text-white/30 font-mono italic">
              NODE_ROLE: {activeAgent.role.toUpperCase()} | 
              PROVIDER: {(activeAgent.provider || 'GEMINI').toUpperCase()} | 
              ENGINE: {(activeAgent.model || 'GEMINI-2.0-FLASH').toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono opacity-50">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${activeAgent.status === AgentStatus.THINKING ? 'bg-accent-gold animate-bounce' : 'bg-green-500'}`} />
            <span>LINK: {activeAgent.status === AgentStatus.THINKING ? 'PROCESSING' : 'ESTABLISHED'}</span>
          </div>
        </div>
      </div>

      {/* Tactical Orchestration Console */}
      <AnimatePresence>
        {currentMission && currentMission.status !== 'idle' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/40 border-b border-white/5 px-8 py-3 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Globe className="w-3 h-3 text-accent-gold" />
                <span className="text-[10px] font-mono text-accent-gold/80 uppercase tracking-widest">Orchestrator_Link: {currentMission.status}</span>
              </div>
              <div className="flex gap-4">
                {currentMission.subAgents?.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2 group">
                    <div className={`p-1.5 rounded bg-white/5 border border-white/5 transition-all ${sub.status === AgentStatus.THINKING ? 'border-accent-gold/30 text-accent-gold shadow-[0_0_8px_rgba(197,160,89,0.2)]' : 'text-white/20'}`}>
                      {getSubAgentIcon(sub.type)}
                    </div>
                    <div className="hidden group-hover:block transition-all">
                      <p className="text-[8px] font-mono whitespace-nowrap text-white/40 uppercase">{sub.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {currentMission.status === 'processing' && (
              <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent-gold"
                  initial={{ width: "0%" }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 5, ease: "easeOut" }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-12 scroll-smooth"
        id="message-container"
      >
        {messages.filter(m => m.agentId === activeAgent.id).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} group`}
          >
            <div className="flex items-center gap-3 px-1">
              <span className={`text-[10px] font-mono tracking-widest ${msg.role === 'user' ? 'text-white/20' : 'text-accent-gold/60'}`}>
                {msg.role === 'user' ? 'OPERATOR_INPUT' : 'AGENT_COGNITION'}
              </span>
              <span className="text-[10px] font-mono opacity-10">T+{new Date(msg.timestamp).toLocaleTimeString([], { second: '2-digit' })}s</span>
            </div>
            
            <div className={`max-w-[85%] px-6 py-4 rounded-2xl text-[15px] leading-relaxed serif relative group/bubble ${
              msg.role === 'user' 
                ? 'bg-white/[0.03] text-white border border-white/5 italic font-light' 
                : 'bg-surface-dark border border-white/5 text-white/90 shadow-xl'
            }`}>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                {msg.role === 'user' && (
                  <button 
                    onClick={() => handleEdit(msg)}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <Terminal className="w-3 h-3 text-white/40" />
                  </button>
                )}
                <button 
                  onClick={() => onDeleteMessage(msg.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors"
                >
                  <X className="w-3 h-3 text-red-500/40" />
                </button>
              </div>

              <div className="markdown-body">
                <Markdown>{msg.content}</Markdown>
              </div>
              
              {msg.artifact && (
                <div className="mt-4">
                  <ArtifactRenderer artifact={msg.artifact} />
                </div>
              )}
            </div>
            
            {msg.role === 'assistant' && (
               <div className="flex gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:text-accent-gold transition-colors"><Sparkles className="w-3 h-3 text-white/20" /></button>
                <button className="p-1 hover:text-accent-gold transition-colors"><Globe className="w-3 h-3 text-white/20" /></button>
              </div>
            )}
          </motion.div>
        ))}
        
        {activeAgent.status === AgentStatus.THINKING && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 items-start">
             <div className="flex items-center gap-3 px-1">
              <span className="text-[10px] font-mono tracking-widest text-accent-gold/60">AGENT_COGNITION</span>
              <span className="text-[10px] font-mono text-accent-gold animate-pulse tracking-tighter">EVALUATING...</span>
            </div>
            <div className="bg-surface-dark/50 border border-white/5 p-4 rounded-xl flex gap-1.5">
              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-accent-gold shadow-[0_0_8px_#c5a059]" />
              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-accent-gold shadow-[0_0_8px_#c5a059]" />
              <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-accent-gold shadow-[0_0_8px_#c5a059]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <footer className="h-24 border-t border-white/5 bg-surface-dark/80 backdrop-blur-xl flex items-center px-8 gap-6 shrink-0">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-6">
          <div className={`flex-1 flex items-center bg-black/40 border rounded-full px-6 py-3.5 group transition-all ${
            editingId ? 'border-accent-gold shadow-[0_0_15px_rgba(197,160,89,0.1)]' : 'border-white/10 focus-within:border-accent-gold/30'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-4 glow-gold ${editingId ? 'bg-accent-gold animate-pulse' : 'bg-white/20'}`} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeAgent.status === AgentStatus.THINKING ? "Processing logic flow..." : (activeMissionId ? "Issue tactical task..." : "Initialize mission protocol...")}
              disabled={activeAgent.status === AgentStatus.THINKING}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:opacity-20 text-white disabled:opacity-50"
            />
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setInput(''); setEditingId(null); }}
                className="text-[10px] font-mono text-accent-gold hover:underline mr-4"
              >
                CANCEL_EDIT
              </button>
            )}
            <div className="flex gap-3 opacity-20 text-[10px] font-mono group-focus-within:opacity-40 transition-opacity">
              <kbd className="bg-white/10 px-2 py-0.5 rounded-md">CMD</kbd>
              <kbd className="bg-white/10 px-2 py-0.5 rounded-md">ENTER</kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeAgent.status === AgentStatus.THINKING && (
              <button
                type="button"
                onClick={() => onStopTask(activeAgent.id)}
                className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0 flex items-center justify-center hover:bg-red-500/40 transition-all text-red-500 group/stop"
                title="Stop current task"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            <button
              type="submit"
              disabled={!input.trim() || activeAgent.status === AgentStatus.THINKING}
              className="w-12 h-12 rounded-full bg-accent-gold flex-shrink-0 flex items-center justify-center hover:scale-105 active:scale-95 disabled:grayscale-100 disabled:opacity-20 disabled:hover:scale-100 transition-all shadow-lg shadow-accent-gold/20"
            >
              <Send className="w-5 h-5 text-bg-dark" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
