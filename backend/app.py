from flask import Flask, request, jsonify
import os
import joblib
import pandas as pd
from flask_cors import CORS
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "cropx_secret_key")

# Create DB tables
Base.metadata.create_all(bind=engine)

# ------------------------------
# LOAD ML MODEL
# ------------------------------
model = joblib.load("crop_model.pkl")
model_columns = joblib.load("model_columns.pkl")


# ------------------------------
# ROUTES
# ------------------------------
@app.route('/')
def home():
    return "CropX Backend is running!"


# ------------------------------
# SIGNUP API
# ------------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    db: Session = next(get_db())

    # Check if already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return jsonify({"error": "User already exists"}), 400

    hashed_password = generate_password_hash(password)

    new_user = User(name=name, email=email, password=hashed_password)

    db.add(new_user)
    db.commit()

    return jsonify({"message": "Signup successful"}), 201


# ------------------------------
# LOGIN API
# ------------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    db: Session = next(get_db())

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid password"}), 400

    token = jwt.encode({
        "id": user.id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=5)
    }, app.config["SECRET_KEY"], algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200


# ------------------------------
# CROP PREDICTION API
# ------------------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        input_df = pd.DataFrame([data])

        # Missing columns fill
        for col in model_columns:
            if col not in input_df.columns:
                input_df[col] = 0

        input_df = input_df[model_columns]

        prediction = model.predict(input_df)[0]

        return jsonify({"crop": prediction})

    except Exception as e:
        return jsonify({"error": str(e)})



# -------------------------------------------------------
# 🌾 LIFESPAN API — GET ALL CROPS FROM lifespan TABLE
# -------------------------------------------------------
@app.route("/lifespan", methods=["GET"])
def get_lifespan():
    """
    Returns all crops and lifespan days from the lifespan table
    using SQLAlchemy Session.
    """
    try:
        db: Session = next(get_db())

        # Execute query to get all cropname and days
        result = db.execute("SELECT cropname, days FROM lifespan").fetchall()

        # Convert result into JSON-friendly list of dicts
        crops = [{"cropname": row[0], "days": int(row[1])} for row in result]

        return jsonify(crops), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# RUN APP
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
