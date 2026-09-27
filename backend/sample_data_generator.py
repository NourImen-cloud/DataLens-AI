import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

def generate_retail_sales():
    np.random.seed(42)
    n_rows = 12450
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
    
    for i in range(n_rows):
        if cat_col[i] == "Electronics" and np.random.rand() < 0.50:
            prod_col[i] = "Product A"
            
    units = np.random.randint(1, 15, size=n_rows)
    price_map = {
        "Electronics": (180, 520),
        "Office Supplies": (15, 60),
        "Furniture": (220, 750),
        "Accessories": (25, 95)
    }
    unit_prices = [np.random.uniform(price_map[c][0], price_map[c][1]) for c in cat_col]
    for i in range(n_rows):
        if prod_col[i] == "Product A":
            unit_prices[i] = 480.0
            
    discounts = np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20], size=n_rows, p=[0.45, 0.25, 0.15, 0.10, 0.05])
    revenue, profit, ad_spend = [], [], []
    
    for i in range(n_rows):
        dt = dates[i]
        reg = region_col[i]
        base_rev = units[i] * unit_prices[i] * (1 - discounts[i])
        
        if dt.month == 3 and dt.year == 2026:
            if reg in ["East", "South"] and cat_col[i] in ["Furniture", "Electronics"]:
                base_rev *= 0.65
            elif dt.day > 10:
                base_rev *= 0.82
                
        ad = base_rev * np.random.uniform(0.12, 0.18) + np.random.normal(0, 15)
        ad = max(5.0, ad)
        prof = base_rev * np.random.uniform(0.22, 0.38) - (discounts[i] * base_rev * 0.5)
        
        revenue.append(round(base_rev, 2))
        profit.append(round(prof, 2))
        ad_spend.append(round(ad, 2))
        
    outlier_indices = np.random.choice(n_rows, size=12, replace=False)
    for idx in outlier_indices:
        revenue[idx] = round(revenue[idx] * np.random.uniform(8.0, 14.0), 2)
        profit[idx] = round(profit[idx] * np.random.uniform(7.0, 12.0), 2)
        ad_spend[idx] = round(ad_spend[idx] * 4.5, 2)
        
    customer_segments = ["Consumer", "Corporate", "Small Business"]
    segment_col = np.random.choice(customer_segments, size=n_rows, p=[0.55, 0.30, 0.15])
    
    payment_methods = ["Credit Card", "Bank Transfer", "PayPal", "Corporate Invoice"]
    payment_col = np.random.choice(payment_methods, size=n_rows, p=[0.48, 0.22, 0.18, 0.12])
    
    ages = np.random.randint(18, 70, size=n_rows).astype(float)
    ages[np.random.rand(n_rows) < 0.074] = np.nan
    
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
    return out_path

def generate_clinical_patients():
    """Healthcare / Clinical Diagnostics Dataset"""
    np.random.seed(55)
    n_rows = 3500
    departments = ["Cardiology", "Neurology", "Endocrinology", "General Medicine"]
    dep_col = np.random.choice(departments, size=n_rows, p=[0.35, 0.22, 0.25, 0.18])
    
    ages = np.random.randint(20, 85, size=n_rows)
    bmi = np.random.normal(27.5, 4.8, size=n_rows).round(1)
    
    # Blood pressure correlates with age & BMI
    systolic_bp = 100 + (ages * 0.4) + (bmi * 0.8) + np.random.normal(0, 8, size=n_rows)
    systolic_bp = systolic_bp.round(0)
    
    cholesterol = 160 + (ages * 0.6) + np.random.normal(0, 20, size=n_rows)
    cholesterol = cholesterol.round(0)
    
    glucose = 85 + (bmi * 1.2) + np.random.normal(0, 15, size=n_rows)
    glucose = glucose.round(0)
    
    # Recovery days
    recovery_days = np.clip((systolic_bp / 20) + (ages / 15) + np.random.normal(0, 2, size=n_rows), 1, 30).round(0)
    
    # Risk score (0 - 100)
    risk_score = np.clip((systolic_bp - 100) * 0.5 + (cholesterol - 160) * 0.3 + (glucose - 85) * 0.4, 5, 98).round(1)
    
    outcomes = ["Discharged Full Recovery", "Outpatient Monitoring", "Extended Hospital Care", "Critical Care Intervention"]
    outcome_col = []
    for r in risk_score:
        if r < 35:
            outcome_col.append("Discharged Full Recovery")
        elif r < 60:
            outcome_col.append("Outpatient Monitoring")
        elif r < 80:
            outcome_col.append("Extended Hospital Care")
        else:
            outcome_col.append("Critical Care Intervention")
            
    # Dates
    start_date = datetime(2025, 6, 1)
    admission_dates = [start_date + timedelta(days=int(d)) for d in np.random.randint(0, 300, size=n_rows)]
    
    df = pd.DataFrame({
        "patient_id": [f"PAT-{20000+i}" for i in range(n_rows)],
        "admission_date": [d.strftime("%Y-%m-%d") for d in admission_dates],
        "department": dep_col,
        "age": ages,
        "bmi": bmi,
        "systolic_bp": systolic_bp,
        "cholesterol": cholesterol,
        "glucose_mg_dl": glucose,
        "risk_score": risk_score,
        "recovery_days": recovery_days,
        "clinical_outcome": outcome_col
    })
    
    out_path = os.path.join(DATASETS_DIR, "clinical_patients.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {out_path} with {len(df)} rows.")
    return out_path

def generate_student_performance():
    """Education / Student Academic Performance Dataset"""
    np.random.seed(88)
    n_rows = 4200
    faculties = ["Computer Science", "Engineering", "Business & Economics", "Data Science", "Humanities"]
    fac_col = np.random.choice(faculties, size=n_rows, p=[0.32, 0.26, 0.20, 0.14, 0.08])
    
    study_hours_weekly = np.clip(np.random.normal(18.5, 6.0, size=n_rows), 2, 50).round(1)
    attendance_pct = np.clip(np.random.normal(82, 12, size=n_rows), 40, 100).round(1)
    
    # Exam score strongly correlated with study hours and attendance
    exam_score = 30 + (study_hours_weekly * 1.1) + (attendance_pct * 0.45) + np.random.normal(0, 6, size=n_rows)
    exam_score = np.clip(exam_score, 15, 100).round(1)
    
    passed = ["Passed" if s >= 50 else "Needs Retake" for s in exam_score]
    engagement_level = ["High" if a > 85 and h > 20 else ("Medium" if a > 70 else "Low") for a, h in zip(attendance_pct, study_hours_weekly)]
    
    df = pd.DataFrame({
        "student_id": [f"STU-{50000+i}" for i in range(n_rows)],
        "faculty": fac_col,
        "study_hours_weekly": study_hours_weekly,
        "attendance_percentage": attendance_pct,
        "midterm_score": (exam_score * np.random.uniform(0.9, 1.05)).clip(20, 100).round(1),
        "final_exam_score": exam_score,
        "engagement_level": engagement_level,
        "status": passed
    })
    
    out_path = os.path.join(DATASETS_DIR, "student_performance.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {out_path} with {len(df)} rows.")
    return out_path

if __name__ == "__main__":
    generate_retail_sales()
    generate_clinical_patients()
    generate_student_performance()
