/* ============================================================
 * UNIFIED JAVASCRIPT LOGIC
 * Includes Authentication, Stats Collection, Body Fat Estimation, 
 * Goal Setting, and Nutrition/Exercise Calculation with Custom Alerts.
 * ============================================================ */

// ------------------------------------------------------------
// 1. GEMINI API CONFIGURATION (FIX ADDED HERE)
// ------------------------------------------------------------

// *NOTED* GEMINI API KEY WONT BE PLACE HERE DUE TO SECURITY.
const GEMINI_API_KEY = "Replace this with your own GEMINI KEY PRODUCT"; // <<< REPLACE THIS WITH YOUR REAL KEY
const GEMINI_MODEL = "gemini-2.5-flash"; // A fast, capable model (supports vision)
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;


// 1. Get ALL DOM Elements
const mainContent = document.getElementById('mainContent');
const loginPage = document.getElementById('loginPage');
const signupPage = document.getElementById('signupPage');
const resetPage = document.getElementById('resetPage');
const statsPage = document.getElementById('statsPage');
const goalPage = document.getElementById('goalPage'); 
// **PAGES**
const foodReceiptPage = document.getElementById('foodReceiptPage'); 
const exerciseReceiptPage = document.getElementById('exerciseReceiptPage');
const chatPage = document.getElementById('chatPage'); 
const foodEstimatorPage = document.getElementById('foodEstimatorPage'); // **NEW**

// Navigation elements
const backToGoalPage = document.getElementById('backToGoalPage'); 
const backToGoalPageFromExercise = document.getElementById('backToGoalPageFromExercise');
const backToGoalFromChat = document.getElementById('backToGoalFromChat'); 
const backToGoalFromEstimator = document.getElementById('backToGoalFromEstimator'); // **NEW**

// Authentication elements
const startButton = document.getElementById('startButton');
const backButton = document.getElementById('backButton');
const loginForm = document.getElementById('loginForm');
const forgotLink = document.getElementById('forgotLink');
const createButton = document.getElementById('createButton');
const signupForm = document.getElementById('signupForm');
const backToLoginButton = document.getElementById('backToLoginButton');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const backToLoginFromReset = document.getElementById('backToLoginFromReset');
const resetForm = document.getElementById('resetForm');
const resetPlanButton = document.getElementById('resetPlanButton');

// Stats and Goal elements
const statsForm = document.getElementById('statsForm');
const userAgeInput = document.getElementById('userAge');
const userWeightInput = document.getElementById('userWeight');
const userTargetWeightInput = document.getElementById('userTargetWeight'); 
const userHeightInput = document.getElementById('userHeight');
const userGenderInput = document.getElementById('userGender'); 
const userActivityInput = document.getElementById('userActivity'); 
const hipGroup = document.getElementById('hipGroup'); // For conditional visibility

// Body Fat inputs
const userNeckInput = document.getElementById('userNeck');
const userWaistInput = document.getElementById('userWaist');
const userHipInput = document.getElementById('userHip');

const backToStatsPage = document.getElementById('backToStatsPage'); 
const goalButtons = document.querySelectorAll('.goal-button'); 
const goalContinueButton = document.getElementById('goalContinueButton'); 

// Body Fat Results Display
const bodyFatResultsDiv = document.getElementById('bodyFatResults');
const bodyFatTargetSpan = document.getElementById('bodyFatTarget');
const bodyFatMessageP = document.getElementById('bodyFatMessage');

// Nutrition Results Display
const nutritionResultsDiv = document.getElementById('nutritionResults');
const calorieTargetSpan = document.getElementById('calorieTarget'); 
const targetCaloriesDisplay = document.getElementById('targetCaloriesDisplay'); 
const proteinTargetSpan = document.getElementById('proteinTarget');
const fatTargetSpan = document.getElementById('fatTarget');
const carbTargetSpan = document.getElementById('carbTarget');

// ML Prediction Elements
const predictionResultsDiv = document.getElementById('predictionResults');
const predictedTimeSpan = document.getElementById('predictedTime');
const predictionMessageP = document.getElementById('predictionMessage');

// ML Recommendation Elements (Food)
const recommendationResultsDiv = document.getElementById('recommendationResults');
const recommendationList = document.getElementById('recommendationList');
const receiptFoodList = document.getElementById('receiptFoodList'); 

// ML Recommendation Elements (Exercise)
const exerciseRecommendationResultsDiv = document.getElementById('exerciseRecommendationResults');
const exerciseRecommendationList = document.getElementById('exerciseRecommendationList');
const receiptExerciseList = document.getElementById('receiptExerciseList'); 

// Chat elements
const openChatButton = document.getElementById('openChatButton');
const chatMessagesDiv = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

// Food Estimator elements **NEW**
const openEstimatorButton = document.getElementById('openEstimatorButton');
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const captureButton = document.getElementById('captureButton');
const estimatorResultsDiv = document.getElementById('estimatorResults');
const estimatorStatusDiv = document.getElementById('estimatorStatus');
let stream; // Global variable to hold the camera stream

// Custom Alert Elements
const customAlert = document.getElementById('custom-alert');

// Store registered users, session data, and state
let registeredUsers = [];
let resetEmail = '';
let selectedGoal = null; 
let userStats = {
    age: 0,
    weight: 0,
    targetWeight: 0, 
    height: 0,
    gender: '',
    activity: 0, // Activity multiplier value (e.g., 1.55)
    tdee: 0,
    // Body Fat properties
    neck: 0,
    waist: 0,
    hip: 0,
    bodyFatPercentage: 0
}; 
let calculatedPlan = null; 
let currentRecommendations = []; 
let currentExerciseRecommendations = [];

/* ============================================================
 * 2. CUSTOM ALERT UTILITY 
 * ============================================================ */
