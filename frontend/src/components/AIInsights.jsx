import { useState } from 'react';
import { Sparkles, ArrowRight, TrendingUp, Tags, Users, Send, X, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const AIInsights = ({ results, simpleMode }) => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [simulation, setSimulation] = useState(null);

  if (!results) return null;

  const { actions, debate = [], marketing = [] } = results;

  // Filter actions for simple mode vs advanced mode
  const displayActions = simpleMode 
    ? actions.slice(0, 3).map(a => a.replace(/Units|Expected Demand|Current Stock/gi, '').trim()) 
    : actions;

  const handleApplyClick = (action) => {
    const text = action.toLowerCase();
    let type = 'unknown';
    if (text.includes('restock')) type = 'restock';
    else if (text.includes('discount')) type = 'discount';
    else if (text.includes('promotion') || text.includes('promote') || text.includes('clear')) type = 'promotion';
    
    let product = 'Product';
    const extractMatch = action.match(/(?:of|on)(?:\s+excess inventory of)?\s+(.+?)(?:\s+(?:immediately|as demand|to clear)|[.\n]|$)/i);
    if (extractMatch && extractMatch[1]) {
      product = extractMatch[1].trim();
    }

    let before = { stock: 100, demand: 250, sales: 1000, profit: 300 };
    let after = { stock: 100, demand: 250, sales: 1000, profit: 300 };
    let insight = '';

    if (type === 'restock') {
      before = { stock: 100, demand: 600, sales: 500, profit: 150 };
      after = { stock: 800, demand: 600, sales: 3000, profit: 900 };
      insight = `Restocking ${product} increased potential sales by 500% by avoiding stockouts and fulfilling high demand.`;
    } else if (type === 'discount') {
      before = { stock: 400, demand: 150, sales: 750, profit: 300 };
      after = { stock: 200, demand: 350, sales: 1400, profit: 450 };
      insight = `Applying a discount on ${product} improved demand by 133%, recovering sales from excess stock.`;
    } else if (type === 'promotion') {
      before = { stock: 500, demand: 100, sales: 400, profit: 120 };
      after = { stock: 200, demand: 400, sales: 1600, profit: 500 };
      insight = `Promotion helped reduce overstock efficiently for ${product}, boosting sales velocity significantly.`;
    } else {
      before = { stock: 200, demand: 200, sales: 1000, profit: 300 };
      after = { stock: 250, demand: 250, sales: 1250, profit: 375 };
      insight = `The suggested action stabilizes ${product} performance metrics.`;
    }

    setSimulation({ type, product, before, after, insight });
    setSelectedAction(action);
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Core Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg text-white">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">AI Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayActions.length === 0 ? (
            <div className="col-span-2 premium-card p-8 text-center text-slate-500">
              No active recommendations at this moment. Everything looks good!
            </div>
          ) : (
            displayActions.map((action, idx) => {
              const isRestock = action.toLowerCase().includes("restock");
              const isPrice = action.toLowerCase().includes("price") || action.toLowerCase().includes("discount");
              
              const Icon = isRestock ? TrendingUp : (isPrice ? Tags : Sparkles);
              const colorClass = isRestock ? "from-emerald-400 to-emerald-600" : (isPrice ? "from-blue-400 to-blue-600" : "from-primary to-secondary");
              const bgClass = isRestock ? "bg-emerald-50 border-emerald-100" : (isPrice ? "bg-blue-50 border-blue-100" : "bg-indigo-50 border-indigo-100");

              return (
                <div key={idx} className={`relative overflow-hidden premium-card p-6 border group ${bgClass}`}>
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-80 ${colorClass}`}></div>
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white shadow-sm text-slate-700`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800 mb-2">
                         {simpleMode ? (isRestock ? "Buy more stock" : "Change Pricing") : "Action Required"}
                      </h3>
                      <p className="text-slate-600 font-medium">
                        {action}
                      </p>
                    </div>
                    <button 
                       onClick={() => handleApplyClick(action)}
                       className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary transition-colors mt-1 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 duration-300"
                    >
                      Apply <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 2. Autonomous Executions & Agent Debate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
        
        {/* Agent Debate */}
        {debate.length > 0 && !simpleMode && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-primary" /> Inside The Engine
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-auto border border-indigo-200">Agent Debate Log</span>
            </h3>
            
            <div className="premium-card bg-slate-900 border-none overflow-hidden flex flex-col h-[400px]">
              <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> recording _transcript
              </div>
              
              <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                {debate.map((stmt, idx) => {
                  const isCEO = stmt.agent.includes("CEO");
                  return (
                    <div key={idx} className={`flex flex-col ${isCEO ? "items-center" : (idx % 2 === 0 ? "items-start" : "items-end")}`}>
                      <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">{stmt.agent}</span>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                        isCEO 
                          ? "bg-gradient-to-r from-primary to-secondary text-white font-medium border border-indigo-400/30 text-center shadow-lg w-full" 
                          : (idx % 2 === 0 ? "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700" : "bg-slate-700 text-slate-100 rounded-tr-sm border border-slate-600")
                      }`}>
                        {stmt.message}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Generative Executions */}
        {marketing.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Send className="text-emerald-500" /> Auto-Generated Assets
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full ml-auto flex items-center gap-1 border border-emerald-200"><Sparkles size={12}/> Ready to Send</span>
            </h3>
            
            <div className="space-y-4 h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {marketing.map((asset, idx) => (
                <div key={idx} className="premium-card p-5 border border-slate-200 hover:border-emerald-300 transition-colors group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded">
                      {asset.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Target: {asset.target}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 font-medium whitespace-pre-wrap font-sans">
                    {asset.content}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                      Copy Text
                    </button>
                    <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-500/20">
                      <Send size={14} /> Execute Target
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 3. Action Impact Analysis Modal */}
      {selectedAction && simulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex justify-between items-center text-white">
              <div>
                 <h3 className="text-2xl font-black flex items-center gap-3">
                   <BarChart2 className="text-emerald-400" size={28} /> Action Impact Analysis
                 </h3>
                 <p className="text-slate-300 font-medium mt-1">Simulated execution for: {simulation.product}</p>
              </div>
              <button onClick={() => setSelectedAction(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left: Metrics summary */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="p-5 bg-white border border-rose-100 rounded-xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                     <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Current State (Before)</h4>
                     <div className="space-y-3">
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Stock</span><span className="font-bold text-rose-600">{simulation.before.stock}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Demand</span><span className="font-bold text-slate-800">{simulation.before.demand}</span></div>
                         <div className="pt-2 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Sales</span><span className="font-bold text-rose-600">${simulation.before.sales}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Profit</span><span className="font-bold text-rose-600">${simulation.before.profit}</span></div>
                     </div>
                 </div>

                 <div className="p-5 bg-white border border-emerald-100 rounded-xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                     <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Expected State (After)</h4>
                     <div className="space-y-3">
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Stock</span><span className="font-bold text-emerald-600">{simulation.after.stock}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Demand</span><span className="font-bold text-emerald-600">{simulation.after.demand}</span></div>
                         <div className="pt-2 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Sales</span><span className="font-bold text-emerald-600">${simulation.after.sales}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Profit</span><span className="font-bold text-emerald-600">${simulation.after.profit}</span></div>
                     </div>
                 </div>
              </div>

              {/* Right: Charts */}
              <div className="lg:col-span-3 space-y-6">
                 {/* Chart Row */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-3 lg:col-span-1">
                         <h4 className="text-sm font-bold text-slate-700 text-center mb-4">Stock vs Demand</h4>
                         <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                      { name: 'Before', Stock: simulation.before.stock, Demand: simulation.before.demand },
                                      { name: 'After', Stock: simulation.after.stock, Demand: simulation.after.demand }
                                  ]}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                      <Bar dataKey="Stock" fill="#cbd5e1" radius={[4,4,0,0]} />
                                      <Bar dataKey="Demand" fill="#6366f1" radius={[4,4,0,0]} />
                                  </BarChart>
                              </ResponsiveContainer>
                         </div>
                     </div>

                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-3 md:col-span-1">
                         <h4 className="text-sm font-bold text-slate-700 text-center mb-4">Sales Impact</h4>
                         <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                      { name: 'Sales', Before: simulation.before.sales, After: simulation.after.sales }
                                  ]}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                      <Bar dataKey="Before" fill="#f43f5e" radius={[4,4,0,0]} />
                                      <Bar dataKey="After" fill="#10b981" radius={[4,4,0,0]} />
                                  </BarChart>
                              </ResponsiveContainer>
                         </div>
                     </div>

                     <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-3 md:col-span-1">
                         <h4 className="text-sm font-bold text-slate-700 text-center mb-4">Profit Impact</h4>
                         <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[
                                      { name: 'Profit', Before: simulation.before.profit, After: simulation.after.profit }
                                  ]}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                      <Bar dataKey="Before" fill="#f43f5e" radius={[4,4,0,0]} />
                                      <Bar dataKey="After" fill="#10b981" radius={[4,4,0,0]} />
                                  </BarChart>
                              </ResponsiveContainer>
                         </div>
                     </div>
                 </div>

                 {/* AI Insight */}
                 <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-0.5"><Sparkles size={20} /></div>
                    <div>
                       <h4 className="font-bold text-indigo-900 mb-1">AI Action Explanation</h4>
                       <p className="text-indigo-800 font-medium">{simulation.insight}</p>
                    </div>
                 </div>

                 {/* Execution block */}
                 <div className="flex justify-end pt-4 pb-2">
                    <button 
                        onClick={() => setSelectedAction(null)} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        Confirm Execution <ArrowRight size={18} />
                    </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AIInsights;

