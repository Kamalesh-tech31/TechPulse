import { supabase } from '../config/supabase';

// ─────────────────────────────────────────────────────────────
//  Wallet
// ─────────────────────────────────────────────────────────────

export interface WalletRow {
  user_id: string;
  available_cash: number;
  portfolio_value: number;
  profit_loss: number;
  updated_at: string;
}

/** Return existing wallet or create one with ₹10,00,000 starting balance. */
export async function getOrCreateWallet(userId: string): Promise<WalletRow> {
  // Try to fetch first
  const { data: existing } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) return existing as WalletRow;

  // Create fresh wallet
  const { data, error } = await supabase
    .from('wallet')
    .insert({
      user_id: userId,
      available_cash: 1000000.00,
      portfolio_value: 0.00,
      profit_loss: 0.00,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Failed to create wallet: ' + (error?.message || 'Unknown error'));
  }
  return data as WalletRow;
}

export async function getWallet(userId: string): Promise<WalletRow | null> {
  const { data } = await supabase
    .from('wallet')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data as WalletRow | null;
}

export async function updateWallet(
  userId: string,
  availableCash: number,
  portfolioValue: number,
  profitLoss: number
): Promise<void> {
  const { error } = await supabase
    .from('wallet')
    .upsert({
      user_id: userId,
      available_cash: Math.round(availableCash * 100) / 100,
      portfolio_value: Math.round(portfolioValue * 100) / 100,
      profit_loss: Math.round(profitLoss * 100) / 100,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error('Failed to update wallet: ' + error.message);
}

// ─────────────────────────────────────────────────────────────
//  Holdings
// ─────────────────────────────────────────────────────────────

export interface HoldingRow {
  id: string;
  user_id: string;
  company_symbol: string;
  company_name: string;
  exchange: string;
  quantity: number;
  buy_price: number;
  buy_time: string;
  current_price?: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InsertHoldingInput {
  userId: string;
  symbol: string;
  companyName: string;
  exchange: string;
  quantity: number;
  buyPrice: number;
}

/** Insert a single purchase row. buy_price is never changed after this. */
export async function insertHolding(input: InsertHoldingInput): Promise<HoldingRow> {
  const { data, error } = await supabase
    .from('holdings')
    .insert({
      user_id: input.userId,
      company_symbol: input.symbol.toUpperCase(),
      company_name: input.companyName,
      exchange: input.exchange || 'NSE',
      quantity: input.quantity,
      buy_price: Math.round(input.buyPrice * 100) / 100,
      buy_time: new Date().toISOString(),
      status: 'active',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Failed to insert holding: ' + (error?.message || 'Unknown error'));
  }
  return data as HoldingRow;
}

export async function getHoldingsByUser(userId: string): Promise<HoldingRow[]> {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('buy_time', { ascending: true });

  if (error) throw new Error('Failed to fetch holdings: ' + error.message);
  return (data || []) as HoldingRow[];
}

export async function getHoldingById(id: string, userId: string): Promise<HoldingRow | null> {
  const { data } = await supabase
    .from('holdings')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  return data as HoldingRow | null;
}

/**
 * Reduce quantity from a specific holding row.
 * If newQty becomes 0, mark row as 'sold' (don't hard-delete for audit trail).
 */
export async function reduceHolding(holdingId: string, newQuantity: number): Promise<void> {
  if (newQuantity === 0) {
    const { error } = await supabase
      .from("holdings")
      .delete()
      .eq("id", holdingId);
  
    if (error)
      throw new Error("Failed to delete holding: " + error.message);
  } 
  else {
    const { error } = await supabase
      .from('holdings')
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq('id', holdingId);
    if (error) throw new Error('Failed to reduce holding: ' + error.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  Transactions
// ─────────────────────────────────────────────────────────────

export interface TransactionRow {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  transaction_time: string;
  created_at: string;
}

export interface InsertTransactionInput {
  userId: string;
  symbol: string;
  companyName: string;
  exchange: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
}

export async function insertTransaction(input: InsertTransactionInput): Promise<TransactionRow> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: input.userId,
      symbol: input.symbol.toUpperCase(),
      company_name: input.companyName,
      exchange: input.exchange || 'NSE',
      type: input.type,
      quantity: input.quantity,
      price: Math.round(input.price * 100) / 100,
      total_amount: Math.round(input.totalAmount * 100) / 100,
      transaction_time: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Failed to insert transaction: ' + (error?.message || 'Unknown error'));
  }
  return data as TransactionRow;
}

export async function getTransactionsByUser(userId: string): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_time', { ascending: false });

  if (error) throw new Error('Failed to fetch transactions: ' + error.message);
  return (data || []) as TransactionRow[];
}
