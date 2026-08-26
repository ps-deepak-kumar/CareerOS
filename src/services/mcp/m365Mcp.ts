import { Task } from '../../data/mockData';

export const m365Mcp = {
  get_teams_tasks: async (): Promise<Partial<Task>[]> => {
    return [
      { id: 'task-work-1', title: 'Fix authentication bug in gateway services', priority: 'high', estimatedTime: 2 },
      { id: 'task-work-2', title: 'Perform peer code reviews for v2 pull request', priority: 'medium', estimatedTime: 1.5 },
      { id: 'task-work-3', title: 'Complete MCP assignment implementation for engineering dashboard', priority: 'high', estimatedTime: 2.5 }
    ];
  },

  get_meetings: async (): Promise<any[]> => {
    return [
      { id: 'meet-1', title: 'M365 Integration Sync Meeting', time: '10:00 AM', duration: '60 min', organizer: 'Product Team' },
      { id: 'meet-2', title: 'Client Feedback Session - Agent Gateway', time: '2:00 PM', duration: '45 min', organizer: 'Sales Team' }
    ];
  },

  get_deadlines: async (): Promise<any[]> => {
    return [
      { id: 'dl-1', title: 'Complete Gateway QA Pipeline', date: '2026-08-14', importance: 'high' },
      { id: 'dl-2', title: 'Submit Sprint 3 Design Document', date: '2026-08-16', importance: 'medium' }
    ];
  },

  search_teams_messages: async (query: string): Promise<any[]> => {
    return [
      { sender: 'Sarah (Lead Engineer)', message: 'Make sure to integrate the new MCP tool specs in the code by Thursday.', channel: 'Core Engineering' },
      { sender: 'James (Project Manager)', message: 'Do we have the estimation for the gateway latency fixes?', channel: 'Standups' }
    ].filter(m => m.message.toLowerCase().includes(query.toLowerCase()) || m.sender.toLowerCase().includes(query.toLowerCase()));
  }
};
