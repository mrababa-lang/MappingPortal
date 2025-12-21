
import React, { useState, useEffect } from 'react';
import { useAppConfig, useUpdateAppConfig } from '../hooks/useAdminData';
import { AppConfig } from '../types';
import { Card, Button, Switch, Input, TextArea } from '../components/UI';
import { 
  Sparkles, 
  Shield, 
  AlertOctagon, 
  Save, 
  Activity, 
  Loader2, 
  Cpu, 
  Globe, 
  Zap, 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  Code,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';

export const ConfigurationView: React.FC = () => {
  const { data: serverConfig, isLoading } = useAppConfig();
  const updateConfigMutation = useUpdateAppConfig();
  
  const [localConfig, setLocalConfig] = useState<AppConfig | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  useEffect(() => {
    if (serverConfig) {
      setLocalConfig(serverConfig);
    }
  }, [serverConfig]);

  const handleSave = () => {
    if (localConfig) {
      updateConfigMutation.mutate(localConfig, {
        onSuccess: () => toast.success("System configuration synchronized.")
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Diagnostic call to verify AI availability on the backend
      const response = await api.get('/config/test-ai-connection', {
        params: { provider: localConfig?.aiProvider }
      });
      toast.success(`${localConfig?.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API is reachable. Latency: ${response.data.latency}ms`);
    } catch (e) {
      toast.error("API Connection Failed. Please verify your credentials and network policy.");
    } finally {
      setIsTesting(false);
    }
  };

  const updateConfig = (key: keyof AppConfig, value: any) => {
    if (localConfig) {
      setLocalConfig({ ...localConfig, [key]: value });
    }
  };

  if (isLoading || !localConfig) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
           <p className="text-slate-500 text-sm">Orchestrate AI models, security keys, and global portal behavior.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Button variant="secondary" onClick={handleTestConnection} isLoading={isTesting} disabled={!localConfig.enableAI} className="flex-1 md:flex-none">
                <Zap size={18} className="text-amber-500" /> Test Connection
            </Button>
            <Button onClick={handleSave} variant="primary" isLoading={updateConfigMutation.isPending} className="flex-1 md:flex-none shadow-lg shadow-slate-900/10">
              <Save size={18} /> Save Changes
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI & Prompt Settings */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">AI Intelligence Core</h2>
                    <p className="text-xs text-slate-400 font-medium">Configure model selection and system-level prompting.</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${localConfig.enableAI ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {localConfig.enableAI ? 'Active' : 'Disabled'}
                </span>
                <Switch 
                    checked={localConfig.enableAI} 
                    onChange={(val) => updateConfig('enableAI', val)} 
                />
              </div>
            </div>
            
            <div className={`space-y-8 transition-opacity duration-300 ${!localConfig.enableAI ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
               <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Cpu size={14} className="text-slate-400" /> Model Orchestration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                          onClick={() => updateConfig('aiProvider', 'gemini')}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${localConfig.aiProvider === 'gemini' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                      >
                          <div className={`p-2 rounded-lg ${localConfig.aiProvider === 'gemini' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                             <Globe size={20} />
                          </div>
                          <div>
                              <span className="text-sm font-bold block text-slate-900">Google Gemini</span>
                              <span className="text-[10px] text-slate-500 font-medium">Optimized for multimodal extraction & speed.</span>
                          </div>
                          {localConfig.aiProvider === 'gemini' && <CheckCircle2 size={16} className="ml-auto text-indigo-600" />}
                      </button>
                      <button 
                          onClick={() => updateConfig('aiProvider', 'openai')}
                          className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${localConfig.aiProvider === 'openai' ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                      >
                          <div className={`p-2 rounded-lg ${localConfig.aiProvider === 'openai' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                             <Zap size={20} />
                          </div>
                          <div>
                              <span className="text-sm font-bold block text-slate-900">OpenAI ChatGPT</span>
                              <span className="text-[10px] text-slate-500 font-medium">Advanced reasoning for complex classification.</span>
                          </div>
                          {localConfig.aiProvider === 'openai' && <CheckCircle2 size={16} className="ml-auto text-emerald-600" />}
                      </button>
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-50">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      <Code size={14} className="text-slate-400" /> AI Prompt Customization
                  </h3>
                  <TextArea 
                      label="Global System Instruction"
                      placeholder="e.g., You are a specialized vehicle data cleaning agent for SlashData. Your goal is to normalize raw ERP vehicle descriptions into clean manufacturer and model hierarchies..."
                      value={localConfig.systemInstruction}
                      onChange={(e) => updateConfig('systemInstruction', e.target.value)}
                      rows={8}
                      className="font-mono text-xs leading-relaxed"
                  />
                  <div className="p-3 bg-blue-50/50 rounded-lg flex items-start gap-3 border border-blue-100">
                    <Settings size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-700 leading-normal">
                      <strong>Dynamic Injection:</strong> This instruction is prepended to every request sent to the AI. Changes here immediately impact mapping confidence and accuracy.
                    </p>
                  </div>
               </div>

               <div className="p-5 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex justify-between items-center">
                     <div>
                       <h3 className="text-sm font-bold text-slate-800">Confidence Threshold</h3>
                       <p className="text-[10px] text-slate-500">Auto-reject matches below this probability.</p>
                     </div>
                     <span className="text-sm font-black text-indigo-600 tabular-nums bg-indigo-100 px-3 py-1 rounded-full">{localConfig.aiConfidenceThreshold}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={localConfig.aiConfidenceThreshold}
                    onChange={(e) => updateConfig('aiConfidenceThreshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
            </div>

            {!localConfig.enableAI && (
               <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-100 animate-in fade-in slide-in-from-top-2">
                  <AlertOctagon size={18} className="shrink-0 text-amber-500" />
                  <div>
                    <p className="font-bold">AI Subsystems Disabled</p>
                    <p className="opacity-80 mt-1">Manual mapping logic is currently enforced across all integration points. AI matching and description generation are paused.</p>
                  </div>
               </div>
            )}
          </Card>
        </div>

        {/* Right Column: Keys & Security */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Security & API Keys</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} /> Gemini API Key
                  </label>
                  <button onClick={() => setShowGeminiKey(!showGeminiKey)} className="text-slate-400 hover:text-slate-600">
                    {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <Input 
                  label=""
                  type={showGeminiKey ? "text" : "password"}
                  placeholder="Enter Google AI Key..."
                  value={localConfig.geminiApiKey || ''}
                  onChange={(e) => updateConfig('geminiApiKey', e.target.value)}
                  className="bg-slate-50 h-10 text-xs font-mono"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} /> OpenAI API Key
                  </label>
                  <button onClick={() => setShowOpenAIKey(!showOpenAIKey)} className="text-slate-400 hover:text-slate-600">
                    {showOpenAIKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <Input 
                  label=""
                  type={showOpenAIKey ? "text" : "password"}
                  placeholder="Enter OpenAI Key..."
                  value={localConfig.openaiApiKey || ''}
                  onChange={(e) => updateConfig('openaiApiKey', e.target.value)}
                  className="bg-slate-50 h-10 text-xs font-mono"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Activity size={120} />
            </div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Activity size={20} className="text-indigo-400" />
                  </div>
                  <h2 className="text-lg font-bold">Diagnostic Status</h2>
               </div>

               <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                        <span>Database Health</span>
                        <span className="text-emerald-500">Synced</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[100%]"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-500">
                        <span>API Server Latency</span>
                        <span className="text-indigo-400">Stable</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[35%] animate-pulse"></div>
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-3">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <p className="text-sm font-bold">Maintenance</p>
                          <p className="text-[10px] text-slate-400">Global Lock</p>
                        </div>
                        <Switch 
                          checked={localConfig.maintenanceMode} 
                          onChange={(val) => updateConfig('maintenanceMode', val)} 
                        />
                     </div>
                     <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <p className="text-sm font-bold">Audit Trail</p>
                          <p className="text-[10px] text-slate-400">Enhanced Logs</p>
                        </div>
                        <Switch 
                          checked={localConfig.enableAuditLog} 
                          onChange={(val) => updateConfig('enableAuditLog', val)} 
                        />
                     </div>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
