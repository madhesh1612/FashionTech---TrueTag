import numpy as np
from datetime import datetime, timedelta
import json
import os
from typing import List, Dict

class SyntheticDataGenerator:
    def __init__(self, num_samples: int = 1000):
        self.num_samples = num_samples
        
    def generate_label_positions(self) -> List[Dict]:
        """Generate synthetic label position data."""
        data = []
        
        # Standard label positions (normalized 0-1 range)
        standard_positions = [
            {"x": 0.1, "y": 0.1, "width": 0.2, "height": 0.1},  # Top left
            {"x": 0.7, "y": 0.1, "width": 0.2, "height": 0.1},  # Top right
            {"x": 0.1, "y": 0.8, "width": 0.2, "height": 0.1},  # Bottom left
            {"x": 0.7, "y": 0.8, "width": 0.2, "height": 0.1}   # Bottom right
        ]
        
        for _ in range(self.num_samples):
            # Pick a random standard position
            base_pos = standard_positions[np.random.randint(0, len(standard_positions))]
            
            # Add some random noise (±10% variation)
            noise = 0.1
            pos = {
                "x": base_pos["x"] + np.random.uniform(-noise, noise),
                "y": base_pos["y"] + np.random.uniform(-noise, noise),
                "width": base_pos["width"] * np.random.uniform(0.9, 1.1),
                "height": base_pos["height"] * np.random.uniform(0.9, 1.1)
            }
            
            data.append({
                "productId": f"PROD{len(data):04d}",
                "labelPosition": pos,
                "isValid": True
            })
            
        return data
    
    def generate_return_data(self) -> List[Dict]:
        """Generate synthetic return attempt data."""
        data = []
        
        # Generate a mix of legitimate and suspicious returns
        for i in range(self.num_samples):
            is_legitimate = np.random.random() > 0.2  # 80% legitimate returns
            
            if is_legitimate:
                # Legitimate return pattern
                activation_time = datetime.now() - timedelta(
                    days=np.random.randint(5, 30)
                )
                return_attempts = np.random.randint(0, 2)
                label_score = np.random.uniform(0.8, 1.0)
            else:
                # Suspicious return pattern
                activation_time = datetime.now() - timedelta(
                    hours=np.random.randint(1, 24)
                )
                return_attempts = np.random.randint(2, 5)
                label_score = np.random.uniform(0.3, 0.7)
            
            data.append({
                "productId": f"PROD{i:04d}",
                "activation_time": activation_time.isoformat(),
                "return_timestamp": datetime.now().isoformat(),
                "return_attempts": return_attempts,
                "label_match_score": label_score,
                "is_legitimate": is_legitimate
            })
            
        return data
    
    def save_to_file(self, data: List[Dict], filename: str):
        """Save synthetic data to JSON file."""
        os.makedirs("datasets", exist_ok=True)
        filepath = os.path.join("datasets", filename)
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Saved {len(data)} records to {filepath}")

def main():
    generator = SyntheticDataGenerator(num_samples=1000)
    
    # Generate and save label position data
    label_data = generator.generate_label_positions()
    generator.save_to_file(label_data, "synthetic_labels.json")
    
    # Generate and save return data
    return_data = generator.generate_return_data()
    generator.save_to_file(return_data, "synthetic_returns.json")

if __name__ == "__main__":
    main()