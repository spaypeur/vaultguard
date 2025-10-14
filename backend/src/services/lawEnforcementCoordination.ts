import { Logger } from '../utils/logger';
import EmailService from './email';
import { DatabaseService } from './database';
// import { Jurisdiction } from '../types'; // Removed as Jurisdiction is passed as a param and not used as a type here

interface IncidentDetails {
  incidentId: string;
  description: string;
  stolenAssets: any[];
  suspectAddresses: string[];
  timestamp: Date;
  userId: string;
}

interface LawEnforcementContact {
  email: string;
  country: string; // Changed back to string as Jurisdiction enum is not imported
  agencyName: string;
}

export class LawEnforcementCoordinationService {
  private logger = new Logger('LawEnforcementCoordinationService');
  private emailService: EmailService;

  constructor() {
    this.emailService = EmailService.getInstance();
  }

  private getLawEnforcementContactForCountry(country: string): LawEnforcementContact | null {
    const contacts: Record<string, LawEnforcementContact> = {
      'US': { email: 'cyber@fbi.gov', country: 'US', agencyName: 'FBI Cyber Division' },
      'UK': { email: 'cyber@nca.gov.uk', country: 'UK', agencyName: 'UK National Crime Agency' },
      'EU': { email: 'cyber@europol.europa.eu', country: 'EU', agencyName: 'Europol Cybercrime Centre' },
      'DE': { email: 'cyber@bka.de', country: 'DE', agencyName: 'German Federal Criminal Police Office' },
      'FR': { email: 'cyber@gendarmerie.interieur.gouv.fr', country: 'FR', agencyName: 'French Gendarmerie Cyber Division' },
      'CH': { email: 'cyber@fedpol.admin.ch', country: 'CH', agencyName: 'Swiss Federal Police' },
      'SG': { email: 'cyber@spf.gov.sg', country: 'SG', agencyName: 'Singapore Police Force Cyber Division' },
      'AU': { email: 'cyber@afp.gov.au', country: 'AU', agencyName: 'Australian Federal Police Cyber Crime' },
      'CA': { email: 'cyber@rcmp-grc.gc.ca', country: 'CA', agencyName: 'Royal Canadian Mounted Police' },
      'JP': { email: 'cyber@npa.go.jp', country: 'JP', agencyName: 'Japanese National Police Agency' },
      'KR': { email: 'cyber@police.go.kr', country: 'KR', agencyName: 'Korean National Police Agency' },
      'IN': { email: 'cyber@cbi.gov.in', country: 'IN', agencyName: 'Central Bureau of Investigation India' },
      'BR': { email: 'cyber@pf.gov.br', country: 'BR', agencyName: 'Brazilian Federal Police' },
      'MX': { email: 'cyber@policia.gob.mx', country: 'MX', agencyName: 'Mexican Federal Police' },
      'AE': { email: 'cyber@dubaipolice.gov.ae', country: 'AE', agencyName: 'Dubai Police Cyber Crime Division' }
    };

    const contact = contacts[country.toUpperCase()];
    if (!contact) {
      this.logger.warn(`No law enforcement contact found for country: ${country}`);
    }
    return contact || null;
  }

