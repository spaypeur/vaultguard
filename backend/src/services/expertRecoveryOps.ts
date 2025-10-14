import { Logger } from '../utils/logger';
import { DatabaseService } from './database';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export interface ExpertTarget {
  id: string;
  label: string;
  description: string;
  status: 'open' | 'in_progress' | 'recovered' | 'failed';
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
  opsec: 'private' | 'shared';
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  filename: string;
  uploadedAt: Date;
  opsec: 'private' | 'shared';
}

export interface Evidence {
  id: string;
  targetId: string;
  filename: string;
  uploadedAt: Date;
  opsec: 'private' | 'shared';
}

export class ExpertRecoveryOps {
  private logger = new Logger('ExpertRecoveryOps');
  private targets: Map<string, ExpertTarget> = new Map();
  private playbooks: Map<string, Playbook> = new Map();
  private evidence: Map<string, Evidence> = new Map();
  private readonly evidenceDir = path.join(__dirname, '../../evidence');
  private readonly playbookDir = path.join(__dirname, '../../playbooks');

  constructor() {
    if (!fs.existsSync(this.evidenceDir)) fs.mkdirSync(this.evidenceDir, { recursive: true });
    if (!fs.existsSync(this.playbookDir)) fs.mkdirSync(this.playbookDir, { recursive: true });
  }

  // Target Management
  public createTarget(label: string, description: string, opsec: 'private' | 'shared'): ExpertTarget {
    const id = uuidv4();
    const now = new Date();
    const target: ExpertTarget = { id, label, description, status: 'open', notes: [], createdAt: now, updatedAt: now, opsec };
    this.targets.set(id, target);
    this.logAction('create_target', { target });
    return target;
  }
  public updateTarget(id: string, updates: Partial<ExpertTarget>): ExpertTarget | null {
    const target = this.targets.get(id);
    if (!target) return null;
    Object.assign(target, updates, { updatedAt: new Date() });
    this.targets.set(id, target);
    this.logAction('update_target', { target });
    return target;
  }
  public getTarget(id: string): ExpertTarget | null {
    return this.targets.get(id) || null;
  }
  public listTargets(opsec: 'private' | 'shared'): ExpertTarget[] {
    return Array.from(this.targets.values()).filter(t => t.opsec === opsec);
  }
  public addTargetNote(id: string, note: string): boolean {
    const target = this.targets.get(id);
    if (!target) return false;
    target.notes.push(note);
    target.updatedAt = new Date();
    this.logAction('add_target_note', { targetId: id, note });
    return true;
  }

  // Playbook Management
  public uploadPlaybook(name: string, description: string, fileBuffer: Buffer, filename: string, opsec: 'private' | 'shared'): Playbook {
    const id = uuidv4();
    const filePath = path.join(this.playbookDir, filename);
    fs.writeFileSync(filePath, fileBuffer);
    const playbook: Playbook = { id, name, description, filename, uploadedAt: new Date(), opsec };
    this.playbooks.set(id, playbook);
    this.logAction('upload_playbook', { playbook });
    return playbook;
  }
  public listPlaybooks(opsec: 'private' | 'shared'): Playbook[] {
    return Array.from(this.playbooks.values()).filter(p => p.opsec === opsec);
  }
  public getPlaybookFile(id: string): Buffer | null {
    const playbook = this.playbooks.get(id);
    if (!playbook) return null;
    const filePath = path.join(this.playbookDir, playbook.filename);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath);
  }

  // Evidence Vault
  public uploadEvidence(targetId: string, fileBuffer: Buffer, filename: string, opsec: 'private' | 'shared'): Evidence {
    const id = uuidv4();
    const filePath = path.join(this.evidenceDir, filename);
    fs.writeFileSync(filePath, fileBuffer);
    const evidence: Evidence = { id, targetId, filename, uploadedAt: new Date(), opsec };
    this.evidence.set(id, evidence);
    this.logAction('upload_evidence', { evidence });
    return evidence;
  }
  public listEvidence(targetId: string, opsec: 'private' | 'shared'): Evidence[] {
    return Array.from(this.evidence.values()).filter(e => e.targetId === targetId && e.opsec === opsec);
  }
  public getEvidenceFile(id: string): Buffer | null {
    const evidence = this.evidence.get(id);
    if (!evidence) return null;
    const filePath = path.join(this.evidenceDir, evidence.filename);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath);
  }

  // Audit Logging
  private async logAction(action: string, details: any) {
    await DatabaseService.logAuditEvent(
      'expert',
      action,
      'ExpertRecoveryOps',
      null,
      {},
      details
    );
    this.logger.info(`[${action}]`, details);
  }
}
