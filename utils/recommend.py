import pandas as pd 
import joblib

model = joblib.load('model/workout_model.pkl')

le_goal = joblib.load('model/le_goal.pkl')
le_level = joblib.load('model/le_level.pkl')
le_exercise = joblib.load('model/le_exercise.pkl')

def predict_workout(age,weight,height,goal,level,duration):

    bmi = weight / ((height / 100) ** 2)

    goal_encoded = le_goal.transform([goal])[0]
    level_encoded = le_level.transform([level])[0]

    input_data = pd.DataFrame([{
        'age':age,
        'weight':weight,
        'height':height,
        'bmi':bmi,
        'goal':goal_encoded,
        'level':level_encoded,
        'duration':duration
    }])

    probabilities = model.predict_proba(input_data)[0]
    top_4_idx = probabilities.argsort()[-4:][::-1]
    top_4_exercises = le_exercise.inverse_transform(top_4_idx)

    return top_4_exercises

predict_workout(
    age=22,
    weight=70,
    height=175,
    goal='muscle_gain',
    level='beginner',
    duration=45
) 