import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split
import warnings

warnings.filterwarnings('ignore')

def clean_data(df):
    """Data validation, missing-value handling, duplicate removal"""
    # Remove duplicates
    cleaned_df = df.drop_duplicates().copy()
    
    # Handle missing values
    cleaned_df['demand_count'] = cleaned_df['demand_count'].fillna(0)
    cleaned_df['skill'] = cleaned_df['skill'].fillna('Unknown')
    cleaned_df['month'] = cleaned_df['month'].fillna(method='ffill')
    
    return cleaned_df

def feature_engineering(df):
    """Add time-series features"""
    # Extract month and year
    df['month_dt'] = pd.to_datetime(df['month'] + '-01')
    df = df.sort_values('month_dt').reset_index(drop=True)
    df['time_idx'] = np.arange(len(df))
    
    # Rolling features to capture short term trends
    df['demand_rolling_3m'] = df['demand_count'].rolling(window=3, min_periods=1).mean()
    df['demand_rolling_6m'] = df['demand_count'].rolling(window=6, min_periods=1).mean()
    
    # Fill any NaNs created by rolling
    df = df.fillna(method='bfill')
    
    return df

def get_prediction_intervals(model_pipeline, X, y_pred, alpha=0.95):
    """Calculate simple prediction intervals based on residuals"""
    # Use standard error of regression
    # This is a simplified approach for prototype demonstration
    y_actual = model_pipeline.predict(X)
    residuals = y_actual - y_pred if hasattr(y_pred, "__len__") else y_actual
    
    # Just an approximation for prototype (not statistically rigorous)
    std_dev = np.std(residuals) if len(residuals) > 0 else 10
    z_score = 1.96 # for 95% confidence
    margin_of_error = z_score * std_dev
    
    return margin_of_error

def train_forecast_model(raw_df, skill):
    """
    Complete ML pipeline for forecasting skill demand.
    Includes data cleaning, train/test evaluation, and forecasting.
    """
    # 1. Data Cleaning
    df = clean_data(raw_df)
    
    # Filter data for specific skill
    skill_data = df[df['skill'] == skill].copy()
    
    if len(skill_data) < 12:
        return None # Insufficient data
        
    # Aggregate demand by month
    monthly_data = skill_data.groupby('month')['demand_count'].sum().reset_index()
    
    # 2. Feature Engineering
    monthly_data = feature_engineering(monthly_data)
    
    # Features and Target
    X = monthly_data[['time_idx', 'demand_rolling_3m']]
    y = monthly_data['demand_count']
    
    # 3. Train/Test Evaluation (to report metrics)
    # We use time-based split, last 20% for testing
    train_size = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:train_size], X.iloc[train_size:]
    y_train, y_test = y.iloc[:train_size], y.iloc[train_size:]
    
    # Pipeline with scaling and regularization
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('regressor', Ridge(alpha=1.0))
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred_test = pipeline.predict(X_test)
    
    # Calculate metrics
    r2 = r2_score(y_test, y_pred_test)
    mae = mean_absolute_error(y_test, y_pred_test)
    
    # 4. Final Model Training (on all data for forecasting)
    pipeline.fit(X, y)
    
    # 5. Forecasting next 6, 12, 24 months
    last_idx = monthly_data['time_idx'].iloc[-1]
    last_rolling_3m = monthly_data['demand_rolling_3m'].iloc[-1]
    
    # Simulating future feature values
    future_X = pd.DataFrame({
        'time_idx': [last_idx + 6, last_idx + 12, last_idx + 24],
        'demand_rolling_3m': [last_rolling_3m] * 3 # Holding last rolling average constant
    })
    
    predictions = pipeline.predict(future_X)
    
    # Calculate confidence interval margin
    y_pred_all = pipeline.predict(X)
    residuals = y - y_pred_all
    std_dev = np.std(residuals)
    margin = 1.96 * std_dev # 95% confidence interval
    
    trend = 'up' if predictions[-1] > y.iloc[-1] else 'down'
    confidence = 'High' if r2 > 0.6 else ('Medium' if r2 > 0.3 else 'Low')
    
    return {
        'skill': skill,
        'current_demand': int(y.iloc[-1]),
        'forecast_6m': int(max(0, predictions[0])),
        'forecast_12m': int(max(0, predictions[1])),
        'forecast_24m': int(max(0, predictions[2])),
        'margin_of_error': int(margin),
        'trend': trend,
        'confidence': confidence,
        'metrics': {
            'r2_score': round(r2, 2),
            'mae': round(mae, 2)
        }
    }