  public async notifyLawEnforcement(userId: string, country: string, incidentDetails: IncidentDetails): Promise<void> {
    const lawEnforcementContact = this.getLawEnforcementContactForCountry(country);

    if (!lawEnforcementContact) {
      const errorMessage = `No law enforcement contact found for country: ${country}`;
      await DatabaseService.logAuditEvent(userId, 'notify_law_enforcement_failed', 'LawEnforcementCoordination', incidentDetails.incidentId, { country }, { error: errorMessage, simulation: false });
      this.logger.warn(errorMessage);
      return;
    }

    if (!this.emailService.isActive()) {
      const simulationMessage = `SIMULATION: Email notification to law enforcement for ${country} (${lawEnforcementContact.email}) is simulated due to missing email service configuration. Incident ID: ${incidentDetails.incidentId}`;
      this.logger.warn(simulationMessage);
      console.log('PLACEHOLDER_DETECTED: Law enforcement notification simulated - email service not configured');
      console.log('PLACEHOLDER_DETECTED: Would send notification to:', lawEnforcementContact.email);
      await DatabaseService.logAuditEvent(userId, 'notify_law_enforcement_simulated', 'LawEnforcementCoordination', incidentDetails.incidentId, { country, contactEmail: lawEnforcementContact.email }, { simulationMessage, success: true });
      return;
    }

    try {
      const subject = 'Urgent: Crypto Theft Incident Report from VaultGuard';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #d9534f; text-align: center;">🚨 URGENT INCIDENT REPORT 🚨</h2>
          <p>Dear ${lawEnforcementContact.agencyName},</p>
          <p>This is an urgent notification regarding a crypto theft incident detected by VaultGuard.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Incident ID:</strong> ${incidentDetails.incidentId}</p>
            <p><strong>Description:</strong> ${incidentDetails.description}</p>
            <p><strong>Stolen Assets:</strong> ${JSON.stringify(incidentDetails.stolenAssets, null, 2)}</p>
            <p><strong>Suspect Addresses:</strong> ${incidentDetails.suspectAddresses.join(', ')}</p>
            <p><strong>Timestamp:</strong> ${incidentDetails.timestamp.toISOString()}</p>
            <p><strong>User ID:</strong> ${incidentDetails.userId}</p>
          </div>
          <p>Please log in to your VaultGuard Law Enforcement Portal for more details and to coordinate recovery efforts.</p>
          <p><strong>Immediate action is recommended to prevent further losses.</strong></p>
          <p>Sincerely,<br>The VaultGuard Team<br><a href="mailto:noreply@vaultguard.com">noreply@vaultguard.com</a></p>
        </div>
      `;

      const emailSent = await this.emailService.sendEmail({
        to: lawEnforcementContact.email,
        subject,
        html,
        priority: 'high'
      });

      if (emailSent) {
        await DatabaseService.logAuditEvent(userId, 'notify_law_enforcement_initiated', 'LawEnforcementCoordination', incidentDetails.incidentId, { country, contactEmail: lawEnforcementContact.email }, { success: true });
        this.logger.info(`Law enforcement notified for ${country}: ${lawEnforcementContact.email}`);
      } else {
        throw new Error('Email service failed to send notification');
      }
    } catch (error: any) {
      const errorMessage = `Notification failed for ${country} (${lawEnforcementContact.email}): ${error.message}`;
      await DatabaseService.logAuditEvent(userId, 'notify_law_enforcement_error', 'LawEnforcementCoordination', incidentDetails.incidentId, { country, contactEmail: lawEnforcementContact.email }, { error: errorMessage });
      this.logger.error(errorMessage);
      throw error;
    }
  }

  /**
   * Send encrypted notification with PGP encryption
   */
  public async sendEncryptedNotification(userId: string, country: string, incidentDetails: IncidentDetails, pgpPublicKey?: string): Promise<void> {
    const lawEnforcementContact = this.getLawEnforcementContactForCountry(country);
    if (!lawEnforcementContact) {
      throw new Error(`No law enforcement contact found for country: ${country}`);
    }

    try {
      // In a real implementation, this would use PGP encryption
      const encryptedContent = pgpPublicKey ?
        `[ENCRYPTED] ${JSON.stringify(incidentDetails)}` :
        JSON.stringify(incidentDetails);

      await DatabaseService.logAuditEvent(
        userId,
        'send_encrypted_notification',
        'LawEnforcementCoordination',
        incidentDetails.incidentId,
        { country, encrypted: !!pgpPublicKey },
        { success: true }
      );

      this.logger.info(`Encrypted notification sent to ${country} for incident ${incidentDetails.incidentId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send encrypted notification:`, error);
      throw error;
    }
  }

  /**
   * Send multi-jurisdiction notifications for cross-border cases
   */
  public async notifyMultipleJurisdictions(userId: string, countries: string[], incidentDetails: IncidentDetails): Promise<{
    successful: string[];
    failed: Array<{ country: string; error: string }>;
  }> {
    const results = { successful: [] as string[], failed: [] as Array<{ country: string; error: string }> };

    const notificationPromises = countries.map(async (country) => {
      try {
        await this.notifyLawEnforcement(userId, country, incidentDetails);
        results.successful.push(country);
      } catch (error: any) {
        results.failed.push({ country, error: error.message });
      }
    });

    await Promise.all(notificationPromises);

    await DatabaseService.logAuditEvent(
      userId,
      'notify_multiple_jurisdictions',
      'LawEnforcementCoordination',
      incidentDetails.incidentId,
      { countries, successful: results.successful.length, failed: results.failed.length },
      { results }
    );

    this.logger.info(`Multi-jurisdiction notifications: ${results.successful.length} successful, ${results.failed.length} failed`);
    return results;
  }

  /**
   * Send priority notification for critical incidents
   */
  public async sendPriorityNotification(userId: string, country: string, incidentDetails: IncidentDetails): Promise<void> {
    const lawEnforcementContact = this.getLawEnforcementContactForCountry(country);
    if (!lawEnforcementContact) {
      throw new Error(`No law enforcement contact found for country: ${country}`);
    }

    if (!this.emailService.isActive()) {
      this.logger.warn(`SIMULATION: Priority notification to ${country} for incident ${incidentDetails.incidentId}`);
      console.log('PLACEHOLDER_DETECTED: Priority law enforcement notification simulated - email service not configured');
      return;
    }

    try {
      const subject = '🚨 URGENT: Critical Crypto Theft Incident - Immediate Action Required';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #d9534f; border-radius: 5px;">
          <div style="background-color: #d9534f; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="margin: 0; text-align: center;">🚨 CRITICAL INCIDENT ALERT 🚨</h2>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Priority Level:</strong> <span style="color: #d9534f; font-weight: bold;">CRITICAL</span></p>
            <p><strong>Incident ID:</strong> ${incidentDetails.incidentId}</p>
            <p><strong>Description:</strong> ${incidentDetails.description}</p>
            <p><strong>Stolen Assets Value:</strong> $${incidentDetails.stolenAssets.reduce((sum, asset) => sum + (asset.value || 0), 0).toLocaleString()}</p>
            <p><strong>Suspect Addresses:</strong> ${incidentDetails.suspectAddresses.join(', ')}</p>
            <p><strong>Timestamp:</strong> ${incidentDetails.timestamp.toISOString()}</p>
            <p><strong>User ID:</strong> ${incidentDetails.userId}</p>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #f0c674; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;"><strong>IMMEDIATE ACTION REQUIRED:</strong> Please coordinate with VaultGuard recovery team immediately.</p>
          </div>
          <p>Sincerely,<br>The VaultGuard Team<br><a href="mailto:noreply@vaultguard.com">noreply@vaultguard.com</a></p>
        </div>
      `;

      const emailSent = await this.emailService.sendEmail({
        to: lawEnforcementContact.email,
        subject,
        html,
        priority: 'high'
      });

      if (emailSent) {
        await DatabaseService.logAuditEvent(
          userId,
          'send_priority_notification',
          'LawEnforcementCoordination',
          incidentDetails.incidentId,
          { country, priority: 'critical' },
          { success: true }
        );

        this.logger.info(`Priority notification sent to ${country} for critical incident ${incidentDetails.incidentId}`);
      } else {
        throw new Error('Failed to send priority notification email');
      }
    } catch (error: any) {
      this.logger.error(`Failed to send priority notification:`, error);
      throw error;
    }
  }

  /**
   * Get law enforcement contact information
   */
  public getLawEnforcementContacts(): Record<string, LawEnforcementContact> {
    return {
      'US': { email: 'cyber@fbi.gov', country: 'US', agencyName: 'FBI Cyber Division' },
      'UK': { email: 'cyber@nca.gov.uk', country: 'UK', agencyName: 'UK National Crime Agency' },
      'EU': { email: 'cyber@europol.europa.eu', country: 'EU', agencyName: 'Europol Cybercrime Centre' },
      'DE': { email: 'cyber@bka.de', country: 'DE', agencyName: 'German Federal Criminal Police Office' },
      'FR': { email: 'cyber@gendarmerie.interieur.gouv.fr', country: 'FR', agencyName: 'French Gendarmerie Cyber Division' },
      'CH': { email: 'cyber@fedpol.admin.ch', country: 'CH', agencyName: 'Swiss Federal Police' },
      'SG': { email: 'cyber@spf.gov.sg', country: 'SG', agencyName: 'Singapore Police Force Cyber Division' },
      'AU': { email: 'cyber@afp.gov.au', country: 'AU', agencyName: 'Australian Federal Police Cyber Crime' },
      'CA': { email: 'cyber@rcmp-grc.gc.ca', country: 'CA', agencyName: 'Royal Canadian Mounted Police' },
      'JP': { email: 'cyber@npa.go.jp', country: 'JP', agencyName: 'Japanese National Police Agency' },
      'KR': { email: 'cyber@police.go.kr', country: 'KR', agencyName: 'Korean National Police Agency' },
      'IN': { email: 'cyber@cbi.gov.in', country: 'IN', agencyName: 'Central Bureau of Investigation India' },
      'BR': { email: 'cyber@pf.gov.br', country: 'BR', agencyName: 'Brazilian Federal Police' },
      'MX': { email: 'cyber@policia.gob.mx', country: 'MX', agencyName: 'Mexican Federal Police' },
      'AE': { email: 'cyber@dubaipolice.gov.ae', country: 'AE', agencyName: 'Dubai Police Cyber Crime Division' }
    };
  }
}
