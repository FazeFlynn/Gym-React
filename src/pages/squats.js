import React, { useState, useRef, useEffect, useContext } from 'react';
import { Pose } from '@mediapipe/pose';
// import './App.css';
import '../styles/style.css';



import WorkoutForm from '../components/WorkOutForm'; 
import { WorkoutPlanContext } from '../context/WorkoutPlanContext';
import ToastNotifier from "../components/ToastNotifier";


function Squats() {
  // State variables
  const [squatsCount, setSquatsCount] = useState(0);
  const [isPullingUp, setIsPullingUp] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [showTrackingPoints, setShowTrackingPoints] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [checker, setChecker] = useState(true);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // Track submission
  

  // Refs

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const videoInputRef = useRef(null);
  const poseRef = useRef(null);
  const smoothedKeypointsRef = useRef({});
  const timeoutIdRef = useRef(null);

  const isPullingUpRef = useRef(false);
  const isUpRef = useRef(false);
  const checkerRef = useRef(true);

  // Constants
  const alpha = 0.6; // Smoothing factor


  
    
      let setCount = 0;  
    
      const [setsCount, setSetsCount] = useState(0);  
      const { workoutPlan } = useContext(WorkoutPlanContext); // Access global state
    
      const planRepsRef = useRef(workoutPlan.reps || 0);
      const planSetsRef = useRef(workoutPlan.sets || 0);
      const planRestTimeRef = useRef(workoutPlan.restTime || 0);
      
      // Track when plan updates
      useEffect(() => {
        planRepsRef.current = workoutPlan.reps || 0;
        planSetsRef.current = workoutPlan.sets || 0;
        planRestTimeRef.current = workoutPlan.restTime || 0;
    
        console.log(`Updated Plan - Sets: ${planSetsRef.current}, Reps: ${planRepsRef.current}, Rest Time: ${planRestTimeRef.current}`);
      }, [workoutPlan]); 
    
    
  



  let squatCount = 0;
let isSquatting = false;
let pose;
// let smoothedKeypoints = {};
// const alpha = 0.6; // Smoothing factor
// let isLiveTracking = false;

  // Functions
  const handleVideoSelect = () => {
    console.log("video selecting");
    videoInputRef.current.click();
  };

  const handleVideoInput = (event) => {
    setSquatsCount(0);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsLiveTracking(false);
    setSquatsCount(0);
    stopCamera();
    setVideoEnded(false);

    console.log("Loading video");

    
    const file = event.target.files[0];
    if (file) {
    console.log("Video loaded");


      videoRef.current.src = URL.createObjectURL(file);
      videoRef.current.load();

      videoRef.current.onloadeddata = () => {
        console.log("Video is now playing");
        setIsVideoPlaying(true); // ✅ Ensure video visibility
      };
    }
  };

  const startTracking = () => {
    videoRef.current.playbackRate = 0.08;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const startCamera = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsLiveTracking(true);
    stopCamera();
    setSquatsCount(0);
    setVideoEnded(false);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsVideoPlaying(true);
        })
        .catch((error) => console.error("Error accessing camera:", error));
    } else {
      console.error("getUserMedia not supported.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      let tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };


  
    const requestRef = useRef(null);
  
  
    const stopCamera2 = () => {
      console.log("Stopping camera and pose processing...");
    
      setIsLiveTracking(false); // Stop tracking
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current); //  Stop ongoing animation loop
        requestRef.current = null;
        console.log(" Animation frame cancelled");
      }
    
      if (poseRef.current) {
        try {
          console.log("Closing MediaPipe Pose...");
          poseRef.current.close();
          poseRef.current = null;
          console.log("Pose instance closed");
        } catch (error) {
          console.error(" Error closing pose instance:", error);
        }
      }
    
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        console.log(" Camera stopped safely");
      }
  
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        console.log("Canvas cleared");
      }
    
      // Reset video element to remove last frame
      if (videoRef.current) {
        videoRef.current.src = ""; // Unload the last frame
        videoRef.current.load(); // Reset the video element
        console.log("Video element cleared");
      }
  
    };
    



  const toggleTrackingPoints = () => {
    setShowTrackingPoints(!showTrackingPoints);
  };

  const playAgain = () => {
    videoRef.current.play();
    setSquatsCount(0);
    setVideoEnded(false);
    setIsVideoPlaying(true);
  };

  let smoothedKeypoints = {}; 


