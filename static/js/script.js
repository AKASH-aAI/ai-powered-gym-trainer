// static/js/script.js

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('workout-form');
    const generateBtn = document.getElementById('generate-btn');
    const workoutContainer = document.getElementById('workout-container');
    
    // Image mapping for workouts
    const imageMapping = {
        'push_up': 'pushup.jpg',
        'squat': 'squat.jpg',
        'deadlift': 'deadlift.jpg',
        'burpees': 'burpees.jpg',
        'plank': 'plank.jpg',
        'lunges': 'lunges.jpg',
        'jumping_jacks': 'jumping_jacks.jpg',
        'mountain_climbers': 'mountain_climbers.jpg',
        'bench_press': 'bench_press.jpg',
        'shoulder_press': 'shoulder_press.jpg',
        'pull_up': 'pull_up.jpg',
        'dumbbell_curl': 'dumbbell_curl.jpg',
        'triceps_dip': 'triceps_dip.jpg',
        'leg_raise': 'leg_raise.jpg',
        'crunches': 'crunches.jpg',
        'russian_twist': 'russian_twist.jpg',
        'bicycle_crunch': 'bicycle_crunch.jpg',
        'high_knees': 'high_knees.jpg',
        'box_jump': 'box_jump.jpg',
        'kettlebell_swing': 'kettlebell_swing.jpg',
        'goblet_squat': 'goblet_squat.jpg',
        'romanian_deadlift': 'romanian_deadlift.jpg',
        'hip_thrust': 'hip_thrust.jpg',
        'glute_bridge': 'glute_bridge.jpg',
        'calf_raise': 'calf_raise.jpg'
    };
    
    // Active timers storage
    let activeTimers = {};
    let timerStates = {}; // Store timer state for pause/resume
    
    // Sound functions
    function playTickSound() {
        try {
            // Create a soft tick sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.5;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
            
            // Resume audio context if suspended (browser policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (error) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Audio not supported');
        }
    }
    
    function playCompleteSound() {
        try {
            // Create a success beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // First beep - higher pitch
            const oscillator1 = audioContext.createOscillator();
            const gainNode1 = audioContext.createGain();
            oscillator1.connect(gainNode1);
            gainNode1.connect(audioContext.destination);
            oscillator1.frequency.value = 1046.50; // C6 note
            gainNode1.gain.value = 0.5;
            
            // Second beep - lower pitch  
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            oscillator2.frequency.value = 783.99; // G5 note
            gainNode2.gain.value = 0.5;
            
            oscillator1.start();
            gainNode1.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
            oscillator1.stop(audioContext.currentTime + 0.2);
            
            setTimeout(() => {
                oscillator2.start();
                gainNode2.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
                oscillator2.stop(audioContext.currentTime + 0.4);
            }, 200);
            
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (error) {
            // Fallback using simple beep
            try {
                const beep = new Audio();
                beep.src = 'data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==';
                beep.volume = 0.2;
                beep.play().catch(e => console.log('Audio play failed'));
            } catch (e) {
                console.log('Audio not supported');
            }
        }
    }
    
    // Helper function to get image filename for workout
    function getWorkoutImage(workoutName) {
        // Convert workout name to snake_case for lookup
        const formattedName = workoutName.toLowerCase().replace(/ /g, '_');
        
        // Check if we have a mapping for this workout
        if (imageMapping[formattedName]) {
            return imageMapping[formattedName];
        }
        
        // Try partial matching
        for (const [key, value] of Object.entries(imageMapping)) {
            if (formattedName.includes(key) || key.includes(formattedName)) {
                return value;
            }
        }
        
        // Default image if no match found
        return 'default.jpg';
    }
    
    // Helper function to format workout name for display
    function formatWorkoutName(name) {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Timer function - WITH PAUSE/RESUME SUPPORT AND SOUNDS
    function startTimer(workoutId, buttonElement, timerDisplayElement) {
        if (activeTimers[workoutId] && activeTimers[workoutId].isRunning) {
            return; // Timer already running for this workout
        }
        
        // Check if ANY timer is currently active and running
        const anyActiveTimer = Object.values(activeTimers).some(timer => timer.isRunning === true);
        if (anyActiveTimer && !activeTimers[workoutId]) {
            alert('Please complete the current workout before starting a new one!');
            return;
        }
        
        const button = buttonElement;
        const timerDisplay = timerDisplayElement;
        
        // If timer exists but is paused, resume it
        if (activeTimers[workoutId] && !activeTimers[workoutId].isRunning) {
            resumeTimer(workoutId, button, timerDisplay);
            return;
        }
        
        // Initialize new timer
        let timeLeft = timerStates[workoutId] ? timerStates[workoutId].timeLeft : 60;
        const originalButtonText = button.innerHTML;
        
        // Disable OTHER timer buttons only (not the current one)
        document.querySelectorAll('.timer-btn').forEach(btn => {
            const btnWorkoutId = btn.getAttribute('data-workout-id');
            if (btnWorkoutId !== workoutId) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            }
        });
        
        // Change the clicked button to pause mode
        button.innerHTML = '<i class="fas fa-pause"></i> Pause Timer';
        button.disabled = false;
        button.style.opacity = '1';
        
        // Update timer display
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerDisplay.style.display = 'block';
        timerDisplay.style.background = '#eff6ff';
        timerDisplay.style.color = '#3b82f6';
        timerDisplay.style.fontWeight = 'bold';
        
        // Start countdown
        const timerInterval = setInterval(() => {
            if (!activeTimers[workoutId] || !activeTimers[workoutId].isRunning) {
                return; // Don't update if timer is paused
            }
            
            timeLeft--;
            timerStates[workoutId] = { timeLeft: timeLeft };
            
            // Play tick sound every second (except at 0)
            if (timeLeft > 0 && timeLeft <= 60) {
                playTickSound();
            }
            
            // Update display
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Visual feedback for last 10 seconds
            if (timeLeft <= 10) {
                timerDisplay.style.background = '#fef2f2';
                timerDisplay.style.color = '#ef4444';
                timerDisplay.style.animation = 'pulse 0.5s ease infinite';
            }
            
            // Check if timer finished
            if (timeLeft <= 0) {
                clearInterval(activeTimers[workoutId].interval);
                delete activeTimers[workoutId];
                delete timerStates[workoutId];
                
                // Play completion sound
                playCompleteSound();
                
                // Update button to completed state
                button.innerHTML = '<i class="fas fa-check"></i> Completed!';
                button.disabled = true;
                button.style.opacity = '0.6';
                timerDisplay.textContent = 'Workout Complete! 🎉';
                timerDisplay.style.background = '#f0fdf4';
                timerDisplay.style.color = '#16a34a';
                timerDisplay.style.animation = 'none';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-play"></i> Start Timer';
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                    timerDisplay.style.display = 'none';
                    timerDisplay.style.background = '';
                    timerDisplay.style.color = '';
                    
                    // Re-enable ALL timer buttons
                    document.querySelectorAll('.timer-btn').forEach(btn => {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                    });
                }, 2000);
            }
        }, 1000);
        
        // Store timer with metadata
        activeTimers[workoutId] = {
            interval: timerInterval,
            isRunning: true,
            button: button,
            timerDisplay: timerDisplay,
            originalButtonText: originalButtonText
        };
        
        // Store initial state
        if (!timerStates[workoutId]) {
            timerStates[workoutId] = { timeLeft: 60 };
        }
    }
    
    // Pause timer function
    function pauseTimer(workoutId) {
        if (activeTimers[workoutId] && activeTimers[workoutId].isRunning) {
            // Clear the interval
            clearInterval(activeTimers[workoutId].interval);
            activeTimers[workoutId].isRunning = false;
            
            // Change button to resume mode
            const button = activeTimers[workoutId].button;
            button.innerHTML = '<i class="fas fa-play"></i> Resume Timer';
            button.disabled = false;
            
            // Update timer display style
            const timerDisplay = activeTimers[workoutId].timerDisplay;
            timerDisplay.style.background = '#fef3c7';
            timerDisplay.style.color = '#d97706';
        }
    }
    
    // Resume timer function
    function resumeTimer(workoutId, button, timerDisplay) {
        if (activeTimers[workoutId] && !activeTimers[workoutId].isRunning) {
            let timeLeft = timerStates[workoutId] ? timerStates[workoutId].timeLeft : 60;
            
            // Change button to pause mode
            button.innerHTML = '<i class="fas fa-pause"></i> Pause Timer';
            
            // Restart the interval
            const timerInterval = setInterval(() => {
                if (!activeTimers[workoutId] || !activeTimers[workoutId].isRunning) {
                    return;
                }
                
                timeLeft--;
                timerStates[workoutId] = { timeLeft: timeLeft };
                
                // Play tick sound every second (except at 0)
                if (timeLeft > 0 && timeLeft <= 60) {
                    playTickSound();
                }
                
                // Update display
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                // Visual feedback for last 10 seconds
                if (timeLeft <= 10) {
                    timerDisplay.style.background = '#fef2f2';
                    timerDisplay.style.color = '#ef4444';
                    timerDisplay.style.animation = 'pulse 0.5s ease infinite';
                } else {
                    timerDisplay.style.background = '#eff6ff';
                    timerDisplay.style.color = '#3b82f6';
                }
                
                // Check if timer finished
                if (timeLeft <= 0) {
                    clearInterval(activeTimers[workoutId].interval);
                    delete activeTimers[workoutId];
                    delete timerStates[workoutId];
                    
                    // Play completion sound
                    playCompleteSound();
                    
                    // Update button to completed state
                    button.innerHTML = '<i class="fas fa-check"></i> Completed!';
                    button.disabled = true;
                    button.style.opacity = '0.6';
                    timerDisplay.textContent = 'Workout Complete! 🎉';
                    timerDisplay.style.background = '#f0fdf4';
                    timerDisplay.style.color = '#16a34a';
                    timerDisplay.style.animation = 'none';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-play"></i> Start Timer';
                        button.disabled = false;
                        button.style.opacity = '1';
                        button.style.cursor = 'pointer';
                        timerDisplay.style.display = 'none';
                        timerDisplay.style.background = '';
                        timerDisplay.style.color = '';
                        
                        // Re-enable ALL timer buttons
                        document.querySelectorAll('.timer-btn').forEach(btn => {
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.cursor = 'pointer';
                        });
                    }, 2000);
                }
            }, 1000);
            
            // Update stored timer
            activeTimers[workoutId].interval = timerInterval;
            activeTimers[workoutId].isRunning = true;
            activeTimers[workoutId].button = button;
            activeTimers[workoutId].timerDisplay = timerDisplay;
        }
    }
    
    // Function to show loading state
    function showLoading() {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Workout...';
        
        workoutContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-dumbbell fa-spin"></i>
                <h3>Analyzing your fitness profile...</h3>
                <p>Our AI is creating the perfect workout plan for you</p>
            </div>
        `;
    }
    
    // Function to hide loading state
    function hideLoading() {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-dumbbell"></i> <span>Generate Workout Plan</span> <i class="fas fa-arrow-right"></i>';
    }
    
    // Function to display error message
    function showError(message) {
        workoutContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
    
    // Function to create workout card
    function createWorkoutCard(workoutName, index) {
        const workoutId = `workout-${Date.now()}-${index}`;
        const formattedName = formatWorkoutName(workoutName);
        const imageFile = getWorkoutImage(workoutName);
        const imagePath = `/static/images/${imageFile}`;
        
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.setAttribute('data-workout-id', workoutId);
        
        card.innerHTML = `
            <div class="workout-image">
                <img src="${imagePath}" alt="${formattedName}" onerror="this.src='/static/images/default.jpg'">
                <div class="workout-number">${index + 1}</div>
            </div>
            <div class="workout-content">
                <h3 class="workout-name">
                    <i class="fas fa-dumbbell"></i>
                    ${formattedName}
                </h3>
                <div class="workout-details">
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>60 sec</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-fire"></i>
                        <span>High intensity</span>
                    </div>
                </div>
                <div class="timer-container">
                    <div class="timer-display" id="timer-${workoutId}" style="display: none;"></div>
                    <button class="timer-btn" data-workout-id="${workoutId}" data-workout-name="${workoutName}">
                        <i class="fas fa-play"></i> Start Timer
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Function to display workout recommendations
    function displayWorkouts(workouts) {
        if (!workouts || workouts.length === 0) {
            showError('No workout recommendations available. Please try different parameters.');
            return;
        }
        
        // Clear container
        workoutContainer.innerHTML = '';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'results-header';
        header.innerHTML = `
            <div class="results-header-content">
                <i class="fas fa-check-circle"></i>
                <h2>Your Personalized Workout Plan</h2>
                <p>Here are ${workouts.length} exercises recommended just for you</p>
            </div>
        `;
        workoutContainer.appendChild(header);
        
        // Create workout cards grid container
        const cardsGrid = document.createElement('div');
        cardsGrid.className = 'workouts-grid';
        
        // Create cards for each workout
        workouts.forEach((workout, index) => {
            const card = createWorkoutCard(workout, index);
            cardsGrid.appendChild(card);
        });
        
        workoutContainer.appendChild(cardsGrid);
        
        // Add motivational tip
        const tip = document.createElement('div');
        tip.className = 'workout-tip';
        tip.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <div>
                <strong>Pro Tip:</strong> Start with a 5-minute warm-up and end with a cool-down stretch for best results!
            </div>
        `;
        workoutContainer.appendChild(tip);
        
        // Attach timer event listeners to buttons
        document.querySelectorAll('.timer-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const workoutId = this.getAttribute('data-workout-id');
                const timerDisplay = document.getElementById(`timer-${workoutId}`);
                
                // Check if timer exists and is running
                if (activeTimers[workoutId] && activeTimers[workoutId].isRunning) {
                    // Pause the current timer
                    pauseTimer(workoutId);
                } else if (activeTimers[workoutId] && !activeTimers[workoutId].isRunning) {
                    // Resume the paused timer
                    startTimer(workoutId, this, timerDisplay);
                } else {
                    // Start new timer
                    startTimer(workoutId, this, timerDisplay);
                }
            });
        });
    }
    
    // Function to validate form inputs - FIXED VERSION
    function validateInputs(age, weight, height, goal, level) {
        console.log('Validating inputs:', { age, weight, height, goal, level });
        
        if (!age || !weight || !height || !goal || !level) {
            return 'Please fill in all fields';
        }
        
        if (age < 15 || age > 100) {
            return 'Age must be between 15 and 100';
        }
        
        if (weight < 30 || weight > 300) {
            return 'Weight must be between 30 kg and 300 kg';
        }
        
        if (height < 100 || height > 250) {
            return 'Height must be between 100 cm and 250 cm';
        }
        
        return null;
    }
    
    // Function to submit form data to backend
    async function submitWorkoutRequest(formData) {
        try {
            console.log('Sending POST request to /predict with data:', formData);
            
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            return data;
            
        } catch (error) {
            console.error('Error in submitWorkoutRequest:', error);
            throw error;
        }
    }
    
    // Form submission handler - FIXED VERSION
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        console.log('Form submitted - starting handler');
        
        // Get form values - duration removed
        const age = document.getElementById('age').value;
        const weight = document.getElementById('weight').value;
        const height = document.getElementById('height').value;
        const goal = document.getElementById('goal').value;
        const level = document.getElementById('level').value;
        
        // Debug: Log to check if values are being collected
        console.log('Form values collected:', { age, weight, height, goal, level });
        
        // Validate inputs - duration removed
        const validationError = validateInputs(age, weight, height, goal, level);
        if (validationError) {
            console.log('Validation error:', validationError);
            showError(validationError);
            return;
        }
        
        // Prepare data for API - using default duration of 45
        const requestData = {
            age: parseFloat(age),
            weight: parseFloat(weight),
            height: parseFloat(height),
            duration: 45, // Default duration
            goal: goal,
            level: level
        };
        
        console.log('Sending request to API:', requestData);
        
        // Show loading state
        showLoading();
        
        try {
            // Make API request
            const result = await submitWorkoutRequest(requestData);
            console.log('API response received:', result);
            
            // Display workouts
            if (result.workouts && result.workouts.length > 0) {
                console.log('Displaying workouts:', result.workouts);
                displayWorkouts(result.workouts);
            } else {
                console.log('No workouts in response');
                showError('No workout recommendations found. Please try different parameters.');
            }
            
        } catch (error) {
            console.error('Submission error in catch block:', error);
            
            // Handle different error scenarios
            if (error.message.includes('Failed to fetch')) {
                showError('Unable to connect to the server. Please make sure the backend is running.');
            } else if (error.message.includes('400')) {
                showError('Invalid input. Please check your form values and try again.');
            } else {
                showError(error.message || 'An unexpected error occurred. Please try again.');
            }
            
        } finally {
            console.log('Hiding loading state');
            hideLoading();
        }
    }
    
    // Attach event listener to form
    if (form) {
        console.log('Form element found, attaching submit event listener');
        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('Form element with id "workout-form" not found!');
    }
    
    // Add input validation feedback - duration removed
    const numberInputs = ['age', 'weight', 'height'];
    numberInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                if (this.value < 0) this.value = 0;
            });
        }
    });
    
    // Clear any active timers when page is unloaded
    window.addEventListener('beforeunload', () => {
        for (const timerId in activeTimers) {
            if (activeTimers[timerId] && activeTimers[timerId].interval) {
                clearInterval(activeTimers[timerId].interval);
            }
        }
    });
    
    console.log('Script.js loaded and ready');
});

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);