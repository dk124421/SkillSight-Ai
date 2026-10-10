from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from typing import List, Optional
import os

from ml_model import train_forecast_model
from data_generator import generate_mock_data

app = FastAPI(title="SkillSight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data on startup
DATA_FILE = "mock_labor_data.csv"
df = None

@app.on_event("startup")
def startup_event():
    global df
    if not os.path.exists(DATA_FILE):
        print("Generating mock data...")
        generate_mock_data(10000)
    df = pd.read_csv(DATA_FILE)

@app.get("/api/overview")
def get_overview(state: Optional[str] = None, district: Optional[str] = None, sector: Optional[str] = None):
    filtered_df = df
    if state:
        filtered_df = filtered_df[filtered_df['state'] == state]
    if district:
        filtered_df = filtered_df[filtered_df['district'] == district]
    if sector:
        filtered_df = filtered_df[filtered_df['sector'] == sector]
        
    total_postings = int(filtered_df['demand_count'].sum())
    total_supply = int(filtered_df['supply_count'].sum())
    
    # Most demanded skills
    skill_demand = filtered_df.groupby('skill')['demand_count'].sum().sort_values(ascending=False).head(5)
    most_demanded = [{"skill": k, "demand": int(v)} for k, v in skill_demand.items()]
    
    return {
        "total_postings": total_postings,
        "estimated_shortage": total_postings - total_supply if total_postings > total_supply else 0,
        "most_demanded_skills": most_demanded,
        "data_source": "Mock Govt Labor Portal",
        "last_updated": filtered_df['last_updated'].iloc[0] if not filtered_df.empty else "N/A"
    }

@app.get("/api/labour-data")
def get_labour_data(
    state: Optional[str] = None, 
    district: Optional[str] = None,
    sector: Optional[str] = None,
    skill: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    filtered_df = df
    if state:
        filtered_df = filtered_df[filtered_df['state'] == state]
    if district:
        filtered_df = filtered_df[filtered_df['district'] == district]
    if sector:
        filtered_df = filtered_df[filtered_df['sector'] == sector]
    if skill:
        filtered_df = filtered_df[filtered_df['skill'] == skill]
        
    start = (page - 1) * limit
    end = start + limit
    
    data = filtered_df.iloc[start:end].to_dict(orient="records")
    return {
        "total_count": len(filtered_df),
        "data": data,
        "data_quality": "High (Prototype Mock)"
    }

@app.get("/api/skill-demand")
def get_skill_demand(state: Optional[str] = None, sector: Optional[str] = None):
    filtered_df = df
    if state:
        filtered_df = filtered_df[filtered_df['state'] == state]
    if sector:
        filtered_df = filtered_df[filtered_df['sector'] == sector]
        
    skill_stats = filtered_df.groupby('skill').agg({
        'demand_count': 'sum',
        'supply_count': 'sum'
    }).reset_index()
    
    skill_stats = skill_stats.sort_values('demand_count', ascending=False)
    
    return skill_stats.to_dict(orient="records")

@app.get("/api/forecast")
def get_forecast(skill: str):
    forecast = train_forecast_model(df, skill)
    if not forecast:
        raise HTTPException(status_code=404, detail="Skill not found or insufficient data")
        
    # Historical data for chart
    skill_data = df[df['skill'] == skill]
    historical = skill_data.groupby('month')['demand_count'].sum().reset_index().to_dict(orient="records")
    
    return {
        "forecast": forecast,
        "historical": historical,
        "model_performance": f"R2: {forecast['metrics']['r2_score']} | MAE: {forecast['metrics']['mae']}",
        "assumptions": f"Ridge Regression with 95% Confidence Interval (±{forecast['margin_of_error']}). Rolling features applied.",
        "margin_of_error": forecast['margin_of_error']
    }

@app.get("/api/supply-demand-gap")
def get_gap_analysis(state: Optional[str] = None, district: Optional[str] = None):
    filtered_df = df
    if state:
        filtered_df = filtered_df[filtered_df['state'] == state]
    if district:
        filtered_df = filtered_df[filtered_df['district'] == district]
        
    skill_stats = filtered_df.groupby('skill').agg({
        'demand_count': 'sum',
        'supply_count': 'sum'
    }).reset_index()
    
    skill_stats['gap'] = skill_stats['demand_count'] - skill_stats['supply_count']
    skill_stats['gap_percentage'] = (skill_stats['gap'] / skill_stats['demand_count'] * 100).fillna(0)
    
    def severity(row):
        if row['gap_percentage'] > 30: return 'High'
        if row['gap_percentage'] > 10: return 'Medium'
        return 'Low'
        
    skill_stats['severity'] = skill_stats.apply(severity, axis=1)
    
    return skill_stats.sort_values('gap', ascending=False).to_dict(orient="records")

@app.get("/api/training-recommendations")
def get_training_recommendations(skill: str):
    # Mock training recommendations based on skill
    recommendations = [
        {
            "skill": skill,
            "program_name": f"Advanced {skill} Certification",
            "provider": "State Skill Development Corp (Sample)",
            "eligibility": "12th Pass or Equivalent",
            "mode": "Hybrid",
            "reason": f"High demand in IT/ITES sector for {skill}"
        },
        {
            "skill": skill,
            "program_name": f"{skill} Bootcamp",
            "provider": "Tech Skills India (Sample)",
            "eligibility": "Graduate",
            "mode": "Online",
            "reason": "Rapid upskilling needed to address >30% gap."
        }
    ]
    return recommendations

@app.get("/api/geographic-intelligence")
def get_geographic_intelligence(state: Optional[str] = None):
    filtered_df = df
    if state:
        filtered_df = filtered_df[filtered_df['state'] == state]
        
    district_stats = filtered_df.groupby('district').agg({
        'demand_count': 'sum',
        'supply_count': 'sum'
    }).reset_index()
    
    district_stats['gap'] = district_stats['demand_count'] - district_stats['supply_count']
    
    return district_stats.to_dict(orient="records")

@app.get("/api/filters")
def get_filters():
    return {
        "states": df['state'].unique().tolist(),
        "districts": df['district'].unique().tolist(),
        "sectors": df['sector'].unique().tolist(),
        "skills": df['skill'].unique().tolist()
    }
