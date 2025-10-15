import { supabase } from '@/config/database';

export interface ContractScan {
  id: string;
  _id?: string; // MongoDB style ID for compatibility
  contractAddress: string; // Match what routes expect
  address?: string; // Keep for backward compatibility
  chainId: number;
  owner: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  scanType?: 'quick' | 'standard' | 'deep';
  rescanInterval?: number;
  alerts?: boolean;
  score?: number;
  vulnerabilities?: {
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  metadata?: {
    compiler?: string;
    source?: string;
    bytecode?: string;
    abi?: any;
    dependencies?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ContractScan {
  static async findByIdAndUpdate(id: string, update: Partial<ContractScan>) {
    const { data, error } = await supabase
      .from('contract_scans')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async create(scanData: Omit<ContractScan, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('contract_scans')
      .insert(scanData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findOne(query: any) {
    let supabaseQuery = supabase.from('contract_scans').select();

    if (query.owner) {
      supabaseQuery = supabaseQuery.eq('owner', query.owner);
    }
    if (query.contractAddress) {
      supabaseQuery = supabaseQuery.eq('contractAddress', query.contractAddress);
    }
    if (query.chainId) {
      supabaseQuery = supabaseQuery.eq('chainId', query.chainId);
    }
    if (query._id) {
      supabaseQuery = supabaseQuery.eq('id', query._id);
    }
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    const { data, error } = await supabaseQuery.single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  static async find(query: any = {}) {
    let supabaseQuery = supabase.from('contract_scans').select();

    if (query.owner) {
      supabaseQuery = supabaseQuery.eq('owner', query.owner);
    }
    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;
    return data || [];
  }

  static async countDocuments(query: any = {}) {
    let countQuery = supabase.from('contract_scans').select('*', { count: 'exact', head: true });

    if (query.owner) {
      countQuery = countQuery.eq('owner', query.owner);
    }
    if (query.status) {
      countQuery = countQuery.eq('status', query.status);
    }

    const { count, error } = await countQuery;

    if (error) throw error;
    return count || 0;
  }

  static async findOneAndDelete(query: any) {
    // First find the record to get its ID
    const record = await this.findOne(query);
    if (!record) return null;

    // Delete the record
    const { error } = await supabase
      .from('contract_scans')
      .delete()
      .eq('id', record.id);

    if (error) throw error;
    return record;
  }
}