function showCustomAlert(message, title = "Notification", icon = '💡') {
    if (!customAlert || !document.getElementById('alert-content')) {
        console.error("Custom alert elements not found. Falling back to native alert.");
        alert(`${title} (${icon}): ${message}`);
        return;
    }
    
    const alertHTML = `
        <div class="alert-icon">${icon}</div>
        <div class="alert-title">${title}</div>
        <div class="alert-message">${message}</div>
        <button class="alert-button" id="alert-ok-button">OK</button>
    `;

    document.getElementById('alert-content').innerHTML = alertHTML;
    customAlert.classList.add('show-alert');

    document.getElementById('alert-ok-button').onclick = function() {
        customAlert.classList.remove('show-alert');
    };
}


/* ============================================================
 * 3. CENTRAL PAGE NAVIGATION FUNCTION 
 * ============================================================ */
function showPage(pageToShow) {
    // ADD foodEstimatorPage to the list of pages
    const pages = [mainContent, loginPage, signupPage, resetPage, statsPage, goalPage, foodReceiptPage, exerciseReceiptPage, chatPage, foodEstimatorPage]; 
    
    pages.forEach(page => {
        if (page) {
            page.style.display = 'none'; 
            page.classList.remove('active'); 
        }
    });

    if (pageToShow) {
        pageToShow.style.display = (pageToShow === mainContent) ? 'block' : 'flex';
        pageToShow.classList.add('active'); 
        window.scrollTo(0, 0);
    }
}

if (mainContent) {
    showPage(mainContent);
}

/* ============================================================
 * 4. SECURITY — SHA-256 PASSWORD HASHING 
 * ============================================================ */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/* ============================================================
 * 5. NAVIGATION EVENT LISTENERS 
 * ============================================================ */
if (startButton) startButton.addEventListener('click', () => showPage(loginPage));
if (backButton) backButton.addEventListener('click', () => showPage(mainContent));
if (createButton) createButton.addEventListener('click', () => showPage(signupPage));
if (backToLoginButton) backToLoginButton.addEventListener('click', () => showPage(loginPage));
if (backToLoginBtn) backToLoginBtn.addEventListener('click', () => showPage(loginPage));

if (backToLoginFromReset) {
    backToLoginFromReset.addEventListener('click', function() {
        resetForm.reset();
        document.getElementById('successMessage').classList.remove('show');
        document.getElementById('resetPasswordError').classList.remove('show');
        showPage(loginPage);
    });
}

// Back from Goal Page to Stats Page (UPDATED to hide all results)
if (backToStatsPage) {
    backToStatsPage.addEventListener("click", () => {
        // Hide result elements
        nutritionResultsDiv.style.display = 'none'; 
        predictionResultsDiv.style.display = 'none'; 
        recommendationResultsDiv.style.display = 'none'; 
        exerciseRecommendationResultsDiv.style.display = 'none';
        bodyFatResultsDiv.style.display = 'none'; 
        
        // Hide AI Feature Buttons
        openChatButton.style.display = 'none';
        openEstimatorButton.style.display = 'none'; // **NEW**

        // Hide all dynamically created button containers
        if (document.getElementById('foodRecommendationButtonContainer')) {
            document.getElementById('foodRecommendationButtonContainer').style.display = 'none';
        }
        if (document.getElementById('exerciseRecommendationButtonContainer')) { 
            document.getElementById('exerciseRecommendationButtonContainer').style.display = 'none';
        }

        // Reset goal state
        selectedGoal = null;
        calculatedPlan = null;
        currentRecommendations = []; 
        currentExerciseRecommendations = [];
        goalContinueButton.disabled = true;
        goalContinueButton.textContent = 'Show My Plan'; 
        goalButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Change Goal Page header back to selection state
        document.getElementById('goalSubtitle').textContent = 'Select the primary objective for your fitness journey.';
        document.getElementById('goalOptions').style.display = 'flex'; 

        showPage(statsPage);
    });
}

// Back from Food Receipt Page to Goal Page
if (backToGoalPage) {
    backToGoalPage.addEventListener('click', () => {
        showPage(goalPage);
    });
}

// Back from Exercise Receipt Page to Goal Page
if (backToGoalPageFromExercise) {
    backToGoalPageFromExercise.addEventListener('click', () => {
        showPage(goalPage);
    });
}

// Back from Chat Page to Goal Page 
if (backToGoalFromChat) {
    backToGoalFromChat.addEventListener('click', () => {
        showPage(goalPage);
    });
}

// Back from Estimator Page to Goal Page **NEW**
if (backToGoalFromEstimator) {
    backToGoalFromEstimator.addEventListener('click', () => {
        stopCamera(); // Stop the camera when navigating away
        estimatorResultsDiv.innerHTML = ''; // Clear results on exit
        estimatorStatusDiv.textContent = 'Press Capture to analyze food.';
        showPage(goalPage);
    });
}

// Open Chat Button
if (openChatButton) {
    openChatButton.addEventListener('click', () => {
        // Customize initial message with user's plan
        const initialMessage = chatMessagesDiv.querySelector('.bot-message');
        if (initialMessage && calculatedPlan) {
            initialMessage.innerHTML = `Hello! I'm FitBot. I see your goal is to ${selectedGoal} and your daily calorie target is ${calculatedPlan.calories.toLocaleString()} kcal. How can I assist with your plan today?`;
        }
        showPage(chatPage);
    });
}

// Open Estimator Button **NEW**
if (openEstimatorButton) {
    openEstimatorButton.addEventListener('click', () => {
        showPage(foodEstimatorPage);
        startCamera(); // Start the camera immediately upon entering the page
    });
}


/* ============================================================
 * 6. AUTHENTICATION LOGIC 
 * ============================================================ */

// Login Form Submission
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');

        // Reset errors
        emailInput.classList.remove('error');
        passwordInput.classList.remove('error');
        emailError.classList.remove('show');
        passwordError.classList.remove('show');

        const hashedPassword = await hashPassword(password);
        const user = registeredUsers.find(u => u.email === email);

        if (!user) {
            emailInput.classList.add('error');
            emailError.classList.add('show');
            return;
        }

        if (user.password !== hashedPassword) {
            passwordInput.classList.add('error');
            passwordError.classList.add('show');
            return;
        }

        // Login successful 
        showCustomAlert('Welcome back, ' + user.name + '!', 'Login Successful', '👋'); 
        
        loginForm.reset();
        showPage(statsPage); // Redirect to the Stats Collection Page
    });
}

