import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Alert, Spin } from 'antd';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import ZkComplianceVerification from '@/components/ZkComplianceVerification';
import { SafetyOutlined, LockOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const ComplianceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState(user?.jurisdiction || 'US');

  // Fetch compliance statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/compliance/summary/overview');
        setStats(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load compliance statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Handle successful verification
  const handleVerificationComplete = async (verified: boolean) => {
    if (verified) {
      // Reload stats to reflect the new verification
      try {
        const response = await axios.get('/api/compliance/summary/overview');
        setStats(response.data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to refresh statistics');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout.Content className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Compliance Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage your compliance requirements with zero-knowledge verification.
          </p>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {/* Statistics Overview */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Requirements"
                value={stats?.total || 0}
                prefix={<SafetyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Zero-Knowledge Verified"
                value={stats?.zkCompliance?.verified || 0}
                prefix={<LockOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Compliant"
                value={stats?.byStatus?.approved || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats?.byStatus?.pending || 0}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Zero-Knowledge Verification Section */}
        <Row gutter={16}>
          <Col span={24}>
            <ZkComplianceVerification
              jurisdiction={jurisdiction}
              onVerificationComplete={handleVerificationComplete}
            />
          </Col>
        </Row>
      </div>
    </Layout.Content>
  );
};

export default ComplianceDashboard;