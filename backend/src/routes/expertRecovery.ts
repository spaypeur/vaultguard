import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Joi from 'joi';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { Logger } from '@/utils/logger';

const router = Router();
const logger = new Logger('expert-recovery-routes');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const opsec = req.body.opsec || 'private';
    const uploadPath = path.join(__dirname, '../../uploads', opsec);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// In-memory storage for demo purposes (replace with database)
let targets: any[] = [];
let playbooks: any[] = [];
let evidences: any[] = [];

// Validation schemas
const targetSchema = Joi.object({
  label: Joi.string().required(),
  description: Joi.string().required(),
  opsec: Joi.string().valid('private', 'shared').default('private'),
});

const noteSchema = Joi.object({
  note: Joi.string().required(),
});

const evidenceSchema = Joi.object({
  targetId: Joi.string().required(),
  opsec: Joi.string().valid('private', 'shared').default('private'),
});

// Get targets
router.get('/targets', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { opsec = 'private' } = req.query;
    const userTargets = targets.filter(t => t.userId === req.user!.id && t.opsec === opsec);

    res.json({
      success: true,
      data: userTargets,
      message: 'Targets retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get targets error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve targets'
    } as ApiResponse);
  }
});

// Create target
router.post('/targets', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { error, value } = targetSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      } as ApiResponse);
      return;
    }

    const newTarget = {
      id: Date.now().toString(),
      userId: req.user.id,
      label: value.label,
      description: value.description,
      opsec: value.opsec,
      status: 'active',
      createdAt: new Date(),
      notes: [] as string[]
    };

    targets.push(newTarget);

    res.status(201).json({
      success: true,
      data: newTarget,
      message: 'Target created successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Create target error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create target'
    } as ApiResponse);
  }
});

// Add note to target
router.post('/targets/:targetId/notes', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { targetId } = req.params;
    const target = targets.find(t => t.id === targetId && t.userId === req.user!.id);

    if (!target) {
      res.status(404).json({ success: false, error: 'Target not found' } as ApiResponse);
      return;
    }

    const { error, value } = noteSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      } as ApiResponse);
      return;
    }

    target.notes.push(value.note);

    res.json({
      success: true,
      data: target,
      message: 'Note added successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add note'
    } as ApiResponse);
  }
});

// Get evidence
router.get('/evidence', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { targetId, opsec = 'private' } = req.query;
    let userEvidence = evidences.filter(e => e.userId === req.user!.id && e.opsec === opsec);

    if (targetId) {
      userEvidence = userEvidence.filter(e => e.targetId === targetId);
    }

    res.json({
      success: true,
      data: userEvidence,
      message: 'Evidence retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get evidence error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve evidence'
    } as ApiResponse);
  }
});

// Upload evidence
router.post('/evidence', upload.single('evidence'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' } as ApiResponse);
      return;
    }

    const { targetId, opsec = 'private' } = req.body;

    const newEvidence = {
      id: Date.now().toString(),
      userId: req.user.id,
      targetId,
      filename: req.file.originalname,
      filepath: req.file.path,
      opsec,
      uploadedAt: new Date()
    };

    evidences.push(newEvidence);

    res.status(201).json({
      success: true,
      data: newEvidence,
      message: 'Evidence uploaded successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Upload evidence error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload evidence'
    } as ApiResponse);
  }
});

// Download evidence
router.get('/evidence/:evidenceId/download', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { evidenceId } = req.params;
    const evidence = evidences.find(e => e.id === evidenceId && e.userId === req.user!.id);

    if (!evidence) {
      res.status(404).json({ success: false, error: 'Evidence not found' } as ApiResponse);
      return;
    }

    if (!fs.existsSync(evidence.filepath)) {
      res.status(404).json({ success: false, error: 'File not found on disk' } as ApiResponse);
      return;
    }

    res.download(evidence.filepath, evidence.filename);
  } catch (error: any) {
    logger.error('Download evidence error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download evidence'
    } as ApiResponse);
  }
});

// Get playbooks
router.get('/playbooks', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { opsec = 'private' } = req.query;
    const userPlaybooks = playbooks.filter(p => p.userId === req.user!.id && p.opsec === opsec);

    res.json({
      success: true,
      data: userPlaybooks,
      message: 'Playbooks retrieved successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Get playbooks error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve playbooks'
    } as ApiResponse);
  }
});

// Upload playbook
router.post('/playbooks', upload.single('playbook'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' } as ApiResponse);
      return;
    }

    const { name, description, opsec = 'private' } = req.body;

    const newPlaybook = {
      id: Date.now().toString(),
      userId: req.user.id,
      name: name || req.file.originalname,
      description: description || '',
      filename: req.file.originalname,
      filepath: req.file.path,
      opsec,
      uploadedAt: new Date()
    };

    playbooks.push(newPlaybook);

    res.status(201).json({
      success: true,
      data: newPlaybook,
      message: 'Playbook uploaded successfully'
    } as ApiResponse);
  } catch (error: any) {
    logger.error('Upload playbook error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload playbook'
    } as ApiResponse);
  }
});

// Download playbook
router.get('/playbooks/:playbookId/download', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' } as ApiResponse);
      return;
    }

    const { playbookId } = req.params;
    const playbook = playbooks.find(p => p.id === playbookId && p.userId === req.user!.id);

    if (!playbook) {
      res.status(404).json({ success: false, error: 'Playbook not found' } as ApiResponse);
      return;
    }

    if (!fs.existsSync(playbook.filepath)) {
      res.status(404).json({ success: false, error: 'File not found on disk' } as ApiResponse);
      return;
    }

    res.download(playbook.filepath, playbook.filename);
  } catch (error: any) {
    logger.error('Download playbook error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download playbook'
    } as ApiResponse);
  }
});

export default router;
