import urllib.request
import json

domains = ['retail_sales', 'clinical_patients', 'student_performance', 'saas_churn']
for n in domains:
    try:
        r = urllib.request.urlopen(f'http://127.0.0.1:8000/api/sample/{n}')
        data = json.loads(r.read())
        qr = urllib.request.urlopen(f"http://127.0.0.1:8000/api/dataset/{data['dataset_id']}/suggested-questions")
        qdata = json.loads(qr.read())
        print(f"=== {n.upper()} ===")
        print("Domain:", qdata['domain']['name'])
        print("Primary Metric:", qdata['domain']['primary_metric'], "| Primary Dim:", qdata['domain']['primary_dimension'])
        print("Top Question:", qdata['questions'][0]['question'])
        print("Hypothesis:", qdata['questions'][0]['hypothesis'])
        print("Pillars:", [c['label'] for c in qdata['categories']])
        print("Total Questions:", len(qdata['questions']))
        print()
    except Exception as e:
        print(f"Error on {n}:", e)
