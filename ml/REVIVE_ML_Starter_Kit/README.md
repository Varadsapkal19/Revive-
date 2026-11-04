# REVIVE Synthetic Payment Recovery Starter Kit

## Files
- `revive_synthetic_payment_recovery_25000.csv`: 25,000 simulated events.
- `train_models.py`: trains a failure classifier and recovery-success model, then scores candidate actions.
- `requirements.txt`: dependencies.

## Important
Every row is synthetic (`data_source=synthetic_simulation`, `is_synthetic=True`).
Outcomes are produced from illustrative simulation assumptions, NOT actual bank, Razorpay, merchant,
WhatsApp, or email results. Do not claim real-world accuracy or recovery uplift from these records.

`simulated_recovery_probability` is included for audit/analysis only and must not be used as a model feature.

## Run (Python 3.11 recommended)
Windows PowerShell:
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python train_models.py
```
Keep the CSV and script in the same folder, or pass `--data path/to/file.csv`.

## Model caveats
The recommender is a prototype that scores candidate actions using a model trained on simulated outcomes.
It is not a causal estimate of which action truly works best. For production, collect authorized merchant
outcomes, establish eligibility rules, use merchant/time holdouts, and validate prospectively.
ML recommendations must never bypass REVIVE's deterministic financial guardrails and approvals.
