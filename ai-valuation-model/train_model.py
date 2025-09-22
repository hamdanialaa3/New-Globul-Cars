# ai-valuation-model/train_model.py
# AI-powered car valuation model for Bulgarian marketplace

import pandas as pd
import numpy as np
from google.cloud import bigquery
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import joblib
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration from environment variables
PROJECT_ID = os.getenv('GOOGLE_CLOUD_PROJECT', 'new-globul-cars-g-cloud')
DATASET_ID = os.getenv('BQ_DATASET', 'car_marketplace_analytics')
TABLE_ID = os.getenv('BQ_TABLE', 'cars')
MODEL_DIR = 'models'

def create_model_directory():
    """Create directory for saving models"""
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

def load_training_data():
    """Load training data from BigQuery or generate sample data"""
    print("Loading training data...")

    try:
        # Try to load from BigQuery first
        client = bigquery.Client(project=PROJECT_ID)

        query = f"""
        SELECT
            make,
            model,
            year,
            mileage,
            fuelType,
            transmission,
            power,
            engineSize,
            location,
            price,
            condition,
            registeredInBulgaria,
            environmentalTaxPaid,
            technicalInspectionValid
        FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        WHERE
            price > 0
            AND price < 1000000  -- Remove outliers
            AND mileage > 0
            AND mileage < 1000000  -- Remove unrealistic mileage
            AND year >= 1990
            AND year <= {datetime.now().year + 1}
            AND make IS NOT NULL
            AND model IS NOT NULL
            AND fuelType IS NOT NULL
            AND transmission IS NOT NULL
            AND location IS NOT NULL
        """

        df = client.query(query).to_dataframe()
        print(f"✅ Loaded {len(df)} training samples from BigQuery")

    except Exception as e:
        print(f"⚠️  BigQuery not available ({str(e)[:100]}...), generating sample Bulgarian car data...")

        # Generate sample Bulgarian car data
        np.random.seed(42)

        # Bulgarian car makes and models
        bulgarian_makes = ['Volkswagen', 'BMW', 'Mercedes', 'Audi', 'Opel', 'Ford', 'Toyota', 'Honda', 'Renault', 'Peugeot']
        bulgarian_cities = ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven']

        n_samples = 5000

        data = {
            'make': np.random.choice(bulgarian_makes, n_samples),
            'model': ['Golf', '3 Series', 'C-Class', 'A4', 'Astra', 'Focus', 'Corolla', 'Civic', 'Clio', '308'] * (n_samples // 10) + ['Golf'] * (n_samples % 10),
            'year': np.random.randint(2010, 2024, n_samples),
            'mileage': np.random.randint(10000, 300000, n_samples),
            'fuelType': np.random.choice(['Gasoline', 'Diesel', 'Electric', 'Hybrid'], n_samples, p=[0.6, 0.3, 0.05, 0.05]),
            'transmission': np.random.choice(['Manual', 'Automatic'], n_samples, p=[0.7, 0.3]),
            'power': np.random.randint(70, 300, n_samples),
            'engineSize': np.random.uniform(1.0, 3.0, n_samples),
            'location': np.random.choice(bulgarian_cities, n_samples),
            'condition': np.random.choice(['Excellent', 'Good', 'Fair', 'Poor'], n_samples, p=[0.2, 0.5, 0.25, 0.05]),
            'registeredInBulgaria': np.random.choice([True, False], n_samples, p=[0.95, 0.05]),
            'environmentalTaxPaid': np.random.choice([True, False], n_samples, p=[0.8, 0.2]),
            'technicalInspectionValid': np.random.choice([True, False], n_samples, p=[0.9, 0.1])
        }

        df = pd.DataFrame(data)

        # Generate realistic prices based on Bulgarian market (EUR)
        def calculate_price(row):
            base_price = 15000  # Base price in EUR

            # Year factor (newer = more expensive)
            year_factor = (row['year'] - 2010) * 500

            # Mileage factor (lower mileage = more expensive)
            mileage_factor = max(0, (200000 - row['mileage']) / 10000) * 200

            # Make factor
            make_factors = {
                'BMW': 1.5, 'Mercedes': 1.4, 'Audi': 1.3, 'Volkswagen': 1.0,
                'Toyota': 0.9, 'Honda': 0.9, 'Ford': 0.8, 'Opel': 0.7,
                'Renault': 0.6, 'Peugeot': 0.6
            }
            make_factor = make_factors.get(row['make'], 1.0) * 5000

            # Fuel type factor
            fuel_factors = {'Gasoline': 1.0, 'Diesel': 1.1, 'Hybrid': 1.3, 'Electric': 1.5}
            fuel_factor = fuel_factors.get(row['fuelType'], 1.0) * 1000

            # Transmission factor
            trans_factor = 2000 if row['transmission'] == 'Automatic' else 0

            # Condition factor
            condition_factors = {'Excellent': 1.2, 'Good': 1.0, 'Fair': 0.8, 'Poor': 0.6}
            condition_factor = condition_factors.get(row['condition'], 1.0)

            # Location factor (Sofia is most expensive)
            location_factors = {
                'Sofia': 1.2, 'Plovdiv': 1.0, 'Varna': 1.1, 'Burgas': 1.1,
                'Ruse': 0.9, 'Stara Zagora': 0.9, 'Pleven': 0.8, 'Sliven': 0.8
            }
            location_factor = location_factors.get(row['location'], 1.0)

            # Add some randomness
            noise = np.random.normal(0, 2000)

            price = (base_price + year_factor + mileage_factor + make_factor +
                    fuel_factor + trans_factor) * condition_factor * location_factor + noise

            return max(1000, price)  # Minimum price 1000 EUR

        df['price'] = df.apply(calculate_price, axis=1)

        print(f"✅ Generated {len(df)} sample Bulgarian car records")

    return df

def preprocess_data(df):
    """Preprocess and clean the data"""
    print("Preprocessing data...")

    # Remove duplicates
    df = df.drop_duplicates()

    # Handle missing values
    df = df.dropna(subset=['price', 'mileage', 'year'])

    # Fill missing values for categorical columns
    categorical_cols = ['condition', 'fuelType', 'transmission', 'location']
    for col in categorical_cols:
        df[col] = df[col].fillna(df[col].mode()[0])

    # Fill missing values for numerical columns
    numerical_cols = ['power', 'engineSize']
    for col in numerical_cols:
        df[col] = df[col].fillna(df[col].median())

    # Convert boolean columns to int
    boolean_cols = ['registeredInBulgaria', 'environmentalTaxPaid', 'technicalInspectionValid']
    for col in boolean_cols:
        df[col] = df[col].astype(int)

    # Create age feature
    current_year = datetime.now().year
    df['age'] = current_year - df['year']

    # Create price per horsepower feature
    df['price_per_hp'] = df['price'] / df['power'].replace(0, 1)

    # Create mileage per year feature
    df['mileage_per_year'] = df['mileage'] / df['age'].replace(0, 1)

    print(f"Data preprocessed. Shape: {df.shape}")
    return df

def create_features(df):
    """Create feature matrix and target variable"""
    print("Creating features...")

    # Define feature columns
    categorical_features = [
        'make', 'model', 'fuelType', 'transmission',
        'location', 'condition'
    ]

    numerical_features = [
        'year', 'mileage', 'power', 'engineSize', 'age',
        'price_per_hp', 'mileage_per_year', 'registeredInBulgaria',
        'environmentalTaxPaid', 'technicalInspectionValid'
    ]

    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])

    # Prepare features and target
    X = df[categorical_features + numerical_features]
    y = df['price']

    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")

    return X, y, preprocessor

