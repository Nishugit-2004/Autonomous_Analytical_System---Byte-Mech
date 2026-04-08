from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import pandas as pd
import io

# Import Agents here
from agents.data_cleaning import clean_data
from agents.analysis import perform_eda
from agents.demand_forecast import forecast_demand
from agents.inventory import optimize_inventory
from agents.pricing import recommend_pricing
from agents.insights import generate_insights
from agents.decision_engine import DecisionEngine
from agents.context_agent import get_external_context
from agents.vision_agent import process_shelf_scan

app = FastAPI(title="RetailPulse AI API", version="1.0")

# Allow all CORS for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for presentation
memory_db = {
    "raw_data": None,
    "cleaned_data": None,
    "results": {}
}

@app.get("/")
def read_root():
    return {"status": "RetailPulse AI API is running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")
        
        # Save raw to memory
        memory_db["raw_data"] = df
        
        # Return basic preview
        preview = df.head(5).fillna("").to_dict(orient="records")
        columns = df.columns.tolist()
        
        return {
            "message": "File uploaded successfully",
            "columns": columns,
            "rows": len(df),
            "preview": preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/pipeline/clean")
async def pipeline_clean():
    df = memory_db.get("raw_data")
    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded. Please upload a dataset first.")
    
    try:
        # User requested: Limit dataset size if needed to improve performance
        if len(df) > 5000:
            df = df.sample(n=5000, random_state=42)
            
        cleaned_df = clean_data(df)
        memory_db["cleaned_data"] = cleaned_df
        return {"status": "success", "message": "Cleaning complete"}
    except Exception as e:
        print(f"[Debugging Log] Clean failed: {e}")
        # Fallback empty df
        memory_db["cleaned_data"] = df.head(100) if df is not None else pd.DataFrame()
        return {"status": "error", "message": "Clean failed, using raw"}

@app.get("/api/pipeline/analyze")
async def pipeline_analyze():
    cleaned_df = memory_db.get("cleaned_data")
    if cleaned_df is None:
        return {"kpis": {}, "trends": [], "top_products": [], "bottom_products": []}
    
    try:
        kpis, trends, top_products, bottom_products = perform_eda(cleaned_df)
        
        # Save intermediate
        if "results" not in memory_db: memory_db["results"] = {}
        memory_db["results"].update({
            "kpis": kpis,
            "trends": trends,
            "top_products": top_products,
            "bottom_products": bottom_products
        })
        
        return {
            "kpis": kpis,
            "trends": trends,
            "top_products": top_products,
            "bottom_products": bottom_products
        }
    except Exception as e:
        print(f"[Debugging Log] Analyze failed: {e}")
        return {"kpis": {}, "trends": [], "top_products": [], "bottom_products": []}

@app.get("/api/pipeline/predict")
async def pipeline_predict():
    cleaned_df = memory_db.get("cleaned_data")
    if cleaned_df is None:
        return {"forecasts": {}}
    
    try:
        forecasts = forecast_demand(cleaned_df)
        
        # Save intermediate
        if "results" not in memory_db: memory_db["results"] = {}
        memory_db["results"].update({"forecasts": forecasts})
        
        return {"forecasts": forecasts}
    except Exception as e:
        print(f"[Debugging Log] Predict failed: {e}")
        return {"forecasts": {}}

@app.get("/api/pipeline/insights")
async def pipeline_insights():
    cleaned_df = memory_db.get("cleaned_data")
    
    try:
        # Load previous results
        res = memory_db.get("results", {})
        forecasts = res.get("forecasts", {})
        trends = res.get("trends", [])
        kpis = res.get("kpis", {})
        
        inventory_recs = optimize_inventory(cleaned_df, forecasts) if cleaned_df is not None else []
        pricing_recs = recommend_pricing(cleaned_df, forecasts) if cleaned_df is not None else []
        
        context_data = get_external_context()

        engine = DecisionEngine()
        alerts, actions, debate, marketing = engine.generate_recommendations(inventory_recs, pricing_recs, trends, context_data)
        
        ai_insights = generate_insights(kpis, actions)
        
        from agents.seasonal_intelligence import SeasonalIntelligenceAgent
        seasonal_agent = SeasonalIntelligenceAgent()
        seasonal_payload = seasonal_agent.generate_intelligence(cleaned_df, inventory_recs)
        
        final_results = {
            "status": "success",
            "inventory": inventory_recs,
            "pricing": pricing_recs,
            "external_context": context_data,
            "alerts": alerts,
            "actions": actions,
            "debate": debate,
            "marketing": marketing,
            "ai_insights": ai_insights,
            "seasonal_intelligence": seasonal_payload
        }
        
        if "results" not in memory_db: memory_db["results"] = {}
        memory_db["results"].update(final_results)
        memory_db["results"]["status"] = "success"
        
        return final_results
    except Exception as e:
        print(f"[Debugging Log] Insights failed: {e}")
        # Partial mock result
        return {
            "status": "error",
            "inventory": [], "pricing": [], "alerts": [], "actions": [], "debate": [], "marketing": {}, "ai_insights": []
        }

@app.get("/api/dashboard")
def get_dashboard_data():
    if not memory_db["results"]:
        raise HTTPException(status_code=404, detail="No analysis results found. Run pipeline first.")
    return memory_db["results"]

@app.post("/api/simulation")
async def run_simulation(data: dict):
    # Expect data: {"product": "A", "price_change_percent": -10, "stock_change": 50}
    # Dummy simulation
    return {
        "status": "success",
        "simulated_revenue_impact": 1500.5,
        "simulated_demand_impact": "Increase by 15%"
    }

@app.post("/api/ask")
async def ask_question(data: dict):
    # Natural Language Query
    question = data.get("question", "")
    # Provide a dummy AI answer or call OpenAI/Gemini
    return {"answer": f"AI Response to: '{question}' - Based on the data, the product is performing well on weekends."}

@app.post("/api/vision/scan")
async def upload_shelf_image(file: UploadFile = File(...)):
    try:
        # Simulate loading the image to memory
        contents = await file.read()
        # Process the image via our Vision Agent
        insights = process_shelf_scan(file.filename)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
