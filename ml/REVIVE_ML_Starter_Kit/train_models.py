import argparse, os
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, average_precision_score, brier_score_loss
import joblib

def prep(cat, num):
    return ColumnTransformer([
      ("cat",Pipeline([("impute",SimpleImputer(strategy="most_frequent")),
                       ("encode",OneHotEncoder(handle_unknown="ignore"))]),cat),
      ("num",Pipeline([("impute",SimpleImputer(strategy="median")),
                       ("scale",StandardScaler())]),num)
    ])

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--data",default="revive_synthetic_payment_recovery_25000.csv")
    args=ap.parse_args()
    df=pd.read_csv(args.data)
    df["event_timestamp"]=pd.to_datetime(df["event_timestamp"])
    df=df.sort_values("event_timestamp").reset_index(drop=True)
    cut=int(len(df)*.8)
    tr,te=df.iloc[:cut],df.iloc[cut:]
    cat=["issuing_bank","payment_method","customer_tier","merchant_category"]
    num=["transaction_amount_inr","time_of_day_hour","day_of_week","customer_tenure_days",
         "previous_failure_count","previous_success_count","retry_count",
         "gateway_response_time_ms","days_since_last_success"]
    os.makedirs("models",exist_ok=True)

    failure=Pipeline([("prep",prep(cat,num)),
      ("model",RandomForestClassifier(n_estimators=200,min_samples_leaf=3,
       class_weight="balanced_subsample",random_state=42,n_jobs=-1))])
    failure.fit(tr[cat+num],tr["error_code"])
    print("\\nFAILURE CLASSIFICATION")
    print(classification_report(te["error_code"],failure.predict(te[cat+num]),zero_division=0))
    joblib.dump(failure,"models/failure_classifier.joblib")

    rcat=cat+["recovery_action","recovery_channel","error_code"]
    recovery=Pipeline([("prep",prep(rcat,num)),
      ("model",RandomForestClassifier(n_estimators=250,min_samples_leaf=5,
       class_weight="balanced",random_state=43,n_jobs=-1))])
    recovery.fit(tr[rcat+num],tr["recovery_success"])
    p=recovery.predict_proba(te[rcat+num])[:,1]
    print("\\nRECOVERY SUCCESS")
    print(classification_report(te["recovery_success"],(p>=.5).astype(int),zero_division=0))
    print("ROC-AUC:",round(roc_auc_score(te["recovery_success"],p),4))
    print("PR-AUC:",round(average_precision_score(te["recovery_success"],p),4))
    print("Brier:",round(brier_score_loss(te["recovery_success"],p),4))
    joblib.dump(recovery,"models/recovery_success_model.joblib")

    # Score each eligible candidate action for sample test events.
    candidate=["Instant_Retry","Delayed_12h_Retry","UPI_Switch",
               "Alternative_Method","Customer_Notification","Manual_Review"]
    recs=[]
    for _,row in te.head(500).iterrows():
        scored=[]
        for a in candidate:
            x=row.copy(); x["recovery_action"]=a; x["recovery_channel"]="None"
            xx=pd.DataFrame([{c:x[c] for c in rcat+num}])
            scored.append((a,float(recovery.predict_proba(xx)[0,1])))
        best=max(scored,key=lambda z:z[1])
        recs.append({"event_id":row.event_id,"recommended_action":best[0],
                     "predicted_recovery_probability":round(best[1],4)})
    pd.DataFrame(recs).to_csv("models/sample_recommendations.csv",index=False)
    print("\\nSaved models/ and sample_recommendations.csv")
    print("Synthetic-data results are NOT real-world performance evidence.")

if __name__=="__main__": main()
