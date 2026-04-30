# ─────────────────────────────────────────────
# Weddify - Flask API
# Loads the trained stacking ensemble model
# and serves predictions via REST API
# ─────────────────────────────────────────────

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import warnings

warnings.filterwarnings('ignore')

# ─── Initialize Flask app ────────────────────
app = Flask(__name__)
CORS(app)

# ─── Load all saved models and encoders ──────
print('Loading models...')

model          = joblib.load('../models/stacking_ensemble.pkl')
encoders       = joblib.load('../models/encoders.pkl')
target_encoder = joblib.load('../models/target_encoder.pkl')
scaler         = joblib.load('../models/scaler.pkl')
cat_cols       = joblib.load('../models/cat_cols.pkl')
num_cols       = joblib.load('../models/num_cols.pkl')

print('All models loaded successfully!')

DATASET_PATH = '../data/weddify_dataset_v_final.csv'
try:
    vendors_df = pd.read_csv(DATASET_PATH)
    vendors_df = vendors_df.copy()
    vendors_df['vendor_id'] = vendors_df.index.map(lambda x: f'py_{x}')
    print(f'Vendor dataset loaded: {len(vendors_df)} rows')
except Exception as e:
    vendors_df = pd.DataFrame()
    print(f'Failed to load vendor dataset: {e}')

# ─── Column order must match training data ───
FEATURE_COLUMNS = [
    'Category',
    'Location',
    'Price Tier',
    'Price (LKR)',
    'Rating (out of 5)',
    'Experience (Years)',
    'Weddings Completed',
    'Response Time (Hours)',
    'Verified',
    'Number of Packages',
    'Social Media Followers',
    'Repeat Client Rate'
]


def to_vendor_payload(row):
    vendor_id = row.get('vendor_id')
    vendor_name = row.get('vendor_name')
    if pd.isna(vendor_name) or not str(vendor_name).strip():
        vendor_name = f"{row.get('Category', 'Vendor')} Vendor {str(vendor_id).replace('py_', '')}"

    return {
        '_id': vendor_id,
        'businessName': vendor_name,
        'vendor_name': vendor_name,
        'category': row.get('Category'),
        'location': row.get('Location'),
        'priceTier': row.get('Price Tier'),
        'price': float(row.get('Price (LKR)', 0) or 0),
        'rating': float(row.get('Rating (out of 5)', 0) or 0),
        'experience': int(row.get('Experience (Years)', 0) or 0),
        'weddingsCompleted': int(row.get('Weddings Completed', 0) or 0),
        'responseTime': float(row.get('Response Time (Hours)', 0) or 0),
        'verified': str(row.get('Verified', '')).strip().lower() == 'yes',
        'recommended': str(row.get('Recommended', '')).strip().lower() == 'yes',
        'numberOfPackages': int(row.get('Number of Packages', 0) or 0),
        'socialFollowers': int(row.get('Social Media Followers', 0) or 0),
        'repeatClientRate': float(row.get('Repeat Client Rate', 0) or 0),
        'description': f"{row.get('Category', 'Wedding Service')} services in {row.get('Location', 'Sri Lanka')}"
    }


def apply_vendor_filters(df, args):
    filtered = df.copy()

    category = args.get('category')
    location = args.get('location')
    price_tier = args.get('priceTier')
    min_price = args.get('minPrice')
    max_price = args.get('maxPrice')
    rating = args.get('rating')

    if category:
        filtered = filtered[filtered['Category'] == category]
    if location:
        filtered = filtered[filtered['Location'] == location]
    if price_tier:
        filtered = filtered[filtered['Price Tier'] == price_tier]
    if min_price:
        filtered = filtered[filtered['Price (LKR)'] >= float(min_price)]
    if max_price:
        filtered = filtered[filtered['Price (LKR)'] <= float(max_price)]
    if rating:
        filtered = filtered[filtered['Rating (out of 5)'] >= float(rating)]

    return filtered


# ─── Health check route ───────────────────────
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status' : 'running',
        'message': 'Weddify ML API is live',
        'version': '1.0.0'
    })


@app.route('/vendors', methods=['GET'])
def get_vendors():
    try:
        if vendors_df.empty:
            return jsonify({'vendors': [], 'total': 0})

        filtered = apply_vendor_filters(vendors_df, request.args)
        total = len(filtered)

        try:
            page = max(int(request.args.get('page', 1)), 1)
        except (TypeError, ValueError):
            page = 1

        try:
            limit = int(request.args.get('limit', 24))
        except (TypeError, ValueError):
            limit = 24

        limit = min(max(limit, 1), 100)
        start = (page - 1) * limit
        end = start + limit

        paged = filtered.iloc[start:end]
        vendors = [to_vendor_payload(row) for _, row in paged.iterrows()]
        return jsonify({'vendors': vendors, 'total': total, 'page': page, 'limit': limit})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/vendors/<vendor_id>', methods=['GET'])
