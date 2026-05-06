from flask import Flask, render_template, request, jsonify
from utils.recommend import predict_workout
import logging
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Optional: Add configuration for better error handling
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

def validate_input_data(data):
    """Validate the input data from the request"""
    required_fields = ['age', 'weight', 'height', 'goal', 'level', 'duration']
    
    # Check if all required fields are present
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate numeric fields
    try:
        age = float(data['age'])
        weight = float(data['weight'])
        height = float(data['height'])
        duration = float(data['duration'])
        
        if age <= 0 or age > 120:
            return False, "Age must be between 1 and 120"
        if weight <= 0 or weight > 500:
            return False, "Weight must be between 1 and 500 kg"
        if height <= 0 or height > 300:
            return False, "Height must be between 1 and 300 cm"
        if duration <= 0 or duration > 240:
            return False, "Duration must be between 1 and 240 minutes"
            
    except ValueError:
        return False, "Age, weight, height, and duration must be valid numbers"
    
    # Validate categorical fields with CORRECT goals
    valid_goals = ['fat_loss', 'muscle_gain', 'upper_body', 'lower_body', 'full_body', 'core']
    valid_levels = ['beginner', 'intermediate', 'advanced']
    
    if data['goal'].lower() not in valid_goals:
        return False, f"Goal must be one of: {', '.join(valid_goals)}"
    
    if data['level'].lower() not in valid_levels:
        return False, f"Level must be one of: {', '.join(valid_levels)}"
    
    return True, "Valid data"

@app.route('/')
def home():
    """Homepage route that renders the main template"""
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering homepage: {str(e)}")
        return jsonify({'error': 'Unable to load homepage'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction API endpoint that returns workout recommendations
    
    Expected JSON payload:
    {
        "age": 25,
        "weight": 70,
        "height": 175,
        "goal": "muscle_gain",
        "level": "intermediate",
        "duration": 60
    }
    """
    try:
        # Check if request contains JSON data
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
        
        # Get JSON data from request
        data = request.get_json()
        
        # Validate input data
        is_valid, validation_message = validate_input_data(data)
        if not is_valid:
            return jsonify({'error': validation_message}), 400
        
        # Extract and convert parameters
        age = float(data['age'])
        weight = float(data['weight'])
        height = float(data['height'])
        goal = data['goal'].lower()
        level = data['level'].lower()
        duration = float(data['duration'])
        
        logger.info(f"Processing request - Age: {age}, Weight: {weight}, Height: {height}, "
                   f"Goal: {goal}, Level: {level}, Duration: {duration}")
        
        # Call the recommendation function
        recommendations = predict_workout(age, weight, height, goal, level, duration)
        
        # Validate recommendations
        if len(recommendations) == 0:
            logger.warning("No recommendations returned")
            return jsonify({
                'workouts': []
            }), 200
        
        # If recommendations is a string, convert to list
        if isinstance(recommendations, str):
            recommendations = [recommendations]
        
        # Ensure we only return top 4 workouts
        top_4_workouts = recommendations[:4].tolist()
        
        # Format the response
        response = {
            'workouts': top_4_workouts
        }
        
        logger.info(f"Successfully returned {len(response['workouts'])} recommendations")
        return jsonify(response), 200
        
    except KeyError as e:
        logger.error(f"Key error in request data: {str(e)}")
        return jsonify({'error': f'Missing required parameter: {str(e)}'}), 400
        
    except ValueError as e:
        logger.error(f"Value error in input data: {str(e)}")
        return jsonify({'error': f'Invalid value provided: {str(e)}'}), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in prediction endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error occurred. Please try again.'}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({'status': 'healthy', 'message': 'AI Gym Workout Recommender is running'}), 200

# Info endpoint with CORRECT goals
@app.route('/info', methods=['GET'])
def get_info():
    """Returns information about available goals and levels"""
    return jsonify({
        'available_goals': ['fat_loss', 'muscle_gain', 'upper_body', 'lower_body', 'full_body', 'core'],
        'available_levels': ['beginner', 'intermediate', 'advanced'],
        'api_version': '1.0.0'
    }), 200

# Error handlers for common HTTP errors
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({'error': 'Method not allowed for this endpoint'}), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Run the Flask application
    # Set debug=False in production
    app.run(host='0.0.0.0', port=5000, debug=True)