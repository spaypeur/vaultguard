import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button, Form, Select, Alert, Progress, Upload } from 'antd';
import { UploadOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/lib/upload/interface';

interface ZkComplianceProps {
  jurisdiction: string;
  onVerificationComplete?: (verified: boolean) => void;
}

const ZkComplianceVerification: React.FC<ZkComplianceProps> = ({ 
  jurisdiction,
  onVerificationComplete
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [documents, setDocuments] = useState<{ name: string, content: string }[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);

  // Load jurisdiction requirements
  useEffect(() => {
    const loadRequirements = async () => {
      try {
        const response = await axios.get(`/api/compliance/requirements?jurisdiction=${jurisdiction}`);
        setRequirements(response.data.requirements || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load requirements');
      }
    };

    loadRequirements();
  }, [jurisdiction]);

  // Handle document upload
  const handleDocumentUpload = async (file: UploadFile) => {
    try {
      const fileObj = file.originFileObj as RcFile;
      if (!fileObj) {
        throw new Error('No file data available');
      }

      setUploading(true);
      
      // Read file content
      const reader = new FileReader();
      const content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(fileObj);
      });

      setDocuments([...documents, { name: file.name, content }]);
      setUploading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      setUploading(false);
    }
  };

  // Start verification process
  const startVerification = async () => {
    try {
      setLoading(true);
      setVerifying(true);
      setProgress(0);
      setError(null);

      // Step 1: Generate verification request
      setProgress(20);
      const requestResponse = await axios.post('/api/compliance/zk/request', {
        userId: user?.id,
        jurisdiction,
        requirements
      });

      // Step 2: Generate zero-knowledge proof
      setProgress(40);
      const proofResponse = await axios.post('/api/compliance/zk/proof', {
        verification: requestResponse.data,
        privateData: {
          documents,
          userId: user?.id
        }
      });

      // Step 3: Verify the proof
      setProgress(80);
      const verificationResponse = await axios.post('/api/compliance/zk/verify', {
        jurisdiction,
        requirements,
        proof: proofResponse.data
      });

      setProgress(100);
      setSuccess(true);
      setVerifying(false);
      setLoading(false);

      if (onVerificationComplete) {
        onVerificationComplete(verificationResponse.data.isValid);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setVerifying(false);
      setLoading(false);
    }
  };

  const isReadyToVerify = documents.length > 0 && requirements.length > 0;

  return (
    <Card title="Zero-Knowledge Compliance Verification" className="shadow-lg">
      <div className="space-y-6">
        {/* Requirements Section */}
        <div>
          <h3 className="font-medium mb-2">Jurisdiction Requirements</h3>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select requirements"
            value={requirements}
            onChange={setRequirements}
            options={requirements.map(r => ({ label: r, value: r }))}
          />
        </div>

        {/* Document Upload Section */}
        <div>
          <h3 className="font-medium mb-2">Document Upload</h3>
          <Form.Item>
            <Upload.Dragger
              name="documents"
              multiple
              beforeUpload={(file) => {
                handleDocumentUpload(file);
                return false; // Prevent default upload behavior
              }}
              showUploadList={true}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag files to upload
              </p>
            </Upload.Dragger>
          </Form.Item>
        </div>

        {/* Progress and Status Section */}
        {verifying && (
          <div className="my-4">
            <Progress percent={progress} status="active" />
          </div>
        )}

        {success && (
          <Alert
            message="Verification Successful"
            description="Your compliance has been verified using zero-knowledge proofs."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        )}

        {error && (
          <Alert
            message="Verification Failed"
            description={error}
            type="error"
            showIcon
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="default"
            onClick={() => {
              setDocuments([]);
              setSuccess(false);
              setError(null);
            }}
            disabled={loading}
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SafetyOutlined />}
            onClick={startVerification}
            loading={loading}
            disabled={!isReadyToVerify || loading}
          >
            Start Verification
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ZkComplianceVerification;