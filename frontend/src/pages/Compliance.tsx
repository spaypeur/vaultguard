import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DocumentCheckIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  dueDate?: string;
  jurisdiction: string;
  framework: string;
  priority: 'high' | 'medium' | 'low';
  lastChecked: string;
  evidence?: string[];
}

export default function Compliance() {
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');
  const queryClient = useQueryClient();

  // Fetch compliance requirements
  const { data: requirements, isLoading } = useQuery({
    queryKey: ['compliance', 'requirements', selectedFramework, selectedJurisdiction],
    queryFn: async () => {
      const { data } = await api.get('/compliance/requirements', {
        params: { framework: selectedFramework, jurisdiction: selectedJurisdiction }
      });
      return data.data;
    },
  });

  // Fetch compliance statistics
  const { data: stats } = useQuery({
    queryKey: ['compliance', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/compliance/stats');
      return data.data;
    },
  });

  // Update compliance status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, evidence }: { id: string; status: string; evidence?: string[] }) => {
      const { data } = await api.put(`/compliance/requirements/${id}`, { status, evidence });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'non_compliant':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ShieldCheckIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-400 bg-green-900/20';
      case 'non_compliant':
        return 'text-red-400 bg-red-900/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-900/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'low':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Compliance Center</h1>
            <p className="mt-2 text-gray-400">Manage regulatory compliance across all jurisdictions</p>
          </div>
          <Link to="/compliance/dashboard" className="btn btn-primary">
            <ChartPieIcon className="h-5 w-5 mr-2" />
            Compliance Dashboard
          </Link>
        </div>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Compliant</p>
                <p className="text-2xl font-bold text-white">{stats.compliant}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Non-Compliant</p>
                <p className="text-2xl font-bold text-white">{stats.nonCompliant}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center">
              <DocumentCheckIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Requirements</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label">
              <span className="label-text">Framework</span>
            </label>
            <select 
              className="select select-bordered"
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
            >
              <option value="all">All Frameworks</option>
              <option value="SOX">SOX</option>
              <option value="PCI-DSS">PCI-DSS</option>
              <option value="GDPR">GDPR</option>
              <option value="CCPA">CCPA</option>
              <option value="HIPAA">HIPAA</option>
              <option value="SOC2">SOC 2</option>
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Jurisdiction</span>
            </label>
            <select 
              className="select select-bordered"
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
            >
              <option value="all">All Jurisdictions</option>
              <option value="US">United States</option>
              <option value="EU">European Union</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="SG">Singapore</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compliance Requirements */}
      <div className="space-y-4">
        {requirements?.map((requirement: ComplianceRequirement) => (
          <div key={requirement.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(requirement.status)}
                  <h3 className="text-lg font-semibold text-white">{requirement.name}</h3>
                  <span className={`badge ${getStatusColor(requirement.status)}`}>
                    {requirement.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`badge ${getPriorityColor(requirement.priority)}`}>
                    {requirement.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{requirement.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Framework: {requirement.framework}</span>
                  <span>Jurisdiction: {requirement.jurisdiction}</span>
                  <span>Last checked: {new Date(requirement.lastChecked).toLocaleDateString()}</span>
                  {requirement.dueDate && (
                    <span className="text-yellow-400">
                      Due: {new Date(requirement.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => updateStatusMutation.mutate({ 
                    id: requirement.id, 
                    status: 'compliant' 
                  })}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Compliant
                </button>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => updateStatusMutation.mutate({ 
                    id: requirement.id, 
                    status: 'non_compliant' 
                  })}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Non-Compliant
                </button>
              </div>
            </div>
            {requirement.evidence && requirement.evidence.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Evidence:</h4>
                <div className="flex flex-wrap gap-2">
                  {requirement.evidence.map((evidence, index) => (
                    <span key={index} className="badge badge-outline">
                      {evidence}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {requirements?.length === 0 && (
        <div className="card text-center py-12">
          <DocumentCheckIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No compliance requirements found</h3>
          <p className="text-gray-400">Try adjusting your filters or contact support to set up compliance monitoring.</p>
        </div>
      )}
    </div>
  );
}
