import { useEffect, useState } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ThreatEvent {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function ThreatFeed() {
  const [events, setEvents] = useState<ThreatEvent[]>([]);

  useEffect(() => {
    // Simulate real-time threat feed
    const threats = [
      { type: 'BLOCKED', message: 'Phishing attempt blocked from 192.168.1.1', severity: 'high' as const },
      { type: 'SECURED', message: 'Wallet transaction verified and secured', severity: 'low' as const },
      { type: 'ALERT', message: 'Unusual login pattern detected', severity: 'medium' as const },
      { type: 'BLOCKED', message: 'Malicious contract interaction prevented', severity: 'critical' as const },
      { type: 'SECURED', message: 'Multi-sig transaction approved', severity: 'low' as const },
      { type: 'ALERT', message: 'High-value transfer initiated', severity: 'medium' as const },
    ];

    const interval = setInterval(() => {
      const randomThreat = threats[Math.floor(Math.random() * threats.length)];
      const newEvent: ThreatEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomThreat.type,
        message: randomThreat.message,
        timestamp: new Date(),
        severity: randomThreat.severity,
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 border-red-500/50';
      case 'high': return 'text-orange-400 border-orange-500/50';
      case 'medium': return 'text-yellow-400 border-yellow-500/50';
      case 'low': return 'text-green-400 border-green-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const getIcon = (type: string) => {
    return type === 'BLOCKED' || type === 'ALERT' ? 
      <ExclamationTriangleIcon className="w-4 h-4" /> : 
      <ShieldCheckIcon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-wider">
          Live Threat Feed
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-mono">ACTIVE</span>
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`
              flex items-start gap-3 p-3 rounded border-l-2 
              bg-gray-900/50 backdrop-blur-sm
              ${getSeverityColor(event.severity)}
              animate-slide-in
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`mt-0.5 ${getSeverityColor(event.severity)}`}>
              {getIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono font-bold ${getSeverityColor(event.severity)}`}>
                  {event.type}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-300 font-mono">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}