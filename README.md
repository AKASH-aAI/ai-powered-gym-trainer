# AI Gym Workout Recommender 💪🤖

> ## Important Note
>
> This is an AI-powered project.
>
> Around 80% of the repetitive/frontend/boilerplate code was built with the help of AI tools, while the Machine Learning workflow, project idea, debugging, integration, feature planning, testing, and system logic were handled by me.
>
> The real question for companies today is:
>
> **Do they only want developers who manually type 1000+ lines of code, or do they want problem solvers who can use AI effectively to build real-world products faster?**
>
> This project represents my approach to modern development:
> using AI as a productivity tool while focusing on architecture, debugging, integration, UX, and solving real problems.

---

# 🚀 Project Overview

AI Gym Workout Recommender is a Machine Learning-powered fitness web application that generates personalized workout recommendations based on a user's:

* Age
* Weight
* Height
* Fitness Goal
* Fitness Level

The system predicts suitable workouts using a trained Random Forest Machine Learning model and displays them in a modern interactive web interface.

Users can:

* Generate AI-based workout plans
* View workout images
* Use built-in workout timers
* Pause/resume timers
* Get a clean gym-style UI experience

---

# 🌐 Live Demo

Deployed on Render:

```bash
https://ai-powered-gym-trainer-2.onrender.com
```

---

# 🧠 Machine Learning Workflow

## Dataset

The dataset used in this project was AI-generated and customized specifically for this fitness recommendation system.

The dataset includes:

* age
* weight
* height
* BMI
* goal
* level
* exercise

Goals include:

* fat_loss
* muscle_gain
* upper_body
* lower_body
* full_body
* core

Levels include:

* beginner
* intermediate
* advanced

---

# ⚙️ ML Model Used

## Random Forest Classifier

The model predicts workout recommendations based on user inputs.

### Why Random Forest?

* Works well on small datasets
* Good classification performance
* Handles mixed features efficiently
* Beginner-friendly
* Fast predictions

---

# 📊 ML Pipeline

### Steps:

1. Dataset generation
2. Data preprocessing
3. Label encoding
4. BMI calculation
5. Model training
6. Prediction generation
7. Model saving using Joblib
8. Flask integration

---

# 🛠️ Tech Stack

## Machine Learning

* Python
* Scikit-learn
* Pandas
* NumPy
* Joblib

## Backend

* Flask

## Frontend

* HTML
* CSS
* JavaScript

## Deployment

* Render

---

# ✨ Features

## AI Workout Recommendation

Generates personalized workout plans using Machine Learning.

---

## Modern UI

* Responsive design
* Fitness-inspired interface
* Clean light theme
* Glassmorphism cards

---

## Workout Images

Each workout card displays a matching exercise image.

---

## Smart Timer System

* 60-second countdown timer
* Pause/Resume functionality
* Only one active timer at a time
* Workout completion state
* Sound effects

---

## Sound Effects

Implemented using JavaScript AudioContext API.

* Tick sound during countdown
* Completion sound after workout

No external sound files required.

---

# 📁 Project Structure

```bash
project-gym-ml-app/
│
├── app.py
│
├── model/
│   ├── workout_model.pkl
│   ├── le_goal.pkl
│   ├── le_level.pkl
│   └── le_exercise.pkl
│
├── data/
│   └── workout_data.csv
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── script.js
│   │
│   └── images/
│
├── templates/
│   └── index.html
│
├── utils/
│   └── recommend.py
│
├── requirements.txt
│
└── README.md
```

---

# 🔥 Challenges Faced

This project involved much more than just writing code.

Major challenges included:

* Connecting ML model with Flask backend
* Debugging frontend-backend communication
* Timer logic issues
* Handling single active timer system
* Dynamic image rendering
* Audio integration in JavaScript
* Deployment issues on Render
* Fixing API and JSON serialization errors
* Managing UI responsiveness
* Error handling and validation

---

# 💡 What I Learned

This project taught me:

* Real-world ML integration
* Flask backend development
* Frontend + backend communication
* API handling
* Deployment workflow
* Debugging large systems
* Using AI tools productively
* Building complete end-to-end applications

Most importantly:

> Building projects is not just about typing code.
>
> It is about solving problems, debugging systems, making features work together, and delivering a functional product.

---

# ⚡ Future Improvements

Planned features:

* User authentication
* Workout history tracking
* MongoDB integration
* Calories tracking
* AI fitness chatbot
* Voice assistant timer
* Exercise video support
* Progress analytics dashboard

---

# 🌍 Live Project

The project is deployed live on Render:

```bash
https://ai-powered-gym-trainer-2.onrender.com
```

You can directly try the AI-powered workout recommendation system online.

---

# 📌 Final Note

This project is a reflection of modern AI-assisted development.

I believe the future belongs to developers who:

* understand systems
* solve real problems
* think critically
* use AI effectively
* ship products faster

instead of only manually typing large amounts of repetitive code.

---

# 👨‍💻 Developer

Built by Akash 🚀
