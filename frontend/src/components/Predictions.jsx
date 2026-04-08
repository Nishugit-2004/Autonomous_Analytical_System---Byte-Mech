import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart } from 'recharts';
import { Target, TrendingUp, Zap, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';

const Predictions = ({ results }) => {
  if (!results || !results.forecasts) return null;

  const { forecasts } = results;
  const productKeys = Object.keys(forecasts);
  
  const [selectedProduct, setSelectedProduct] = useState(productKeys[0] || "");
  const [timeframe, setTimeframe] = useState("7"); // "7" or "30"

  // Ensure selected product is valid if data changes
  useEffect(() => {
     if (productKeys.length > 0 && !productKeys.includes(selectedProduct)) {
         setSelectedProduct(productKeys[0]);
     }
  }, [results, productKeys, selectedProduct]);

  if (productKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 premium-card">
        <Target size={48} className="text-slate-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Insufficient Data for Forecasts</h3>
        <p className="text-slate-500">The dataset needs date and quantity columns to generate models.</p>
      </div>
    );
  }

  const targetData = forecasts[selectedProduct];
  if (!targetData) return null;

  // Build the time-series array joining history and forecast together
  const chartData = [];
  
  const historyLen = targetData.history ? targetData.history.length : 0;
  const historicalPoints = targetData.history || [];
  
  // 1. Add historical data
  historicalPoints.forEach((val, idx) => {
      chartData.push({
          day: `T-${historyLen - idx}`,
          actual: Math.round(val),
          forecast: null,
          confidenceMin: null,
          confidenceMax: null
      });
  });

  // 2. Add connection point (last historical point becomes first forecast point)
  const lastActual = historyLen > 0 ? historicalPoints[historyLen - 1] : 0;
  if (historyLen > 0) {
      chartData[chartData.length - 1].forecast = Math.round(lastActual);
      chartData[chartData.length - 1].confidenceMin = Math.round(lastActual);
      chartData[chartData.length - 1].confidenceMax = Math.round(lastActual);
  }

  // 3. Add future data
  const futureDays = timeframe === "7" ? 7 : 30;
  const projectedPoints = targetData.daily || [];
  
  for(let i=0; i<futureDays; i++) {
      if(i < projectedPoints.length) {
          const val = projectedPoints[i];
          const variance = val * 0.15; // 15% confidence interval visual
          chartData.push({
              day: `Day ${i + 1}`,
              actual: null,
              forecast: Math.round(val),
              confidenceMin: Math.max(0, Math.round(val - variance)),
              confidenceMax: Math.round(val + variance)
          });
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Time-Series Forecast</h2>
          <p className="text-slate-500">Polynomial regression mapped with detected seasonal fluctuations.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedProduct} 
            onChange={e => setSelectedProduct(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm"
          >
            {productKeys.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          
          <div className="flex bg-slate-100 p-1 rounded-xl whitespace-nowrap">
            <button 
                onClick={() => setTimeframe("7")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${timeframe === "7" ? "bg-white text-primary shadow" : "text-slate-500 hover:text-slate-800"}`}
            >
                7 Days
            </button>
            <button 
                onClick={() => setTimeframe("30")}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${timeframe === "30" ? "bg-white text-primary shadow" : "text-slate-500 hover:text-slate-800"}`}
            >
                30 Days
            </button>
          </div>
        </div>
      </div>

      <div className="premium-card p-6 h-[450px]">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <TrendingUp className="text-indigo-500" />
             Projected Sales Volume: {selectedProduct}
           </h3>
           <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-800"></div> Actual History</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> AI Forecast</div>
           </div>
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
            
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            
            {/* Confidence Interval Shading (Min to Max) */}
            <Area 
                type="monotone" 
                dataKey="confidenceMax" 
                stroke="none" 
                fill="#e0e7ff" 
                fillOpacity={0.6} 
                activeDot={false}
            />
            <Area 
                type="monotone" 
                dataKey="confidenceMin" 
                stroke="none" 
                fill="#ffffff" 
                fillOpacity={1} 
                activeDot={false}
            />

            {/* Historical Solid Line */}
            <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Sales"
                stroke="#1e293b" 
                strokeWidth={3}
                dot={{ stroke: '#1e293b', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                activeDot={{ r: 6, fill: '#1e293b' }}
                connectNulls
            />

            {/* Predicted Dashed Line */}
            <Line 
                type="monotone" 
                dataKey="forecast" 
                name="AI Prediction"
                stroke="#6366f1" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ stroke: '#6366f1', strokeWidth: 2, r: 4, fill: '#ffffff' }}
                activeDot={{ r: 6, fill: '#6366f1' }}
                connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card p-6 border-l-4 border-l-indigo-500 flex items-center justify-between">
           <div>
               <h4 className="text-slate-500 text-sm mb-1 font-bold uppercase tracking-wider">Short-Term Demand</h4>
               <p className="text-3xl font-black text-slate-800">
                 {Math.round(targetData.total_predicted_demand)} <span className="text-sm font-bold text-slate-400">units / next 7 days</span>
               </p>
           </div>
           <div className="bg-indigo-50 p-4 rounded-full text-indigo-500">
               <Zap size={24}/>
           </div>
        </div>
        
        <div className="premium-card p-6 border-l-4 border-l-emerald-500 flex items-center justify-between">
           <div>
               <h4 className="text-slate-500 text-sm mb-1 font-bold uppercase tracking-wider">Historical Context</h4>
               <p className="text-3xl font-black text-slate-800">
                 {Math.round(targetData.history?.slice(-7).reduce((a,b)=>a+b, 0) || 0)} <span className="text-sm font-bold text-slate-400">units / last 7 days</span>
               </p>
           </div>
           <div className="bg-emerald-50 p-4 rounded-full text-emerald-500">
               <CalendarDays size={24}/>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