//   const smoothKeypoint = (index, x, y) => {
//     if (!smoothedKeypointsRef.current[index]) {
//       smoothedKeypointsRef.current[index] = { x, y };
//     } else {
//       smoothedKeypointsRef.current[index].x = alpha * smoothedKeypointsRef.current[index].x + (1 - alpha) * x;
//       smoothedKeypointsRef.current[index].y = alpha * smoothedKeypointsRef.current[index].y + (1 - alpha) * y;
//     }
//   };

  function smoothKeypoint(index, x, y) {
    if (!smoothedKeypoints[index]) {
        smoothedKeypoints[index] = { x, y };
    } else {
        smoothedKeypoints[index].x = alpha * smoothedKeypoints[index].x + (1 - alpha) * x;
        smoothedKeypoints[index].y = alpha * smoothedKeypoints[index].y + (1 - alpha) * y;
    }
}

  const isDoingEx = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    timeoutIdRef.current = setTimeout(() => {
      if (isUpRef.current) {
        console.log('is not doing exercise');
        setIsUp(false);
        isUpRef.current = false;
      } else {
        console.log('Subject is doing exercise');
      }
    }, 10000);
  };

  const squatsCountRef = useRef(0);

//   const incrementSquatsCount = () => {
//     squatsCountRef.current += 1; // Updates immediately
//     setSquatsCount(squatsCountRef.current);
//     console.log(`Immediate Squats Count: ${squatsCountRef.current}`);
//   };




  async function RestTimeOut(){
    await setTimeout(() => {
      console.log(`wait for ${planRestTimeRef.current} second`);
      videoRef.current.play();    
    }, planRestTimeRef.current*1000);
  }
  
  function checkRepsAndSets(){ 
    squatsCountRef.current = 0;
    setSquatsCount(0);
    setCount++;
    setSetsCount(setCount);
    videoRef.current.pause();
    RestTimeOut();
    ToastNotifier.success(`Rest for ${planRestTimeRef.current}s`, planRestTimeRef.current);
    console.warn(`Rest for ${planRestTimeRef.current}s`);
  }
  


  let camStopped = false;


  const processPose = (keypoints) => {
    const ctx = canvasRef.current.getContext('2d');



    console.log("process Pose running");

    // Left and Right keypoints for squats
    const leftPoints = [23, 25, 27];  // Left hip, knee, ankle
    const rightPoints = [24, 26, 28]; // Right hip, knee, ankle

    console.log("process Pose poits setups");

    // Calculate visibility scores
    const leftVisibility = leftPoints.reduce((sum, idx) => sum + (keypoints[idx]?.visibility || 0), 0) / leftPoints.length;
    const rightVisibility = rightPoints.reduce((sum, idx) => sum + (keypoints[idx]?.visibility || 0), 0) / rightPoints.length;

    console.log("process Pose visiblity score");


    // Select the side with higher visibility
    let hipIndex, kneeIndex, ankleIndex;
    if (rightVisibility >= leftVisibility) {
        [hipIndex, kneeIndex, ankleIndex] = rightPoints;
    } else {
        [hipIndex, kneeIndex, ankleIndex] = leftPoints;
    }

    // Smooth selected keypoints
    [hipIndex, kneeIndex, ankleIndex].forEach(index => {
        smoothKeypoint(index, keypoints[index].x, keypoints[index].y);
    });

    // Draw keypoints
    [hipIndex, kneeIndex, ankleIndex].forEach(index => {
        const { x, y } = smoothedKeypoints[index];
        ctx.beginPath();
        ctx.arc(x * canvasRef.current.width, y * canvasRef.current.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "purple"; 
        ctx.fill();
    });

    // Squat detection logic
    const hipY = smoothedKeypoints[hipIndex].y;
    const kneeY = smoothedKeypoints[kneeIndex].y;
    const ankleY = smoothedKeypoints[ankleIndex].y;

    // Going down (hip below knee)
    if (hipY > kneeY && !isSquatting) {
        isSquatting = true;
    } 
    // Coming up (hip above knee again)
    else if (hipY < kneeY && isSquatting) {
        squatCount++;
        squatsCountRef.current = squatCount; // Updates immediately
    setSquatsCount(squatCount);
        // set = squatCount;
        isSquatting = false;
        //
    }

    videoRef.current.playbackRate = 0.9;


    if(setCount >= planSetsRef.current-1 && squatsCountRef.current >= planRepsRef.current){
      // console.alert(`Video should have ended now`);
      setIsLiveTracking(false);
      console.warn(`Video should have ended now`);
      setVideoEnded(true);
      setIsVideoPlaying(false);
      stopCamera2();
      camStopped = true;
    } else {
      console.log(`Condition not true ${setCount-1} >= ${planSetsRef.current} and ${squatsCountRef.current} >= ${planRepsRef.current}`);
    }


    if(squatCount >= planRepsRef.current && !camStopped){
      checkRepsAndSets();
      console.log(`Condition true ${squatCount} >= ${planRepsRef.current}`);
      squatsCountRef.current = 0;
      squatCount = 0;
    }


   
  };

  

  const onResults = (results) => {
    if (!results.poseLandmarks) return;

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    processPose(results.poseLandmarks);
  };

  // const processVideo = async () => {
  //   if (videoRef.current.paused || videoRef.current.ended) return;
  //   await poseRef.current.send({ image: videoRef.current });
  //   requestAnimationFrame(processVideo);
  // };

  // const processLiveVideo = async () => {
  //   if (!isLiveTracking) return;
  //   await poseRef.current.send({ image: videoRef.current });
  //   requestAnimationFrame(processLiveVideo);
  // };

  const processVideo = async () => {
    if (!isLiveTracking && !poseRef.current && !videoRef.current) return; // ✅ Prevent crashes
  
    try {
      if(poseRef.current){

        await poseRef.current.send({ image: videoRef.current });
        requestRef.current = requestAnimationFrame(processVideo); // ✅ Store request ID
      }
    } catch (error) {
      console.error("🔥 Error in processVideo:", error);
    }
  };
  
  const processLiveVideo = async () => {
    if (!isLiveTracking && !poseRef.current && !videoRef.current) return; // ✅ Prevent crashes
  
    try {
      if(poseRef.current){

        await poseRef.current.send({ image: videoRef.current });
      requestRef.current = requestAnimationFrame(processLiveVideo); // ✅ Store request ID
      }
    } catch (error) {
      console.error("🔥 Error in processLiveVideo:", error);
    }
  };
  

  // Load pose detection model
  useEffect(() => {
    const startPoseTracking = async () => {
      poseRef.current = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      poseRef.current.onResults(onResults);
      console.log("BlazePose model loaded");
    };

    startPoseTracking();

    return () => {
      stopCamera();
    };
  }, []);

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    
    const handleVideoEnd = () => {
      setVideoEnded(true);
      setIsVideoPlaying(false);
    };
    
    const handleVideoPlay = () => {
      if (isLiveTracking) {
        processLiveVideo();
      } else {
        processVideo();
      }
    };
    
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnd);
      videoElement.addEventListener('play', handleVideoPlay);
      
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd);
        videoElement.removeEventListener('play', handleVideoPlay);
      };
    }
  }, [isLiveTracking]);

  return (
    <div>
      <div className="title center">
        <h1>Squats Counter</h1>
      </div>

    
      <p>Full Body should be in the frame to achieve high accuracy</p>

     {/* 🏋️‍♂️ Workout Plan Form */}
 {/* Pass form submission handler to WorkoutForm */}
 <WorkoutForm onFormSubmit={() => setIsFormSubmitted(true)} />

{/* Show buttons only after form submission */}
{isFormSubmitted && (
  <div id="hide-when-next-clickked" className="buttons center">
    <button id="cam" onClick={startCamera}>Open Camera</button>
    <input
      type="file"
      ref={videoInputRef}
      accept="video/*"
      style={{ display: 'none' }}
      onChange={handleVideoInput}
    />
    <button onClick={handleVideoSelect} className="select-video">
      {isVideoPlaying || videoEnded ? "Select a new Video" : "Select a Video"}
    </button>
    <a href="/">
      <button>Back</button>
    </a>
  </div>
)}

      <div className={`vid-container center ${isVideoPlaying || videoEnded ? 'flex' : 'none'}`} style={{ display: isVideoPlaying || videoEnded ? 'flex' : 'none' }}>
        <div className={`video-container ${isLiveTracking ? 'mirrored' : ''}`}>
          <video 
            ref={videoRef} 
            className="vid-player" 
            width="640" 
            height="360"
          />
          <canvas 
            ref={canvasRef} 
            width="640" 
            height="360" 
            style={{ opacity: showTrackingPoints ? '100%' : '0%' }}
          />
        </div>
      </div>

      <div className="center zind">
        <div 
          className="start-button buttons center" 
          style={{ display: (isVideoPlaying || videoEnded) && !videoEnded ? 'flex' : 'none' }}
        >
          <button onClick={startTracking} className="zind">
            {isVideoPlaying ? "Start Tracking" : "Start Tracking"}
          </button>
          <button onClick={toggleTrackingPoints} className="zind">
            {showTrackingPoints ? "Hide Tracking Points" : "Show Tracking Points"}
          </button>
        </div>
      </div>

      <div 
        className="rep-text center zind" 
        style={{ display: (isVideoPlaying || videoEnded) && !videoEnded ? 'flex' : 'none' }}
      >
        <h2>Reps: <span id="repsCount">{squatsCount}</span></h2>
        <h2>Sets: <span id="setsCount">{setsCount}</span></h2>
      </div>

      <div 
        className="summary center zind" 
        style={{ display: videoEnded ? 'flex' : 'none' }}
      >
        <h2>Well Done</h2>
        {/* <button onClick={playAgain} className="zind">Play Again</button> */}
        <p className="zind">
        <span>Workout Plan Completed: </span> You have performed {setsCount+1} sets of {planRepsRef.current} reps of Squats in this Session.
        {/* <span>Summary: </span> You have performed {setsCount} sets of {planRepsRef.current} reps + {squatsCount} reps of pull-ups in this video. Keep going! */}
          {/* <span>Summary: </span> You have performed {squatsCount} reps of pull-ups in this video. Keep going! */}
        </p>
      </div>
    </div>
  );
}

export default Squats;

