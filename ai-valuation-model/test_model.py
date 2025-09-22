#!/usr/bin/env python3
"""
Bulgarian Car Valuation Model Testing Script
اختبار نموذج تقييم السيارات البلغارية
"""

import os
import joblib
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_model():
    """Test the trained model performance"""

    # Load test data
    test_data_path = 'data/test_data.csv'
    if not os.path.exists(test_data_path):
        print("Test data not found. Running training first...")
        from train_model import train_model
        train_model()
        return

    test_df = pd.read_csv(test_data_path)

    # Load the trained model
    model_path = 'models/best_model.pkl'
    if not os.path.exists(model_path):
        print("Model not found. Running training first...")
        from train_model import train_model
        train_model()
        return

    model = joblib.load(model_path)

    # Prepare features
    feature_columns = [
        'year', 'mileage', 'engine_size', 'horsepower',
        'make_encoded', 'model_encoded', 'fuel_type_encoded',
        'transmission_encoded', 'location_encoded', 'condition_encoded'
    ]

    X_test = test_df[feature_columns]
    y_test = test_df['price']

    # Make predictions
    predictions = model.predict(X_test)

    # Calculate metrics
    mae = mean_absolute_error(y_test, predictions)
    mse = mean_squared_error(y_test, predictions)
    rmse = mse ** 0.5
    r2 = r2_score(y_test, predictions)

    print("Model Performance Metrics:")
    print(f"Mean Absolute Error: €{mae:.2f}")
    print(f"Root Mean Squared Error: €{rmse:.2f}")
    print(f"R² Score: {r2:.4f}")

    # Test with sample Bulgarian cars
    sample_cars = [
        {
            'year': 2018,
            'mileage': 85000,
            'engine_size': 1.6,
            'horsepower': 110,
            'make_encoded': 1,  # Volkswagen
            'model_encoded': 1,  # Golf
            'fuel_type_encoded': 0,  # Gasoline
            'transmission_encoded': 0,  # Manual
            'location_encoded': 0,  # Sofia
            'condition_encoded': 1   # Good
        },
        {
            'year': 2020,
            'mileage': 45000,
            'engine_size': 2.0,
            'horsepower': 150,
            'make_encoded': 2,  # BMW
            'model_encoded': 2,  # 3 Series
            'fuel_type_encoded': 1,  # Diesel
            'transmission_encoded': 1,  # Automatic
            'location_encoded': 1,  # Plovdiv
            'condition_encoded': 2   # Excellent
        }
    ]

    print("\nSample Predictions:")
    for i, car in enumerate(sample_cars, 1):
        car_df = pd.DataFrame([car])
        prediction = model.predict(car_df)[0]
        print(f"Car {i}: Predicted Price €{prediction:.2f}")

if __name__ == "__main__":
    test_model()