import Joi from 'joi';

// Replace duplicate Joi validation patterns across all route files
export class ValidationHelper {

  // Common field patterns - eliminate 50+ duplicates
  static email() {
    return Joi.string().email().lowercase().trim();
  }

  static password() {
    return Joi.string().min(8).max(128);
  }

  static name() {
    return Joi.string().min(1).max(100).trim();
  }

  static optionalName() {
    return Joi.string().min(1).max(100).trim().optional();
  }

  static description() {
    return Joi.string().max(1000).optional();
  }

  static id() {
    return Joi.string().uuid().required();
  }

  static positiveNumber() {
    return Joi.number().positive();
  }

  // Common schema patterns
  static pagination() {
    return {
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      sortBy: Joi.string().optional(),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    };
  }

  static dateFilters() {
    return {
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().when('startDate', {
        is: Joi.exist(),
        then: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
        otherwise: Joi.optional()
      }).optional()
    };
  }

  // Replace all duplicate auth validation schemas
  static loginSchema() {
    return Joi.object({
      email: this.email().required(),
      password: this.password().required(),
      twoFactorCode: Joi.string().length(6).optional(),
      rememberMe: Joi.boolean().default(false)
    });
  }

  static registerSchema() {
    return Joi.object({
      email: this.email().required(),
      password: this.password().required(),
      firstName: this.name().required(),
      lastName: this.name().required(),
      phoneNumber: Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).optional(),
    });
  }

  static userSettingsSchema() {
    return Joi.object({
      firstName: this.optionalName(),
      lastName: this.optionalName(),
      twoFactorEnabled: Joi.boolean().optional(),
      theme: Joi.string().valid('light', 'dark').optional(),
      timezone: Joi.string().optional(),
      language: Joi.string().length(2).optional()
    });
  }

  // Replace duplicate compliance schemas
  static complianceRecordSchema() {
    return Joi.object({
      jurisdiction: Joi.string().valid('US', 'UK', 'EU', 'CH', 'SG', 'UAE').required(),
      type: Joi.string().valid(
        'kyc', 'aml', 'tax_filing', 'fatca', 'crs',
        'travel_rule', 'entity_management', 'audit'
      ).required(),
      title: Joi.string().min(1).max(500).required(),
      description: Joi.string().max(1000).optional(),
      dueDate: Joi.date().optional(),
      documents: Joi.array().items(Joi.string().uri()).optional(),
      requirements: Joi.object().optional(),
      notes: Joi.string().max(500).optional()
    });
  }

  static complianceUpdateSchema() {
    return Joi.object({
      status: Joi.string().valid(
        'pending', 'in_review', 'approved', 'rejected',
        'expired', 'exempt'
      ).optional(),
      title: Joi.string().min(1).max(500).optional(),
      description: Joi.string().max(1000).optional(),
      dueDate: Joi.date().optional(),
      documents: Joi.array().items(Joi.string().uri()).optional(),
      requirements: Joi.object().optional(),
      notes: Joi.string().max(500).optional()
    });
  }

  // Replace duplicate threat schemas
  static threatSchema() {
    return Joi.object({
      type: Joi.string().valid(
        'phishing', 'malware', 'suspicious_transaction', 'social_engineering',
        'network_attack', 'physical_security', 'regulatory_violation', 'market_manipulation'
      ).required(),
      severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
      title: Joi.string().min(1).max(500).required(),
      description: Joi.string().required(),
      sourceIp: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional(),
      indicators: Joi.array().items(Joi.string()).optional(),
      metadata: Joi.object().optional()
    });
  }

  static threatStatusUpdateSchema() {
    return Joi.object({
      status: Joi.string().valid(
        'detected', 'investigating', 'confirmed',
        'false_positive', 'resolved', 'ignored'
      ).required(),
      resolutionNotes: Joi.string().max(1000).optional()
    });
  }

  // Replace duplicate asset/portfolio schemas
  static portfolioSchema() {
    return Joi.object({
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(500).optional(),
      currency: Joi.string().length(3).default('USD'),
      riskLevel: Joi.string().valid(
        'conservative', 'moderate', 'aggressive', 'very_aggressive'
      ).default('moderate')
    });
  }

  static assetSchema() {
    return Joi.object({
      symbol: Joi.string().min(1).max(20).required(),
      name: Joi.string().min(1).max(100).required(),
      type: Joi.string().valid(
        'cryptocurrency', 'token', 'nft', 'defi_position',
        'staked', 'fiat', 'stock', 'bond', 'real_estate', 'commodity'
      ).required(),
      amount: this.positiveNumber().required(),
      currency: Joi.string().length(3).default('USD'),
      blockchain: Joi.string().valid(
        'bitcoin', 'ethereum', 'solana', 'polygon', 'avalanche',
        'binance_smart_chain', 'arbitrum', 'optimism', 'base', 'cardano'
      ).optional(),
      address: Joi.string().optional(),
      exchange: Joi.string().optional()
    });
  }

  // Utility method to validate and return details
  static validate(schema: Joi.ObjectSchema, data: any): { error: any, value: any } {
    return schema.validate(data, { abortEarly: false });
  }

  static validateSingle(schema: Joi.AnySchema, data: any): { error: any, value: any } {
    return schema.validate(data);
  }
}
