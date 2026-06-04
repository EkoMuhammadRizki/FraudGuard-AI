import os
import csv
import json
import random

# File paths
BASE_DIR = r"D:\Fraud Detection By Eza\fraudguard-ai"
DATA_DIR = os.path.join(BASE_DIR, "data", "data")
DATASETS_DIR = os.path.join(DATA_DIR, "datasets")
OUTPUTS_DIR = os.path.join(DATA_DIR, "model_outputs_bias_aware")

ENRICHED_CSV = os.path.join(DATASETS_DIR, "fraudguard_enriched_dataset.csv")
PRED_CSV = os.path.join(OUTPUTS_DIR, "fraud_predictions_bias_aware.csv")
TYPE_CSV = os.path.join(OUTPUTS_DIR, "fraud_type_predictions_bias_aware.csv")
ANOM_CSV = os.path.join(OUTPUTS_DIR, "anomaly_scores_bias_aware.csv")
XAI_CSV = os.path.join(OUTPUTS_DIR, "xai_explanations_bias_aware.csv")
GRAPH_CSV = os.path.join(OUTPUTS_DIR, "graph_node_predictions_bias_aware.csv")
GEO_CSV = os.path.join(OUTPUTS_DIR, "geo_risk_scores_bias_aware.csv")
METRICS_JSON = os.path.join(OUTPUTS_DIR, "model_metrics_bias_aware.json")

TARGET_TS = os.path.join(BASE_DIR, "src", "pustaka", "data-fraudguard.ts")

