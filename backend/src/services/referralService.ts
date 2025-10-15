import { Referral, ReferralReward, ReferralLeaderboard, ReferralBadge, AffiliateProgram, ReferralLink, FraudDetection, ReferralStatus, ReferralType, RewardType, RewardStatus, LeaderboardPeriod, SocialPlatform, FraudFlag, FraudStatus, PayoutMethod, AffiliateStatus } from '../types';
import DatabaseService from './database';
import EmailService from './email';
import { BaseService } from './base/BaseService';
import { supabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import crypto from 'crypto';

export class ReferralService extends BaseService<any> {
  private emailService: EmailService;

  constructor() {
    super('referrals');
    this.emailService = EmailService.getInstance();
  }

  // Generate unique referral code
  async generateReferralCode(userId: string, type: ReferralType = ReferralType.STANDARD): Promise<string> {
    try {
      this.requireAuth(userId);

      // Generate a unique code using user ID and timestamp
      const timestamp = Date.now().toString(36);
      const userHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 8);
      const randomSuffix = Math.random().toString(36).substring(2, 8);

      const referralCode = `${type.charAt(0).toUpperCase()}${userHash}${timestamp}${randomSuffix}`.toUpperCase();

      // Ensure uniqueness by checking database
      const existingReferral = await this.findReferralByCode(referralCode);
      if (existingReferral) {
        // Recursively generate new code if collision occurs
        return this.generateReferralCode(userId, type);
      }

      return referralCode;
    } catch (error) {
      this.logger.error('Error generating referral code:', error);
      throw error;
    }
  }

  // Create referral record
  async createReferral(
    referrerId: string,
    referralCode?: string,
    type: ReferralType = ReferralType.STANDARD,
    metadata?: Record<string, any>
  ): Promise<Referral> {
    try {
      this.requireAuth(referrerId);

      if (!referralCode) {
        referralCode = await this.generateReferralCode(referrerId, type);
      }

      const referral: Partial<Referral> = {
        id: uuidv4(),
        referrerId,
        referralCode,
        status: ReferralStatus.ACTIVE,
        type,
        referrerReward: this.getReferrerReward(type),
        refereeReward: this.getRefereeReward(type),
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { data, error } = await supabase
        .from('referrals')
        .insert([{
          id: referral.id,
          referrer_id: referral.referrerId,
          referral_code: referral.referralCode,
          status: referral.status,
          type: referral.type,
          referrer_reward: referral.referrerReward,
          referee_reward: referral.refereeReward,
          metadata: referral.metadata || {},
          created_at: referral.createdAt.toISOString(),
          updated_at: referral.updatedAt.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      await this.logAudit(referrerId, 'CREATE_REFERRAL', 'referral', referral.id);

      return data as Referral;
    } catch (error) {
      this.logger.error('Error creating referral:', error);
      throw error;
    }
  }

  // Process successful referral
  async processReferral(
    referralCode: string,
    refereeId: string,
    refereeEmail?: string
  ): Promise<{ referral: Referral; rewards: ReferralReward[] }> {
    try {
      this.requireAuth(refereeId);

      const referral = await this.findReferralByCode(referralCode);
      if (!referral || referral.status !== ReferralStatus.ACTIVE) {
        throw new Error('Invalid or expired referral code');
      }

      // Check for fraud
      const fraudCheck = await this.checkFraudRisk(referral, refereeId);
      if (fraudCheck.riskScore > 0.7) {
        await this.flagReferral(referral.id, fraudCheck);
        throw new Error('Referral flagged for suspicious activity');
      }

      // Update referral status
      await supabase
        .from('referrals')
        .update({
          referee_id: refereeId,
          status: ReferralStatus.COMPLETED,
          used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', referral.id);

      // Distribute rewards
      const rewards = await this.distributeRewards(referral, refereeId, refereeEmail);

      // Send notifications
      await this.sendReferralNotifications(referral, refereeId, refereeEmail);

      return { referral, rewards };
    } catch (error) {
      this.logger.error('Error processing referral:', error);
      throw error;
    }
  }

  // Generate referral link
  async generateReferralLink(
    referralId: string,
    platform?: SocialPlatform,
    customPath?: string
  ): Promise<ReferralLink> {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'https://vaultguard.com';
      const path = customPath || `/register?ref=${referralId}`;

      const url = `${baseUrl}${path}`;
      const qrCode = await this.generateQRCode(url);

      const referralLink: Partial<ReferralLink> = {
        id: uuidv4(),
        referralId,
        url,
        qrCode,
        platform,
        clicks: 0,
        conversions: 0,
        createdAt: new Date(),
      };

      const { data, error } = await supabase
        .from('referral_links')
        .insert([{
          id: referralLink.id,
          referral_id: referralLink.referralId,
          url: referralLink.url,
          qr_code: referralLink.qrCode,
          platform: referralLink.platform || null,
          clicks: referralLink.clicks,
          conversions: referralLink.conversions,
          created_at: referralLink.createdAt.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data as ReferralLink;
    } catch (error) {
      this.logger.error('Error generating referral link:', error);
      throw error;
    }
  }

  // Generate QR code
  private async generateQRCode(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      this.logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Get referral statistics
  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    completedReferrals: number;
    totalEarnings: number;
    currentRank?: number;
  }> {
    try {
      this.requireAuth(userId);

      const { data, error } = await supabase
        .from('referrals')
        .select('status, referrer_reward')
        .eq('referrer_id', userId);

      if (error) throw error;

      const stats = data.reduce(
        (acc: { totalReferrals: number; activeReferrals: number; completedReferrals: number; totalEarnings: number }, row) => {
          acc.totalReferrals += 1;
          if (row.status === ReferralStatus.ACTIVE) acc.activeReferrals += 1;
          if (row.status === ReferralStatus.COMPLETED) acc.completedReferrals += 1;
          acc.totalEarnings += row.referrer_reward || 0;
          return acc;
        },
        { totalReferrals: 0, activeReferrals: 0, completedReferrals: 0, totalEarnings: 0 }
      );

      // Get leaderboard rank - simplified for now
      const { data: rankData } = await supabase
        .from('referrals')
        .select('referrer_id, referrer_reward')
        .eq('status', ReferralStatus.COMPLETED)
        .order('referrer_reward', { ascending: false });

      const userRank = rankData?.findIndex(r => r.referrer_id === userId) + 1 || null;

      return {
        ...stats,
        currentRank: userRank,
      };
    } catch (error) {
      this.logger.error('Error getting referral stats:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(
    period: LeaderboardPeriod = LeaderboardPeriod.MONTHLY,
    limit: number = 10
  ): Promise<ReferralLeaderboard[]> {
    try {
      const dateFilter = this.getDateFilter(period);

      let query = supabase
        .from('referrals')
        .select(`
          referrer_id,
          referrer_reward,
          users!inner(first_name, last_name)
        `)
        .eq('status', ReferralStatus.COMPLETED);

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query
        .order('referrer_reward', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Group by referrer and calculate stats
      const userStats = data.reduce((acc: any, row: any) => {
        const userId = row.referrer_id;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: `${row.users.first_name} ${row.users.last_name}`,
            referralCount: 0,
            totalRewards: 0,
          };
        }
        acc[userId].referralCount += 1;
        acc[userId].totalRewards += row.referrer_reward || 0;
        return acc;
      }, {});

      return Object.values(userStats)
        .sort((a: any, b: any) => b.referralCount - a.referralCount || b.totalRewards - a.totalRewards)
        .slice(0, limit)
        .map((user: any, index: number) => ({
          userId: user.userId,
          userName: user.userName,
          referralCount: user.referralCount,
          totalRewards: user.totalRewards,
          rank: index + 1,
          badges: [], // Would be populated from badge service
          period,
        }));
    } catch (error) {
      this.logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Create affiliate program
  async createAffiliateProgram(
    userId: string,
    commissionRate: number = 10,
    payoutInfo: any
  ): Promise<AffiliateProgram> {
    try {
      this.requireAuth(userId);

      const affiliateCode = await this.generateReferralCode(userId, ReferralType.AFFILIATE);

      const affiliateProgram: Partial<AffiliateProgram> = {
        id: uuidv4(),
        userId,
        affiliateCode,
        commissionRate,
        status: AffiliateStatus.ACTIVE,
        totalEarnings: 0,
        totalReferrals: 0,
        payoutInfo,
        performance: {
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          earnings: {
            thisMonth: 0,
            lastMonth: 0,
            total: 0,
          },
          topReferrals: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { data, error } = await supabase
        .from('affiliate_programs')
        .insert([{
          id: affiliateProgram.id,
          user_id: affiliateProgram.userId,
          affiliate_code: affiliateProgram.affiliateCode,
          commission_rate: affiliateProgram.commissionRate,
          status: affiliateProgram.status,
          total_earnings: affiliateProgram.totalEarnings,
          total_referrals: affiliateProgram.totalReferrals,
          payout_info: affiliateProgram.payoutInfo,
          performance: affiliateProgram.performance,
          created_at: affiliateProgram.createdAt.toISOString(),
          updated_at: affiliateProgram.updatedAt.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      await this.logAudit(userId, 'CREATE_AFFILIATE_PROGRAM', 'affiliate_program', affiliateProgram.id);

      return data as AffiliateProgram;
    } catch (error) {
      this.logger.error('Error creating affiliate program:', error);
      throw error;
    }
  }

  // Track affiliate link click
  async trackAffiliateClick(affiliateCode: string, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      // Find affiliate program
      const affiliate = await this.findAffiliateByCode(affiliateCode);
      if (!affiliate) return;

      // Log click (you might want to store this in a separate clicks table)
      await DatabaseService.query(
        'UPDATE affiliate_programs SET performance = performance::jsonb || $1 WHERE id = $2',
        [JSON.stringify({ clicks: affiliate.performance.clicks + 1 }), affiliate.id]
      );
    } catch (error) {
      this.logger.error('Error tracking affiliate click:', error);
    }
  }

  // Private helper methods
  private async findReferralByCode(referralCode: string): Promise<Referral | null> {
    const result = await DatabaseService.query(
      'SELECT * FROM referrals WHERE referral_code = $1',
      [referralCode]
    );
    return result.rows[0] || null;
  }

  private async findAffiliateByCode(affiliateCode: string): Promise<AffiliateProgram | null> {
    const result = await DatabaseService.query(
      'SELECT * FROM affiliate_programs WHERE affiliate_code = $1 AND status = $2',
      [affiliateCode, AffiliateStatus.ACTIVE]
    );
    return result.rows[0] || null;
  }

  private getReferrerReward(type: ReferralType): number {
    switch (type) {
      case ReferralType.STANDARD:
        return 500; // $500 credit
      case ReferralType.AFFILIATE:
        return 0; // Commission-based
      case ReferralType.INFLUENCER:
        return 1000; // Higher reward for influencers
      default:
        return 500;
    }
  }

  private getRefereeReward(type: ReferralType): number {
    switch (type) {
      case ReferralType.STANDARD:
        return 10; // 10% discount
      case ReferralType.AFFILIATE:
        return 5; // 5% discount for affiliate referrals
      default:
        return 10;
    }
  }

  private getDateFilter(period: LeaderboardPeriod): string | null {
    const now = new Date();
    switch (period) {
      case LeaderboardPeriod.DAILY:
        return now.toISOString().split('T')[0];
      case LeaderboardPeriod.WEEKLY:
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case LeaderboardPeriod.MONTHLY:
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      default:
        return null;
    }
  }

  private async checkFraudRisk(referral: Referral, refereeId: string): Promise<FraudDetection> {
    const flags: FraudFlag[] = [];
    let riskScore = 0;

    // Check if referrer and referee are the same
    if (referral.referrerId === refereeId) {
      flags.push(FraudFlag.MULTIPLE_ACCOUNTS);
      riskScore += 0.8;
    }

    // Check for rapid referrals from same IP (would need IP tracking)
    // Check for VPN usage (would need IP geolocation service)
    // Check device fingerprint patterns

    return {
      referralId: referral.id,
      riskScore,
      flags,
      status: riskScore > 0.7 ? FraudStatus.FLAGGED : FraudStatus.CLEAN,
    };
  }

  private async flagReferral(referralId: string, fraudCheck: FraudDetection): Promise<void> {
    await supabase
      .from('referrals')
      .update({ status: ReferralStatus.FRAUD_SUSPECTED })
      .eq('id', referralId);

    // Log fraud detection
    await supabase
      .from('fraud_detections')
      .insert([{
        id: uuidv4(),
        referral_id: referralId,
        risk_score: fraudCheck.riskScore,
        flags: fraudCheck.flags,
        status: fraudCheck.status,
        created_at: new Date().toISOString(),
      }]);
  }

  private async distributeRewards(
    referral: Referral,
    refereeId: string,
    refereeEmail?: string
  ): Promise<ReferralReward[]> {
    const rewards: ReferralReward[] = [];

    // Create referrer reward
    if (referral.referrerReward > 0) {
      const referrerReward = await this.createReward(
        referral.id,
        referral.referrerId,
        RewardType.CREDIT,
        referral.referrerReward,
        'USD'
      );
      rewards.push(referrerReward);
    }

    // Create referee reward
    if (referral.refereeReward > 0) {
      const refereeReward = await this.createReward(
        referral.id,
        refereeId,
        RewardType.DISCOUNT,
        referral.refereeReward,
        'PERCENT'
      );
      rewards.push(refereeReward);
    }

    return rewards;
  }

  private async createReward(
    referralId: string,
    userId: string,
    type: RewardType,
    amount: number,
    currency: string
  ): Promise<ReferralReward> {
    const reward: Partial<ReferralReward> = {
      id: uuidv4(),
      referralId,
      userId,
      type,
      amount,
      currency,
      status: RewardStatus.DISTRIBUTED,
      distributedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data, error } = await supabase
      .from('referral_rewards')
      .insert([{
        id: reward.id,
        referral_id: reward.referralId,
        user_id: reward.userId,
        type: reward.type,
        amount: reward.amount,
        currency: reward.currency,
        status: reward.status,
        distributed_at: reward.distributedAt?.toISOString(),
        created_at: reward.createdAt.toISOString(),
        updated_at: reward.updatedAt.toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data as ReferralReward;
  }

  private async sendReferralNotifications(
    referral: Referral,
    refereeId: string,
    refereeEmail?: string
  ): Promise<void> {
    try {
      // Send notification to referrer
      await this.emailService.sendEmail({
        to: '', // Would need to get referrer email
        subject: 'Referral Successful - Reward Earned!',
        html: `<p>Congratulations! Your referral code ${referral.referralCode} was used successfully. You've earned $${referral.referrerReward} in credits!</p>`,
      });

      // Send notification to referee
      if (refereeEmail) {
        await this.emailService.sendEmail({
          to: refereeEmail,
          subject: 'Welcome to VaultGuard - Referral Reward Applied!',
          html: `<p>Welcome to VaultGuard! Your referral code ${referral.referralCode} has been applied. You've received ${referral.refereeReward}% off your first year!</p>`,
        });
      }
    } catch (error) {
      this.logger.error('Error sending referral notifications:', error);
    }
  }
}

export default new ReferralService();