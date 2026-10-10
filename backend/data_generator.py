import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_mock_data(num_records=5000):
    states_districts = {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
        "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
        "Delhi": ["New Delhi", "North Delhi", "South Delhi"]
    }
    
    sectors = ["IT/ITES", "Manufacturing", "Healthcare", "Agriculture", "Construction", "Retail"]
    
    roles_skills = {
        "IT/ITES": {
            "Software Developer": ["Python", "Java", "React", "SQL", "Cloud Computing"],
            "Data Analyst": ["Python", "SQL", "PowerBI", "Excel", "Machine Learning"],
            "System Admin": ["Linux", "Networking", "AWS", "Security"]
        },
        "Manufacturing": {
            "Production Engineer": ["CAD", "Quality Control", "Lean Manufacturing", "Robotics"],
            "Machine Operator": ["CNC Machining", "Safety Protocols", "Equipment Maintenance"]
        },
        "Healthcare": {
            "Nurse": ["Patient Care", "BLS", "Record Keeping"],
            "Lab Technician": ["Sample Analysis", "Equipment Calibration", "Phlebotomy"]
        },
        "Agriculture": {
            "Agronomist": ["Crop Management", "Soil Testing", "Pest Control"],
            "Farm Manager": ["Farm Operations", "Supply Chain", "Labor Management"]
        },
        "Construction": {
            "Civil Engineer": ["AutoCAD", "Project Management", "Structural Analysis"],
            "Site Supervisor": ["Safety Compliance", "Resource Allocation", "Quality Assurance"]
        },
        "Retail": {
            "Store Manager": ["Inventory Management", "Customer Service", "Sales Forecasting"],
            "Sales Associate": ["Point of Sale", "Merchandising", "Communication"]
        }
    }

    start_date = datetime(2023, 1, 1)
    end_date = datetime(2025, 12, 1)
    
    months = []
    current = start_date
    while current <= end_date:
        months.append(current.strftime("%Y-%m"))
        current += timedelta(days=32)
        current = current.replace(day=1)

    data = []
    
    for _ in range(num_records):
        state = random.choice(list(states_districts.keys()))
        district = random.choice(states_districts[state])
        sector = random.choice(sectors)
        role = random.choice(list(roles_skills[sector].keys()))
        skill = random.choice(roles_skills[sector][role])
        month = random.choice(months)
        
        # Base demand based on sector and role
        base_demand = random.randint(50, 500)
        demand = int(base_demand * random.uniform(0.5, 1.5))
        
        # Supply usually lags behind or is lower for tech
        if sector == "IT/ITES":
            supply = int(demand * random.uniform(0.4, 0.9))
        else:
            supply = int(demand * random.uniform(0.7, 1.2))
            
        enrolments = int(supply * random.uniform(0.5, 0.8))
        completions = int(enrolments * random.uniform(0.6, 0.9))
        
        data.append({
            "month": month,
            "state": state,
            "district": district,
            "sector": sector,
            "job_role": role,
            "skill": skill,
            "demand_count": demand,
            "supply_count": supply,
            "training_enrolments": enrolments,
            "training_completions": completions,
            "source": "Mock Govt Labor Portal",
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        })
        
    df = pd.DataFrame(data)
    df.to_csv("mock_labor_data.csv", index=False)
    print("Mock data generated and saved to mock_labor_data.csv")

if __name__ == "__main__":
    generate_mock_data(10000)