// Signup Form Submission
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showCustomAlert('Passwords do not match! Please try again.', 'Error', '❌');
            return;
        }

        if (registeredUsers.find(u => u.email === email)) {
            showCustomAlert('Email already registered! Please use a different email.', 'Registration Failed', '⚠️');
            return;
        }

        const hashedPassword = await hashPassword(password);
        registeredUsers.push({ name, email, password: hashedPassword });

        showCustomAlert('Welcome, ' + name + '! Please login to continue.', 'Account Created', '🎉');
        signupForm.reset();
        
        showPage(loginPage); // Redirect to login page
    });
}

// Forgot Password Link
if (forgotLink) {
    forgotLink.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        
        if (!email) {
            showCustomAlert('Please enter your email address first.', 'Missing Email', '📧');
            return;
        }

        const user = registeredUsers.find(u => u.email === email);
        
        if (!user) {
            showCustomAlert('Email not found. Please register first.', 'User Not Found', '❓');
            return;
        }

        resetEmail = email;
        
        showCustomAlert(`Password reset link has been simulated for ${email}. Click OK to proceed to reset page.`, 'Password Reset', '🔑');
        
        showPage(resetPage);
    });
}

// Reset Password Form Submission
if (resetForm) {
    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const resetPasswordError = document.getElementById('resetPasswordError');
        const successMessage = document.getElementById('successMessage');

        resetPasswordError.classList.remove('show');
        successMessage.classList.remove('show');

        if (newPassword !== confirmNewPassword) {
            resetPasswordError.classList.add('show');
            return;
        }

        const newHashedPassword = await hashPassword(newPassword);
        const userIndex = registeredUsers.findIndex(u => u.email === resetEmail);
        
        if (userIndex !== -1) {
            registeredUsers[userIndex].password = newHashedPassword;
            
            successMessage.classList.add('show');
            resetForm.reset();
            
            setTimeout(function() {
                successMessage.classList.remove('show');
                showPage(loginPage);
                resetEmail = '';
            }, 2000);
        }
        
    });
}

/* ============================================================
 * 7. VALIDATION FUNCTION 
 * ============================================================ */

/**
 * Validates numerical inputs with specific min/max bounds.
 */
function validateNumericalInput(inputElement, min, max, fieldName) {
    const value = parseFloat(inputElement.value);
    
    if (inputElement.value.trim() === '' || isNaN(value)) {
        showCustomAlert(`${fieldName} must be a valid number.`, 'Input Error', '⚠️');
        inputElement.focus();
        return false;
    }

    if (value < min || value > max) {
        showCustomAlert(`${fieldName} must be between ${min} and ${max}.`, 'Input Error', '⚠️');
        inputElement.focus();
        return false;
    }

    return true;
}

/**
 * Validates a number is positive, used for circumference fields which have no bounds.
 */
function validatePositiveNumber(inputElement, fieldName, isOptional = false) {
    const value = parseFloat(inputElement.value);

    // Allow empty value if optional
    if (isOptional && inputElement.value.trim() === '') {
        return true;
    }
    
    if (inputElement.value.trim() === '' || isNaN(value) || value <= 0) {
        showCustomAlert(`${fieldName} must be a positive number.`, 'Input Error', '⚠️');
        inputElement.focus();
        return false;
    }
    return true;
}


/* ============================================================
 * 8. NUTRITION CALCULATION FUNCTIONS 
 * ============================================================ */

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor.
 */
