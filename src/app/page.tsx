"use client";

import { useState, useEffect } from "react";
import { 
  Home, Map as MapIcon, Activity, ShieldAlert, Globe, Crosshair, 
  Bell, Search, Menu, X, CloudRain, Droplet, Thermometer, Wind, 
  Zap, Flame, Camera, ArrowRight, ArrowDown, Users, CheckCircle, 
  TrendingUp, AlertTriangle, AlertCircle, RefreshCw, Car, HeartPulse, LogOut
} from "lucide-react";
import RegionMap from "@/components/RegionMap";
import { getRiskEvents, runSimulation, clearSimulations, RiskEvent } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [selectedState, setSelectedState] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [activeView, setActiveView] = useState('my-city');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [cityPoints, setCityPoints] = useState(145);
  const [resilienceScore, setResilienceScore] = useState(82);
  const [rainfall, setRainfall] = useState(50);
  const [simLoading, setSimLoading] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const [risks, setRisks] = useState<RiskEvent[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.state) {
        setSelectedState(session.user.user_metadata.state);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.state) {
        setSelectedState(session.user.user_metadata.state);
      }
    });

    fetchRisks();

    return () => subscription.unsubscribe();
  }, []);

  const fetchRisks = async () => {
    const data = await getRiskEvents();
    setRisks(data);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleDemoLogin = () => {
    // Fake login for instant demo without configuring Google Auth
    setSession({ user: { user_metadata: { full_name: 'Demo Judge', avatar_url: 'https://i.pravatar.cc/100?img=11' } } });
  };

  const saveSelectedState = async (stateName: string) => {
    setSelectedState(stateName);
    if (session?.user?.id && !session.user.user_metadata?.full_name?.includes('Demo')) {
      await supabase.auth.updateUser({
        data: { state: stateName }
      });
    } else if (session) {
       // Demo user local state save
       setSession({ ...session, user: { ...session.user, user_metadata: { ...session.user.user_metadata, state: stateName } } });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setSelectedState("");
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    await clearSimulations();
    await runSimulation(rainfall);
    await fetchRisks();
    setResilienceScore(rainfall > 120 ? 68 : 82);
    setHasSimulated(true);
    setSimLoading(false);
  };

  const handleClearSim = async () => {
    setSimLoading(true);
    await clearSimulations();
    await fetchRisks();
    setResilienceScore(82);
    setRainfall(50);
    setHasSimulated(false);
    setSimLoading(false);
  };

  const completeMission = () => {
    setSimLoading(true);
    setTimeout(() => {
      setCityPoints(prev => prev + 25);
      setMissionComplete(true);
      setSimLoading(false);
    }, 800);
  }

  // --- AUTH SCREENS ---

  if (authLoading) return <div className="h-screen bg-[#070b14] flex items-center justify-center text-emerald-400"><RefreshCw className="animate-spin"/></div>;

  if (!session) {
    return (
      <div className="h-screen bg-[#070b14] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a111c] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <ShieldAlert className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-2">BHARAT AI 2.0</h1>
          <p className="text-slate-400 text-sm mb-8">The Living Planet Intelligence Platform.</p>
          
          <button onClick={handleGoogleLogin} className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 21.53 7.7 24 12 24z"/><path fill="#FBBC05" d="M5.84 15.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V8.06H2.18C1.43 9.55 1 11.22 1 12s.43 2.45 1.18 3.94l3.66-2.84z"/><path fill="#EA4335" d="M12 4.75c1.61 0 3.06.56 4.2 1.64l3.15-3.15C17.45 1.43 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.06l3.66 2.84c.87-2.6 3.3-4.15 6.16-4.15z"/></svg>
            Continue with Google
          </button>

          <button onClick={handleDemoLogin} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 px-4 rounded-xl transition-colors">
            Continue as Guest (Demo)
          </button>
          
          <p className="text-[10px] text-slate-500 mt-6 mt-4">Note: Google Auth requires Supabase dashboard configuration. Use Guest Mode if not configured yet.</p>
        </div>
      </div>
    );
  }

  if (!selectedState) {
    const states = ['Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu'];
    return (
      <div className="h-screen bg-[#070b14] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a111c] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
          <Globe className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Select Your Region</h2>
          <p className="text-slate-400 text-sm mb-8">BHARAT AI will personalize intelligence and alerts for your state.</p>
          
          <div className="space-y-3">
            {states.map(state => (
              <button 
                key={state}
                onClick={() => saveSelectedState(state)}
                className="w-full bg-[#0f1722] hover:bg-slate-800 border border-slate-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---

  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Citizen";
  const userAvatar = session?.user?.user_metadata?.avatar_url || "https://i.pravatar.cc/100?img=11";

  const renderView = () => {
    switch (activeView) {
      case 'my-city': return <MyStateView stateName={selectedState} resilienceScore={resilienceScore} setActiveView={setActiveView} />;
      case 'ai-map': return <AIMapView stateName={selectedState} />;
      case 'future-mode': return <FutureModeView stateName={selectedState} rainfall={rainfall} setRainfall={setRainfall} loading={simLoading} onSimulate={handleSimulate} onClear={handleClearSim} hasSimulated={hasSimulated} />;
      case 'missions': return <MissionsView stateName={selectedState} points={cityPoints} onComplete={completeMission} isComplete={missionComplete} loading={simLoading} />;
      case 'command-center': return <CommandCenterView risks={risks} />;
      case 'global-library': return <GlobalLibraryView />;
      default: return <MyStateView stateName={selectedState} resilienceScore={resilienceScore} setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-200 overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar */}
      <aside className={`w-64 bg-[#0a111c] border-r border-slate-800/50 flex flex-col transition-all shrink-0 z-30 relative ${isSidebarOpen ? 'ml-0' : '-ml-64'}`}>
        <div className="p-5 border-b border-slate-800/50">
          <div className="flex items-center gap-2 mb-1 text-emerald-400">
            <ShieldAlert size={24} className="text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight">BHARAT AI 2.0</h1>
          </div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Living Planet Intelligence</p>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 ml-3 mb-2 tracking-wider">Citizen</div>
          <NavItem icon={<Home size={18} />} label={`My State (${selectedState})`} active={activeView === 'my-city'} onClick={() => setActiveView('my-city')} />
          <NavItem icon={<MapIcon size={18} />} label="AI Map" active={activeView === 'ai-map'} onClick={() => setActiveView('ai-map')} />
          <NavItem icon={<Activity size={18} />} label="Future Mode" active={activeView === 'future-mode'} onClick={() => setActiveView('future-mode')} />
          <NavItem icon={<Crosshair size={18} />} label="Save Your State" active={activeView === 'missions'} onClick={() => setActiveView('missions')} />
          
          <div className="mt-6 mb-2 text-[10px] uppercase font-bold text-slate-500 ml-3 tracking-wider">Authority</div>
          <NavItem icon={<AlertTriangle size={18} />} label="Command Center" active={activeView === 'command-center'} onClick={() => setActiveView('command-center')} />
          <NavItem icon={<Globe size={18} />} label="Global Library" active={activeView === 'global-library'} onClick={() => setActiveView('global-library')} />
        </nav>
        
        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-emerald-900/40 to-[#0a111c] border border-emerald-900/30 text-center relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => setActiveView('missions')}>
          <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h4 className="font-bold text-slate-300 text-xs mb-1">State Hero Status</h4>
          <div className="text-2xl font-bold text-emerald-400">{cityPoints} <span className="text-sm text-emerald-500/70">pts</span></div>
          <div className="text-[10px] text-slate-400 mt-1">Rank: #42 in {selectedState}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 bg-[#0a111c]/80 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
              <Menu size={20} />
            </button>
            <div className="text-sm font-semibold text-slate-300 hidden md:block">
              {activeView === 'my-city' && `${selectedState} Overview`}
              {activeView === 'future-mode' && 'Simulation Engine'}
              {activeView === 'missions' && 'Citizen Engagement'}
              {activeView === 'command-center' && 'Emergency Operations'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-800 pl-6 group relative cursor-pointer">
              <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-600" />
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-white">{userName}</div>
                <div className="text-[10px] text-emerald-400 uppercase tracking-widest">{selectedState} Hero</div>
              </div>
              {/* Logout Tooltip */}
              <button onClick={handleSignOut} className="absolute top-10 right-0 bg-[#0f1722] border border-slate-700 rounded-lg p-2 flex items-center gap-2 text-red-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                 <LogOut size={14}/> Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Injection */}
        <div className="flex-1 overflow-auto bg-[#070b14] p-4 md:p-6 relative z-10">
           {renderView()}
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// View 1: My State (Home)
// -----------------------------------------------------------------------------
function MyStateView({ stateName, resilienceScore, setActiveView }: any) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Overall Score */}
      <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <Globe className="absolute -right-10 -top-10 w-64 h-64 text-slate-800/30 rotate-12 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase mb-1">Bharat AI</h2>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 uppercase">
            GOOD MORNING 👋 {stateName}
          </h1>
          <p className="text-slate-400 text-sm max-w-md">Your state is actively monitored by 6 interconnected AI agents assessing weather, infrastructure, and mobility.</p>
        </div>
        
        <div className="bg-[#0a111c] border border-slate-700/50 p-4 rounded-xl flex items-center gap-4 z-10 min-w-[200px]">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xl font-bold text-emerald-400 relative">
            {resilienceScore}%
            {resilienceScore < 70 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall</div>
            <div className="text-sm font-bold text-white">Resilience</div>
            <div className={`text-[10px] font-bold ${resilienceScore < 70 ? 'text-orange-400' : 'text-emerald-400'}`}>
              {resilienceScore < 70 ? 'Caution Advised' : 'Optimal Status'}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
            <div className={`p-4 rounded-xl ${resilienceScore < 70 ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <CloudRain size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-400 font-semibold mb-1">Rain Risk</div>
              <div className={`text-lg font-bold ${resilienceScore < 70 ? 'text-orange-400' : 'text-amber-400'}`}>
                {resilienceScore < 70 ? 'HIGH' : 'MEDIUM'}
              </div>
            </div>
         </div>

         <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
            <div className={`p-4 rounded-xl ${resilienceScore < 70 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Car size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-400 font-semibold mb-1">Traffic Congestion</div>
              <div className={`text-lg font-bold ${resilienceScore < 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                {resilienceScore < 70 ? 'SEVERE' : 'NORMAL'}
              </div>
            </div>
         </div>

         <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="p-4 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Droplet size={24} />
            </div>
            <div>
              <div className="text-sm text-slate-400 font-semibold mb-1">Water Supply</div>
              <div className="text-lg font-bold text-emerald-400">NORMAL</div>
            </div>
         </div>
      </div>

      {/* Main Promo & Agent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0f1722] to-[#0a111c] border border-slate-800 rounded-2xl p-8 shadow-lg flex flex-col justify-center items-start relative overflow-hidden group cursor-pointer" onClick={() => setActiveView('future-mode')}>
          <Activity className="absolute -right-6 -bottom-6 w-48 h-48 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500" />
          <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 relative z-10"><Zap size={18}/> THE KILLER FEATURE</h3>
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">🔮 Future Mode</h2>
          <p className="text-slate-400 max-w-md mb-6 leading-relaxed relative z-10">
            Stop reacting to problems. Start predicting them. Ask BHARAT AI what happens if it rains heavily tomorrow and watch the entire state's cascading response.
          </p>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-[#070b14] font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 relative z-10">
            Try Simulation Engine <ArrowRight size={16} />
          </button>
        </div>

        <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-full relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Live Agent Core</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Autonomous agents analyzing {stateName}</p>
          
          <div className="flex-1 space-y-4">
            <AgentFeedItem name="[Weather-Agent]" desc="Analyzing incoming monsoon front..." time="12s" color="bg-blue-500" icon={<CloudRain size={14}/>} />
            <AgentFeedItem name="[Mobility-Agent]" desc="Mapping regional bottleneck risks..." time="18s" color="bg-orange-500" icon={<Car size={14}/>} />
            <AgentFeedItem name="[Energy-Agent]" desc="Grid load stable at 84% capacity." time="24s" color="bg-emerald-500" icon={<Zap size={14}/>} />
            <AgentFeedItem name="[Health-Agent]" desc="No extreme environmental threats." time="32s" color="bg-emerald-500" icon={<HeartPulse size={14}/>} />
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// View 2: AI Map
// -----------------------------------------------------------------------------
function AIMapView({ stateName }: { stateName: string }) {
  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
       <div className="flex-1 bg-[#0f1722] border border-slate-800 rounded-2xl p-2 shadow-lg relative min-h-[400px]">
         <RegionMap regionName={stateName} />
       </div>
       <div className="w-full md:w-80 shrink-0 space-y-4">
          <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-5 shadow-lg">
             <h3 className="font-bold text-white mb-4">Legend</h3>
             <div className="space-y-3">
               <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span><span className="text-sm text-slate-300">Critical Risk</span></div>
               <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></span><span className="text-sm text-slate-300">High Risk</span></div>
               <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span><span className="text-sm text-slate-300">Medium Risk</span></div>
               <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span><span className="text-sm text-slate-300">Normal</span></div>
             </div>
          </div>
          <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-5 shadow-lg">
             <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2"><MapIcon size={16}/> Tap an area</h3>
             <p className="text-sm text-slate-400">Click on any marker on the digital twin to instantly ask the AI agents for local conditions and risk assessments in {stateName}.</p>
          </div>
       </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// View 3: Future Mode (What-If)
// -----------------------------------------------------------------------------
function FutureModeView({ stateName, rainfall, setRainfall, loading, onSimulate, onClear, hasSimulated }: any) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
       <div className="text-center mb-8">
         <Activity className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
         <h2 className="text-3xl font-bold text-white mb-2">What if...?</h2>
         <p className="text-slate-400 text-sm max-w-lg mx-auto">Use the slider below to simulate extreme conditions. BHARAT AI's neural risk chain will predict exactly how {stateName} will collapse—and how to stop it.</p>
       </div>

       <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-8 shadow-lg">
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Rainfall Scenario ({stateName})</label>
              <div className="bg-[#0a111c] border border-slate-700 px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold text-emerald-400">{rainfall}</span>
                <span className="text-sm text-slate-500 ml-1">mm</span>
              </div>
            </div>
            <input 
              type="range" min="0" max="250" step="10" 
              value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
               <span>Dry (0mm)</span>
               <span>Heavy Rain (100mm)</span>
               <span>Extreme Flood (250mm)</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onSimulate} 
              disabled={loading}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-[#070b14] font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 text-lg"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Zap />}
              {loading ? 'AI Computing Chain Reaction...' : 'SHOW ME WHAT HAPPENS'}
            </button>
            {hasSimulated && (
              <button onClick={onClear} disabled={loading} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                Reset
              </button>
            )}
          </div>
       </div>

       {hasSimulated && rainfall > 120 && (
         <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <h3 className="text-center font-bold text-slate-400 uppercase tracking-widest text-sm mb-6">Predicted AI Risk Chain</h3>
           
           <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-8">
             <ChainNode icon={<CloudRain/>} title="HEAVY RAIN" color="bg-blue-500" />
             <ArrowRight className="hidden md:block text-slate-600" />
             <ArrowDown className="md:hidden text-slate-600" />
             
             <ChainNode icon={<Droplet/>} title="DRAINAGE STRESS" color="bg-cyan-500" />
             <ArrowRight className="hidden md:block text-slate-600" />
             <ArrowDown className="md:hidden text-slate-600" />
             
             <ChainNode icon={<AlertTriangle/>} title="ROAD FLOODING" color="bg-orange-500" />
             <ArrowRight className="hidden md:block text-slate-600" />
             <ArrowDown className="md:hidden text-slate-600" />
             
             <ChainNode icon={<Car/>} title="TRAFFIC +38%" color="bg-red-500" />
             <ArrowRight className="hidden md:block text-slate-600" />
             <ArrowDown className="md:hidden text-slate-600" />
             
             <ChainNode icon={<Activity/>} title="EMERGENCY DELAY" color="bg-red-600" pulse />
           </div>

           <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><ShieldAlert size={18}/> AI Recommendation</h4>
               <p className="text-slate-300 text-sm">Clear drainage hotspot A in critical zones and re-route ambulances away from major highways before the rainfall event hits 150mm.</p>
             </div>
             <button className="shrink-0 bg-[#070b14] border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
               Issue Authority Alert
             </button>
           </div>
         </div>
       )}

       {hasSimulated && rainfall <= 120 && (
         <div className="mt-8 text-center p-8 bg-[#0f1722] border border-slate-800 rounded-2xl animate-in fade-in">
           <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
           <h3 className="text-white font-bold text-lg mb-2">State Infrastructure Holding</h3>
           <p className="text-slate-400 text-sm">At {rainfall}mm, the drainage systems and traffic networks are predicted to operate within safe margins. No cascading failures detected.</p>
         </div>
       )}
    </div>
  );
}

function ChainNode({ icon, title, color, pulse }: any) {
  return (
    <div className={`flex flex-col items-center bg-[#0a111c] border border-slate-700 p-4 rounded-xl shadow-lg w-full md:w-32 ${pulse ? 'ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''}`}>
      <div className={`p-3 rounded-full ${color} text-white mb-2 ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div className="text-[10px] font-bold text-slate-300 text-center uppercase tracking-wider">{title}</div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// View 4: Citizen Missions
// -----------------------------------------------------------------------------
function MissionsView({ stateName, points, onComplete, isComplete, loading }: any) {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Crosshair className="text-emerald-400"/> Save {stateName}</h2>
          <p className="text-slate-400 text-sm mb-6">Don't just complain. Help the AI ground its data and earn State Hero Points.</p>
          
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border ${isComplete ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-slate-900 border-slate-700 relative overflow-hidden group'}`}>
               {!isComplete && <div className="absolute top-0 right-0 p-4"><span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span></div>}
               <div className="flex gap-4 items-start">
                 <div className="p-3 bg-[#070b14] border border-slate-800 rounded-lg text-emerald-400 shrink-0"><Camera /></div>
                 <div className="flex-1">
                   <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">🚨 STATE MISSION</div>
                   <h3 className="text-white font-bold mb-1">Verify Water Leak</h3>
                   <p className="text-xs text-slate-400 mb-4">A massive water leak has been reported by an IoT pressure sensor in your area. We need a human to verify the street condition.</p>
                   
                   {isComplete ? (
                     <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                       <CheckCircle size={16} /> Verified (+25 Points added)
                     </div>
                   ) : (
                     <button onClick={onComplete} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-[#070b14] font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                       {loading ? <RefreshCw size={14} className="animate-spin"/> : <Camera size={14}/>}
                       {loading ? 'Verifying...' : 'Take Photo to Verify (+25 pts)'}
                     </button>
                   )}
                 </div>
               </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0a111c] border border-slate-800 opacity-70">
               <div className="flex gap-4 items-start">
                 <div className="p-3 bg-[#070b14] border border-slate-700 rounded-lg text-slate-500 shrink-0"><Thermometer /></div>
                 <div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">♻️ STATE MISSION</div>
                   <h3 className="text-slate-300 font-bold mb-1">Correct Waste Segregation</h3>
                   <p className="text-xs text-slate-500 mb-3">Scan your recycling bin to confirm proper segregation of plastics.</p>
                   <button className="bg-slate-800 text-slate-400 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-2">
                     Locked (+10 pts)
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white mb-6 text-center text-lg">🏆 State Leaderboard</h3>
          <div className="space-y-4">
            <LeaderboardRow city={stateName} score="82%" width="82%" active />
            <LeaderboardRow city={stateName === 'Maharashtra' ? 'Karnataka' : 'Maharashtra'} score="76%" width="76%" />
            <LeaderboardRow city="Delhi" score="71%" width="71%" />
            <LeaderboardRow city="Gujarat" score="68%" width="68%" />
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-6">This is an engagement feature reflecting citizen participation.</p>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ city, score, width, active }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className={active ? 'text-emerald-400' : 'text-slate-300'}>{city}</span>
        <span className="text-slate-400">{score}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${active ? 'bg-emerald-500' : 'bg-slate-600'}`} style={{ width }}></div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// View 5: Command Center
// -----------------------------------------------------------------------------
function CommandCenterView({ risks }: any) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 border-b border-slate-800 pb-4">
        <ShieldAlert className="text-red-500"/> BHARAT AI COMMAND CENTER
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1 bg-red-900/10 border border-red-900/30 rounded-2xl p-6 flex flex-col justify-center items-center">
           <div className="text-sm font-bold text-red-500 mb-2">ACTIVE RISKS</div>
           <div className="text-6xl font-black text-red-500">17</div>
        </div>
        <div className="md:col-span-3 bg-[#0f1722] border border-slate-800 rounded-2xl p-6 grid grid-cols-3 gap-4">
           <div className="text-center p-4 bg-[#0a111c] rounded-xl border border-slate-800"><div className="text-3xl font-bold text-red-500 mb-1">3</div><div className="text-xs text-slate-400 font-bold uppercase">Critical</div></div>
           <div className="text-center p-4 bg-[#0a111c] rounded-xl border border-slate-800"><div className="text-3xl font-bold text-orange-500 mb-1">6</div><div className="text-xs text-slate-400 font-bold uppercase">High</div></div>
           <div className="text-center p-4 bg-[#0a111c] rounded-xl border border-slate-800"><div className="text-3xl font-bold text-amber-500 mb-1">8</div><div className="text-xs text-slate-400 font-bold uppercase">Medium</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-[#0f1722] border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Top Priority Threat</div>
           <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-2"><CloudRain className="text-blue-400"/> FLOOD WARNING</h3>
           <div className="grid grid-cols-2 gap-4 mb-6">
             <div><span className="text-xs text-slate-400">Probability:</span> <span className="font-bold text-red-400">74%</span></div>
             <div><span className="text-xs text-slate-400">Potential Impact:</span> <span className="font-bold text-red-400">High</span></div>
           </div>
           <div className="bg-[#0a111c] border border-slate-800 rounded-xl p-4">
             <div className="text-xs font-bold text-slate-400 mb-3 uppercase">Predicted Infrastructure Affected</div>
             <div className="space-y-2 text-sm text-slate-300">
               <div className="flex justify-between border-b border-slate-800 pb-1"><span>Roads</span><span className="font-bold text-white">12</span></div>
               <div className="flex justify-between border-b border-slate-800 pb-1"><span>Hospitals</span><span className="font-bold text-red-400">2</span></div>
               <div className="flex justify-between border-b border-slate-800 pb-1"><span>Schools</span><span className="font-bold text-white">7</span></div>
               <div className="flex justify-between"><span>Traffic Zones</span><span className="font-bold text-white">5</span></div>
             </div>
           </div>
         </div>

         <div className="bg-gradient-to-b from-emerald-900/20 to-[#0f1722] border border-emerald-900/30 rounded-2xl p-6 shadow-lg">
           <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2"><Zap size={20}/> MASTER AI RECOMMENDATION</h3>
           <div className="space-y-4">
             <ActionItem num="1" text="Inspect critical drainage zones" status="Pending Deployment" />
             <ActionItem num="2" text="Prepare emergency route protocols" status="Coordinating with Traffic Dept" />
             <ActionItem num="3" text="Alert vulnerable areas" status="Citizen App Broadcast Ready" />
             <ActionItem num="4" text="Deploy response team" status="Standby" />
           </div>
           <button className="w-full mt-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2">
             <AlertCircle size={18} /> Execute Master Plan
           </button>
         </div>
      </div>
    </div>
  );
}

function ActionItem({ num, text, status }: any) {
  return (
    <div className="flex items-center gap-4 bg-[#0a111c] border border-slate-800 p-4 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">{num}</div>
      <div className="flex-1">
        <div className="font-bold text-slate-200 text-sm">{text}</div>
        <div className="text-[10px] text-slate-500 uppercase">{status}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// View 6: Global Library
// -----------------------------------------------------------------------------
function GlobalLibraryView() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="text-center mb-8">
         <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
         <h2 className="text-3xl font-bold text-white mb-2">Global Problem Library</h2>
         <p className="text-slate-400 text-sm max-w-lg mx-auto">BHARAT AI is India-first, but globally expandable.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <GlobalCard country="India 🇮🇳" theme="Flooding, Scarcity, Heat" icon={<CloudRain className="text-blue-400"/>} active />
         <GlobalCard country="Japan 🇯🇵" theme="Earthquake Preparedness" icon={<Activity className="text-red-400"/>} />
         <GlobalCard country="USA 🇺🇸" theme="Wildfire Risk" icon={<Flame className="text-orange-500"/>} />
       </div>
    </div>
  );
}

function GlobalCard({ country, theme, icon, active }: any) {
  return (
    <div className={`bg-[#0f1722] border ${active ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-800'} rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:border-emerald-500/30`}>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-bold text-white">{country}</h3>
        <div className="p-3 bg-[#0a111c] rounded-xl">{icon}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">AI Module</div>
        <div className="text-sm font-semibold text-slate-300">{theme}</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Shared UI Components
// -----------------------------------------------------------------------------
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}

function AgentFeedItem({ name, desc, time, color, icon }: any) {
  return (
    <div className="flex gap-3 items-start relative pl-2 border-l border-slate-800">
      <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${color}`}></div>
      <div className={`p-1.5 rounded-md ${color.replace('bg-', 'bg-').replace('500', '500/20 text-').replace('text-bg-', 'text-')} shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-300">{name}</div>
        <div className="text-[10px] text-slate-500 truncate">{desc}</div>
      </div>
      <div className="text-[10px] font-mono text-slate-600">{time}</div>
    </div>
  );
}
