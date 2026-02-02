import os
import datetime
import jwt
from functools import wraps
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import Schema, fields, validate, ValidationError
from bson.objectid import ObjectId

app = Flask(__name__)
# Configurations
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'default_super_secret_key')

# MongoDB Connection Options (Local by default, override with ENV for Atlas)
# Local: mongodb://localhost:27017/interviewbot_db
# Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/interviewbot_db?retryWrites=true&w=majority
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/interviewbot_db')
app.config["MONGO_URI"] = MONGO_URI

# Initialize Extensions
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
CORS(app)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# --- Index Setup ---
# Create unique index on gmail
with app.app_context():
    try:
        mongo.db.users.create_index("gmail", unique=True)
        print("MongoDB unique index on 'gmail' created.")
    except Exception as e:
        print(f"Index creation skipped or failed: {e}")

# --- Schemas & Validation ---
class SignupSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=2))
    gmail = fields.Email(required=True)
    password = fields.Str(required=True, validate=[
        validate.Length(min=8),
        lambda p: any(c.isupper() for c in p), 
        lambda p: any(c.islower() for c in p), 
        lambda p: any(c.isdigit() for c in p), 
        lambda p: any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in p)
    ])
    role = fields.Str(required=True, validate=validate.OneOf(["candidate", "interviewer", "admin"]))

class LoginSchema(Schema):
    gmail = fields.Email(required=True)
    password = fields.Str(required=True)

signup_schema = SignupSchema()
login_schema = LoginSchema()

# --- Decorators ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({"_id": ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# --- Security Headers ---
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# --- Routes ---

@app.route('/api/signup', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    try:
        data = signup_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    # Check for duplicate gmail manually (though index handles it, manual check allows clear error msg)
    if mongo.db.users.find_one({"gmail": data['gmail']}):
        return jsonify({'message': 'Email already registered. Please sign in.'}), 409

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    timestamp = datetime.datetime.utcnow()
    new_user = {
        "name": data['name'],
        "gmail": data['gmail'],
        "password": hashed_password,
        "role": data['role'],
        "created_at": timestamp,
        "updated_at": timestamp,
        "is_active": True,
        "interview_count": 0,
        "last_login": None
    }
    
    try:
        mongo.db.users.insert_one(new_user)
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500

@app.route('/api/signin', methods=['POST'])
@limiter.limit("10 per minute")
def signin():
    try:
        data = login_schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400

    user = mongo.db.users.find_one({"gmail": data['gmail']})

    if user and bcrypt.check_password_hash(user['password'], data['password']):
        # Update last_login
        mongo.db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.datetime.utcnow(), "updated_at": datetime.datetime.utcnow()}}
        )

        token = jwt.encode({
            'user_id': str(user['_id']),
            'email': user['gmail'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({
            'token': token, 
            'role': user['role'], 
            'gmail': user['gmail'],
            'name': user['name']
        }), 200

    return jsonify({'message': 'Invalid gmail or password'}), 401

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'user_id': str(current_user['_id']),
        'name': current_user['name'],
        'gmail': current_user['gmail'],
        'role': current_user['role'],
        'interview_count': current_user['interview_count'],
        'created_at': current_user['created_at'].isoformat()
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
