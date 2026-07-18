import { supabase } from '../config/supabase';
import { ChatSession } from '../../src/types';

export class AIService {
  static async getSessions(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('ai_assistant_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const sessionsMap = new Map<string, ChatSession>();
    for (const rec of data || []) {
      if (rec.conversation_id === 'latest_report') {
        continue; // skip the report snapshot entry in chat list
      }
      if (!sessionsMap.has(rec.conversation_id)) {
        sessionsMap.set(rec.conversation_id, {
          id: rec.conversation_id,
          title: rec.prompt.slice(0, 30) + '...',
          date: rec.created_at,
          messages: []
        });
      }
      const sess = sessionsMap.get(rec.conversation_id)!;
      sess.messages.push({
        role: 'user',
        content: rec.prompt,
        timestamp: rec.created_at
      });
      sess.messages.push({
        role: 'assistant',
        content: rec.response,
        timestamp: rec.created_at,
        sources: rec.metadata?.sources || []
      });
    }

    // Return sorted by date descending (newest chat sessions first)
    return Array.from(sessionsMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  static async saveRecord(
    userId: string,
    conversationId: string,
    prompt: string,
    response: string,
    metadata: any = {},
    referencedStocks: string[] = [],
    portfolioSnapshot: any = {}
  ) {
    const { data, error } = await supabase
      .from('ai_assistant_records')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        prompt,
        response,
        metadata,
        referenced_stocks: referencedStocks,
        portfolio_snapshot: portfolioSnapshot,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSession(userId: string, conversationId: string) {
    const { error } = await supabase
      .from('ai_assistant_records')
      .delete()
      .eq('user_id', userId)
      .eq('conversation_id', conversationId);

    if (error) throw error;
    return { success: true };
  }

  static async getLatestReport(userId: string) {
    const { data, error } = await supabase
      .from('ai_assistant_records')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_id', 'latest_report')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    try {
      return JSON.parse(data.response);
    } catch {
      return null;
    }
  }

  static async saveLatestReport(userId: string, reportData: any) {
    // Delete any existing latest_report rows first to keep it clean
    await supabase
      .from('ai_assistant_records')
      .delete()
      .eq('user_id', userId)
      .eq('conversation_id', 'latest_report');

    const { data, error } = await supabase
      .from('ai_assistant_records')
      .insert({
        user_id: userId,
        conversation_id: 'latest_report',
        prompt: 'Generate Portfolio Report',
        response: JSON.stringify(reportData),
        metadata: { type: 'portfolio_report' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
