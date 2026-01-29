import re
import json

def parse_car_tree(file_path):
    categories = set()
    brands = set()
    models = set()
    
    # regex for icons
    # Category: 📂
    # Brand: 🚗
    # Model: 📅
    
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if '📂' in line:
                name = line.split('📂')[-1].strip()
                categories.add(name)
            elif '🚗' in line:
                name = line.split('🚗')[-1].strip()
                brands.add(name)
            elif '📅' in line:
                name = line.split('📅')[-1].strip()
                models.add(name)
                
    return {
        'categories': sorted(list(categories)),
        'brands': sorted(list(brands)),
        'models': sorted(list(models))
    }

if __name__ == "__main__":
    input_file = r'C:\Users\hamda\Desktop\New Globul Cars\CARS_TREE_UPDATED.txt'
    output_file = r'C:\Users\hamda\Desktop\New Globul Cars\extracted_cars.json'
    
    data = parse_car_tree(input_file)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Extracted {len(data['categories'])} categories, {len(data['brands'])} brands, and {len(data['models'])} models.")
