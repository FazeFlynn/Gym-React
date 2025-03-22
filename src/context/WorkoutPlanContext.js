import React, { createContext, useState } from 'react';

// Create the context
export const WorkoutPlanContext = createContext();

// Provider component
export const WorkoutPlanProvider = ({ children }) => {
  const [workoutPlan, setWorkoutPlan] = useState({
    sets: '',
    reps: '',
    restTime: '',
    weight: ''
  });

  return (
    <WorkoutPlanContext.Provider value={{ workoutPlan, setWorkoutPlan }}>
      {children}
    </WorkoutPlanContext.Provider>
  );
};
