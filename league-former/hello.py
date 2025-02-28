from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler

app = FastAPI()

class UserData(BaseModel):
    handle: str
    monthly_spending: float
    monthly_savings: float
    last_month_savings: float

class UserDataList(BaseModel):
    users: list[UserData]

def load_model_and_scaler(model_path, scaler_path):
    """Load the trained K-Means model and StandardScaler."""
    kmeans = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    return kmeans, scaler

def calculate_user_points(monthly_spending, monthly_savings, last_month_savings):
    """Compute the derived features, normalize, and calculate user points."""
    if monthly_savings == 0:
        monthly_savings = 0.01

    if last_month_savings == 0:
        last_month_savings = 0.01

    # Derived features
    withdrawal_ratio = monthly_spending / monthly_savings
    savings_growth_rate = (monthly_savings - last_month_savings) / last_month_savings

    # Feature weights
    weights = {
        "Monthly_Savings": 0.5,
        "Monthly_Spending": 0.2,
        "Withdrawal_Ratio": -0.2,
        "Savings_Growth_Rate": 0.2,
    }

    # Normalize features (assuming max and min values from training data)
    max_savings, max_spending = 9904865, 72944  # Adjust based on dataset
    max_withdrawal_ratio, min_savings_growth_rate, max_savings_growth_rate = 5, -1, 2

    norm_savings = monthly_savings / max_savings
    norm_spending = monthly_spending / max_spending
    norm_withdrawal_ratio = 1 - (withdrawal_ratio / max_withdrawal_ratio)
    norm_savings_growth = (savings_growth_rate - min_savings_growth_rate) / (max_savings_growth_rate - min_savings_growth_rate)

    # Compute the final score
    points = (
        norm_savings * weights["Monthly_Savings"] +
        norm_spending * weights["Monthly_Spending"] +
        norm_withdrawal_ratio * weights["Withdrawal_Ratio"] +
        norm_savings_growth * weights["Savings_Growth_Rate"]
    )

    # Scale points to a range (0 to 1000)
    points = max(0, min(1000, points * 1000))  # Ensure points stay in range
    return round(points, 2)

def predict_cluster(monthly_spending, monthly_savings, last_month_savings, model_path, scaler_path):
    """Calculate points and predict cluster."""
    kmeans, scaler = load_model_and_scaler(model_path, scaler_path)
    points = calculate_user_points(monthly_spending, monthly_savings, last_month_savings)
    points_scaled = scaler.transform(np.array([[points]]))  # Reshape for model
    cluster = kmeans.predict(points_scaled)[0]
    return cluster, points

def cluster_Mapping(cluster):
    if cluster == 0:
        return 0
    elif cluster == 1:
        return 2
    elif cluster == 2:
        return 1
    elif cluster == 3:
        return 4
    elif cluster == 4:
        return 3

@app.post("/predict")
async def predict_user_cluster(user_data: UserData):
    try:
        model_path = "./model/kmeans_model.pkl"
        scaler_path = "./model/scaler.pkl"
        
        cluster, points = predict_cluster(
            user_data.monthly_spending,
            user_data.monthly_savings,
            user_data.last_month_savings,
            model_path,
            scaler_path
        )
        
        mapped_cluster = cluster_Mapping(cluster)
        
        return {
            "handle": user_data.handle,
            "cluster": mapped_cluster,
            "points": points
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict-batch")
async def predict_user_clusters(user_data_list: UserDataList):
    try:
        model_path = "./model/kmeans_model.pkl"
        scaler_path = "./model/scaler.pkl"
        
        results = []
        for user_data in user_data_list.users:
            cluster, points = predict_cluster(
                user_data.monthly_spending,
                user_data.monthly_savings,
                user_data.last_month_savings,
                model_path,
                scaler_path
            )
            
            mapped_cluster = cluster_Mapping(cluster)
            
            results.append({
                "handle": user_data.handle,
                "cluster": mapped_cluster,
                "points": points
            })
        
        # Sort results by points in descending order
        results.sort(key=lambda x: x["points"], reverse=True)
            
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