def load_csv(path):
    if not os.path.exists(path):
        print(f"Warning: File not found {path}")
        return []
    with open(path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def load_json(path):
    if not os.path.exists(path):
        print(f"Warning: File not found {path}")
        return {}
    with open(path, mode='r', encoding='utf-8') as f:
        return json.load(f)

def run():
    print("Loading datasets...")
    tx_list = load_csv(ENRICHED_CSV)
    pred_list = load_csv(PRED_CSV)
    type_list = load_csv(TYPE_CSV)
    anom_list = load_csv(ANOM_CSV)
    xai_list = load_csv(XAI_CSV)
    graph_list = load_csv(GRAPH_CSV)
    geo_list = load_csv(GEO_CSV)
    metrics = load_json(METRICS_JSON)

    print(f"Loaded {len(tx_list)} raw transactions.")

    # Index other files by TransactionID
    pred_by_id = {row['TransactionID']: row for row in pred_list}
    type_by_id = {row['TransactionID']: row for row in type_list}
    anom_by_id = {row['TransactionID']: row for row in anom_list}
    xai_by_id = {row['TransactionID']: row for row in xai_list}

    # Index GNN node predictions by NodeID
    graph_node_risks = {}
    for row in graph_list:
        node_id = row['NodeID']
        # Strip prefixes like ACC:, DEV:, IP:, REC: if they exist to match raw values
        raw_id = node_id.split(":", 1)[1] if ":" in node_id else node_id
        graph_node_risks[raw_id] = {
            'risk': round(float(row['GraphFraudProbability']) * 100),
            'prediction': int(row['GraphFraudPrediction']),
            'type': row['NodeType']
        }

    # Helper to map risk levels
    def get_risk_level(score):
        if score >= 90: return "kritis"
        if score >= 70: return "tinggi"
        if score >= 38: return "sedang"
        return "rendah"

    # Helper to map analyst actions
    def get_status_action(status, risk_level):
        if status in ["Auto-Approved", "Cleared", "Approved"]:
            return "Lolos"
        elif status == "Closed-Confirmed Fraud":
            return "Tahan"
        elif status == "Investigating":
            return "Investigasi"
        elif status == "Review":
            return "Review"
        
        # Fallback based on risk level
        mapping = {
            "kritis": "Eskalasi",
            "tinggi": "Investigasi",
            "sedang": "Review",
            "rendah": "Lolos"
        }
        return mapping.get(risk_level, "Lolos")

    # Map raw location name to BPS_RegionCode
    bps_to_location = {row['BPS_RegionCode']: row for row in geo_list}

    # Pre-build lookup for shared device/IP accounts to generate realistic GNN fraud rings
    device_to_accounts = {}
    ip_to_accounts = {}
    for tx in tx_list:
        dev = tx.get('DeviceID')
        ip = tx.get('IP Address')
        acc = tx.get('AccountID')
        if dev and acc:
            device_to_accounts.setdefault(dev, set()).add(acc)
        if ip and acc:
            ip_to_accounts.setdefault(ip, set()).add(acc)

    # 1. Build joined view & transactionFeed
    transaction_feed = []
    investigation_details = {}

    for tx in tx_list:
        tx_id = tx['TransactionID']
        
        # Merge model predictions
        pred = pred_by_id.get(tx_id, {})
        ftype = type_by_id.get(tx_id, {})
        anom = anom_by_id.get(tx_id, {})
        xai = xai_by_id.get(tx_id, {})

        # Compute risk score (XGBoost probability takes priority, then XAI probability seed, then fallback)
        prob = None
        if 'xgboost_probability' in pred:
            prob = float(pred['xgboost_probability'])
        elif 'FraudScore_Probability_Seed' in xai:
            prob = float(xai['FraudScore_Probability_Seed'])
        else:
            prob = 1.0 if tx['IsFraud'] == '1' else 0.05
        
        risk_score = round(prob * 100)
        risk_lvl = get_risk_level(risk_score)
        
        # Scale amount to realistic IDR
        raw_amount = float(tx['TransactionAmount'])
        scaled_amount = round(raw_amount * 100000)

        # Get status and action
        analyst_status = tx.get('AnalystStatus', '')
        status = get_status_action(analyst_status, risk_lvl)

        # Get fraud type
        fraud_class = ftype.get('PredictedFraudClass')
        if not fraud_class or fraud_class == 'Legitimate':
            fraud_class = tx.get('FraudType', 'None')
        if fraud_class == 'None':
            fraud_class = 'Legitimate'

        # Get anomaly score
        anomaly_prob = None
        if 'AnomalyScore' in anom:
            anomaly_prob = float(anom['AnomalyScore'])
        else:
            anomaly_prob = 0.85 if tx['IsFraud'] == '1' and risk_score > 70 else (risk_score * 0.007 + 0.1)
        anomaly_score = round(anomaly_prob * 100)

        # Compile evidence from XAI reasons
        reasons = []
        if xai.get('TopReason1_ID') and xai['TopReason1_ID'] != 'Tidak ada faktor tambahan':
            reasons.append(xai['TopReason1_ID'])
        if xai.get('TopReason2_ID') and xai['TopReason2_ID'] != 'Tidak ada faktor tambahan':
            reasons.append(xai['TopReason2_ID'])
        if xai.get('TopReason3_ID') and xai['TopReason3_ID'] != 'Tidak ada faktor tambahan':
            reasons.append(xai['TopReason3_ID'])
        
        if reasons:
            evidence = f"Model mendeteksi anomali pada: {', '.join(reasons)}"
        else:
            evidence = "Pola transaksi terverifikasi normal oleh model."

        feed_item = {
            "id": tx_id,
            "waktu": tx['TransactionDate'],
            "pengirim": tx['AccountID'],
            "penerima": tx['RecipientAccountID'],
            "jumlah": scaled_amount,
            "risiko": risk_lvl,
            "riskScore": risk_score,
            "status": status,
            "fraudType": fraud_class,
            "evidence": evidence
        }
        transaction_feed.append(feed_item)

        # 2. Build XAI features list
        xai_features = []
        for i in [1, 2, 3]:
            feat = xai.get(f'TopFeature{i}')
            val = xai.get(f'TopFeature{i}Value')
            contr = xai.get(f'TopFeature{i}Contribution_Seed')
            reason = xai.get(f'TopReason{i}_ID')
            
            if feat and reason and reason != 'Tidak ada faktor tambahan':
                contrib_val = float(contr) if contr else 0.0
                impact = "tinggi" if contrib_val >= 0.15 else "sedang" if contrib_val >= 0.08 else "rendah"
                xai_features.append({
                    "name": reason,
                    "importance": contrib_val,
                    "impact": impact
                })

        # 3. Build Dynamic GNN Graph nodes and edges for this transaction
        acc_id = tx['AccountID']
        rec_id = tx['RecipientAccountID']
        dev_id = tx['DeviceID']
        ip_addr = tx['IP Address']
        merch_id = tx['MerchantID']
        bps_code = tx['BPS_RegionCode']

        # Get risk values from graph predictions
        acc_risk = graph_node_risks.get(acc_id, {'risk': risk_score, 'type': 'Account'})['risk']
        rec_risk = graph_node_risks.get(rec_id, {'risk': round(risk_score * 0.8), 'type': 'RecipientAccount'})['risk']
        dev_risk = graph_node_risks.get(dev_id, {'risk': round(risk_score * 0.7), 'type': 'Device'})['risk']
        ip_risk = graph_node_risks.get(ip_addr, {'risk': round(risk_score * 0.75), 'type': 'IP'})['risk']
        
        geo_name = bps_to_location.get(bps_code, {}).get('Location', 'Unknown Location')
        geo_risk = round(float(bps_to_location.get(bps_code, {}).get('ThreatIntensityScore', 0.1)) * 100)

        # Add merchant details
        merch_risk = round(risk_score * 0.4)

        # Radial Layout coordinates
        # Center: Account (300, 250)
        # BPS Region: Top (300, 90)
        # Recipient: Top-Left (120, 150)
        # Device: Bottom-Left (120, 350)
        # IP Address: Top-Right (480, 150)
        # Merchant: Bottom-Right (480, 350)
        gnn_nodes = [
            {"id": "A", "label": acc_id, "x": 300, "y": 250, "type": "suspect" if acc_risk >= 38 else "normal", "risk": acc_risk},
            {"id": "B", "label": rec_id, "x": 120, "y": 150, "type": "recipient" if rec_risk < 38 else "suspect", "risk": rec_risk},
            {"id": "C", "label": dev_id, "x": 120, "y": 350, "type": "device", "risk": dev_risk},
            {"id": "D", "label": ip_addr, "x": 480, "y": 150, "type": "ip", "risk": ip_risk},
            {"id": "E", "label": merch_id, "x": 480, "y": 350, "type": "merchant", "risk": merch_risk},
            {"id": "F", "label": geo_name, "x": 300, "y": 90, "type": "geo", "risk": geo_risk}
        ]

        gnn_edges = [
            {"from": "A", "to": "B", "weight": round(prob * 8) + 2, "suspicious": risk_score >= 38},
            {"from": "A", "to": "C", "weight": 5, "suspicious": dev_risk >= 38},
            {"from": "A", "to": "D", "weight": 6, "suspicious": ip_risk >= 38},
            {"from": "A", "to": "E", "weight": 4, "suspicious": merch_risk >= 70},
            {"from": "A", "to": "F", "weight": 3, "suspicious": geo_risk >= 70}
        ]

        # Add shared device/IP accounts if any to build fraud-ring topologi
        node_letter_idx = 7
        letters = "GHIJKLM"
        
        shared_accounts_dev = list(device_to_accounts.get(dev_id, set()) - {acc_id})[:1]
        shared_accounts_ip = list(ip_to_accounts.get(ip_addr, set()) - {acc_id})[:1]

        # Add shared device accounts
        for o_acc in shared_accounts_dev:
            o_risk = graph_node_risks.get(o_acc, {'risk': 50, 'type': 'Account'})['risk']
            letter = letters[node_letter_idx - 7]
            node_letter_idx += 1
            # Place to the left of the Device node
            gnn_nodes.append({"id": letter, "label": o_acc, "x": 50, "y": 420, "type": "suspect" if o_risk >= 38 else "normal", "risk": o_risk})
            gnn_edges.append({"from": letter, "to": "C", "weight": 4, "suspicious": o_risk >= 38 or dev_risk >= 38})

        # Add shared IP accounts
        for o_acc in shared_accounts_ip:
            o_risk = graph_node_risks.get(o_acc, {'risk': 50, 'type': 'Account'})['risk']
            if node_letter_idx - 7 < len(letters):
                letter = letters[node_letter_idx - 7]
                node_letter_idx += 1
                # Place to the right of the IP node
                gnn_nodes.append({"id": letter, "label": o_acc, "x": 550, "y": 80, "type": "suspect" if o_risk >= 38 else "normal", "risk": o_risk})
                gnn_edges.append({"from": letter, "to": "D", "weight": 4, "suspicious": o_risk >= 38 or ip_risk >= 38})

        investigation_details[tx_id] = {
            "detail": {
                "id": tx_id,
                "pengirim": acc_id,
                "penerima": rec_id,
                "jumlah": scaled_amount,
                "waktu": tx['TransactionDate'],
                "metode": tx['TransactionType'],
                "lokasi": geo_name,
                "bpsCode": bps_code,
                "ip": ip_addr,
                "device": dev_id,
                "merchant": merch_id,
                "riskScore": risk_score,
                "threshold": 38,
                "modelVerdict": "Fraud Alert" if risk_score >= 38 else "Cleared",
                "fraudType": fraud_class,
                "anomalyScore": anomaly_score,
                "analystAction": status
            },
            "xaiFeatures": xai_features,
            "gnnNodes": gnn_nodes,
            "gnnEdges": gnn_edges
        }

    # Sort feeds by riskScore descending
    transaction_feed.sort(key=lambda x: x['riskScore'], reverse=True)

    # 4. Build dashboardSummary
    total_tx = len(tx_list)
    fraud_labels = sum(1 for tx in tx_list if tx['IsFraud'] == '1')
    
    # Threshold for alerts
    selected_threshold = metrics.get("binary_models", {}).get("xgboost", {}).get("selected_threshold", 0.38)
    fraud_alerts = sum(1 for tx in transaction_feed if tx['riskScore'] >= (selected_threshold * 100))

    false_positive_rate = metrics.get("binary_models", {}).get("xgboost", {}).get("test", {}).get("false_positive_rate", 0.0054)
    f1_score = metrics.get("binary_models", {}).get("xgboost", {}).get("test", {}).get("f1_score", 0.8148)
    pr_auc = metrics.get("binary_models", {}).get("xgboost", {}).get("test", {}).get("pr_auc", 0.9604)

    dashboard_summary = {
        "totalTransactions": total_tx,
        "fraudLabels": fraud_labels,
        "fraudAlerts": fraud_alerts,
        "falsePositiveRate": false_positive_rate,
        "f1Score": f1_score,
        "prAuc": pr_auc,
        "selectedThreshold": selected_threshold,
        "framing": "MVP"
    }

    # 5. Build geoRiskRegions
    geo_risk_regions = []
    for row in geo_list:
        geo_risk_regions.append({
            "name": row['Location'],
            "province": row['Province'],
            "latitude": float(row['Latitude']),
            "longitude": float(row['Longitude']),
            "threatIntensityScore": float(row['ThreatIntensityScore']),
            "transactionCount": int(row['TransactionCount']),
            "fraudCount": int(row['FraudCount']),
            "level": "kritis" if float(row['ThreatIntensityScore']) >= 0.13 else "tinggi" if float(row['ThreatIntensityScore']) >= 0.10 else "sedang" if float(row['ThreatIntensityScore']) >= 0.08 else "rendah"
        })

    # Write output TS file
    print(f"Writing to {TARGET_TS}...")
    with open(TARGET_TS, 'w', encoding='utf-8') as f:
        f.write("// generated file: do not edit manually\n\n")
        
        # Write Types
        f.write("""export type DashboardSummary = {
  totalTransactions: number;
  fraudLabels: number;
  fraudAlerts: number;
  falsePositiveRate: number;
  f1Score: number;
  prAuc: number;
  selectedThreshold: number;
  framing: "MVP" | "Pilot" | "Production";
};

export type TransactionFeedItem = {
  id: string;
  waktu: string;
  pengirim: string;
  penerima: string;
  jumlah: number;
  risiko: "rendah" | "sedang" | "tinggi" | "kritis";
  riskScore: number;
  status: "Lolos" | "Review" | "Investigasi" | "Tahan" | "Eskalasi";
  fraudType: string;
  evidence: string;
};

export type XaiFeature = {
  name: string;
  importance: number;
  impact: "rendah" | "sedang" | "tinggi";
};

export type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "suspect" | "recipient" | "device" | "ip" | "merchant" | "geo" | "normal";
  risk: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight: number;
  suspicious: boolean;
};

export type InvestigationDetail = {
  id: string;
  pengirim: string;
  penerima: string;
  jumlah: number;
  waktu: string;
  metode: string;
  lokasi: string;
  bpsCode: string;
  ip: string;
  device: string;
  merchant: string;
  riskScore: number;
  threshold: number;
  modelVerdict: string;
  fraudType: string;
  anomalyScore: number;
  analystAction: string;
};

export type InvestigationRecord = {
  detail: InvestigationDetail;
  xaiFeatures: XaiFeature[];
  gnnNodes: GraphNode[];
  gnnEdges: GraphEdge[];
};

export type GeoRiskRegion = {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  threatIntensityScore: number;
  transactionCount: number;
  fraudCount: number;
  level: "rendah" | "sedang" | "tinggi" | "kritis";
};

""")

        # Write Data
        f.write(f"export const dashboardSummary: DashboardSummary = {json.dumps(dashboard_summary, indent=2)};\n\n")
        f.write(f"export const transactionFeed: TransactionFeedItem[] = {json.dumps(transaction_feed, indent=2)} as any;\n\n")
        f.write(f"export const investigationDetails: Record<string, InvestigationRecord> = {json.dumps(investigation_details, indent=2)} as any;\n\n")
        f.write(f"export const geoRiskRegions: GeoRiskRegion[] = {json.dumps(geo_risk_regions, indent=2)} as any;\n\n")
        
        # Write metadata metrics helper
        f.write(f"export const rawModelMetrics: any = {json.dumps(metrics, indent=2)};\n")

    print("Success generating TS data file.")

if __name__ == "__main__":
    run()