function calculateBMR(weightKg, heightCm, ageYears, gender) {
    let s = (gender === 'male') ? 5 : -161;
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + s;
    return bmr;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
function calculateTDEE(bmr, activityFactor) {
    return bmr * activityFactor;
}

/**
 * Calculates a Macronutrient plan based on TDEE and Goal.
 */
function calculateNutritionPlan(tdee, goal, bodyFatPercentage) {
    let calorieTarget;
    let proteinMultiplier = 2.2; // g/kg of current body weight for an active person
    let fatPercentage = 0.25; // 25% of calories from fat is a standard baseline

    // Determine Calorie Target
    if (goal === 'Lose Weight') {
        // Create a 500 kcal deficit (aggressive but common)
        calorieTarget = tdee - 500;
        // Ensure minimum safe floor (e.g., 1200 for women, 1500 for men)
        if (userStats.gender === 'female' && calorieTarget < 1200) calorieTarget = 1200;
        if (userStats.gender === 'male' && calorieTarget < 1500) calorieTarget = 1500;
        
    } else if (goal === 'Gain Muscle/Weight') {
        // Create a 300 kcal surplus for muscle gain (mostly)
        calorieTarget = tdee + 300;
        
    } else { // Maintain Weight
        calorieTarget = tdee;
    }
    
    // 1. Calculate Protein (4 kcal/g)
    // Use the maximum of (current weight, target weight) for a safer protein target
    const effectiveWeightForProtein = Math.max(userStats.weight, userStats.targetWeight);
    let proteinGrams = Math.round(proteinMultiplier * effectiveWeightForProtein);
    let proteinCalories = proteinGrams * 4;
    
    // If protein calories exceed 50% of the target, adjust down slightly
    if (proteinCalories > (calorieTarget * 0.5)) {
         proteinGrams = Math.round((calorieTarget * 0.5) / 4);
         proteinCalories = proteinGrams * 4;
    }

    // 2. Calculate Fat (9 kcal/g)
    // Ensure fat is at least 20% for hormonal health
    if (fatPercentage < 0.20) fatPercentage = 0.20; 
    let fatCalories = Math.round(calorieTarget * fatPercentage);
    let fatGrams = Math.round(fatCalories / 9);

    // 3. Calculate Carbs (4 kcal/g) - The remainder
    let remainingCalories = calorieTarget - proteinCalories - fatCalories;
    // Ensure carbs are not negative
    if (remainingCalories < 0) remainingCalories = 0; 
    let carbGrams = Math.round(remainingCalories / 4);
    
    // Final Tally Check (optional cleanup for rounding)
    let totalCalculatedCalories = proteinCalories + fatCalories + (carbGrams * 4);
    
    return {
        calories: Math.round(calorieTarget),
        protein: proteinGrams,
        fat: fatGrams,
        carbs: carbGrams,
        tdee: Math.round(tdee)
    };
}

/* ============================================================
 * 9. BODY FAT ESTIMATION (US NAVY METHOD)
 * ============================================================ */

/**
 * Estimates Body Fat Percentage using the U.S. Navy Method (circumference based).
 * Assumes inputs are in centimeters (cm) and converts to inches for the formula.
 * @param {string} gender 'male' or 'female'
 * @param {number} heightCm Height in cm
 * @param {number} neckCm Neck circumference in cm
 * @param {number} waistCm Waist circumference in cm
 * @param {number} hipCm Hip circumference in cm (only used for female)
 * @returns {number} Body Fat Percentage (0-100), or 0 if inputs are invalid.
 */
function calculateBodyFatPercentage(gender, heightCm, neckCm, waistCm, hipCm) {
    // If any required inputs are 0, return 0 (in case user skipped optional fields)
    if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return 0;
    if (gender === 'female' && hipCm <= 0) return 0;
    
    // Conversion factor to Inches for the formula (1 cm = 0.393701 inches)
    const heightInches = heightCm * 0.393701;
    const neckInches = neckCm * 0.393701;
    const waistInches = waistCm * 0.393701;
    const hipInches = hipCm * 0.393701;

    let bodyFatPercentage = 0;

    if (gender === 'male') {
        // Male formula: 
        // BF% = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
        try {
            // Using a simplified US Navy method:
            const measure = waistInches - neckInches;
            if (measure <= 0) return 0; // Avoid log of non-positive
            bodyFatPercentage = 86.010 * Math.log10(measure) - 70.041 * Math.log10(heightInches) + 36.76;
        } catch (e) {
            return 0;
        }
    } else {
        // Female formula: 
        // BF% = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
        try {
            const measure = waistInches + hipInches - neckInches;
            if (measure <= 0) return 0; // Avoid log of non-positive
            bodyFatPercentage = 163.205 * Math.log10(measure) - 97.684 * Math.log10(heightInches) - 78.387;
        } catch (e) {
            return 0;
        }
    }
    
    // Clamp the result to a sensible range (0% to 50%)
    return Math.min(50, Math.max(0, parseFloat(bodyFatPercentage.toFixed(1))));
}

/* ============================================================
 * 10. DISPLAY FUNCTIONS 
 * ============================================================ */

function displayNutritionResults(plan) {
    targetCaloriesDisplay.textContent = plan.calories.toLocaleString();
    proteinTargetSpan.textContent = `${plan.protein}g`;
    fatTargetSpan.textContent = `${plan.fat}g`;
    carbTargetSpan.textContent = `${plan.carbs}g`;
    
    nutritionResultsDiv.style.display = 'block';
}

function displayBodyFatResults(bfPercentage, gender) {
    if (bfPercentage === 0) {
        bodyFatResultsDiv.style.display = 'none';
        return;
    }
    
    bodyFatTargetSpan.textContent = `${bfPercentage}%`;
    let message = 'Your body fat could not be reliably estimated with the provided measurements.';

    if (gender === 'male') {
        if (bfPercentage < 6) {
            message = "Essential Fat! This is likely too low and may be unhealthy.";
        } else if (bfPercentage >= 6 && bfPercentage <= 13) {
            message = "Elite Athlete Range. Excellent level of leanness!";
        } else if (bfPercentage > 13 && bfPercentage <= 17) {
            message = "Fitness Range. Great body composition for an active lifestyle.";
        } else if (bfPercentage > 17 && bfPercentage <= 24) {
            message = "Acceptable Range. A good, healthy range for the general population.";
        } else {
            message = "Above Average. Focus on fat loss through diet and exercise.";
        }
    } else {
        // Female
        if (bfPercentage < 14) {
            message = "Essential Fat! This is likely too low and may be unhealthy.";
        } else if (bfPercentage >= 14 && bfPercentage <= 20) {
            message = "Elite Athlete Range. Excellent level of leanness!";
        } else if (bfPercentage > 20 && bfPercentage <= 24) {
            message = "Fitness Range. Great body composition for an active lifestyle.";
        } else if (bfPercentage > 24 && bfPercentage <= 31) {
            message = "Acceptable Range. A good, healthy range for the general population.";
        } else {
            message = "Above Average. Focus on fat loss through diet and exercise.";
        }
    }
    bodyFatMessageP.textContent = message;
    bodyFatResultsDiv.style.display = 'block';
}

/* ============================================================
 * 11. ML FEATURE: PREDICTED WEIGHT LOSS/GAIN TIME (CALORIE-BASED FIX)
 * ============================================================ */

/**
 * Predicts the days until the target weight is reached based on calorie deficit/surplus.
 */
function calculateTimePrediction(currentWeight, targetWeight, goal, tdee, targetCalories) {
    const weightDifference = targetWeight - currentWeight;
    const kcalPerKg = 7700; // Estimated calories in 1kg of body fat/mass

    // The daily calorie delta is the difference between maintenance (TDEE) and the plan (Target Calories)
    const dailyCalorieDelta = targetCalories - tdee; 

    const isDeficit = dailyCalorieDelta < 0; // True if losing weight
    const isGainGoal = weightDifference > 0; // True if target is higher than current

    let days = '...';
    let rate = '...'; 
    let predictionMessage = '';
    
    // 1. Check for 'Maintenance' - no prediction needed
    if (goal === 'Maintain Weight') {
        days = '--';
        predictionMessage = "You are set to maintain your current weight with this calorie plan.";
        predictedTimeSpan.textContent = days;
        predictionResultsDiv.style.display = 'block';
        predictionMessageP.textContent = predictionMessage;
        return;
    }

    // 2. Check for goal/calorie inconsistency (e.g., trying to lose weight with a surplus)
    if ((isGainGoal && isDeficit) || (!isGainGoal && !isDeficit)) {
        days = '∞';
        predictionMessage = `Error: Your calorie plan (${targetCalories} kcal) is inconsistent with your weight goal (${goal}). You are currently trying to ${isDeficit ? 'lose' : 'gain'} weight.`;
        predictedTimeSpan.textContent = days;
        predictionResultsDiv.style.display = 'block';
        predictionMessageP.textContent = predictionMessage;
        return;
    }

    // 3. Perform the calculation
    if (Math.abs(dailyCalorieDelta) > 100) { // Only calculate if the deficit/surplus is significant (>100 kcal)
        // Total required calorie change (always positive)
        const totalCalorieDelta = Math.abs(weightDifference) * kcalPerKg;
        // Days to reach the goal (always positive)
        let predictedDays = totalCalorieDelta / Math.abs(dailyCalorieDelta);
        days = Math.round(predictedDays);

        // Calculate rate (kg/week) for the message
        const dailyWeightChange = Math.abs(dailyCalorieDelta) / kcalPerKg;
        rate = (dailyWeightChange * 7).toFixed(2);

        predictionMessage = `Based on a daily adjustment of ${Math.round(Math.abs(dailyCalorieDelta))} kcal, you are on track for a sustainable change rate of ~${rate} kg/week.`;

        // Apply a safe limit for extremely fast predictions (e.g., if target is 1kg loss and deficit is huge)
        if (days < 14) { 
            days = Math.max(14, days); // Set a minimum of 2 weeks
            predictionMessage += ` (Min prediction time is 14 days for safety).`;
        }
    } else {
        days = '∞';
        predictionMessage = `Your daily calorie adjustment is small (${Math.round(Math.abs(dailyCalorieDelta))} kcal). It may take a very long time to reach your goal.`;
    }

    predictedTimeSpan.textContent = days;
    predictionResultsDiv.style.display = 'block';
    predictionMessageP.textContent = predictionMessage;
}

/* ============================================================
 * 12. ML FEATURE: FOOD RECOMMENDATIONS 
 * ============================================================ */

const MASTER_FOOD_DATABASE = {
    PROTEIN_SOURCES: [ 'Chicken Breast (Grilled)', 'Salmon (Baked)', 'Tofu (Extra Firm)', 'Lentils', 'Greek Yogurt (Plain)', 'Cottage Cheese', 'Lean Ground Beef' ],
    CARB_SOURCES: [ 'Oatmeal', 'Sweet Potato', 'Brown Rice', 'Quinoa', 'Whole Wheat Bread', 'Chickpeas' ],
    HEALTHY_FATS: [ 'Avocado', 'Almonds', 'Walnuts', 'Olive Oil', 'Chia Seeds' ],
    VEGGIES_AND_LOW_CALORIE: [ 'Spinach', 'Broccoli', 'Kale', 'Carrots', 'Bell Peppers', 'Green Beans', 'Cabbage', 'Cauliflower' ]
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Gets a balanced list of food recommendations based on the goal.
 */
function getFoodRecommendations(goal) {
    let recs = [];
    const db = MASTER_FOOD_DATABASE;

    // Determine priority picks based on goal
    let priorityPicks = {
        primary: db.PROTEIN_SOURCES,
        secondary: db.VEGGIES_AND_LOW_CALORIE,
        tertiary: db.CARB_SOURCES
    };

    if (goal === 'Lose Weight') {
        // High Protein/Fiber, Lower Carb density
        priorityPicks.primary = db.PROTEIN_SOURCES;
        priorityPicks.secondary = db.VEGGIES_AND_LOW_CALORIE;
        priorityPicks.tertiary = db.HEALTHY_FATS; // Add healthy fats for satiety
    } else if (goal === 'Gain Muscle/Weight') {
        // High Protein, High Carb density
        priorityPicks.primary = db.PROTEIN_SOURCES;
        priorityPicks.secondary = db.CARB_SOURCES;
        priorityPicks.tertiary = db.HEALTHY_FATS;
    }

    // 1. Add top 3 primary
    recs.push(...priorityPicks.primary.slice(0, 3)); 
    
    // 2. Add 2 secondary 
    shuffleArray(priorityPicks.secondary);
    recs.push(...priorityPicks.secondary.slice(0, 2));

    // 3. Add 1 tertiary (only if not already a primary or secondary focus)
    shuffleArray(priorityPicks.tertiary);
    if (!recs.includes(priorityPicks.tertiary[0])) {
         recs.push(priorityPicks.tertiary[0]);
    }
    
    // Ensure 6 total for the main plan view
    return recs.slice(0, 6); 
}

function displayFoodRecommendations(recommendations) {
    recommendationList.innerHTML = ''; // Clear previous list
    
    // Display only the first 3 for the dashboard
    recommendations.slice(0, 3).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item}</span> 🥩`;
        recommendationList.appendChild(li);
    });
    
    // Show the card
    recommendationResultsDiv.style.display = 'block';

    // Also update the full receipt list (for the modal button)
    receiptFoodList.innerHTML = '';
    recommendations.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        receiptFoodList.appendChild(li);
    });

    // Handle the full plan button creation and visibility
    let buttonContainer = document.getElementById('foodRecommendationButtonContainer');
    if (!buttonContainer) {
        // Create the button and container if it doesn't exist
        const buttonHTML = `
            <div id="foodRecommendationButtonContainer" style="text-align: center; margin-top: 1.5rem;">
                <button id="foodButton" class="login-button" style="width: 100%; max-width: 300px; background-color: #48bb78; border-color: #48bb78; box-shadow: 0 5px 15px rgba(72, 187, 120, 0.4);">
                    Full Nutrition Plan
                </button>
            </div>
        `;
        // Insert the HTML structure right after the food recommendation results
        recommendationResultsDiv.insertAdjacentHTML('afterend', buttonHTML);
        buttonContainer = document.getElementById('foodRecommendationButtonContainer');
        document.getElementById('foodButton').onclick = handleFoodRecipeButtonClick;
    }
    buttonContainer.style.display = 'block';
}

function handleFoodRecipeButtonClick() {
    // Show the full receipt page
    document.getElementById('foodReceiptSubTitle').textContent = `The following food sources are tailored to your ${selectedGoal} Goal.`;
    showPage(foodReceiptPage);
}


/* ============================================================
 * 13. ML FEATURE: EXERCISE RECOMMENDATIONS 
 * ============================================================ */

const MASTER_WORKOUT_DATABASE = {
    CARDIO: [
        'High-Intensity Interval Training (HIIT)',
        'Brisk walking or steady-state jogging',
        'Cycling/Spin class',
        'Jump Rope intervals',
    ],
    STRENGTH_LOW: [
        'Bodyweight workout (Squats, Push-ups, Lunges)',
        'Resistance band training',
        'Light Dumbbell Circuit',
    ],
    STRENGTH_HIGH: [
        'Heavy compound lifting (Squat, Deadlift, Bench Press)',
        'Full Body Hypertrophy session (8-12 reps)',
        'Advanced Kettlebell workout',
    ],
    BALANCE_AND_FLEXIBILITY: [
        'Yoga or Pilates session',
        'Foam rolling and deep stretching',
    ]
};

/**
 * Gets a balanced list of exercise recommendations based on the goal and activity.
 */
function getExerciseRecommendations(goal, activityFactor) {
    let recs = [];
    const db = MASTER_WORKOUT_DATABASE;

    if (goal === 'Lose Weight') {
        // Prioritize a mix of cardio and low/high strength for muscle preservation
        recs.push(db.CARDIO[0], db.CARDIO[1]); // 2 Cardio
        recs.push(db.STRENGTH_HIGH[1]); // 1 High Strength (to maintain muscle)
        recs.push(db.STRENGTH_LOW[0]); // 1 Low Strength
    } else if (goal === 'Gain Muscle/Weight') {
        // Prioritize heavy strength training
        recs.push(db.STRENGTH_HIGH[0], db.STRENGTH_HIGH[1]); // 2 High Strength
        recs.push(db.STRENGTH_LOW[2]); // 1 Low Strength for isolation
        recs.push(db.CARDIO[1]); // 1 Light Cardio for recovery/health
    } else { // Maintain Weight
        // Balanced approach
        recs.push(db.CARDIO[1]); // 1 Cardio
        recs.push(db.STRENGTH_HIGH[1]); // 1 High Strength
        recs.push(db.STRENGTH_LOW[0]); // 1 Low Strength
        recs.push(db.BALANCE_AND_FLEXIBILITY[0]); // 1 Flexibility
    }

    // Optional: Add more depending on activity factor (e.g., if very active, add one more)
    if (activityFactor >= 1.725) {
        recs.push(db.CARDIO[3]);
    }
    
    // Ensure 4 total for the main plan view
    return Array.from(new Set(recs)).slice(0, 4); 
}

function displayExerciseRecommendations(recommendations) {
    exerciseRecommendationList.innerHTML = ''; // Clear previous list
    
    // Display all 4 for the dashboard
    recommendations.slice(0, 4).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item}</span> 🏋️`;
        exerciseRecommendationList.appendChild(li);
    });
    
    exerciseRecommendationResultsDiv.style.display = 'block';

    // Also update the full receipt list (for the modal button)
    receiptExerciseList.innerHTML = '';
    recommendations.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        receiptExerciseList.appendChild(li);
    });

    // Handle the full plan button creation and visibility
    let buttonContainer = document.getElementById('exerciseRecommendationButtonContainer');
    if (!buttonContainer) {
        // Create the button and container if it doesn't exist
        const buttonHTML = `
            <div id="exerciseRecommendationButtonContainer" style="text-align: center; margin-top: 1.5rem;">
                <button id="workoutButton" class="login-button" style="width: 100%; max-width: 300px; background-color: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);">
                    Full Workout Plan
                </button>
            </div>
        `;
        // Insert the HTML structure right after the exercise recommendation results
        exerciseRecommendationResultsDiv.insertAdjacentHTML('afterend', buttonHTML);
        buttonContainer = document.getElementById('exerciseRecommendationButtonContainer');
        document.getElementById('workoutButton').onclick = handleExerciseRecipeButtonClick;
    }
    buttonContainer.style.display = 'block';
}

