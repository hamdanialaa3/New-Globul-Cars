#!/usr/bin/env python3
"""
Bulgarian Car Valuation Prediction Script
سكريبت التنبؤ بأسعار السيارات البلغارية
"""

import os
import joblib
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class BulgarianCarValuation:
    """Bulgarian Car Valuation Model"""

    def __init__(self):
        self.model = None
        self.encoders = {}
        self.load_model()

    def load_model(self):
        """Load the trained model and encoders"""
        model_path = 'models/best_model.pkl'
        encoders_path = 'models/encoders.pkl'

        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print("Model loaded successfully")
        else:
            raise FileNotFoundError("Model not found. Please train the model first.")

        if os.path.exists(encoders_path):
            self.encoders = joblib.load(encoders_path)
            print("Encoders loaded successfully")

    def preprocess_input(self, car_data):
        """Preprocess input data for prediction"""

        # Create a DataFrame from input
        df = pd.DataFrame([car_data])

        # Encode categorical variables
        categorical_cols = ['make', 'model', 'fuel_type', 'transmission', 'location', 'condition']

        for col in categorical_cols:
            if col in df.columns and col in self.encoders:
                encoder = self.encoders[col]
                df[f'{col}_encoded'] = encoder.transform(df[col])
            elif col in df.columns:
                # Handle unknown categories
                df[f'{col}_encoded'] = 0

        # Select features
        feature_columns = [
            'year', 'mileage', 'engine_size', 'horsepower',
            'make_encoded', 'model_encoded', 'fuel_type_encoded',
            'transmission_encoded', 'location_encoded', 'condition_encoded'
        ]

        return df[feature_columns]

    def predict_price(self, car_data):
        """Predict car price"""

        if self.model is None:
            raise ValueError("Model not loaded")

        # Preprocess input
        processed_data = self.preprocess_input(car_data)

        # Make prediction
        prediction = self.model.predict(processed_data)[0]

        # Calculate confidence (simplified)
        confidence = 0.85  # Placeholder - would be calculated based on prediction intervals

        return {
            'predicted_price': round(prediction, 2),
            'currency': 'EUR',
            'confidence': confidence,
            'market': 'Bulgaria'
        }

def main():
    """Main function for testing"""

    # Initialize valuation model
    valuation = BulgarianCarValuation()

    # Sample Bulgarian car data
    sample_car = {
        'make': 'Volkswagen',
        'model': 'Golf',
        'year': 2018,
        'mileage': 85000,
        'engine_size': 1.6,
        'horsepower': 110,
        'fuel_type': 'Gasoline',
        'transmission': 'Manual',
        'location': 'Sofia',
        'condition': 'Good'
    }

    # Make prediction
    result = valuation.predict_price(sample_car)

    print("Car Valuation Result:")
    print(f"Make: {sample_car['make']} {sample_car['model']}")
    print(f"Year: {sample_car['year']}")
    print(f"Mileage: {sample_car['mileage']} km")
    print(f"Location: {sample_car['location']}")
    print(f"Predicted Price: €{result['predicted_price']}")
    print(f"Confidence: {result['confidence']*100}%")
    print(f"Market: {result['market']}")

if __name__ == "__main__":
    main()