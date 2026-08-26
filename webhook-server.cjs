const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'src', 'data', 'webhookData.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks: [], meetings: [], messages: [] }, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/data') {
    try {
      const rawData = fs.readFileSync(DATA_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(rawData);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading data file');
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log('Received Webhook Payload:', payload);

        // Load existing data
        let currentData = { tasks: [], meetings: [], messages: [] };
        try {
          currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
          if (!currentData.messages) currentData.messages = [];
        } catch (e) {
          // fallback to defaults
        }

        if (payload.type === 'task') {
          const newTask = {
            id: `task-webhook-${Date.now()}`,
            title: payload.title || 'Untitled Task',
            source: 'custom',
            estimatedTime: Number(payload.estimatedTime) || 1,
            status: 'pending',
            priority: payload.priority || 'medium',
            deadline: new Date().toISOString().split('T')[0],
            category: 'work'
          };
          currentData.tasks.push(newTask);
        } else if (payload.type === 'meeting') {
          const newMeeting = {
            id: `meet-webhook-${Date.now()}`,
            title: payload.title || 'Untitled Meeting',
            time: payload.time || '12:00 PM',
            duration: payload.duration || '30 min',
            organizer: payload.organizer || 'Unknown Organizer',
            status: 'Upcoming'
          };
          currentData.meetings.push(newMeeting);
        } else if (payload.type === 'message') {
          const newMessage = {
            id: `msg-webhook-${Date.now()}`,
            sender: payload.sender || 'Unknown Sender',
            message: payload.message || '',
            channel: payload.channel || 'General Chats',
            time: payload.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          currentData.messages.push(newMessage);
        }

        // Save updated data
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Data saved successfully' }));
      } catch (err) {
        console.error('Error processing webhook:', err);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON payload or internal error');
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/sync-calendar') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const calendarUrl = payload.url;
        if (!calendarUrl) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing calendar URL');
          return;
        }

        let icsText = '';
        if (calendarUrl === 'mock-teams-calendar') {
          // Generate a mock iCalendar feed text dynamically matching today's actual date
          const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
          icsText = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN
BEGIN:VEVENT
SUMMARY:Refactor production-grade LangGraph agent servers
DTSTART:${todayStr}T100000Z
DTEND:${todayStr}T113000Z
ORGANIZER;CN=Sarah Connor (Lead Engineer):mailto:sarah@company.com
DESCRIPTION:Refactor critical auth schemas and telemetry channels.
END:VEVENT
BEGIN:VEVENT
SUMMARY:Complete gateway QA pipeline integration
DTSTART:${todayStr}T140000Z
DTEND:${todayStr}T150000Z
ORGANIZER;CN=Sarah Connor (Lead Engineer):mailto:sarah@company.com
DESCRIPTION:Perform pipeline check for security gateway auth patterns.
END:VEVENT
BEGIN:VEVENT
SUMMARY:Teams Architecture and MCP Sync
DTSTART:${todayStr}T160000Z
DTEND:${todayStr}T170000Z
ORGANIZER;CN=Mark Zuckerberg (Product Manager):mailto:mark@company.com
DESCRIPTION:Align on JSON schemas for MCP integrations.
END:VEVENT
END:VCALENDAR`;
        } else {
          // Fetch real published Teams/Outlook calendar link (ICS)
          icsText = await fetchUrlContent(calendarUrl);
        }

        const parsedEvents = parseICS(icsText);

        // Load existing data
        let currentData = { tasks: [], meetings: [], messages: [] };
        try {
          currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {}
        if (!currentData.tasks) currentData.tasks = [];
        if (!currentData.meetings) currentData.meetings = [];
        if (!currentData.messages) currentData.messages = [];

        let tasksSynced = 0;
        let meetingsSynced = 0;

        parsedEvents.forEach(evt => {
          // 1. Create a task entry
          const taskId = `task-cal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          // calculate estimated time in hours
          let durationHours = 1;
          if (evt.start && evt.end) {
            durationHours = Math.round(((evt.end - evt.start) / (1000 * 60 * 60)) * 100) / 100;
          }
          
          let timeOfDayFormatted = '12:00 PM';
          if (evt.start) {
            let hours = evt.start.getHours();
            const minutes = evt.start.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            timeOfDayFormatted = `${hours}:${minutes} ${ampm}`;
          }
            
          const deadlineFormatted = evt.start
            ? evt.start.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          // Check duplicate
          if (!currentData.tasks.some(t => t.title === evt.title && t.deadline === deadlineFormatted)) {
            currentData.tasks.push({
              id: taskId,
              title: evt.title || 'Untitled Sync Task',
              source: 'teams',
              estimatedTime: durationHours || 1,
              status: 'pending',
              priority: 'medium',
              deadline: deadlineFormatted,
              timeOfDay: timeOfDayFormatted,
              category: 'work'
            });
            tasksSynced++;
          }

          // 2. Create a meeting entry
          const meetId = `meet-cal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          let endTimeFormatted = '1:00 PM';
          if (evt.end) {
            let hours = evt.end.getHours();
            const minutes = evt.end.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            endTimeFormatted = `${hours}:${minutes} ${ampm}`;
          }
          const meetTimeFormatted = `${timeOfDayFormatted} - ${endTimeFormatted}`;

          if (!currentData.meetings.some(m => m.title === evt.title && m.time.startsWith(timeOfDayFormatted))) {
            currentData.meetings.push({
              id: meetId,
              title: evt.title || 'Untitled Meeting',
              time: meetTimeFormatted,
              duration: evt.start && evt.end ? `${Math.round((evt.end - evt.start) / 60000)} min` : '60 min',
              organizer: evt.organizer || 'Unknown Organizer',
              status: 'Synced'
            });
            meetingsSynced++;
          }
        });

        // Save updated data
        fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, tasksSynced, meetingsSynced }));
      } catch (err) {
        console.error('Error processing calendar sync:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal error: ${err.message}`);
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

const https = require('https');

function fetchUrlContent(urlStr) {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https') ? https : http;
    client.get(urlStr, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Failed to fetch calendar. HTTP Status Code: ${res.statusCode}`));
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', (err) => reject(err));
  });
}

function parseICS(icsText) {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let currentEvent = null;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Handle folded lines
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      line += lines[i + 1].substring(1);
      i++;
    }
    
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.title) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const keyPart = line.substring(0, colonIdx);
        const value = line.substring(colonIdx + 1);
        const key = keyPart.split(';')[0];
        
        if (key === 'SUMMARY') {
          currentEvent.title = value.trim();
        } else if (key === 'DTSTART') {
          currentEvent.start = parseICSDate(value.trim());
        } else if (key === 'DTEND') {
          currentEvent.end = parseICSDate(value.trim());
        } else if (key === 'UID') {
          currentEvent.uid = value.trim();
        } else if (key === 'ORGANIZER') {
          const cnMatch = keyPart.match(/CN=([^;:]+)/);
          currentEvent.organizer = cnMatch ? cnMatch[1].trim() : value.trim();
        }
      }
    }
  }
  return events;
}

function parseICSDate(icsDateStr) {
  const clean = icsDateStr.replace(/[^0-9T]/g, '');
  if (clean.length >= 8) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    let dateStr = `${y}-${m}-${d}`;
    if (clean.includes('T') && clean.length >= 15) {
      const h = clean.substring(9, 11);
      const min = clean.substring(11, 13);
      const s = clean.substring(13, 15);
      dateStr += `T${h}:${min}:${s}Z`;
    }
    return new Date(dateStr);
  }
  return new Date(icsDateStr);
}

server.listen(PORT, () => {
  console.log(`Webhook server is running on http://localhost:${PORT}`);
});
