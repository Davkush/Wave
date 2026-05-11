/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import { Agent, Message, AgentStatus, Mission, SubAgent } from './types';
import { INITIAL_AGENTS } from './constants';
import { generateAgentResponse } from './services/geminiService';
import { AnimatePresence, motion } from 'motion/react';

const STORAGE_KEY = 'wave_agent_workspace_v1';

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_agents`);
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
  });

  const [activeAgentId, setActiveAgentId] = useState<string | null>(INITIAL_AGENTS[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
    return saved ? JSON.parse(saved) : [];
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_missions`);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMissionId, setActiveMissionId] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_active_mission_id`);
  });

  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_agents`, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_missions`, JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    if (activeMissionId) {
      localStorage.setItem(`${STORAGE_KEY}_active_mission_id`, activeMissionId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_active_mission_id`);
    }
  }, [activeMissionId]);

  const activeAgent = agents.find(a => a.id === activeAgentId) || null;

  const updateAgentStatus = useCallback((agentId: string, status: AgentStatus) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status, lastActive: new Date().toISOString() } : a
    ));
  }, []);

  const handleUpdateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const stopTask = useCallback((agentId: string) => {
    const controller = abortControllers.current.get(agentId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(agentId);
      updateAgentStatus(agentId, AgentStatus.IDLE);
    }
  }, [updateAgentStatus]);

  const handleNewMission = useCallback(() => {
    setActiveMissionId(null);
  }, []);

  const handleSelectMission = useCallback((missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission) {
      setActiveMissionId(missionId);
      setActiveAgentId(mission.agentId);
    }
  }, [missions]);

  const handleDeleteMission = useCallback((missionId: string) => {
    setMissions(prev => prev.filter(m => m.id !== missionId));
    setMessages(prev => prev.filter(m => m.missionId !== missionId));
    if (activeMissionId === missionId) {
      setActiveMissionId(null);
    }
  }, [activeMissionId]);

  const handleSendMessage = async (content: string, editMessageId?: string) => {
    if (!activeAgent) return;

    let currentMissionId = activeMissionId;
    const targetAgentId = activeAgent.id;

    // Create new mission if none active
    if (!currentMissionId) {
      currentMissionId = crypto.randomUUID();
      const newMission: Mission = {
        id: currentMissionId,
        agentId: targetAgentId,
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        timestamp: new Date().toISOString(),
        status: 'processing',
        subAgents: [
          { id: crypto.randomUUID(), type: 'ui_worker', status: AgentStatus.THINKING, task: 'Decomposing Visual Atoms', progress: 30 },
          { id: crypto.randomUUID(), type: 'logic_agent', status: AgentStatus.IDLE, task: 'Orchestrating Logic Flow', progress: 0 }
        ]
      };
      setMissions(prev => [newMission, ...prev]);
      setActiveMissionId(currentMissionId);
    }

    const targetModel = activeAgent.model || 'gemini-3-flash-preview';
    const targetProvider = activeAgent.provider || 'gemini';
    const targetApiKey = activeAgent.apiKey;

    // If editing, remove all subsequent messages in that mission thread
    if (editMessageId) {
      setMessages(prev => {
        const index = prev.findIndex(m => m.id === editMessageId);
        if (index === -1) return prev;
        return prev.filter((m, i) => i <= index); // Keep the edited message (will be replaced)
      });
    }

    const userMessage: Message = {
      id: editMessageId || crypto.randomUUID(),
      agentId: targetAgentId,
      missionId: currentMissionId,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      if (editMessageId) {
        return prev.map(m => m.id === editMessageId ? userMessage : m);
      }
      return [...prev, userMessage];
    });

    updateAgentStatus(targetAgentId, AgentStatus.THINKING);

    const controller = new AbortController();
    abortControllers.current.set(targetAgentId, controller);

    const missionHistory = messages
      .filter(m => m.missionId === currentMissionId && m.id !== editMessageId)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await generateAgentResponse(
        activeAgent.name,
        activeAgent.role,
        missionHistory,
        content,
        targetModel,
        targetProvider,
        targetApiKey,
        controller.signal
      );

      if (controller.signal.aborted) return;

      let artifact: Message['artifact'] = undefined;

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'renderMap') {
            artifact = {
              type: 'map',
              data: {
                location: call.args.location,
                zoom: call.args.zoom || 12
              }
            };
          } else if (call.name === 'generateImage') {
             artifact = {
              type: 'image',
              data: {
                prompt: call.args.prompt,
              }
            };
          }
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        agentId: targetAgentId,
        missionId: currentMissionId,
        role: 'assistant',
        content: response.text || (artifact ? `Processing artifact: ${artifact.type}...` : "Task processed."),
        timestamp: new Date().toISOString(),
        artifact
      };

      setMessages(prev => [...prev, assistantMessage]);
      updateAgentStatus(targetAgentId, AgentStatus.RESPONDING);
      
      setTimeout(() => {
        updateAgentStatus(targetAgentId, AgentStatus.IDLE);
      }, 1500);

    } catch (error) {
      console.error(error);
      updateAgentStatus(targetAgentId, AgentStatus.ERROR);
    } finally {
      abortControllers.current.delete(targetAgentId);
    }
  };

  const handleDeleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <div className="flex h-screen bg-bg-dark text-[#e0e0e0] selection:bg-accent-gold/30 overflow-hidden" id="main-app">
      <Sidebar 
        agents={agents} 
        missions={missions}
        messages={messages}
        activeAgentId={activeAgentId} 
        activeMissionId={activeMissionId}
        onSelectAgent={setActiveAgentId}
        onSelectMission={handleSelectMission}
        onNewMission={handleNewMission}
        onDeleteMission={handleDeleteMission}
        onSendMessage={handleSendMessage}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden" id="viewport">
        <AnimatePresence mode="wait">
          <ChatInterface 
            activeAgent={activeAgent}
            activeMissionId={activeMissionId}
            messages={messages.filter(m => m.missionId === activeMissionId)}
            missions={missions}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onStopTask={stopTask}
          />
        </AnimatePresence>
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] overflow-hidden">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '48px 48px' 
          }} />
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        agents={agents}
        onUpdateAgent={handleUpdateAgent}
      />

      {/* Global Status Bar */}
      <div className="fixed bottom-0 left-80 right-0 h-0.5 bg-white/5">
        <motion.div 
          className="h-full bg-accent-gold shadow-[0_0_15px_#c5a059]"
          initial={{ width: "0%" }}
          animate={{ width: activeAgent?.status === AgentStatus.THINKING ? "100%" : "0%" }}
          transition={{ duration: 2, repeat: activeAgent?.status === AgentStatus.THINKING ? Infinity : 0, ease: "linear" }}
        />
      </div>
    </div>
  );
}