function handleExerciseRecipeButtonClick() {
    // Show the full receipt page
    document.getElementById('exerciseReceiptSubTitle').textContent = `The following workout plan is tailored to your ${selectedGoal} Goal.`;
    showPage(exerciseReceiptPage);
}

/* ============================================================
 * 14. GEMINI AI CHAT/VISION LOGIC **UPDATED WITH VISION FUNCTION**
 * ============================================================ */

// Helper to append messages to the chat interface
function appendMessage(text, sender) {
    const message = document.createElement('div');
    message.classList.add('message-bubble', `${sender}-message`);
    message.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Basic markdown bold
    chatMessagesDiv.appendChild(message);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll to bottom
}

// Function to call the Gemini API for Chat (Text-only)
async function getAiResponse(question) {
    // Check for placeholder key
    if (GEMINI_API_KEY.includes("AIzaSyArgcvUts6bXItM7Yg3IkKnjxodYUcgnpM")) { 
        return "I'm sorry, FitBot cannot connect. You must replace the **placeholder** `GEMINI_API_KEY` with your actual key to use the AI chat feature.";
    }

    // Context for the AI
    const userContext = `User Goal: ${selectedGoal}, Current Weight: ${userStats.weight}kg, Target Weight: ${userStats.targetWeight}kg, Daily Calories: ${calculatedPlan.calories}kcal, Macros: P:${calculatedPlan.protein}g C:${calculatedPlan.carbs}g F:${calculatedPlan.fat}g.`;
    const systemInstruction = `You are FitBot, a friendly and helpful fitness and nutrition coach. Use the user context below to provide personalized advice. Do not reveal the API key. Keep your response concise, encouraging, and focused on the user's query. User Context: ${userContext}`;

    // 1. Combine system instruction and question
    const combinedInput = systemInstruction + "\nUser Question: " + question;

    // 2. Build the request body
    const requestBody = {
        contents: [{
            parts: [{ text: combinedInput }]
        }]
    };

    try {
        const response = await fetch(GEMINI_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
             const errorData = await response.json();
             console.error("Gemini API Error:", errorData);
             return `I'm sorry, FitBot received a network error: ${response.status} ${response.statusText}. Please verify your GEMINI_API_KEY and network connection.`;
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textResponse) {
            return textResponse.trim();
        } else if (data.promptFeedback?.blockReason) {
            return `I'm sorry, FitBot was unable to process your request due to content safety policy. Please try a shorter or different question.`;
        } else {
            // Final FALLBACK: Unexpected empty response structure
            console.error("Gemini API Error: Unexpected empty response structure. Data:", data);
            return "I'm sorry, FitBot received an empty or unreadable response from the AI. This can happen with unusual inputs. Please try a different question.";
        }
    } catch (error) {
        console.error("Network or Fetch Error:", error);
        return "Network Error. Please check your connection or API base URL.";
    }
}

