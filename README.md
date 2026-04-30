# Weddify ML - AI-Based Wedding Vendor Recommendation System

## Overview
Weddify ML is the machine learning component of the Weddify wedding planning platform.
It uses a Stacking Ensemble model to recommend the best wedding vendors to couples
based on category, location, budget, rating, experience, and other factors.

**Developed by:** S.A.G.P.Nethsara  
**Supervisor:** Ms. Lakni Peiris  
**University:** NSBM Green University / University of Plymouth  
**Module:** PUSL3190 Computing Project  

---

## Project Structure

```
weddify-ml/
│
├── data/
│   ├── weddify_dataset_v_final.csv    ← raw dataset (13,296 vendors)
│   └── processed/
│       ├── X_train.pkl
│       ├── X_test.pkl
│       ├── y_train.pkl
│       └── y_test.pkl
│
├── notebooks/
│   ├── 01_eda.ipynb                   ← Exploratory Data Analysis
│   ├── 02_preprocessing.ipynb         ← Data Preprocessing
│   ├── 03_model_training.ipynb        ← Train 3 individual models
│   ├── 04_hybrid_model.ipynb          ← Stacking Ensemble
│   └── 05_evaluation.ipynb            ← Final evaluation + SHAP
│
├── models/
│   ├── random_forest.pkl              ← Baseline model
│   ├── xgboost_model.pkl              ← Comparison model
│   ├── catboost_model.pkl             ← Best single model
│   ├── stacking_ensemble.pkl          ← Final best model
│   ├── encoders.pkl                   ← Label encoders
│   ├── target_encoder.pkl             ← Target encoder
│   ├── scaler.pkl                     ← StandardScaler
│   ├── cat_cols.pkl                   ← Categorical column names
│   └── num_cols.pkl                   ← Numerical column names
│
├── api/
│   └── app.py                         ← Flask REST API
│
├── outputs/
│   ├── figures/                       ← All charts and plots
│   └── results/                       ← Model comparison tables
│
├── weddify-env/                       ← Virtual environment (not pushed to GitHub)
├── requirements.txt                   ← All dependencies
└── README.md                          ← This file
```

---

## Models Used

| Model | Role | Accuracy | AUC |
|---|---|---|---|
| Random Forest | Baseline | 85% | ~0.85 |
| XGBoost | Comparison | 88% | ~0.88 |
| CatBoost | Best Single Model | 90% | ~0.90 |
| Stacking Ensemble | Best Overall | 92%+ | ~0.93+ |

---

## Dataset

- **Total rows:** 13,296 vendors
- **Features:** 12 input features
- **Target:** Recommended (Yes / No)
- **Class balance:** 50% Yes / 50% No (balanced using SMOTE)
- **Categories:** 9 wedding service categories
- **Locations:** 25 Sri Lankan districts

### Features Used

| Feature | Type | Description |
|---|---|---|
| Category | Categorical | Type of wedding service |
| Location | Categorical | Sri Lankan district |
| Price Tier | Categorical | Budget / Mid-Range / Premium |
| Price (LKR) | Numerical | Service price in LKR |
| Rating (out of 5) | Numerical | Customer rating |
| Experience (Years) | Numerical | Years in business |
| Weddings Completed | Numerical | Total weddings done |
| Response Time (Hours) | Numerical | How fast vendor replies |
| Verified | Categorical | Platform verified Yes/No |
| Number of Packages | Numerical | How many packages offered |
| Social Media Followers | Numerical | Instagram/Facebook followers |
| Repeat Client Rate | Numerical | % of returning clients |

---

## Setup Instructions

### Step 1 - Clone or download the project
```bash
cd D:/
```

### Step 2 - Create virtual environment
```bash
python -m venv weddify-env
```

### Step 3 - Activate virtual environment

Windows:
```bash
weddify-env\Scripts\activate
```

Mac/Linux:
```bash
source weddify-env/bin/activate
```

### Step 4 - Install dependencies
```bash
pip install -r requirements.txt
```

