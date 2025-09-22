#!/usr/bin/env python3
"""
Bulgarian Car Valuation Model Deployment Script
نشر نموذج تقييم السيارات البلغارية على Vertex AI
"""

import os
import joblib
from google.cloud import aiplatform
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def deploy_model():
    """Deploy the trained model to Vertex AI"""

    # Find the latest model file
    import glob
    model_files = glob.glob('models/car_valuation_model_*.joblib')
    if not model_files:
        raise FileNotFoundError("No trained model found in models/ directory")

    model_path = max(model_files, key=os.path.getctime)  # Get most recent model
    print(f"Using model: {model_path}")

    # Load the trained model
    model = joblib.load(model_path)

    # Initialize Vertex AI
    aiplatform.init(
        project=os.getenv('VERTEX_AI_PROJECT', os.getenv('GOOGLE_CLOUD_PROJECT')),
        location=os.getenv('VERTEX_AI_LOCATION', 'europe-west3')
    )

    # Create model resource
    model_name = os.getenv('VERTEX_AI_MODEL_NAME', 'bulgarian_car_valuation')
    try:
        vertex_model = aiplatform.Model.upload(
            display_name=model_name,
            artifact_uri=f"gs://{os.getenv('GOOGLE_CLOUD_PROJECT')}-models/{model_name}",
            serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/sklearn-cpu.1-3:latest"
        )
        print(f"Model uploaded: {vertex_model.resource_name}")
    except Exception as e:
        print(f"Model upload failed: {e}")
        print("Trying to get existing model...")
        # Try to get existing model
        try:
            models = aiplatform.Model.list(filter=f"display_name={model_name}")
            if models:
                vertex_model = models[0]
                print(f"Using existing model: {vertex_model.resource_name}")
            else:
                raise Exception("No existing model found")
        except Exception as e2:
            print(f"Failed to get existing model: {e2}")
            return None

    # Create endpoint
    endpoint_name = os.getenv('VERTEX_AI_ENDPOINT_NAME', 'bulgarian_car_valuation_endpoint')
    try:
        endpoint = aiplatform.Endpoint.create(
            display_name=endpoint_name,
            project=os.getenv('VERTEX_AI_PROJECT', os.getenv('GOOGLE_CLOUD_PROJECT')),
            location=os.getenv('VERTEX_AI_LOCATION', 'europe-west3')
        )
        print(f"Endpoint created: {endpoint.resource_name}")
    except Exception as e:
        print(f"Endpoint creation failed: {e}")
        print("Trying to get existing endpoint...")
        try:
            endpoints = aiplatform.Endpoint.list(filter=f"display_name={endpoint_name}")
            if endpoints:
                endpoint = endpoints[0]
                print(f"Using existing endpoint: {endpoint.resource_name}")
            else:
                raise Exception("No existing endpoint found")
        except Exception as e2:
            print(f"Failed to get existing endpoint: {e2}")
            return None

    # Deploy model to endpoint
    try:
        deployed_model = vertex_model.deploy(
            endpoint=endpoint,
            machine_type="n1-standard-2",
            min_replica_count=1,
            max_replica_count=3,
            traffic_split={"0": 100}
        )
        print(f"Model deployed successfully!")
        print(f"Endpoint ID: {endpoint.resource_name}")
        print(f"Model ID: {vertex_model.resource_name}")

        return endpoint.resource_name
    except Exception as e:
        print(f"Model deployment failed: {e}")
        print("Model may still be deployable manually or through different method")
        return None

if __name__ == "__main__":
    deploy_model()