/**
 * **NEW MULTIMODAL FUNCTION**
 * Calls the Gemini API with a base64 encoded image to estimate calories.
 * Prompts the model to return a structured JSON object.
 */
async function getAiVisionResponse(base64Image) {
    // Check for placeholder key
    if (GEMINI_API_KEY.includes("AIzaSyArgcvUts6bXItM7Yg3IkKnjxodYUcgnpM")) { 
        return {
            isError: true,
            message: "AI not configured. Please set a valid `GEMINI_API_KEY` to use this feature."
        };
    }

    const prompt = `Analyze the provided image of food. Identify the food item(s) and estimate the total calorie count (kcal) for the visible portion. Provide the response as a JSON object with two fields: "food_item" (string, e.g., "Two scrambled eggs and toast") and "estimated_calories" (integer, e.g., 250). Do not include any text outside the JSON object.`;

    const requestBody = {
        contents: [{
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: prompt }
            ]
        }]
    };

    try {
        const response = await fetch(GEMINI_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            return {
                isError: true,
                message: `AI Estimation failed: ${response.status} ${response.statusText}. See console for details.`
            };
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!textResponse) {
            return { isError: true, message: "AI response was empty or unreadable." };
        }
        
        // Try to parse the JSON response
        try {
            // The AI might wrap the JSON in markdown code fences. Remove them.
            const cleanJson = textResponse.replace(/^```json\s*|```\s*$/g, '').trim();
            const jsonResponse = JSON.parse(cleanJson);
            
            if (jsonResponse.food_item && jsonResponse.estimated_calories !== undefined) {
                return { isError: false, result: jsonResponse };
            } else {
                 return { isError: true, message: `AI returned invalid JSON structure. Response: ${cleanJson.substring(0, 50)}...` };
            }
        } catch (e) {
            console.error("JSON Parsing Error:", e);
            return { isError: true, message: `AI returned non-JSON text. Response: ${textResponse.substring(0, 50)}...` };
        }
    } catch (error) {
        console.error("Network or Fetch Error:", error);
        return {
            isError: true,
            message: "Network Error. Please check your connection or API base URL."
        };
    }
}


