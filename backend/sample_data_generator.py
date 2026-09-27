import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

def generate_retail_sales():
    np.random.seed(42)
    n_rows = 12450
    
    # Dates from 2025-10-01 to 2026-03-31 (6 months)
    start_date = datetime(2025, 10, 1)
    date_offsets = np.random.randint(0, 182, size=n_rows)
    dates = [start_date + timedelta(days=int(d)) for d in date_offsets]
    
    regions = ["North", "West", "East", "South"]
    region_weights = [0.34, 0.28, 0.22, 0.16]
    region_col = np.random.choice(regions, size=n_rows, p=region_weights)
    
    categories = ["Electronics", "Office Supplies", "Furniture", "Accessories"]
    products_map = {
        "Electronics": ["Product A", "Smart Monitor X", "Pro Headphones", "Ultra Laptop"],
        "Office Supplies": ["Ergo Desk Mat", "Premium Notebook", "Gel Pen Pack"],
        "Furniture": ["Standing Desk Pro", "Mesh Office Chair", "Bookshelf Duo"],
        "Accessories": ["Wireless Mouse", "USB-C Hub", "Laptop Stand"]
    }
    
    cat_col = np.random.choice(categories, size=n_rows, p=[0.42, 0.23, 0.20, 0.15])
    prod_col = [np.random.choice(products_map[c]) for c in cat_col]
    
    # Force Product A to have a prominent share in Electronics
    # If Electronics, 50% Product A
    for i in range(n_rows):
        if cat_col[i] == "Electronics" and np.random.rand() < 0.50:
            prod_col[i] = "Product A"
            
    # Base units sold
    units = np.random.randint(1, 15, size=n_rows)
    
    # Price per unit based on category
    price_map = {
        "Electronics": (180, 520),
        "Office Supplies": (15, 60),
        "Furniture": (220, 750),
        "Accessories": (25, 95)
    }
    
    unit_prices = [np.random.uniform(price_map[c][0], price_map[c][1]) for c in cat_col]
    # Product A high price
    for i in range(n_rows):
        if prod_col[i] == "Product A":
            unit_prices[i] = 480.0
            
    # Discounts
    discounts = np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20], size=n_rows, p=[0.45, 0.25, 0.15, 0.10, 0.05])
    
    revenue = []
    profit = []
    ad_spend = []
    
    for i in range(n_rows):
        dt = dates[i]
        reg = region_col[i]
        base_rev = units[i] * unit_prices[i] * (1 - discounts[i])
        
        # Simulated March drop: in March 2026, especially in East and South for Furniture & Electronics
        if dt.month == 3 and dt.year == 2026:
            if reg in ["East", "South"] and cat_col[i] in ["Furniture", "Electronics"]:
                base_rev *= 0.65  # 35% decline anomaly
            elif dt.day > 10:
                base_rev *= 0.82
                
        # Advertising spend strongly correlated with revenue
        ad = base_rev * np.random.uniform(0.12, 0.18) + np.random.normal(0, 15)
        ad = max(5.0, ad)
        
        # Profit margins ~ 22% - 38%
        prof = base_rev * np.random.uniform(0.22, 0.38) - (discounts[i] * base_rev * 0.5)
        
        revenue.append(round(base_rev, 2))
        profit.append(round(prof, 2))
        ad_spend.append(round(ad, 2))
        
    # Inject 12 extreme outliers (B2B wholesale transactions)
    outlier_indices = np.random.choice(n_rows, size=12, replace=False)
    for idx in outlier_indices:
        revenue[idx] = round(revenue[idx] * np.random.uniform(8.0, 14.0), 2)
        profit[idx] = round(profit[idx] * np.random.uniform(7.0, 12.0), 2)
        ad_spend[idx] = round(ad_spend[idx] * 4.5, 2)
        
    customer_segments = ["Consumer", "Corporate", "Small Business"]
    segment_col = np.random.choice(customer_segments, size=n_rows, p=[0.55, 0.30, 0.15])
    
    payment_methods = ["Credit Card", "Bank Transfer", "PayPal", "Corporate Invoice"]
    payment_col = np.random.choice(payment_methods, size=n_rows, p=[0.48, 0.22, 0.18, 0.12])
    
    # Customer age with 7.4% missing values
    ages = np.random.randint(18, 70, size=n_rows).astype(float)
    missing_age_mask = np.random.rand(n_rows) < 0.074
    ages[missing_age_mask] = np.nan
    
    # Ratings (1 to 5) with 4.5% missing
    ratings = np.random.choice([1, 2, 3, 4, 5], size=n_rows, p=[0.04, 0.06, 0.15, 0.45, 0.30]).astype(float)
    ratings[np.random.rand(n_rows) < 0.045] = np.nan
    
    df = pd.DataFrame({
        "order_date": [d.strftime("%Y-%m-%d") for d in dates],
        "region": region_col,
        "category": cat_col,
        "product": prod_col,
        "units_sold": units,
        "unit_price": [round(p, 2) for p in unit_prices],
        "discount": discounts,
        "revenue": revenue,
        "profit": profit,
        "advertising_spend": ad_spend,
        "customer_segment": segment_col,
        "payment_method": payment_col,
        "customer_age": ages,
        "satisfaction_rating": ratings
    })
    
    out_path = os.path.join(DATASETS_DIR, "retail_sales_2026.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {out_path} with {len(df)} rows and {len(df.columns)} columns.")
    return out_path

def generate_saas_metrics():
    np.random.seed(101)
    n_rows = 5200
    plans = ["Starter", "Professional", "Enterprise"]
    plan_col = np.random.choice(plans, size=n_rows, p=[0.45, 0.38, 0.17])
    
    mrr_map = {"Starter": (29, 49), "Professional": (99, 149), "Enterprise": (499, 1200)}
    mrr = [round(np.random.uniform(mrr_map[p][0], mrr_map[p][1]), 2) for p in plan_col]
    
    tenure_months = np.random.randint(1, 48, size=n_rows)
    total_charges = [round(m * t * np.random.uniform(0.9, 1.05), 2) for m, t in zip(mrr, tenure_months)]
    
    tickets = np.random.poisson(lam=2.5, size=n_rows)
    churn_prob = 0.05 + (tickets * 0.08) - (tenure_months * 0.003)
    churn_prob = np.clip(churn_prob, 0.02, 0.85)
    churn = [np.random.rand() < p for p in churn_prob]
    
    df = pd.DataFrame({
        "customer_id": [f"CUST-{10000+i}" for i in range(n_rows)],
        "plan_tier": plan_col,
        "monthly_revenue": mrr,
        "tenure_months": tenure_months,
        "total_revenue": total_charges,
        "support_tickets": tickets,
        "active_users": np.random.randint(1, 40, size=n_rows),
        "contract_type": np.random.choice(["Monthly", "Annual", "Two-Year"], size=n_rows, p=[0.55, 0.35, 0.10]),
        "churned": ["Yes" if c else "No" for c in churn]
    })
    
    out_path = os.path.join(DATASETS_DIR, "saas_churn_metrics.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {out_path} with {len(df)} rows.")
    return out_path

if __name__ == "__main__":
    generate_retail_sales()
    generate_saas_metrics()
