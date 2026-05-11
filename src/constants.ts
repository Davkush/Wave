import { Agent, AgentStatus } from './types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'wave-prime',
    name: 'Wave Prime',
    role: 'Orchestrator',
    description: 'The master agent for coordinating complex tasks and delegation.',
    color: '#c5a059', // Gold Accent
    status: AgentStatus.IDLE,
    lastActive: new Date().toISOString(),
    model: 'gemini-2.0-flash',
    skills: ['Task Delegation', 'System Monitoring', 'Conflict Resolution']
  },
  {
    id: 'code-surge',
    name: 'Code Surge',
    role: 'Senior Developer',
    description: 'Expert in system architecture, debugging, and advanced refactoring.',
    color: '#e0e0e0', // Silver/White
    status: AgentStatus.IDLE,
    lastActive: new Date().toISOString(),
    model: 'gemini-1.5-pro',
    skills: ['Live Debugging', 'Architecture Mapping', 'Security Patching']
  },
  {
    id: 'logic-flow',
    name: 'Logic Flow',
    role: 'Analyst',
    description: 'Specializes in logic verification, data analysis, and documentation.',
    color: '#8b8d98', // Muted Slate
    status: AgentStatus.IDLE,
    lastActive: new Date().toISOString(),
    model: 'gemini-1.5-flash',
    skills: ['Market Analysis', 'Search Grounding', 'Data Synthesis']
  }
];

export const SYSTEM_COLORS = {
  bg: '#0a0a0b',
  card: '#121214',
  border: 'rgba(255,255,255,0.08)',
  accent: '#c5a059',
  textSecondary: '#8b8d98'
};