// Event listener for chat form submission - **UPDATED to use async/await**
if (chatForm) {
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        // 1. Display user message
        appendMessage(userInput, 'user');
        
        // 2. Clear input and disable
        chatInput.value = ''; // Clear input field immediately
        chatInput.disabled = true;
        chatForm.querySelector('.send-button').disabled = true;
        
        // Add a temporary 'thinking' message
        const thinkingBubble = document.createElement('div');
        thinkingBubble.classList.add('message-bubble', 'bot-message', 'thinking');
        thinkingBubble.innerHTML = 'FitBot is thinking...';
        chatMessagesDiv.appendChild(thinkingBubble);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;

        // 3. Get actual AI response
        const botResponse = await getAiResponse(userInput);
        
        // 4. Remove thinking message
        chatMessagesDiv.removeChild(thinkingBubble);

        // 5. Display response
        appendMessage(botResponse, 'bot');
        
        // 6. Re-enable input
        chatInput.disabled = false;
        chatForm.querySelector('.send-button').disabled = false;
        chatInput.focus(); 
    });
}

/* ============================================================
 * 15. CAMERA AND ESTIMATOR LOGIC **NEW**
 * ============================================================ */
/**
 * Requests and starts the camera stream in the video element.
 */
async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        estimatorStatusDiv.textContent = 'Error: Camera access is not supported in this browser.';
        captureButton.disabled = true;
        return;
    }
    
    estimatorStatusDiv.textContent = 'Initializing camera...';
    estimatorResultsDiv.innerHTML = '';
    captureButton.disabled = true;

    try {
        // Request camera access, preferring the environment (back) camera
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment' 
            } 
        }); 
        videoElement.srcObject = stream;
        // Wait for video to load before enabling capture
        videoElement.onloadedmetadata = function() {
            videoElement.play();
            estimatorStatusDiv.textContent = 'Point your camera at the food and press Capture.';
            captureButton.disabled = false;
        };
    } catch (err) {
        console.error("Error accessing camera: ", err);
        estimatorStatusDiv.textContent = 'Error: Could not access camera. Please check permissions.';
        captureButton.disabled = true;
    }
}

/**
 * Stops the camera stream.
 */
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

/**
 * Captures the current frame from the video element onto the canvas.
 * @returns {string} The base64 part of the JPEG image data URL.
 */
function captureImage() {
    const context = canvasElement.getContext('2d');
    
    // Set canvas dimensions to match video feed for a good capture
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Get the image data as a base64 string
    const imageDataURL = canvasElement.toDataURL('image/jpeg', 0.8); // JPEG format, 80% quality
    return imageDataURL.split(',')[1]; // Return only the base64 part
}

