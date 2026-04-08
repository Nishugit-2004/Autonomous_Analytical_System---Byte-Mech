import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

os.makedirs('demo_datasets', exist_ok=True)

def generate_dataset(filename, categories_dict, num_rows=5000):
    np.random.seed(random.randint(0, 10000))
    
    # Generate dates over the last year
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    # Generate random dates
    dates = [start_date + timedelta(days=random.randint(0, 365)) for _ in range(num_rows)]
    
    products = list(categories_dict.keys())
    
    # Generate random products
    chosen_products = random.choices(products, k=num_rows)
    
    data = []
    for i in range(num_rows):
        productName = chosen_products[i]
        base_price = categories_dict[productName]['price']
        
        # Add random variation to price (+/- 10%)
        unit_price = round(base_price * random.uniform(0.9, 1.1), 2)
        
        # Quantity depends randomly on price (lower price = higher qty)
        qty = random.randint(1, max(3, int(500 / base_price))) 
        
        # Calculate revenue / sales
        sales = round(unit_price * qty, 2)
        
        # Calculate profit margin (20% to 50% randomly)
        profit_margin = random.uniform(0.2, 0.5)
        profit = round(sales * profit_margin, 2)
        
        # Random Store / City
        city = random.choice(['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'])
        
        data.append({
            "Order Date": dates[i].strftime("%Y-%m-%d"),
            "Product Name": productName,
            "Category": categories_dict[productName]['cat'],
            "City": city,
            "Unit Price": unit_price,
            "Quantity Sold": qty,
            "Total Sales": sales,
            "Net Profit": profit
        })
        
    df = pd.DataFrame(data)
    df = df.sort_values(by="Order Date")
    file_path = os.path.join('demo_datasets', filename)
    df.to_csv(file_path, index=False)
    print(f"Generated {file_path} with {num_rows} rows.")

# 1. Electronics
electronics = {
    "Wireless Headphones": {"price": 120, "cat": "Audio"},
    "Bluetooth Speaker": {"price": 85, "cat": "Audio"},
    "Smartphone 5G": {"price": 800, "cat": "Mobile"},
    "Tablet Pro": {"price": 550, "cat": "Mobile"},
    "4K Monitor": {"price": 320, "cat": "Display"},
    "Mechanical Keyboard": {"price": 110, "cat": "Accessories"},
    "Gaming Mouse": {"price": 65, "cat": "Accessories"},
    "Smartwatch": {"price": 190, "cat": "Wearables"},
    "Laptop Stand": {"price": 45, "cat": "Accessories"},
    "USB-C Hub": {"price": 35, "cat": "Accessories"}
}

# 2. Fashion
fashion = {
    "Denim Jacket": {"price": 60, "cat": "Outerwear"},
    "Cotton T-Shirt": {"price": 15, "cat": "Topwear"},
    "Sneakers": {"price": 85, "cat": "Footwear"},
    "Formal Shirt": {"price": 45, "cat": "Topwear"},
    "Chinos": {"price": 55, "cat": "Bottomwear"},
    "Summer Dress": {"price": 40, "cat": "Dress"},
    "Leather Belt": {"price": 25, "cat": "Accessories"},
    "Sunglasses": {"price": 30, "cat": "Accessories"},
    "Wrist Watch": {"price": 120, "cat": "Accessories"},
    "Running Shoes": {"price": 95, "cat": "Footwear"}
}

# 3. Supermarket
grocery = {
    "Organic Milk": {"price": 4.5, "cat": "Dairy"},
    "Whole Wheat Bread": {"price": 3.0, "cat": "Bakery"},
    "Eggs (Dz)": {"price": 4.2, "cat": "Dairy"},
    "Apples (1kg)": {"price": 5.0, "cat": "Produce"},
    "Chicken Breast": {"price": 8.5, "cat": "Meat"},
    "Pasta": {"price": 2.5, "cat": "Pantry"},
    "Tomato Ketchup": {"price": 3.5, "cat": "Pantry"},
    "Coffee Beans": {"price": 12.0, "cat": "Beverages"},
    "Green Tea": {"price": 6.5, "cat": "Beverages"},
    "Potato Chips": {"price": 2.2, "cat": "Snacks"}
}

# 4. Pharmacy
pharmacy = {
    "Multivitamins": {"price": 15.0, "cat": "Supplements"},
    "Vitamin C": {"price": 12.0, "cat": "Supplements"},
    "Pain Relief Pills": {"price": 8.5, "cat": "Medication"},
    "Cough Syrup": {"price": 9.0, "cat": "Medication"},
    "Band-Aids": {"price": 4.0, "cat": "First Aid"},
    "Antiseptic Cream": {"price": 6.5, "cat": "First Aid"},
    "Face Masks (Pack)": {"price": 18.0, "cat": "Hygiene"},
    "Hand Sanitizer": {"price": 5.0, "cat": "Hygiene"},
    "Protein Powder": {"price": 45.0, "cat": "Supplements"},
    "Eye Drops": {"price": 11.0, "cat": "Medication"}
}

# 5. Home & Furniture
home = {
    "Cushion Cover": {"price": 18.0, "cat": "Decor"},
    "Table Lamp": {"price": 35.0, "cat": "Lighting"},
    "Bed Sheets (King)": {"price": 65.0, "cat": "Bedding"},
    "Coffee Table": {"price": 120.0, "cat": "Furniture"},
    "Office Chair": {"price": 150.0, "cat": "Furniture"},
    "Wall Clock": {"price": 25.0, "cat": "Decor"},
    "Bookshelf": {"price": 85.0, "cat": "Furniture"},
    "Ceramic Mug": {"price": 12.0, "cat": "Kitchen"},
    "Frying Pan": {"price": 45.0, "cat": "Kitchen"},
    "Bath Towel Set": {"price": 30.0, "cat": "Bath"}
}

if __name__ == "__main__":
    generate_dataset("dataset_electronics.csv", electronics, 5000)
    generate_dataset("dataset_fashion.csv", fashion, 5000)
    generate_dataset("dataset_supermarket.csv", grocery, 5000)
    generate_dataset("dataset_pharmacy.csv", pharmacy, 5000)
    generate_dataset("dataset_home_decor.csv", home, 5000)
    print("\nAll datasets successfully generated in the 'demo_datasets' folder!")
