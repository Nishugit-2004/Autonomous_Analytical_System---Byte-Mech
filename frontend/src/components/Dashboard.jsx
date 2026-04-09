import { CloudLightning, CalendarDays, Camera, BadgeAlert, LocateFixed, Eye, Store, MapPin, TrendingUp, DollarSign, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { useAppContext } from '../context/AppContext';

const Dashboard = ({ results }) => {
  const { simpleMode } = useAppContext();
  
  if (!results) return null;

  // Render Vision Results if user scanned a shelf
  if (results.isVision) {
      return (
          <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg text-white">
                    <Camera size={24} />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800">Visual Shelf Scan Results</h2>
              </div>
              <div className="premium-card p-8 flex flex-col items-center justify-center border-b-4 border-indigo-500 mb-6">
                   <p className="text-sm font-bold text-slate-500 uppercase">Shelf Health Score</p>
                   <p className="text-6xl font-black text-slate-800">{results.overall_health_score}/100</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {results.insights.map((insight, idx) => {
                      const isCrit = insight.severity === 'Critical';
                      const Icon = isCrit ? BadgeAlert : (insight.type === 'Misplaced' ? LocateFixed : Eye);
                      const color = isCrit ? 'text-rose-500' : (insight.type === 'Misplaced' ? 'text-amber-500' : 'text-blue-500');
                      const bg = isCrit ? 'bg-rose-100' : (insight.type === 'Misplaced' ? 'bg-amber-100' : 'bg-blue-100');
                      
                      return (
                       <div key={idx} className="premium-card p-6 flex gap-4 items-start">
                          <div className={`p-4 rounded-xl ${bg} ${color}`}>
                              <Icon size={32} />
                          </div>
                          <div>
                              <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-slate-800">{insight.type}</h3>
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${bg} ${color}`}>{insight.severity}</span>
                              </div>
                              <p className="text-sm font-bold text-slate-600 mb-1">Target: {insight.product}</p>
                              <p className="text-slate-500 font-medium">{insight.detail}</p>
                          </div>
                       </div>
                      )
                  })}
              </div>
          </div>
      )
  }

  // Normal Dataset Dashboard Logic
  const { kpis, trends, top_products, external_context, seasonal_intelligence, collaboration_intelligence } = results;

  // Render Simple Executive Mode
  if (simpleMode) {
      return (
          <div className="max-w-4xl mx-auto space-y-6 mt-4 pb-20 animate-in fade-in zoom-in-95 duration-300">
               <div className="text-center mb-8">
                   <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
                       Executive Briefing
                   </h2>
                   <p className="text-slate-500 mt-2 font-medium text-lg">Distilled insights. Focus on what matters.</p>
               </div>

               {/* 1. The Bottom Line */}
               {collaboration_intelligence && (
                   <div className="bg-gradient-to-r from-emerald-500 to-teal-400 p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between text-white border border-emerald-400">
                       <div className="flex-1">
                           <h3 className="font-bold text-2xl flex items-center gap-2">
                               <TrendingUp size={28} /> Projected Network Growth
                           </h3>
                           <p className="text-emerald-50 text-base mt-2 max-w-md">
                               Sharing localized stock data across {collaboration_intelligence.network_size} {collaboration_intelligence.category} stores uncovers a hidden margin opportunity.
                           </p>
                       </div>
                       <div className="mt-6 md:mt-0 md:text-right bg-white/20 p-6 rounded-xl backdrop-blur-md border border-white/30">
                           <p className="text-sm font-bold text-emerald-50 uppercase tracking-widest">Your Share</p>
                           <p className="text-5xl font-black text-white mt-1">+${collaboration_intelligence.profit_sharing.breakdown[0].amount.toLocaleString()}</p>
                       </div>
                   </div>
               )}

               {/* 2. Top Critical Actions */}
               <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-md relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5"><BadgeAlert size={100} /></div>
                   <h3 className="text-xl font-bold flex items-center gap-2 text-rose-600 mb-6 relative z-10">
                       <BadgeAlert size={24} /> Recommended Immediate Actions
                   </h3>
                   <div className="space-y-4 relative z-10">
                       {collaboration_intelligence?.ai_recommendations?.slice(0,2).map((rec, i) => (
                           <div key={`collab-${i}`} className="flex gap-4 items-center bg-rose-50 p-4 rounded-xl border border-rose-100">
                               <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></div>
                               <p className="text-slate-700 font-bold text-lg">{rec}</p>
                           </div>
                       ))}
                       {seasonal_intelligence?.recommended_actions?.slice(0,2).map((rec, i) => (
                           <div key={`season-${i}`} className="flex gap-4 items-center bg-orange-50 p-4 rounded-xl border border-orange-100">
                               <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                               <p className="text-slate-700 font-bold text-lg">{rec}</p>
                           </div>
                       ))}
                   </div>
               </div>

               {/* 3. Streamlined Top Product Pulse */}
               <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
                   <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 mb-6">
                       <Store size={24} /> Top Movers Matrix
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {top_products?.slice(0, 3).map((p, idx) => (
                       <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between">
                           <div>
                               <span className="text-xs font-black text-slate-400 mb-1 block">RANK #{idx + 1}</span>
                               <p className="font-bold text-lg text-slate-700">{p.product}</p>
                           </div>
                           <div className="mt-4 pt-4 border-t border-slate-200">
                               <p className="font-black text-2xl text-primary">${p.sales.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                           </div>
                       </div>
                     ))}
                   </div>
               </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      
      {/* Real-World Context Connectors */}
      {external_context && external_context.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {external_context.map((ctx, idx) => {
                  const isWeather = ctx.type === 'Weather';
                  const Icon = isWeather ? CloudLightning : CalendarDays;
                  const color = isWeather ? 'text-blue-500 bg-blue-100' : 'text-purple-500 bg-purple-100';
                  
                  return (
                      <div key={idx} className="premium-card p-5 border-l-4 border-l-primary flex items-center gap-4 bg-slate-50">
                         <div className={`p-3 rounded-full ${color}`}>
                             <Icon size={24} />
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-800">{ctx.type} Context Synced</h4>
                             <p className="text-sm text-slate-600 font-medium">{ctx.description}</p>
                         </div>
                      </div>
                  )
              })}
          </div>
      )}

      {/* COLLABORATION HUB */}
      {collaboration_intelligence && (
          <div className="premium-card overflow-hidden border-2 border-indigo-100 mt-8">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Users size={120} />
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-3xl font-extrabold flex items-center gap-3">
                          <Users size={32} /> Collaboration Hub
                      </h3>
                      <p className="text-indigo-100 font-medium mt-2 text-lg">
                          Shared network intelligence across {collaboration_intelligence.network_size} retailers inside {collaboration_intelligence.category}
                      </p>
                  </div>
              </div>

              <div className="p-6 bg-slate-50 space-y-8">
                  {/* 1. Collaborator List */}
                  <div>
                      <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                          <Store size={18} /> Network Collaborators
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {collaboration_intelligence.collaborators.map((c, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                  <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-lg text-indigo-700">{c.name}</h5>
                                      <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded">{c.category}</span>
                                  </div>
                                  <div className="space-y-1 text-sm font-medium text-slate-600">
                                      <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {c.location}</p>
                                      <p className="flex items-center gap-2"><DollarSign size={14} className="text-emerald-500"/> Sales: {c.monthly_sales}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* 2. & 3. Product-Based Collaboration & Insights */}
                      <div className="space-y-6">
                           <div>
                              <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                                  <Eye size={18} /> Shared Product Insights
                              </h4>
                              <div className="space-y-3">
                                  {collaboration_intelligence.shared_insights.map((insight, idx) => (
                                      <div key={idx} className="flex gap-3 items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><TrendingUp size={20} /></div>
                                          <p className="text-sm font-bold text-slate-700">{insight}</p>
                                      </div>
                                  ))}
                              </div>
                           </div>

                           <div>
                               <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                                   <BadgeAlert size={18} /> Management Recommendations
                               </h4>
                               <div className="space-y-3">
                                   {collaboration_intelligence.ai_recommendations.map((rec, idx) => (
                                       <div key={idx} className="flex gap-3 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                                           <p className="text-sm font-bold text-slate-700">{rec}</p>
                                       </div>
                                   ))}
                               </div>
                           </div>
                      </div>

                      {/* 4. Sales Growth Visualization */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-6 flex items-center gap-2">
                              <TrendingUp size={18} /> Sales Growth After Collaboration
                          </h4>
                          <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={collaboration_intelligence.sales_growth.labels.map((label, i) => ({
                                      name: label,
                                      'Before Collaboration': collaboration_intelligence.sales_growth.before_collaboration[i],
                                      'After Collaboration': collaboration_intelligence.sales_growth.after_collaboration[i],
                                  }))}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                                      <RechartsTooltip 
                                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                          formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                      />
                                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                      <Line type="monotone" dataKey="Before Collaboration" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                      <Line type="monotone" dataKey="After Collaboration" stroke="#6366f1" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                                  </LineChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  </div>

                  {/* 5. Profit Sharing System */}
                  <div>
                      <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                          <DollarSign size={18} /> Network Profit Distribution
                      </h4>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8">
                          <div className="flex-shrink-0 text-center md:text-left">
                              <p className="text-sm font-bold text-slate-400 uppercase">Total Increased Profit</p>
                              <p className="text-4xl font-black text-emerald-600 mt-1">${collaboration_intelligence.profit_sharing.total_increased_profit.toLocaleString()}</p>
                          </div>
                          
                          <div className="w-px h-16 bg-slate-200 hidden md:block"></div>
                          
                          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {collaboration_intelligence.profit_sharing.breakdown.map((item, idx) => (
                                  <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-bold text-slate-700">{item.store}</span>
                                          <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{item.percentage}%</span>
                                      </div>
                                      <p className="text-xl font-bold text-slate-800">${item.amount.toLocaleString()}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      )}

      {/* COMPETITOR BENCHMARKING SYSTEM */}
      {collaboration_intelligence && collaboration_intelligence.competitors && (
          <div className="premium-card overflow-hidden border-2 border-rose-100 mt-8 mb-8">
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 text-white">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                      <TrendingUp size={24} /> Competitor Benchmarking
                  </h3>
                  <p className="text-rose-100 font-medium mt-1">Live market comparison against Top 3 local competitors</p>
              </div>

              <div className="p-6 bg-slate-50 space-y-8">
                  {/* Competitor List */}
                  <div>
                      <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                          <Store size={18} /> Active Competitors Tracked
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {collaboration_intelligence.competitors.map((c, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-rose-300 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                      <h5 className="font-bold text-lg text-rose-700">{c.name}</h5>
                                      <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-1 rounded">{c.location}</span>
                                  </div>
                                  <div className="space-y-1 text-sm font-medium text-slate-600">
                                      <p className="font-bold text-slate-800 flex justify-between"><span>Sales:</span> <span>{c.monthly_sales}</span></p>
                                      <p className="flex justify-between"><span>Avg Price:</span> <span className="text-emerald-600">{c.avg_price}</span></p>
                                      <div className="pt-2 flex items-center justify-between">
                                          <span className="text-xs uppercase font-bold text-slate-400">Stock</span>
                                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${c.stock === 'High' ? 'bg-emerald-100 text-emerald-700' : c.stock === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                              {c.stock} Level
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* Market Comparison Chart */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                          <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-6 flex items-center gap-2">
                              <TrendingUp size={18} /> Market Sales Comparison
                          </h4>
                          <div className="h-64 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={collaboration_intelligence.competitor_sales_chart}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                                      <RechartsTooltip 
                                          cursor={{fill: '#f1f5f9'}}
                                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                          formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Sales']}
                                      />
                                      <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                                          {
                                              collaboration_intelligence.competitor_sales_chart.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.name === 'Your Store' ? '#e11d48' : '#cbd5e1'} />
                                              ))
                                          }
                                      </Bar>
                                  </BarChart>
                              </ResponsiveContainer>
                          </div>
                      </div>

                      {/* Strategic Benchmarking */}
                      <div className="space-y-6">
                           <div>
                              <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                                  <Eye size={18} /> Market Intelligence Insights
                              </h4>
                              <div className="space-y-3">
                                  {collaboration_intelligence.competitor_insights.map((insight, idx) => (
                                      <div key={idx} className="flex gap-3 items-center bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-sm">
                                          <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><TrendingUp size={20} /></div>
                                          <p className="text-sm font-bold text-slate-700">{insight}</p>
                                      </div>
                                  ))}
                              </div>
                           </div>

                           <div>
                               <h4 className="text-sm uppercase tracking-widest font-bold text-slate-500 mb-4 flex items-center gap-2">
                                   <BadgeAlert size={18} /> Strategic Recommendations
                               </h4>
                               <div className="space-y-3">
                                   {collaboration_intelligence.competitor_recommendations.map((rec, idx) => (
                                       <div key={idx} className="flex gap-3 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
                                           <div className="mt-0.5 text-rose-500">•</div>
                                           <p className="text-sm font-bold text-slate-700">{rec}</p>
                                       </div>
                                   ))}
                               </div>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Seasonal and Trending Intelligence System */}
      {seasonal_intelligence && (
          <div className="premium-card overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                      <div>
                         <h3 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarDays size={24} /> Seasonal Intelligence
                         </h3>
                         <p className="text-emerald-100 font-medium mt-1">AI-Powered Quarterly Strategy Engine</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur pb-1 pt-1 pl-4 pr-4 rounded-full border border-white/30 text-center">
                         <span className="text-xs uppercase tracking-wider font-bold text-emerald-50">Current Season</span>
                         <p className="text-lg font-black">{seasonal_intelligence.season}</p>
                      </div>
                  </div>
                  <p className="text-sm bg-black/20 p-3 rounded-lg border border-black/10 inline-block font-medium">
                      {seasonal_intelligence.quarterly_strategy}
                  </p>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50">
                  {/* Trending Products */}
                  <div>
                      <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">🔥 Trending Products</h4>
                      <div className="space-y-3">
                          {seasonal_intelligence.trending_products.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                  <span className="font-bold text-slate-700">{item.product}</span>
                                  <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">{item.growth}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Profit Optimization Recommendations */}
                  <div>
                      <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-4">💼 Management Recommendations</h4>
                      <div className="space-y-3">
                          {seasonal_intelligence.recommended_actions.map((action, idx) => (
                              <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                  <div className="text-primary mt-0.5"><Eye size={16} /></div>
                                  <p className="text-sm font-medium text-slate-700">{action}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Rest of traditional dashboard component */}
      <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Performers Overview</h3>
          <div className="space-y-4">
            {top_products.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                  <p className="font-bold text-slate-700">{p.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary">${p.sales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
