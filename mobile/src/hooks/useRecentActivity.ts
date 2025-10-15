import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  severity?: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Subscribe to various activity updates
    socketService.subscribeThreatAlerts((threat) => {
      addActivity({
        id: threat.id,
        type: 'threat',
        title: threat.title,
        description: threat.description,
        timestamp: new Date(),
        severity: threat.severity,
      });
    });

    socketService.subscribePortfolioUpdates('general', (update) => {
      addActivity({
        id: update.id,
        type: 'portfolio',
        title: 'Portfolio Update',
        description: `${update.type}: ${update.description}`,
        timestamp: new Date(),
      });
    });

    socketService.subscribeComplianceUpdates((update) => {
      addActivity({
        id: update.id,
        type: 'compliance',
        title: 'Compliance Update',
        description: update.description,
        timestamp: new Date(),
      });
    });

    return () => {
      socketService.unsubscribeThreatAlerts();
      socketService.unsubscribePortfolioUpdates();
      socketService.unsubscribeComplianceUpdates();
    };
  }, []);

  const addActivity = (activity: Activity) => {
    setActivities((current) => {
      const updated = [activity, ...current].slice(0, 20); // Keep last 20 activities
      return updated;
    });
  };

  return activities;
}