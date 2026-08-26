import React, { useState, useEffect } from 'react';
import { Briefcase, MessageSquare, Calendar, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import { stateManager, getLocalDateString } from '../services/stateManager';
import { Task } from '../data/mockData';
import { microsoftGraphService } from '../services/microsoftGraphService';

export const WorkIntelligence: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<any[]>([
    { id: 'meet-1', title: 'M365 Integration Sync Meeting', time: '10:00 AM - 11:00 AM', organizer: 'Sarah C.', status: 'Syncing' },
    { id: 'meet-2', title: 'PR Code Review and Testing', time: '4:00 PM - 5:00 PM', organizer: 'Core Gateway', status: 'Upcoming' }
  ]);
  const [messages, setMessages] = useState<any[]>([
    { id: 'msg-1', sender: 'Sarah Connor (Lead Engineer)', message: 'Make sure the scaled dot-product masking formulas are checked in before Friday. We need correct causality on training runs.', channel: 'Core Engineering', time: '10:45 AM' },
    { id: 'msg-2', sender: 'Mark Zuckerberg (Product Manager)', message: 'Can you join the MCP Architecture sync at 2:00 PM today? We need to lock the JSON schemas.', channel: 'MCP General', time: '11:15 AM' },
    { id: 'msg-3', sender: 'Automated Build Bot', message: 'Build #394-gateway-auth passed core unit test criteria in 14.2s.', channel: 'DevOps Alerts', time: '12:05 PM' }
  ]);

  // Legacy iCalendar sync states
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isSyncingOld, setIsSyncingOld] = useState(false);
  const [syncMessageOld, setSyncMessageOld] = useState('');
  const [syncStatusOld, setSyncStatusOld] = useState<'success' | 'error' | ''>('');

  // Microsoft 365 Authentication & Graph state
  const [msAccount, setMsAccount] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | ''>('');
  const [msSyncTime, setMsSyncTime] = useState<string>('');
  const [msEventsFilter, setMsEventsFilter] = useState<'today' | '7days' | 'month'>('today');

  // Check on mount for active session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const account = await microsoftGraphService.getAccount();
        if (account) {
          setMsAccount(account);
          await fetchMsCalendar('today', account);
        }
      } catch (err) {
        console.error('Active Microsoft session restoration failed:', err);
      }
    };
    checkSession();
  }, []);

  const fetchWebhookData = async () => {
    try {
      const res = await fetch('http://localhost:3001/data');
      if (res.ok) {
        const data = await res.json();
        
        // Merge webhook tasks with local tasks, avoiding duplicates
        const localTasks = stateManager.getTasks();
        let stateUpdated = false;
        if (data.tasks && data.tasks.length > 0) {
          data.tasks.forEach((webTask: Task) => {
            if (!localTasks.some(t => t.id === webTask.id)) {
              localTasks.push({
                ...webTask,
                deadline: webTask.deadline || getLocalDateString()
              });
              stateUpdated = true;
            }
          });
        }
        if (stateUpdated) {
          stateManager.saveTasks(localTasks);
          window.dispatchEvent(new CustomEvent('tasks-updated'));
        }
        
        setTasks(localTasks.filter(t => t.category === 'work'));

        // Update messages list
        if (data.messages && data.messages.length > 0) {
          const defaultMessages = [
            { id: 'msg-1', sender: 'Sarah Connor (Lead Engineer)', message: 'Make sure the scaled dot-product masking formulas are checked in before Friday. We need correct causality on training runs.', channel: 'Core Engineering', time: '10:45 AM' },
            { id: 'msg-2', sender: 'Mark Zuckerberg (Product Manager)', message: 'Can you join the MCP Architecture sync at 2:00 PM today? We need to lock the JSON schemas.', channel: 'MCP General', time: '11:15 AM' },
            { id: 'msg-3', sender: 'Automated Build Bot', message: 'Build #394-gateway-auth passed core unit test criteria in 14.2s.', channel: 'DevOps Alerts', time: '12:05 PM' }
          ];
          const mergedMessages = [...defaultMessages];
          data.messages.forEach((webMsg: any) => {
            if (!mergedMessages.some(m => m.id === webMsg.id)) {
              mergedMessages.push(webMsg);
            }
          });
          setMessages(mergedMessages);
        }
      }
    } catch (err) {
      // Webhook server not running or network offline, fail silently
    }
  };

  useEffect(() => {
    fetchWebhookData();
    const pollInterval = setInterval(fetchWebhookData, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchMsCalendar = async (filterType: 'today' | '7days' | 'month', accountOverride?: any) => {
    const activeAcc = accountOverride || msAccount;
    if (!activeAcc) return;

    setIsSyncing(true);
    setSyncMessage('Fetching calendar events from Microsoft Graph...');
    setSyncStatus('');

    try {
      const events = await microsoftGraphService.fetchCalendarEvents(filterType);
      
      const localTasks = stateManager.getTasks();
      const defaultMeetings = [
        { id: 'meet-1', title: 'M365 Integration Sync Meeting', time: '10:00 AM - 11:00 AM', organizer: 'Sarah C.', status: 'Syncing' },
        { id: 'meet-2', title: 'PR Code Review and Testing', time: '4:00 PM - 5:00 PM', organizer: 'Core Gateway', status: 'Upcoming' }
      ];

      const newMeetings: any[] = [];
      let tasksSynced = 0;
      let meetingsSynced = 0;
      let stateUpdated = false;

      events.forEach((evt: any) => {
        const taskId = `task-ms-${evt.id}`;
        const meetId = `meet-ms-${evt.id}`;

        const start = new Date(evt.start.dateTime);
        const end = new Date(evt.end.dateTime);

        const formatTime = (date: Date) => {
          let hours = date.getHours();
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          return `${hours}:${minutes} ${ampm}`;
        };

        const startTimeStr = formatTime(start);
        const endTimeStr = formatTime(end);

        const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        const durationHours = Math.round((durationMinutes / 60) * 100) / 100;

        const dateStr = getLocalDateString(start);

        // 1. Create task entry (work, pending)
        if (!localTasks.some(t => t.id === taskId)) {
          localTasks.push({
            id: taskId,
            title: evt.subject || 'Untitled Microsoft Event',
            source: 'teams',
            estimatedTime: durationHours || 1,
            status: 'pending',
            priority: evt.importance === 'high' ? 'high' : 'medium',
            deadline: dateStr,
            timeOfDay: startTimeStr,
            category: 'work'
          });
          tasksSynced++;
          stateUpdated = true;
        }

        // 2. Create meeting entry
        newMeetings.push({
          id: meetId,
          title: evt.subject || 'Untitled Microsoft Event',
          time: `${startTimeStr} - ${endTimeStr}`,
          duration: `${durationMinutes} min`,
          organizer: evt.organizer?.emailAddress?.name || 'Unknown',
          status: evt.isCancelled ? 'Cancelled' : 'Synced',
          meetingUrl: evt.onlineMeeting?.joinUrl || undefined
        });
        meetingsSynced++;
      });

      if (stateUpdated) {
        stateManager.saveTasks(localTasks);
        window.dispatchEvent(new CustomEvent('tasks-updated'));
      }

      // Merge meetings
      const mergedMeetings = [...defaultMeetings];
      newMeetings.forEach(newMeet => {
        if (!mergedMeetings.some(m => m.id === newMeet.id)) {
          mergedMeetings.push(newMeet);
        }
      });

      setMeetings(mergedMeetings);
      setTasks(localTasks.filter(t => t.category === 'work'));
      setMsSyncTime(new Date().toLocaleTimeString());
      setSyncStatus('success');
      setSyncMessage(`Successfully synchronized ${tasksSynced} tasks and ${meetingsSynced} meetings from Microsoft Graph!`);

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Work Intelligence Agent',
        action: 'sync_microsoft_calendar',
        status: 'success',
        message: `Sync complete: synchronized ${tasksSynced} tasks and ${meetingsSynced} meetings.`,
        reasoning: `Queried Graph calendarView for range: ${filterType}.`,
        tool: 'microsoftGraphService.fetchCalendarEvents()'
      });
    } catch (err: any) {
      console.error('M365 sync error:', err);
      setSyncStatus('error');
      setSyncMessage(err?.message || 'Failed to synchronize with Microsoft Graph Calendar API.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectMicrosoft = async () => {
    setIsSyncing(true);
    setSyncMessage('Launching Microsoft Authentication...');
    setSyncStatus('');
    try {
      const account = await microsoftGraphService.login();
      setMsAccount(account);
      setSyncStatus('success');
      setSyncMessage(`Successfully connected to Microsoft account: ${account.username}`);
      
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Work Intelligence Agent',
        action: 'connect_microsoft_calendar',
        status: 'success',
        message: `Connected Microsoft account: ${account.username}`,
        reasoning: 'Acquired OAuth delegated scope permission for Microsoft Graph Calendars.',
        tool: 'msal.login()'
      });
      
      await fetchMsCalendar(msEventsFilter, account);
    } catch (err: any) {
      setSyncStatus('error');
      setSyncMessage(err?.message || 'Unable to connect to Microsoft Calendar. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectMicrosoft = async () => {
    setIsSyncing(true);
    try {
      await microsoftGraphService.logout();
      setMsAccount(null);
      setSyncStatus('');
      setSyncMessage('Successfully disconnected Microsoft account.');
      
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Work Intelligence Agent',
        action: 'disconnect_microsoft_calendar',
        status: 'warning',
        message: 'Disconnected Microsoft account integration.',
        reasoning: 'Revoked active memory tokens and cleared session contexts.'
      });
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Legacy sync function
  const handleSyncCalendarOld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarUrl.trim()) return;

    setIsSyncingOld(true);
    setSyncMessageOld('Connecting to iCalendar subscription gateway...');
    setSyncStatusOld('');

    try {
      const response = await fetch('http://localhost:3001/sync-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: calendarUrl })
      });

      if (response.ok) {
        const result = await response.json();
        setSyncStatusOld('success');
        setSyncMessageOld(`Synchronized ${result.tasksSynced} tasks and ${result.meetingsSynced} meetings from fallback calendar feed.`);
        
        stateManager.addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Work Intelligence Agent',
          action: 'sync_teams_calendar_legacy',
          status: 'success',
          message: `Synchronized ${result.tasksSynced} tasks and ${result.meetingsSynced} meetings from legacy iCalendar subscription.`,
          reasoning: 'Polled published ICS endpoint to align schedules.',
          tool: 'm365Mcp.sync_calendar()'
        });
        
        await fetchWebhookData();
      } else {
        const text = await response.text();
        setSyncStatusOld('error');
        setSyncMessageOld(`Failed to synchronize calendar: ${text}`);
      }
    } catch (err) {
      setSyncStatusOld('error');
      setSyncMessageOld('Network error: Could not reach calendar sync backend.');
    } finally {
      setIsSyncingOld(false);
    }
  };

  const handleUseMockOld = () => {
    setCalendarUrl('mock-teams-calendar');
    setSyncMessageOld('Prefilled mock Teams calendar subscription. Click Sync to fetch!');
    setSyncStatusOld('');
  };

  const handleToggleConnection = () => {
    setIsConnected(!isConnected);
    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Work Intelligence Agent',
      action: isConnected ? 'disconnect_teams' : 'connect_teams',
      status: isConnected ? 'warning' : 'success',
      message: isConnected 
        ? 'Teams planner exchange closed.' 
        : 'Teams planner exchange established. Fetching tasks...',
      reasoning: isConnected 
        ? 'Halted live telemetry sync handlers.'
        : 'Syncing local checklists with m365Mcp.get_teams_tasks().',
      tool: isConnected ? undefined : 'm365Mcp.get_teams_tasks()'
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Work Intelligence Integrations</h2>
          <p className="text-xs text-slate-550 mt-0.5 font-display">Manage tasks, meetings, and calendar sync channels with corporate platforms.</p>
        </div>

        {/* Sync switch */}
        <button 
          onClick={handleToggleConnection}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 select-none transition-all ${
            isConnected 
              ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400 font-display uppercase tracking-wider' 
              : 'border-slate-800 bg-slate-900/60 text-slate-500 font-display uppercase tracking-wider'
          }`}
        >
          {isConnected ? <ToggleRight className="text-emerald-450" size={18} /> : <ToggleLeft className="text-slate-700" size={18} />}
          <span>{isConnected ? 'Teams Active' : 'Sync Paused'}</span>
        </button>
      </div>

      {/* MICROSOFT 365 GRAPH CALENDAR CARD */}
      {isConnected && (
        <div className="glass-panel p-5 bg-[#0c0d15]/40 border-brand-border flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-brand-border/60 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <Calendar className="text-blue-400" size={16} />
            <h3 className="text-xs font-bold font-display text-white uppercase tracking-wider">Microsoft Teams / 365 Calendar Integration</h3>
          </div>

          {!msAccount ? (
            <div className="flex flex-col gap-3 items-center py-6 text-center">
              <p className="text-xs text-slate-405 max-w-md leading-relaxed">
                Connect your work or corporate Microsoft 365 account to dynamically import actual Outlook and Teams calendar items, schedulable tasks, and meeting coordination parameters.
              </p>
              <button
                onClick={handleConnectMicrosoft}
                disabled={isSyncing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded font-bold text-xs select-none font-display uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <span>Connect Microsoft Calendar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-center bg-slate-950/40 p-3 rounded border border-slate-900">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-550 uppercase font-mono font-bold">Integration Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-440 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connected
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-550 uppercase font-mono font-bold">Active Account</span>
                  <span className="text-white font-mono font-bold truncate" title={msAccount.username}>
                    {msAccount.username}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-555 uppercase font-mono font-bold">Last Synchronized</span>
                  <span className="text-slate-350 font-mono">
                    {msSyncTime || 'Never'}
                  </span>
                </div>
              </div>

              {/* Range Filters */}
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex bg-slate-900 border border-brand-border rounded p-0.5 select-none text-[10px]">
                  {(['today', '7days', 'month'] as const).map(filter => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setMsEventsFilter(filter);
                        fetchMsCalendar(filter);
                      }}
                      className={`px-3 py-1 rounded font-bold font-display tracking-wider uppercase transition-all ${
                        msEventsFilter === filter ? 'bg-blue-600 text-white shadow' : 'text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      {filter === 'today' ? 'Today' : filter === '7days' ? '7 Days' : 'This Month'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => fetchMsCalendar(msEventsFilter)}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded font-semibold text-[10px] text-slate-300 font-display uppercase tracking-wider transition-all"
                  >
                    Refresh Calendar
                  </button>
                  <button
                    onClick={handleDisconnectMicrosoft}
                    className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 rounded font-semibold text-[10px] text-red-400 font-display uppercase tracking-wider transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}

          {syncMessage && (
            <div className={`p-3 rounded text-xs border ${
              syncStatus === 'success' ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-400' :
              syncStatus === 'error' ? 'bg-red-950/20 border-red-900/35 text-red-400' :
              'bg-slate-900/40 border-slate-800 text-slate-350'
            }`}>
              {syncMessage}
            </div>
          )}
        </div>
      )}

      {/* FALLBACK LEGACY ICALENDAR SYNC PANEL */}
      {isConnected && (
        <div className="glass-panel p-5 bg-[#0c0d15]/40 border-brand-border/60">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-slate-500" size={16} />
            <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-wider">iCalendar Subscription Feed (Fallback Sync)</h3>
          </div>
          
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            Alternatively, subscribe to public/published calendars in `.ics` format. Note: This does not support online Microsoft Graph interactive authentication.
          </p>

          <form onSubmit={handleSyncCalendarOld} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
              placeholder="e.g. https://outlook.office365.com/owa/calendar/.../calendar.ics"
              className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500/40 flex-1"
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleUseMockOld}
                className="px-3 py-2 bg-slate-900 text-slate-355 hover:text-white rounded border border-slate-850 text-xs font-semibold select-none font-display uppercase tracking-wider transition-all"
              >
                Use Mock Calendar
              </button>
              <button 
                type="submit"
                disabled={isSyncingOld}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-semibold text-xs select-none font-display uppercase tracking-wider transition-all"
              >
                {isSyncingOld ? 'Syncing...' : 'Sync Calendar'}
              </button>
            </div>
          </form>

          {syncMessageOld && (
            <div className={`mt-3 p-3 rounded text-xs border ${
              syncStatusOld === 'success' ? 'bg-emerald-950/20 border-emerald-900/35 text-emerald-450' :
              syncStatusOld === 'error' ? 'bg-red-950/20 border-red-900/35 text-red-400' :
              'bg-slate-900/40 border-slate-800 text-slate-350'
            }`}>
              {syncMessageOld}
            </div>
          )}
        </div>
      )}

      {/* DOCKING CHANNELS */}
      {isConnected ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ASSIGNED TASKS */}
          <div className="glass-panel p-4 flex flex-col gap-4 bg-[#0c0d15]/40">
            <h3 className="text-xs font-bold font-display text-white border-b border-brand-border pb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase size={13} className="text-blue-400" />
              <span>Planner Tasks</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {tasks.map(task => (
                <div key={task.id} className="p-3 bg-slate-900/20 border border-brand-border rounded-lg flex items-start gap-2.5 text-xs text-slate-350">
                  <CheckCircle2 size={14} className={task.status === 'completed' ? 'text-emerald-500 mt-0.5' : 'text-slate-750 mt-0.5'} />
                  <div>
                    <h4 className={`font-semibold leading-snug ${task.status === 'completed' ? 'text-slate-500 line-through font-normal' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-mono mt-1 font-bold uppercase">Priority: {task.priority} • Est: {task.estimatedTime}h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CHATS */}
          <div className="glass-panel p-4 flex flex-col gap-4 bg-[#0c0d15]/40">
            <h3 className="text-xs font-bold font-display text-white border-b border-brand-border pb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare size={13} className="text-cyan-400" />
              <span>Important Chats</span>
            </h3>

            <div className="flex flex-col gap-3">
              {messages.map(msg => (
                <div key={msg.id} className="p-3 bg-slate-900/20 border border-brand-border rounded-lg flex flex-col gap-1 text-xs text-slate-350">
                  <div className="flex justify-between items-center text-[9px] text-slate-555 font-bold font-mono uppercase">
                    <span className="text-slate-300">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-slate-400 leading-normal mt-1 truncate" title={msg.message}>
                    {msg.message}
                  </p>
                  <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-900/25 px-1.5 py-0.2 rounded w-fit mt-1 font-mono">
                    #{msg.channel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* MEETINGS */}
          <div className="glass-panel p-4 flex flex-col gap-4 bg-[#0c0d15]/40">
            <h3 className="text-xs font-bold font-display text-white border-b border-brand-border pb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar size={13} className="text-indigo-405" />
              <span>Calendar Synchronizer</span>
            </h3>

            <div className="flex flex-col gap-3 text-xs text-slate-350">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-3 border border-brand-border rounded-lg bg-slate-900/20 flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white leading-snug">{meeting.title}</h4>
                    <p className="text-[9px] text-slate-500 mt-1">{meeting.time} • Organizer: {meeting.organizer}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[8px] text-slate-550 uppercase font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">{meeting.status}</span>
                    {meeting.meetingUrl && (
                      <a 
                        href={meeting.meetingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[8px] px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold font-mono tracking-wider uppercase transition-all select-none"
                      >
                        Join Teams
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* DISCONNECTED */
        <div className="glass-panel p-10 text-center flex flex-col items-center gap-4 bg-slate-900/10 border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-500 shadow-md">
            <Briefcase size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold font-display text-white uppercase tracking-wider">Exchange Sync Paused</h3>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Teams sync channel closed. Enable the connection switcher above to synchronize calendar items.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
export default WorkIntelligence;
