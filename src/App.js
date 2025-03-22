import React from 'react';
import { Link,BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PullUps from "./pages/pullUps";
import PushUps from "./pages/pushUps";
import './App.css';
import Squats from './pages/squats';
import Lunges from './pages/lunges';
import DumbPress from './pages/dumbPress';
import Dips from './pages/dips';


import { WorkoutPlanProvider } from './context/WorkoutPlanContext'; 
import { ToastContainerComponent } from "./components/ToastNotifier"; 



function Home() {
  return (
    <div>
      <div id="container">
        <div className="title center">
          <h2>Welcome to your AI Gym Tracker</h2>
        </div>

        <div className="today center">
          <p>What are we doing today!</p>
        </div>

        <div className="ex-list center">
          <Link to="/push-ups">
            <div className="excercises center">
              <p>Push-ups</p>
            </div>
          </Link>

          <Link to="/squats">
            <div className="excercises center">
              <p>Squats</p>
            </div>
          </Link>

          <Link to="/lunges">
            <div className="excercises center">
              <p>Lunges</p>
            </div>
          </Link>

          <Link to="/dumbbell-press">
            <div className="excercises center">
              <p>Dumbell Press</p>
            </div>
          </Link>

          <Link to="/pull-ups">
            <div className="excercises center">
              <p>Pull-ups</p>
            </div>
          </Link>

          <Link to="/dips">
            <div className="excercises center">
              <p>Dips</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (

    <WorkoutPlanProvider> 
      
      <ToastContainerComponent /> {/* Ensures toast messages appear globally */}

    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/push-ups" element={<PushUps />} />
          <Route path="/pull-ups" element={<PullUps />} />
          <Route path="/squats" element={<Squats />} />
          <Route path="/lunges" element={<Lunges />} />
          <Route path="/dumbbell-press" element={<DumbPress />} />
          <Route path="/dips" element={<Dips />} />
        </Routes>
      </div>
    </Router>
    </WorkoutPlanProvider>
  );
}

export default App;