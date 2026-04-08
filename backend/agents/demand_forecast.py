import pandas as pd
import numpy as np

def forecast_demand(df: pd.DataFrame, days_to_predict=30):
    """
    Demand Forecast Agent: 
    - Uses Polynomial Regression (Degree 2)
    - Injects Weekly Seasonality
    - Returns 30 days of predictions + Last 14 days of history
    """
    predictions = {}
    
    col_mapping = {}
    for col in df.columns:
        if 'product' in col or 'item' in col:
            col_mapping['product'] = col
        elif 'qty' in col or 'quantity' in col:
            col_mapping['quantity'] = col
        elif 'date' in col or 'time' in col:
            col_mapping['date'] = col

    if not all(k in col_mapping for k in ['product', 'quantity', 'date']):
        return predictions  # Insufficient columns for forecasting

    prod_col = col_mapping['product']
    qty_col = col_mapping['quantity']
    date_col = col_mapping['date']

    if pd.api.types.is_datetime64_any_dtype(df[date_col]):
        df_copy = df.copy()
        # Create a date ordinal for regression
        df_copy['date_ordinal'] = df_copy[date_col].apply(lambda x: x.toordinal())
        
        # We will only forecast for the top 5 products to save time and UI space
        top_products = df_copy.groupby(prod_col)[qty_col].sum().sort_values(ascending=False).head(5).index
        
        for p in top_products:
            p_data = df_copy[df_copy[prod_col] == p].copy()
            
            # Group by day so we get total daily quantity
            daily_data = p_data.groupby('date_ordinal')[qty_col].sum().reset_index().sort_values('date_ordinal')
            
            if len(daily_data) < 7:
                continue # Not enough data
            
            X = daily_data['date_ordinal'].values
            y = daily_data[qty_col].values
            
            # Fit Polynomial (degree 2) to capture trends
            coeffs = np.polyfit(X, y, 2)
            poly = np.poly1d(coeffs)
            
            last_date = X[-1]
            future_dates_ordinal = np.array([last_date + i for i in range(1, days_to_predict + 1)])
            
            base_future_demand = poly(future_dates_ordinal)
            
            # Inject weekly seasonality (amplitude approx 10% of base prediction)
            seasonality = np.sin((future_dates_ordinal - last_date) * (2 * np.pi / 7)) * (np.abs(base_future_demand) * 0.1)
            
            future_demand = base_future_demand + seasonality
            
            # Format outputs ensuring no negative values
            daily_predictions = [max(0, float(val)) for val in future_demand]
            
            # Extract up to 14 days of historical actuals
            history = list(y[-14:])
            
            predictions[str(p)] = {
                "total_predicted_demand": sum(daily_predictions[:7]), # Primary 7 day outlook KPI
                "daily": daily_predictions,
                "history": [float(h) for h in history]
            }
            
    return predictions