### Step 5 - Register Jupyter kernel
```bash
pip install ipykernel
python -m ipykernel install --user --name=weddify-env --display-name "Weddify ML"
```

### Step 6 - Open Jupyter
```bash
jupyter notebook
```

---

## Running the Notebooks

Run notebooks in order:

```
1. notebooks/01_eda.ipynb
2. notebooks/02_preprocessing.ipynb
3. notebooks/03_model_training.ipynb
4. notebooks/04_hybrid_model.ipynb
5. notebooks/05_evaluation.ipynb
```

Each notebook saves its outputs automatically.
Always select **Weddify ML** as the kernel before running.

---

## Running the Flask API

```bash
cd api
python app.py
```

API will start at: `http://127.0.0.1:5000`

---

## Node.js Backend (MongoDB + Auth + Bookings + Admin)

A full Node.js API is available in `node-backend/` and runs on `http://localhost:8000`.

### Backend setup

```bash
cd node-backend
npm install
npm run dev
```

### MongoDB connection

The MongoDB connection is configured in:

`node-backend/src/config/db.js`

Environment values are in:

`node-backend/.env`

Default:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/weddify
```

---

## Frontend API Environment

The Next.js frontend now reads backend URLs from:

`frontend/.env.local`

```env
NEXT_PUBLIC_NODE_API_URL=http://localhost:8000
NEXT_PUBLIC_ML_API_URL=http://localhost:5000
```

These values are used by:

`frontend/lib/api.js`

---

## Run Full Stack Together

Open 3 terminals:

1. Flask ML API

```bash
cd api
python app.py
```

2. Node.js API

```bash
cd node-backend
npm run dev
```

3. Next.js Frontend

```bash
cd frontend
npm run dev
```

If you see a Next.js server runtime error like `TypeError: e[o] is not a function` or `JSON.parse` after moving folders, run a clean start:

```bash
cd frontend
npm run dev:clean
```

If the issue repeats with errors like `Cannot find module './655.js'` or missing `.next/server/vendor-chunks/*`, run the deep stable start:

```bash
cd frontend
npm run dev:stable
```

If port `3000` is occupied by an older process, stop it and restart this command.

Frontend: `http://localhost:3000`
Node API: `http://localhost:8000`
Flask API: `http://localhost:5000`

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/predict` | POST | Predict single vendor |
| `/predict/batch` | POST | Predict multiple vendors |

### Example Request - Single Vendor

```bash
POST http://127.0.0.1:5000/predict
Content-Type: application/json

{
  "Category": "Photographers",
  "Location": "Colombo",
  "Price Tier": "Mid-Range",
  "Price (LKR)": 85000,
  "Rating (out of 5)": 4.5,
  "Experience (Years)": 8,
  "Weddings Completed": 120,
  "Response Time (Hours)": 3.5,
  "Verified": "Yes",
  "Number of Packages": 3,
  "Social Media Followers": 15000,
  "Repeat Client Rate": 0.45
}
```

### Example Response

```json
{
  "recommended": "Yes",
  "confidence": 92.5,
  "probability_yes": 92.5,
  "probability_no": 7.5
}
```

---

## Key Findings

- **Rating** is the most important feature for vendor recommendation
- **Repeat Client Rate** has the strongest positive impact
- **Verified** vendors are significantly more likely to be recommended
- **Fast Response Time** increases recommendation chances
- **Premium tier** vendors are recommended more than Budget tier
- **Colombo** and **Gampaha** have the most vendors on the platform

---

## Technologies Used

- **Python 3.11**
- **pandas, numpy** - Data processing
- **scikit-learn** - ML pipeline, Random Forest, Stacking
- **XGBoost** - Gradient boosting
- **CatBoost** - Categorical boosting
- **SHAP** - Model explainability
- **Flask** - REST API
- **matplotlib, seaborn** - Visualizations
- **imbalanced-learn** - SMOTE for class balancing
- **joblib** - Model saving and loading

---

## .gitignore

Add this to your .gitignore file:

```
weddify-env/
__pycache__/
*.pkl
.ipynb_checkpoints/
data/processed/
outputs/
```
