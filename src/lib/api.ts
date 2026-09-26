import { supabase } from './supabase';

export interface RiskEvent {
  id: string;
  type: string;
  domain: string;
  geography_id: string;
  geography_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Normal';
  probability_or_confidence: number;
  time_window: string;
  data_status: 'LIVE' | 'HISTORICAL' | 'SEEDED' | 'SIMULATED';
  created_at: string;
}

export async function getRiskEvents(): Promise<RiskEvent[]> {
  const { data, error } = await supabase
    .from('risk_events')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching risks:", error);
    return [];
  }
  return data as RiskEvent[];
}

export async function runSimulation(rainfall: number) {
  // 1. Create the Scenario record in Supabase
  const { error: sErr } = await supabase.from('scenarios').insert([{
    name: `Pune Monsoon Sim: ${rainfall}mm`,
    description: `Auto-generated BHARAT AI 2.0 scenario`,
    region_id: '11111111-1111-4a7b-a259-2c7075775f56', // generic ID
    target_rainfall_mm: rainfall
  }]);

  if (sErr) console.error("Error saving scenario:", sErr);

  // 2. Generate Cascading Risk Events based on inputs
  const newRisks = [];
  
  if (rainfall > 120) {
    const severity = rainfall > 200 ? 'Critical' : 'High';
    newRisks.push({ 
      type: 'Drainage Overload', domain: 'Water', 
      geography_id: '33333333-3333-4a7b-a259-2c7075775f60', geography_type: 'district', 
      severity, probability_or_confidence: 90, time_window: 'Next 12 Hours', data_status: 'SIMULATED' 
    });
    newRisks.push({ 
      type: 'Road Flooding', domain: 'Infrastructure', 
      geography_id: '33333333-3333-4a7b-a259-2c7075775f60', geography_type: 'district', 
      severity, probability_or_confidence: 85, time_window: 'Next 12 Hours', data_status: 'SIMULATED' 
    });
    newRisks.push({ 
      type: 'Traffic Congestion (+38%)', domain: 'Mobility', 
      geography_id: '33333333-3333-4a7b-a259-2c7075775f60', geography_type: 'district', 
      severity, probability_or_confidence: 95, time_window: 'Next 12 Hours', data_status: 'SIMULATED' 
    });
  }

  // 3. Save the Simulated Risks to Supabase
  if (newRisks.length > 0) {
    const { error: rErr } = await supabase.from('risk_events').insert(newRisks);
    if (rErr) console.error("Error saving simulated risks:", rErr);
  }
}

export async function clearSimulations() {
  await supabase.from('risk_events').delete().eq('data_status', 'SIMULATED');
  await supabase.from('scenarios').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
}