def train_models(X_train, X_test, y_train, y_test, preprocessor):
    """Train multiple models and select the best one"""
    print("Training models...")

    models = {
        'random_forest': RandomForestRegressor(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        ),
        'gradient_boosting': GradientBoostingRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        ),
        'xgboost': xgb.XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1
        )
    }

    results = {}

    for name, model in models.items():
        print(f"Training {name}...")

        # Create pipeline
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])

        # Train model
        pipeline.fit(X_train, y_train)

        # Make predictions
        y_pred = pipeline.predict(X_test)

        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)

        results[name] = {
            'model': pipeline,
            'metrics': {
                'mae': mae,
                'rmse': rmse,
                'r2': r2
            },
            'predictions': y_pred
        }

        print(f"{name} - MAE: €{mae:.2f}, RMSE: €{rmse:.2f}, R²: {r2:.4f}")

    return results

def select_best_model(results):
    """Select the best performing model based on R² score"""
    best_model_name = max(results.keys(), key=lambda x: results[x]['metrics']['r2'])
    best_model = results[best_model_name]

    print(f"\nBest model: {best_model_name}")
    print(f"R² Score: {best_model['metrics']['r2']:.4f}")
    print(f"MAE: €{best_model['metrics']['mae']:.2f}")
    print(f"RMSE: €{best_model['metrics']['rmse']:.2f}")

    return best_model_name, best_model['model']