def get_vendor_by_id(vendor_id):
    try:
        if vendors_df.empty:
            return jsonify({'error': 'Vendor dataset not loaded'}), 404

        match = vendors_df[vendors_df['vendor_id'] == vendor_id]
        if match.empty:
            return jsonify({'error': 'Vendor not found'}), 404

        vendor = to_vendor_payload(match.iloc[0].to_dict())
        vendor['packages'] = [
            {'name': 'Basic', 'price': max(10000, int(vendor['price'] * 0.8))},
            {'name': 'Standard', 'price': int(vendor['price'])},
            {'name': 'Premium', 'price': int(vendor['price'] * 1.3)}
        ]

        return jsonify({'vendor': vendor})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Predict route ────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from request
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        # Build input dataframe
        input_df = pd.DataFrame([{
            'Category'              : data.get('Category'),
            'Location'              : data.get('Location'),
            'Price Tier'            : data.get('Price Tier'),
            'Price (LKR)'           : float(data.get('Price (LKR)', 0)),
            'Rating (out of 5)'     : float(data.get('Rating (out of 5)', 0)),
            'Experience (Years)'    : int(data.get('Experience (Years)', 0)),
            'Weddings Completed'    : int(data.get('Weddings Completed', 0)),
            'Response Time (Hours)' : float(data.get('Response Time (Hours)', 0)),
            'Verified'              : data.get('Verified'),
            'Number of Packages'    : int(data.get('Number of Packages', 0)),
            'Social Media Followers': int(data.get('Social Media Followers', 0)),
            'Repeat Client Rate'    : float(data.get('Repeat Client Rate', 0))
        }])

        # Encode categorical columns
        for col in cat_cols:
            if col in input_df.columns:
                le = encoders[col]
                input_df[col] = le.transform(input_df[col])

        # Scale numerical columns
        input_df[num_cols] = scaler.transform(input_df[num_cols])

        # Reorder columns to match training
        input_df = input_df[FEATURE_COLUMNS]

        # Make prediction
        prediction      = model.predict(input_df)[0]
        prediction_prob = model.predict_proba(input_df)[0]

        # Decode prediction back to Yes/No
        prediction_label = target_encoder.inverse_transform([prediction])[0]

        # Return result
        return jsonify({
            'recommended'       : prediction_label,
            'confidence'        : round(float(max(prediction_prob)) * 100, 2),
            'probability_yes'   : round(float(prediction_prob[1]) * 100, 2),
            'probability_no'    : round(float(prediction_prob[0]) * 100, 2),
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Batch predict route ──────────────────────
@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    try:
        data = request.get_json()

        if not data or 'vendors' not in data:
            return jsonify({'error': 'No vendors list provided'}), 400

        vendors   = data['vendors']
        results   = []

        for vendor in vendors:
            input_df = pd.DataFrame([{
                'Category'              : vendor.get('Category'),
                'Location'              : vendor.get('Location'),
                'Price Tier'            : vendor.get('Price Tier'),
                'Price (LKR)'           : float(vendor.get('Price (LKR)', 0)),
                'Rating (out of 5)'     : float(vendor.get('Rating (out of 5)', 0)),
                'Experience (Years)'    : int(vendor.get('Experience (Years)', 0)),
                'Weddings Completed'    : int(vendor.get('Weddings Completed', 0)),
                'Response Time (Hours)' : float(vendor.get('Response Time (Hours)', 0)),
                'Verified'              : vendor.get('Verified'),
                'Number of Packages'    : int(vendor.get('Number of Packages', 0)),
                'Social Media Followers': int(vendor.get('Social Media Followers', 0)),
                'Repeat Client Rate'    : float(vendor.get('Repeat Client Rate', 0))
            }])

            # Encode
            for col in cat_cols:
                if col in input_df.columns:
                    le = encoders[col]
                    input_df[col] = le.transform(input_df[col])

            # Scale
            input_df[num_cols] = scaler.transform(input_df[num_cols])

            # Reorder
            input_df = input_df[FEATURE_COLUMNS]

            # Predict
            prediction      = model.predict(input_df)[0]
            prediction_prob = model.predict_proba(input_df)[0]
            prediction_label= target_encoder.inverse_transform([prediction])[0]

            results.append({
                '_vendor_id'     : vendor.get('_vendor_id', ''),
                'vendor_name'    : vendor.get('vendor_name', 'Unknown'),
                'recommended'    : prediction_label,
                'confidence'     : round(float(max(prediction_prob)) * 100, 2),
                'probability_yes': round(float(prediction_prob[1]) * 100, 2),
                'probability_no' : round(float(prediction_prob[0]) * 100, 2),
            })

        # Sort by probability_yes descending
        results = sorted(results, key=lambda x: x['probability_yes'], reverse=True)

        return jsonify({
            'total'  : len(results),
            'results': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Run the app ──────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, port=5000)
