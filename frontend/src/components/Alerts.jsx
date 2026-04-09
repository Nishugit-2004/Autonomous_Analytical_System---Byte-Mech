import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, RefreshCw, X, BarChart2, Sparkles, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const Alerts = ({ results }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [simulation, setSimulation] = useState(null);

  if (!results || !results.alerts || results.alerts.length === 0) return null;

  const { alerts } = results;

  const getStyle = (severity) => {
    switch (severity) {
      case 'Critical': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' };
      case 'Warning': return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' };
      default: return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };
    }
  };

  const handleResolveClick = (alert) => {
    const text = alert.message;
    let type = 'unknown';
    let product = 'Product';
    let currentStock = 100;
    let currentDemand = 100;

    if (text.includes('Stock-out')) {
        type = 'stock-out';
        const prodMatch = text.match(/Stock-out risk for (.+?)\./i);
        if (prodMatch) product = prodMatch[1].trim();
        
        const demandMatch = text.match(/demand:\s*(\d+)/i);
        if (demandMatch) currentDemand = parseInt(demandMatch[1], 10);
        
        const stockMatch = text.match(/stock:\s*(\d+)/i);
        if (stockMatch) currentStock = parseInt(stockMatch[1], 10);
    } else if (text.includes('Overstock')) {
        type = 'overstock';
        const prodMatch = text.match(/Overstock detected for (.+?)\./i);
        if (prodMatch) product = prodMatch[1].trim();

        const stockMatch = text.match(/Stock:\s*(\d+)/i);
        if (stockMatch) currentStock = parseInt(stockMatch[1], 10);

        const demandMatch = text.match(/Demand:\s*(\d+)/i);
        if (demandMatch) currentDemand = parseInt(demandMatch[1], 10);
    }

    const basePrice = 5; 

    // Before calculate
    const beforeSales = Math.min(currentStock, currentDemand) * basePrice;
    const beforeProfit = beforeSales * 0.3;

    const before = { 
        stock: currentStock, 
        demand: currentDemand, 
        sales: Math.round(beforeSales), 
        profit: Math.round(beforeProfit)
    };

    let after = { stock: 0, demand: 0, sales: 0, profit: 0 };
    let insight = '';

    if (type === 'stock-out') {
        const targetStock = currentDemand + Math.floor(currentDemand * 0.1);
        after.stock = targetStock;
        after.demand = currentDemand;
        const afterSales = after.demand * basePrice;
        after.sales = Math.round(afterSales);
        after.profit = Math.round(afterSales * 0.3);
        
        let salesIncrease = 0;
        if(before.sales > 0) salesIncrease = (((after.sales - before.sales) / before.sales) * 100).toFixed(0);
        else salesIncrease = 100;
        insight = `Restocking eliminated stock-out risk and increased sales potential by ${salesIncrease}%.`;
    } else if (type === 'overstock') {
        const newDemand = currentDemand + Math.floor(currentDemand * 0.15); // discount bumps demand
        const targetStock = newDemand; // clear to new demand level
        after.stock = targetStock;
        after.demand = newDemand;
        
        const afterSales = after.demand * (basePrice * 0.85); // 15% discount
        after.sales = Math.round(afterSales);
        after.profit = Math.round(afterSales * 0.2); // lower margin
        
        insight = `Reducing overstock improved inventory efficiency, aligned stock with demand, and mitigated carrying costs.`;
    } else {
        after.stock = currentStock;
        after.demand = currentDemand;
        after.sales = before.sales;
        after.profit = before.profit;
        insight = `Stock-demand mismatch resolved successfully.`;
    }

    setSimulation({ type, product, before, after, insight });
    setSelectedAlert(alert);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-800">Critical Alerts</h2>
        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">{alerts.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert, idx) => {
          const style = getStyle(alert.severity);
          const Icon = style.icon;
          
          return (
            <div key={idx} className={`rounded-xl border p-5 ${style.bg} ${style.border} flex items-start gap-4 transition-all hover:bg-white hover:shadow-md`}>
              <div className={`p-2 rounded-lg bg-white/60 ${style.color}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-800">{alert.severity}</h4>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{alert.message}</p>
                <div className="mt-3">
                  <button 
                    onClick={() => handleResolveClick(alert)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-white shadow-sm border ${style.border} ${style.color} hover:bg-slate-50 transition-colors flex items-center gap-1`}
                  >
                    <RefreshCw size={12} /> Resolve Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution Impact Analysis Modal */}
      {selectedAlert && simulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex justify-between items-center text-white">
              <div>
                 <h3 className="text-2xl font-black flex items-center gap-3">
                   <BarChart2 className="text-emerald-400" size={28} /> Resolution Impact Analysis
                 </h3>
                 <p className="text-slate-300 font-medium mt-1">Simulated resolution for: {simulation.product}</p>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left: Metrics summary */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="p-5 bg-white border border-rose-100 rounded-xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                     <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Before Resolution</h4>
                     <div className="space-y-3">
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Stock</span><span className="font-bold text-rose-600">{simulation.before.stock}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Demand</span><span className="font-bold text-slate-800">{simulation.before.demand}</span></div>
                         <div className="pt-2 border-t border-slate-100 flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Sales</span><span className="font-bold text-rose-600">${simulation.before.sales}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-600">Profit</span><span className="font-bold text-rose-600">${simulation.before.profit}</span></div>
                     </div>
                 </div>

                 <div className="p-5 bg-white border border-emerald-100 rounded-xl shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                     <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">After Resolution</h4>
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
                        onClick={() => setSelectedAlert(null)} 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        Apply Resolution <ArrowRight size={18} />
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

export default Alerts;