def save_model(model, model_name, preprocessor):
    """Save the trained model and preprocessor"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    model_filename = f"{MODEL_DIR}/car_valuation_model_{timestamp}.joblib"
    preprocessor_filename = f"{MODEL_DIR}/preprocessor_{timestamp}.joblib"

    # Save model
    joblib.dump(model, model_filename)
    joblib.dump(preprocessor, preprocessor_filename)

    print(f"Model saved as: {model_filename}")
    print(f"Preprocessor saved as: {preprocessor_filename}")

    return model_filename, preprocessor_filename

def evaluate_model_performance(model, X_test, y_test):
    """Evaluate model performance with detailed metrics"""
    print("\nDetailed Model Evaluation:")

    y_pred = model.predict(X_test)

    # Calculate percentage errors
    percentage_errors = np.abs((y_test - y_pred) / y_test) * 100

    print(f"Mean Absolute Percentage Error: {percentage_errors.mean():.2f}%")
    print(f"Median Absolute Percentage Error: {np.median(percentage_errors):.2f}%")
    print(f"Percentage of predictions within 10%: {(percentage_errors <= 10).mean() * 100:.2f}%")
    print(f"Percentage of predictions within 20%: {(percentage_errors <= 20).mean() * 100:.2f}%")
    # Price range analysis
    price_ranges = [
        (0, 5000), (5000, 10000), (10000, 20000),
        (20000, 35000), (35000, 50000), (50000, float('inf'))
    ]

    print("\nPerformance by Price Range:")
    for min_price, max_price in price_ranges:
        mask = (y_test >= min_price) & (y_test < max_price)
        if mask.sum() > 0:
            range_mae = mean_absolute_error(y_test[mask], y_pred[mask])
            range_mape = np.mean(percentage_errors[mask])
            print(f"  €{min_price:,} - €{max_price:,}: MAE €{range_mae:.0f}, MAPE {range_mape:.1f}%")

def main():
    """Main training pipeline"""
    print("🚗 Bulgarian Car Valuation AI Model Training")
    print("=" * 50)

    try:
        # Create model directory
        create_model_directory()

        # Load and preprocess data
        df = load_training_data()
        df = preprocess_data(df)

        # Create features
        X, y, preprocessor = create_features(df)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        print(f"Training set: {X_train.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")

        # Train models
        results = train_models(X_train, X_test, y_train, y_test, preprocessor)

        # Select best model
        best_model_name, best_model = select_best_model(results)

        # Evaluate performance
        evaluate_model_performance(best_model, X_test, y_test)

        # Save model
        model_file, preprocessor_file = save_model(best_model, best_model_name, preprocessor)

        print("\n✅ Model training completed successfully!")
        print(f"📁 Model saved to: {model_file}")
        print(f"📁 Preprocessor saved to: {preprocessor_file}")

        return best_model, preprocessor

    except Exception as e:
        print(f"❌ Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    main()