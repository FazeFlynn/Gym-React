import React, { useState, useRef, useEffect, useContext } from 'react';
import { Pose } from '@mediapipe/pose';
// import './App.css';
import '../styles/style.css';



import WorkoutForm from '../components/WorkOutForm'; 
import { WorkoutPlanContext } from '../context/WorkoutPlanContext';
import ToastNotifier from "../components/ToastNotifier";


function DumbPress() {
  // State variables
  const [dumbPressCount, setdumbPressCount] = useState(0);
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
  
  





  // Functions
  const handleVideoSelect = () => {
    console.log("video selecting");
    videoInputRef.current.click();
  };

  const handleVideoInput = (event) => {
    setdumbPressCount(0);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsLiveTracking(false);
    setdumbPressCount(0);
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
    setdumbPressCount(0);
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

  const toggleTrackingPoints = () => {
    setShowTrackingPoints(!showTrackingPoints);
  };

  const playAgain = () => {
    videoRef.current.play();
    setdumbPressCount(0);
    setVideoEnded(false);
    setIsVideoPlaying(true);
  };

  const smoothKeypoint = (index, x, y) => {
    if (!smoothedKeypointsRef.current[index]) {
      smoothedKeypointsRef.current[index] = { x, y };
    } else {
      smoothedKeypointsRef.current[index].x = alpha * smoothedKeypointsRef.current[index].x + (1 - alpha) * x;
      smoothedKeypointsRef.current[index].y = alpha * smoothedKeypointsRef.current[index].y + (1 - alpha) * y;
    }
  };

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

  const dumbPressCountRef = useRef(0);

  const incrementdumbPressCount = () => {
    dumbPressCountRef.current += 1; // Updates immediately
    setdumbPressCount(dumbPressCountRef.current);
    console.log(`Immediate DumbPress Count: ${dumbPressCountRef.current}`);
  };



  
  async function RestTimeOut(){

    await setTimeout(() => {

      console.log(`wait for ${planRestTimeRef.current} second`);
      videoRef.current.play();
      
      
    }, planRestTimeRef.current*1000);


  }

  
  function checkRepsAndSets(){

    

    dumbPressCountRef.current = 0;
    setdumbPressCount(0);
    setCount++;
    setSetsCount(setCount);
    videoRef.current.pause();
    RestTimeOut();

    ToastNotifier.success(`Rest for ${planRestTimeRef.current}s`, planRestTimeRef.current);

    console.warn(`Rest for ${planRestTimeRef.current}s`);



  }







  

  const processPose = (keypoints) => {
    const ctx = canvasRef.current.getContext('2d');
    const shoulders = [11, 12]; // Left, right shoulder
    const elbows = [13, 14]; // Left, right elbow
    const wrists = [15, 16]; // Left, right wrist

    // Smooth keypoints
    [...shoulders, ...elbows, ...wrists].forEach(index => {
      smoothKeypoint(index, keypoints[index].x, keypoints[index].y);
    });

    // Draw keypoints
    [...shoulders, ...elbows].forEach(index => {
      const { x, y } = smoothedKeypointsRef.current[index];
      ctx.beginPath();
      ctx.arc(x * canvasRef.current.width, y * canvasRef.current.height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "purple";
      ctx.fill();
    });

    const leftShoulderY = smoothedKeypointsRef.current[11].y;
    const rightShoulderY = smoothedKeypointsRef.current[12].y;
    const avgShoulderY = (leftShoulderY + rightShoulderY) / 2;

    const leftWristY = smoothedKeypointsRef.current[15].y;
    const rightWristY = smoothedKeypointsRef.current[16].y;
    const avgWristY = (leftWristY + rightWristY) / 2;

    const leftElbowY = smoothedKeypointsRef.current[13].y;
    const rightElbowY = smoothedKeypointsRef.current[14].y;
    const avgElbowY = (leftElbowY + rightElbowY) / 2;

    if (avgShoulderY < avgElbowY && checkerRef.current) {
      setIsPullingUp(true);
      isPullingUpRef.current = true;
      setChecker(false);
      checkerRef.current = false;
      
    }

    if (avgShoulderY > avgElbowY && !isPullingUpRef.current) {
      console.log("cam in avg shoulder 222-2-2-2-22-2--2-2");
      setIsPullingUp(true);
      isPullingUpRef.current = true;

      console.log("Trued");
    } else if (avgShoulderY < avgElbowY && isPullingUpRef.current) {
      if (!isUpRef.current) {
        setIsUp(true);
        isUpRef.current = true
      } else {
        incrementdumbPressCount();
      console.log(`DumbPress Count inside: ${dumbPressCountRef.current}`);

        
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
        }
        
        isDoingEx();
      }
      console.log("pulling up has done false here which mean it came here");
      setIsPullingUp(false);
      isPullingUpRef.current = false;
    }

    console.log(`DumbPress Count: ${dumbPressCountRef.current}`);

    videoRef.current.playbackRate = 0.9;

    if(dumbPressCountRef.current >= planRepsRef.current){
      checkRepsAndSets();
      console.log(`Condition true ${dumbPressCountRef.current} >= ${planRepsRef.current}`)
    }


  };

  

  const onResults = (results) => {
    if (!results.poseLandmarks) return;

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    processPose(results.poseLandmarks);
  };

  const processVideo = async () => {
    if (videoRef.current.paused || videoRef.current.ended) return;
    await poseRef.current.send({ image: videoRef.current });
    requestAnimationFrame(processVideo);
  };

  const processLiveVideo = async () => {
    if (!isLiveTracking) return;
    await poseRef.current.send({ image: videoRef.current });
    requestAnimationFrame(processLiveVideo);
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
        <h1>Dumbbell Press Counter</h1>
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
        <h2>Reps: <span id="repsCount">{dumbPressCount}</span></h2>
        <h2>Sets: <span id="setsCount">{setsCount}</span></h2>
      </div>

      <div 
        className="summary center zind" 
        style={{ display: videoEnded ? 'flex' : 'none' }}
      >
        <button onClick={playAgain} className="zind">Play Again</button>
        <p className="zind">
          <span>Summary: </span> You have performed {dumbPressCount} reps of pull-ups in this video. Keep going!
        </p>
      </div>
    </div>
  );
}

export default DumbPress;

