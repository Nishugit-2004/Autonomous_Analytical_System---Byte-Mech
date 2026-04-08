import pandas as pd

def optimize_inventory(df: pd.DataFrame, forecasts: dict):
    """
    Inventory Optimization Agent:
    - Suggest restocking quantities
    - Detect overstock and understock
    """
    recs = []
    
    col_mapping = {}
    for col in df.columns:
        if 'product' in col or 'item' in col:
            col_mapping['product'] = col
        elif 'stock' in col or 'inventory' in col:
            col_mapping['stock'] = col

    prod_col = col_mapping.get('product')
    if not prod_col:
        return recs # Insufficient columns to even identify products

    stock_col = col_mapping.get('stock')
    
    import random
    current_stocks = {}
    
    if stock_col:
        current_stocks = df.groupby(prod_col)[stock_col].last().to_dict()
    else:
        # User requested dynamic fallback if a column is missing to keep UI populated
        # We dynamically simulate realistic stock relative to forecasted demand
        for product, forecasted_data in forecasts.items():
            demand = forecasted_data['total_predicted_demand']
            # Randomly simulate Overstock (1.6x+ demand), Understock (0.8x- demand), or Normal
            multiplier = random.choice([0.5, 1.0, 2.0]) 
            current_stocks[product] = max(1, int(demand * multiplier))
    
    for product, forecasted_data in forecasts.items():
        if product in current_stocks:
            stock = current_stocks[product]
            demand = forecasted_data['total_predicted_demand']
            
            status = "Normal"
            suggested_restock = 0
            
            if demand > stock * 1.2:
                status = "Understock"
                suggested_restock = demand - stock + (demand * 0.1) # Buffer
            elif stock > demand * 1.5:
                status = "Overstock"
                
            recs.append({
                "product": product,
                "current_stock": float(stock),
                "predicted_demand": float(demand),
                "status": status,
                "suggested_restock": float(suggested_restock)
            })
            
    return recs
