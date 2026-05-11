export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  RESPONDING = 'RESPONDING',
  ERROR = 'ERROR'
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  status: AgentStatus;
  lastActive?: string;
  model?: string;
  provider?: 'gemini' | 'openrouter';
  apiKey?: string;
  skills?: string[];
}

export interface Artifact {
  type: 'map' | 'image' | 'table';
  data: any;
}

export interface Message {
  id: string;
  agentId: string;
  missionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  artifact?: Artifact;
}

export interface Mission {
  id: string;
  agentId: string;
  title: string;
  timestamp: string;
  status: 'idle' | 'processing' | 'synthesizing' | 'completed' | 'failed';
  summary?: string;
  subAgents?: SubAgent[];
}

export interface SubAgent {
  id: string;
  type: 'ui_worker' | 'logic_agent' | 'integrity_verifier';
  status: AgentStatus;
  task: string;
  progress: number;
}

export interface AgentWorkspaceState {
  agents: Agent[];
  activeAgentId: string | null;
  messages: Message[];
}
