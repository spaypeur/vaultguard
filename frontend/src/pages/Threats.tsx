import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BellAlertIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Threat {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  detectedAt: string;
  sourceIp?: string;
  sourceLocation?: string;
  indicators?: string[];
  metadata?: any;
}

interface ThreatStats {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recent: Threat[];
  unresolved: number;
}

export default function Threats() {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [showIntelligence, setShowIntelligence] = useState(false);

  const queryClient = useQueryClient();

  // Fetch threats
  const { data: threats, isLoading: threatsLoading } = useQuery({
    queryKey: ['threats'],
    queryFn: async () => {
      const { data } = await api.get('/threats');
      return data.data;
    },
  });

  // Fetch threat stats
  const { data: threatStats } = useQuery({
    queryKey: ['threats', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/threats/stats');
      return data.data as ThreatStats;
    },
  });

  // Fetch threat intelligence
  const { data: intelligence } = useQuery({
    queryKey: ['threats', 'intelligence'],
    queryFn: async () => {
      const { data } = await api.get('/threats/intelligence');
      return data.data;
    },
    enabled: showIntelligence,
  });

  // Update threat status mutation
  const updateThreatStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/threats/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['threats', 'stats'] });
      toast.success('Threat status updated');
      setSelectedThreat(null);
    },
    onError: () => {
      toast.error('Failed to update threat status');
    },
  });

  // Real-time threat detection
  const detectThreatMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/threats/detect');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['threats', 'stats'] });
      toast.success('Threat detection scan completed');
    },
    onError: () => {
      toast.error('Failed to run threat detection');
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900 border-red-800';
      case 'high': return 'text-orange-400 bg-orange-900 border-orange-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900 border-yellow-800';
      case 'low': return 'text-green-400 bg-green-900 border-green-800';
      default: return 'text-gray-400 bg-gray-900 border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400';
      case 'investigating': return 'text-yellow-400';
      case 'confirmed': return 'text-red-400';
      case 'detected': return 'text-blue-400';
      case 'false_positive': return 'text-gray-400';
      case 'ignored': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Threat Monitoring</h1>
        <div className="flex gap-3">
          <button
            onClick={() => detectThreatMutation.mutate()}
            disabled={detectThreatMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <PlayCircleIcon className="w-4 h-4" />
            {detectThreatMutation.isPending ? 'Scanning...' : 'Run Threat Scan'}
          </button>
          <button
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={`btn-secondary flex items-center gap-2 ${
              showIntelligence ? 'bg-primary-500 hover:bg-primary-600' : ''
            }`}
          >
            <DocumentTextIcon className="w-4 h-4" />
            Intelligence
          </button>
        </div>
      </div>

      {/* Threat Statistics */}
      {threatStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Threats</p>
                <p className="text-2xl font-bold text-white">{threatStats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Unresolved</p>
                <p className="text-2xl font-bold text-white">{threatStats.unresolved}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <BellAlertIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">High Severity</p>
                <p className="text-2xl font-bold text-white">
                  {(threatStats.bySeverity.high || 0) + (threatStats.bySeverity.critical || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-white">{threatStats.byStatus.resolved || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Threat Intelligence Feed */}
      {showIntelligence && intelligence && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Threat Intelligence</h2>
          </div>
          <div className="space-y-4">
            {intelligence.map((item: any) => (
              <div key={item.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Affected: {item.affectedRegions?.join(', ') || 'Global'}</span>
                  <span>Mitigation: {item.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Threats */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Threats</h2>
          <div className="text-sm text-gray-400">
            {threatStats?.unresolved || 0} active threats
          </div>
        </div>

        {threatsLoading ? (
          <div className="text-center py-12 text-gray-400">Loading threats...</div>
        ) : threats?.length > 0 ? (
          <div className="space-y-4">
            {threats.map((threat: Threat) => (
              <div
                key={threat.id}
                className="border border-gray-700 rounded-lg p-4 bg-gray-800/50 hover:bg-gray-800/70 cursor-pointer transition-colors"
                onClick={() => setSelectedThreat(threat)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white">{threat.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(threat.severity)}`}>
                        {threat.severity}
                      </span>
                      <span className={`text-sm ${getStatusColor(threat.status)} capitalize`}>
                        {threat.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{threat.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {formatDate(threat.detectedAt)}
                      </span>
                      <span>Type: {threat.type.replace('_', ' ')}</span>
                      {threat.sourceIp && <span>IP: {threat.sourceIp}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateThreatStatusMutation.mutate({ id: threat.id, status: 'investigating' });
                      }}
                      className="p-2 text-yellow-400 hover:bg-yellow-400 hover:bg-opacity-20 rounded"
                      title="Mark as investigating"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateThreatStatusMutation.mutate({ id: threat.id, status: 'resolved' });
                      }}
                      className="p-2 text-green-400 hover:bg-green-400 hover:bg-opacity-20 rounded"
                      title="Mark as resolved"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateThreatStatusMutation.mutate({ id: threat.id, status: 'false_positive' });
                      }}
                      className="p-2 text-gray-400 hover:bg-gray-400 hover:bg-opacity-20 rounded"
                      title="Mark as false positive"
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShieldCheckIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No threats detected</h3>
            <p className="text-gray-400 mb-4">Your system is currently secure</p>
            <button
              onClick={() => detectThreatMutation.mutate()}
              disabled={detectThreatMutation.isPending}
              className="btn-primary"
            >
              Run Threat Detection Scan
            </button>
          </div>
        )}
      </div>

      {/* Threat Details Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Threat Details</h3>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <p className="text-white capitalize">{selectedThreat.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Severity</label>
                  <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(selectedThreat.severity)}`}>
                    {selectedThreat.severity}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <span className={`text-sm ${getStatusColor(selectedThreat.status)} capitalize`}>
                    {selectedThreat.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Detected At</label>
                  <p className="text-white">{formatDate(selectedThreat.detectedAt)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400">Title</label>
                <p className="text-white font-medium">{selectedThreat.title}</p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Description</label>
                <p className="text-white">{selectedThreat.description}</p>
              </div>

              {selectedThreat.sourceIp && (
                <div>
                  <label className="text-sm text-gray-400">Source IP</label>
                  <p className="text-white font-mono">{selectedThreat.sourceIp}</p>
                </div>
              )}

              {selectedThreat.indicators && (
                <div>
                  <label className="text-sm text-gray-400">Indicators</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedThreat.indicators.map((indicator: string, index: number) => (
                      <span key={index} className="text-xs bg-gray-800 px-2 py-1 rounded">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedThreat.metadata && (
                <div>
                  <label className="text-sm text-gray-400">Additional Data</label>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedThreat.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