// Capture Button Logic
if (captureButton) {
    captureButton.addEventListener('click', async function() {
        estimatorResultsDiv.innerHTML = ''; // Clear previous results
        estimatorStatusDiv.textContent = 'Analyzing image, please wait... ⏳';
        captureButton.disabled = true;
        
        // 1. Capture the image
        const base64Image = captureImage();

        // 2. Send to AI
        const aiResult = await getAiVisionResponse(base64Image);

        // 3. Display results
        if (aiResult.isError) {
            estimatorStatusDiv.textContent = `Estimation Failed: ${aiResult.message}`;
            // Re-enable capture for another attempt
            captureButton.disabled = false; 
        } else {
            stopCamera(); // Stop camera once the image is processed to save battery
            estimatorStatusDiv.textContent = 'Estimation Complete! ✅';
            
            const result = aiResult.result;
            // Display the captured image and results
            estimatorResultsDiv.innerHTML = `
                <div class="result-card">
                    <img src="${'data:image/jpeg;base64,' + base64Image}" alt="Captured Food" class="captured-image"/>
                    <div class="result-details">
                        <p class="food-item-name">${result.food_item}</p>
                        <p class="calorie-estimate">
                            <span>Estimated Calories:</span> 
                            <strong>${result.estimated_calories.toLocaleString()} kcal</strong>
                        </p>
                    </div>
                </div>
            `;
            // Keep button disabled until camera is restarted or user navigates away/back
            captureButton.disabled = true; 
        }
    });
}


/* ============================================================
 * 16. GENDER and STATS FORM LOGIC
 * ============================================================ */
// Listener to conditionally show Hip measurement for females
if (userGenderInput) {
    userGenderInput.addEventListener('change', function() {
        if (userGenderInput.value === 'female') {
            hipGroup.style.display = 'block';
            userHipInput.required = true;
        } else {
            hipGroup.style.display = 'none';
            userHipInput.required = false;
        }
    });
}

// Stats Form Submission
if (statsForm) {
    statsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const gender = userGenderInput.value;

        // 1. Validation Checks
        if (!gender) {
            showCustomAlert('Please select your gender.', 'Input Error', '⚠️');
            return;
        }
        if (!validateNumericalInput(userAgeInput, 10, 100, "Age") || 
            !validateNumericalInput(userHeightInput, 100, 250, "Height") ||
            !validateNumericalInput(userWeightInput, 30, 300, "Current Weight") ||
            !validateNumericalInput(userTargetWeightInput, 30, 300, "Target Weight") ||
            !validatePositiveNumber(userNeckInput, "Neck Circumference", true) ||
            !validatePositiveNumber(userWaistInput, "Waist Circumference", true) ||
            (gender === 'female' && !validatePositiveNumber(userHipInput, "Hip Circumference", true))) {
            return; 
        }

        // 2. Collect Data
        userStats.age = parseFloat(userAgeInput.value);
        userStats.weight = parseFloat(userWeightInput.value);
        userStats.targetWeight = parseFloat(userTargetWeightInput.value);
        userStats.height = parseFloat(userHeightInput.value);
        userStats.gender = gender;
        userStats.activity = parseFloat(userActivityInput.value);
        userStats.neck = parseFloat(userNeckInput.value) || 0;
        userStats.waist = parseFloat(userWaistInput.value) || 0;
        userStats.hip = parseFloat(userHipInput.value) || 0;

        // 3. Calculate Core Stats
        const bmr = calculateBMR(userStats.weight, userStats.height, userStats.age, userStats.gender);
        userStats.tdee = calculateTDEE(bmr, userStats.activity);
        userStats.bodyFatPercentage = calculateBodyFatPercentage(
            userStats.gender, 
            userStats.height, 
            userStats.neck, 
            userStats.waist, 
            userStats.hip
        );

        // 4. Reset Goal Selection State
        selectedGoal = null;
        goalButtons.forEach(btn => btn.classList.remove('selected'));
        goalContinueButton.disabled = true;
        
        // 5. Navigate to Goal Page
        showPage(goalPage);
    });
}


/* ============================================================
 * 17. GOAL SELECTION LOGIC 
 * ============================================================ */

if (goalButtons) {
    goalButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'selected' from all
            goalButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add 'selected' to the clicked button
            this.classList.add('selected');
            
            // Store the selected goal
            selectedGoal = this.getAttribute('data-goal');
            
            // Enable the continue button
            goalContinueButton.disabled = false;
        });
    });
}

/* ============================================================
 * 18. GOAL CONTINUATION BUTTON LOGIC (TRIGGERING CALCULATION)
 * ============================================================ */
if (goalContinueButton) {
    goalContinueButton.addEventListener('click', function() {
        if (!selectedGoal) {
            showCustomAlert('Please select a fitness goal to continue.', 'Selection Required', '⚠️');
            return;
        }

        // 1. Calculate the nutrition plan (Calorie/Macro Targets)
        // This function will set the calculatedPlan global variable.
        calculatedPlan = calculateNutritionPlan(userStats.tdee, selectedGoal, userStats.bodyFatPercentage);

        // 2. Display the results
        displayNutritionResults(calculatedPlan);
        displayBodyFatResults(userStats.bodyFatPercentage, userStats.gender); // Show BF results again

        // 3. Calculate and Display Time Prediction
        calculateTimePrediction(
            userStats.weight,
            userStats.targetWeight,
            selectedGoal,
            userStats.tdee,
            calculatedPlan.calories
        );
        
        // 4. Get and display recommendations
        currentRecommendations = getFoodRecommendations(selectedGoal);
        displayFoodRecommendations(currentRecommendations);
        currentExerciseRecommendations = getExerciseRecommendations(selectedGoal, userStats.activity);
        displayExerciseRecommendations(currentExerciseRecommendations);

        // 5. Update UI for 'Plan Ready' state
        document.getElementById('goalSubtitle').textContent = `Your ${selectedGoal} Plan is Ready!`;
        document.getElementById('goalOptions').style.display = 'none';

        // 6. Show the AI Feature Buttons
        openChatButton.style.display = 'inline-block';
        openEstimatorButton.style.display = 'inline-block'; // **NEW**

        // Hide the continue button
        this.style.display = 'none';
        
        showCustomAlert(`Your personalized ${selectedGoal} plan is ready! Scroll down to view your targets.`, 'Plan Ready', '🚀');
    });

}
