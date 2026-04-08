import functools
import numpy as np
import pandas as pd

class CollaborationAgent:
    def __init__(self):
        pass

    def generate_collaboration_insights(self, df):
        # We will simulate a network of 3-5 stores collaborating in the same product category
        network_size = 3
        
        # 1. Dummy Collaborators
        collaborators = [
            {"name": "TechZone", "location": "Bangalore", "category": "Electronics", "monthly_sales": "$45,000", "key_products": ["Headphones", "Cameras"]},
            {"name": "GadgetHub", "location": "Chennai", "category": "Accessories", "monthly_sales": "$32,000", "key_products": ["Headphones", "Cables"]},
            {"name": "MobileMart", "location": "Hyderabad", "category": "Smartphones", "monthly_sales": "$58,000", "key_products": ["Smartphones", "Headphones"]}
        ]
        
        # 5. Profit Sharing System
        profit_sharing = {
            "total_increased_profit": 15500,
            "breakdown": [
                {"store": "Your Store (Owner)", "percentage": 40, "amount": 6200},
                {"store": "MobileMart", "percentage": 35, "amount": 5425},
                {"store": "TechZone", "percentage": 25, "amount": 3875}
            ]
        }
        
        # 4. Sales Growth Visualization (Before vs After)
        sales_growth = {
            "labels": ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
            "before_collaboration": [20000, 21000, 20500, 21200, 20800, 21500],
            "after_collaboration": [20000, 21000, 24500, 28000, 34000, 42000],
            "overall_growth_pct": 98.4
        }
        
        product_level_data = []
        insights = []
        recommendations = []
        category = "Electronics" 

        if df is not None and len(df) > 0:
            col_mapping = {}
            for col in df.columns:
                if 'product' in col.lower() or 'item' in col.lower():
                    col_mapping['product'] = col
                elif 'qty' in col.lower() or 'quantity' in col.lower() or 'sales' in col.lower():
                    col_mapping['quantity'] = col
                elif 'price' in col.lower():
                    col_mapping['price'] = col

            if 'product' in col_mapping and 'quantity' in col_mapping:
                p_col = col_mapping['product']
                q_col = col_mapping['quantity']
                price_col = col_mapping.get('price', None)
                
                # Calculate store's performance on top 3 products
                top_products = df.groupby(p_col).agg({q_col: 'sum'})
                if price_col:
                    prices = df.groupby(p_col)[price_col].mean()
                    top_products['price'] = prices
                else:
                    top_products['price'] = np.random.uniform(50, 200, size=len(top_products))
                    
                top_products = top_products.sort_values(by=q_col, ascending=False).head(3)
                
                for product, row in top_products.iterrows():
                    my_demand = int(row[q_col])
                    my_price = float(row['price'])
                    
                    network_avg_demand = int(my_demand * np.random.uniform(1.1, 1.8))
                    network_total_demand = network_avg_demand * network_size
                    network_avg_price = float(my_price * np.random.uniform(0.85, 1.15))
                    
                    growth_pct = np.random.randint(15, 45)
                    
                    product_level_data.append({
                        "product": str(product),
                        "my_demand": my_demand,
                        "my_price": round(my_price, 2),
                        "network_total_demand": network_total_demand,
                        "network_avg_price": round(network_avg_price, 2),
                        "growth": f"+{growth_pct}%",
                        "stock_availability": "Low" if np.random.random() > 0.5 else "Stable"
                    })
        
        # 3. Shared Insights Engine
        insights.append(f"Product demand increased by 28% across {network_size} stores")
        insights.append("Stock shortage detected in multiple hub locations")
        insights.append("High demand trend identified for cross-selling accessories")
        
        # 6. Management Recommendations
        recommendations.append("Restock high-demand products immediately via centralized bulk ordering")
        recommendations.append("Maintain optimal pricing dynamically based on network average")
        recommendations.append("Promote trending items using unified marketing campaigns")

        # --- NEW: Competitor Benchmarking System ---
        competitors = [
            {"name": "TechMart", "location": "Local Radius", "category": "General Tech", "monthly_sales": "$38,000", "avg_price": "$115", "stock": "High"},
            {"name": "GadgetWorld", "location": "Online / Regional", "category": "Accessories", "monthly_sales": "$52,000", "avg_price": "$90", "stock": "Medium"},
            {"name": "SmartBuy", "location": "City Center", "category": "Electronics", "monthly_sales": "$41,000", "avg_price": "$105", "stock": "Low"}
        ]
        
        competitor_sales_chart = [
            {"name": "Your Store", "sales": 32000},
            {"name": "TechMart", "sales": 38000},
            {"name": "SmartBuy", "sales": 41000},
            {"name": "GadgetWorld", "sales": 52000}
        ]
        
        competitor_insights = [
            "Your overall sales are ~24% lower than the main market average.",
            "Competitors are aggressively stocking up on premium accessories.",
            "Market demand for smart devices is currently at a 3-month peak."
        ]
        
        competitor_recommendations = [
            "Reduce standard pricing by 8-12% to recapture local market share.",
            "Increase inventory reserves for high-demand category leaders.",
            "Adopt dynamic pricing similar to GadgetWorld's accessory lines."
        ]
        
        return {
            "network_size": network_size,
            "category": category,
            "collaborators": collaborators,
            "profit_sharing": profit_sharing,
            "sales_growth": sales_growth,
            "product_level_data": product_level_data,
            "shared_insights": insights,
            "ai_recommendations": recommendations,
            # Competitor Payload
            "competitors": competitors,
            "competitor_sales_chart": competitor_sales_chart,
            "competitor_insights": competitor_insights,
            "competitor_recommendations": competitor_recommendations
        }
