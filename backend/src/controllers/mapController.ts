import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { config } from '../config/redis';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: config.redis.tls ? {} : undefined
});

export const getLiveThreats = async (req: Request, res: Response): Promise<void> => {
  try {
    // First try to get from Redis cache
    const cachedThreats = await redis.get('live:threats');
    if (cachedThreats) {
      res.json(JSON.parse(cachedThreats));
      return;
    }

    // If not in cache, fetch from database
    const supabase: SupabaseClient = req.app.get('supabase');
    const { data: threats, error } = await supabase
      .from('threats')
      .select('*')
      .eq('status', 'active')
      .order('severity', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Add geolocation data (in production, this would come from the threat detection system)
    const enhancedThreats = threats.map(threat => ({
      ...threat,
      latitude: Math.random() * 180 - 90, // Random lat for demo
      longitude: Math.random() * 360 - 180, // Random long for demo
    }));

    // Cache the result for 30 seconds
    await redis.setex('live:threats', 30, JSON.stringify(enhancedThreats));

    res.json(enhancedThreats);
  } catch (error) {
    console.error('Error fetching live threats:', error);
    res.status(500).json({ error: 'Failed to fetch live threats' });
  }
};

export const getLiveTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    // First try to get from Redis cache
    const cachedTransactions = await redis.get('live:transactions');
    if (cachedTransactions) {
      res.json(JSON.parse(cachedTransactions));
      return;
    }

    // If not in cache, generate demo data (in production, this would come from real blockchain data)
    const demoTransactions = Array.from({ length: 20 }, () => ({
      fromLat: Math.random() * 180 - 90,
      fromLong: Math.random() * 360 - 180,
      toLat: Math.random() * 180 - 90,
      toLong: Math.random() * 360 - 180,
      amount: Math.random() * 100000,
      cryptocurrency: ['BTC', 'ETH', 'SOL', 'ADA'][Math.floor(Math.random() * 4)],
    }));

    // Cache the result for 10 seconds
    await redis.setex('live:transactions', 10, JSON.stringify(demoTransactions));

    res.json(demoTransactions);
  } catch (error) {
    console.error('Error fetching live transactions:', error);
    res.status(500).json({ error: 'Failed to fetch live transactions' });
  }
};