import React, { useContext, useState } from 'react';
import { WorkoutPlanContext } from '../context/WorkoutPlanContext';

function WorkoutForm({ onFormSubmit }) {
    const { workoutPlan, setWorkoutPlan } = useContext(WorkoutPlanContext);
    const [showForm, setShowForm] = useState(true); // Track form visibility
  
    // Handle input changes
    const handleInputChange = (event) => {
      const { name, value } = event.target;
      setWorkoutPlan(prevPlan => ({
        ...prevPlan,
        [name]: value ? Number(value) : '' // ✅ Convert to number directly
      }));
    };
  
    // Handle form submission
    const handleFormSubmit = (event) => {
      event.preventDefault();
      console.log("Workout Plan Submitted:", workoutPlan);
      
      // Hide the form after submission
      setShowForm(false);
      onFormSubmit(); // Show buttons after form submission
    };
  
    return (
      <div id="form-con" className="form-con-class center">
        {showForm && ( // Only show form if showForm is true
          <div className="contact-form-container center">
            <form id="plan-form" onSubmit={handleFormSubmit}>
              <h3>Enter Workout Plan</h3>
  
              <label>No of Sets:</label>
              <input className="inp-cl" type="number" placeholder="e.g. 5" name="sets" value={workoutPlan.sets} onChange={handleInputChange} required />
  
              <br />
              <label>No of Reps per Set:</label>
              <input className="inp-cl" type="number" placeholder="e.g. 10" name="reps" value={workoutPlan.reps} onChange={handleInputChange} required />
  
              <br />
              <label>Rest Time (Seconds):</label>
              <input className="inp-cl" type="number" placeholder="e.g. 10" name="restTime" value={workoutPlan.restTime} onChange={handleInputChange} required />
  
              <br />
              <label>Weight (kg):</label>
              <input className="inp-cl" type="number" placeholder="Weight in kg" name="weight" value={workoutPlan.weight} onChange={handleInputChange} required />
  
              <br />
              <button type="submit" id="sub-button" className="form-sub-button">Next</button>
            </form>
          </div>
        )}
      </div>
    );
  }
  
  export default WorkoutForm;