import { supabase } from '@/config/database';

export interface ContractScan {
  id: string;
  address: string;
  chainId: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
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
}