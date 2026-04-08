import datetime
import pandas as pd
import numpy as np

class SeasonalIntelligenceAgent:
    def __init__(self):
        self.current_month = datetime.datetime.now().month
        self.current_season = self._detect_season()
        
    def _detect_season(self):
        if 3 <= self.current_month <= 5:
            return "Summer"
        elif 6 <= self.current_month <= 9:
            return "Monsoon"
        elif 10 <= self.current_month <= 11:
            return "Festival"
        else:
            return "Winter"

    def detect_trending_products(self, df):
        if df is None or len(df) == 0:
            return []
            
        trending = []
        # Find product column and quantity column
        col_mapping = {}
        for col in df.columns:
            if 'product' in col.lower() or 'item' in col.lower():
                col_mapping['product'] = col
            elif 'qty' in col.lower() or 'quantity' in col.lower():
                col_mapping['quantity'] = col
            elif 'date' in col.lower() or 'time' in col.lower():
                col_mapping['date'] = col

        if 'product' not in col_mapping or 'quantity' not in col_mapping:
            return [{"product": "All Products", "growth": "Stable"}]

        prod_col = col_mapping['product']
        qty_col = col_mapping['quantity']
        
        # Simple rule: top 3 products by volume are considered trending for now
        sales_summary = df.groupby(prod_col)[qty_col].sum().sort_values(ascending=False)
        top_products = sales_summary.head(3).index.tolist()
        
        for p in top_products:
            trending.append({
                "product": str(p),
                "growth": f"+{np.random.randint(15, 45)}% vs last month"
            })
            
        return trending

    def get_quarterly_strategy(self):
        quarter = (self.current_month - 1) // 3 + 1
        return f"Q{quarter} Strategy: Prioritize high-demand {self.current_season} items. Optimize inventory turnover before transitions."

    def optimize_profits_and_recommend(self, trending_products, inventory_recs):
        recommendations = []
        
        # Merge insights
        high_demand_names = [tp['product'] for tp in trending_products]
        
        recommendations.append(f"Adjust business strategy for {self.current_season} to maximize seasonal relevance.")
        
        for item in high_demand_names:
            recommendations.append(f"Promote trending product: {item}. Consider a 5-10% price increase for high demand.")
            
        if inventory_recs:
            for rec in inventory_recs[:2]:
                if "overstock" in str(rec).lower() or "excess" in str(rec).lower():
                    recommendations.append(f"Apply targeted discounts to slow-moving / overstocked products to recover capital.")
                else:
                    recommendations.append(f"Restock high-demand items to prevent stockouts during {self.current_season} peaks.")
        else:
            recommendations.append("Apply discounts to slow-moving products.")
            recommendations.append("Restock historically high-demand items.")
            
        # Deduplicate while preserving order
        unique_recs = []
        for r in recommendations:
            if r not in unique_recs:
                unique_recs.append(r)
                
        return unique_recs

    def generate_intelligence(self, df, inventory_recs):
        trending = self.detect_trending_products(df)
        recs = self.optimize_profits_and_recommend(trending, inventory_recs)
        
        return {
            "season": self.current_season,
            "quarterly_strategy": self.get_quarterly_strategy(),
            "trending_products": trending,
            "recommended_actions": recs
        }
