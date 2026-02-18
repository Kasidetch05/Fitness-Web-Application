# Fitness-Web-Application
---
Introduction

FitLife is a personalized fitness motivation and nutrition platform. It is a comprehensive, AI-powered web application designed to help users transform their body and mind through data-driven fitness planning. By combining tradtional physiological formulas with modern AI capabilities. FitLife provides a personalized roadmap for anyone looking to lose weight, gain muscle, or maintain a healthy lifestyle.

---
Key Features : 

- Intelligent Goal Setting : Users can define objectives—such as weight loss or muscle gain—and                               receive a plan tailored to their unique physiological profile.

- Macros & Nutrition tracking : The application calculates personalized macronutrient targets                                    (Protein, Carbs and Fats) and daily calorie needs using the                                      Miffin-St Jeor Formula for BMR and activity-based TDEE.

- Body Fat Estimation : Includes a built-in estimator utilizing the U.S Navy Method                                      (circumference - based) to track body composition beyond just scale                              weight.

- AI-Powered Insights :
  - Fitbot AI chat        : A personalized fitness coach powered by Gemini AI to answer                                      nutrition and exercise questions in real-time.
  - Visual Food Estimator : Uses computer vision and AI to analyze food images and provide                                   nutritional estimates via the device's camera.
  - Time Prediction       : Predicts the timeframe for reaching weight goals based on the user's                             current caloric deficit or surplus
  - Secure Authentication :  Features a custom-built user management system with SHA-256                                      password hashing for secure login and account recovery.
 
---
Technical Stack

- Frontend       : HTML5, CSS3 (Modern Flexbox/Grid layouts), and Vanilla Javascript.
- AI Integration : Google Gemini API for natural language processing and image recognition.
- Security       : Web Crypto API for SHA-256 password encryption.
- Animations     : Custom CSS animation for a smooth, interactive user experience.

---
How It Works
1. Onboarding   : Users create a secure account and provide vital stage (age, weight, height,                      activity level).
2. Analysis     : The system calculates the user's BMR, TDEE, and estimated Bodyfat percentage.
3. Plannning    : Based on the selected goal, the app generates a "Receipt" style plan detailing                   daily caloric and macronutrient targets
4. Interaction  : Users can consult the FitBot AI or use the Food Estimator to stay on track                       throughout their journey.
---
