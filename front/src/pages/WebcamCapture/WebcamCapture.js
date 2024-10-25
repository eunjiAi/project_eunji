import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WebcamCapture.css';

function WebcamCapture() {
  const [modelName, setModelName] = useState('');
  const [prediction, setPrediction] = useState('검사전');
  const [okCount, setOkCount] = useState(0);
  const [ngCount, setNgCount] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [mode, setMode] = useState('');
  const [captureInterval, setCaptureInterval] = useState(1000);
  const [detectedObjects, setDetectedObjects] = useState([]); // 객체 탐지 결과 상태
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null); // 객체 탐지 박스를 그릴 캔버스
  const navigate = useNavigate();

  // 웹캠 스트림 시작
  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("웹캠 접근 오류:", err);
      }
    }

    startWebcam();

    // 웹캠 종료 처리
    const stopWebcam = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };

    // 페이지 언마운트 시 웹캠 중지
    window.addEventListener('beforeunload', stopWebcam);

    return () => {
      stopWebcam();
      window.removeEventListener('beforeunload', stopWebcam);
    };
  }, [navigate]);

  // 모델 이름 가져오기
  useEffect(() => {
    const fetchModelName = async () => {
      try {
        const response = await fetch('http://localhost:5000/model-name');
        const data = await response.json();
        console.log('Model Name Response:', data);
        setModelName(data.model_name);
      } catch (error) {
        console.error('모델 이름 가져오기 오류:', error);
      }
    };
    fetchModelName();
  }, []);

  // prediction 상태 변경 감지
  useEffect(() => {
    if (prediction === 'ng') {
      console.log('불량입니다!');
      stopCapturing();
    } else if (prediction === 'ok') {
      console.log('양품입니다!');
    }
  }, [prediction]);

  // n초마다 이미지 캡처하여 서버로 전송
  const startCapturing = () => {
    if (!intervalId && mode) {
      setPrediction('검사중');
      const id = setInterval(async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (video && video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

          const formData = new FormData();
          formData.append('image', imageBlob, 'webcam.png');
          formData.append('mode', mode);

          try {
            const response = await fetch('http://localhost:5000/predict', {
              method: 'POST',
              body: formData,
            });
            const result = await response.json();
            setPrediction(result.prediction);
            setOkCount(result.ok_count);
            setNgCount(result.ng_count);
            setDetectedObjects(result.detected_objects || []);
            drawDetectedObjects(result.detected_objects || []);
          } catch (error) {
            console.error('Error:', error);
          }
        }
      }, captureInterval);
      setIntervalId(id);
    }
  };

  // 캡처 중지
  const stopCapturing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // 모드 변경 시 기존 타이머 중지
  useEffect(() => {
    stopCapturing();
  }, [mode]);

  // 모드에 따른 텍스트 표시
  const getModeText = () => {
    switch (mode) {
      case 'inspect':
        return '검사(기본) 모드';
      case 'inspectSave':
        return '검사(저장) 모드';
      default:
        return '선택 전';
    }
  };

  // 객체 탐지 결과를 캔버스에 그리기
  const drawDetectedObjects = (objects) => {
    const video = videoRef.current;
    const overlayCanvas = overlayRef.current;
    if (!overlayCanvas) return;

    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;
    const ctx = overlayCanvas.getContext('2d');

    // 기존 그리기 내용 지우기
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // 박스 그리기
    objects.forEach(obj => {
      const [xmin, ymin, xmax, ymax] = obj.box;
      const width = xmax - xmin;
      const height = ymax - ymin;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(xmin * overlayCanvas.width, ymin * overlayCanvas.height, width * overlayCanvas.width, height * overlayCanvas.height);

      ctx.font = '16px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(`${obj.class} (${(obj.score * 100).toFixed(1)}%)`, xmin * overlayCanvas.width, ymin * overlayCanvas.height - 10);
    });
  };

  return (
    <div className="container">
      <h2>OspreyAI System - {modelName}</h2>

      <div className="main-content">
        {/* 왼쪽: 비디오 촬영 박스 */}
        <div className="left-panel">
          <div className={`video-container ${prediction}`}>
            <video ref={videoRef} autoPlay />
            <canvas ref={overlayRef} className="overlay-canvas" />
          </div>
        </div>

        {/* 오른쪽: 설정 및 검사 결과 */}
        <div className="right-panel">
          {/* 시간 간격 선택 */}
          <div className="input-group">
            <label htmlFor="captureInterval">촬영 간격 (밀리초): </label>
            <input
              type="number"
              id="captureInterval"
              value={captureInterval}
              onChange={(e) => setCaptureInterval(parseInt(e.target.value))}
              min="100"
              step="100"
            />
          </div>

          {/* 모드 선택 버튼 */}
          <div className="button-group">
            <button onClick={() => setMode('inspect')}>검사(기본) 모드</button>
            <button onClick={() => setMode('inspectSave')}>검사(저장) 모드</button>
          </div>

          {/* 현재 선택된 모드 표시 */}
          <h3>현재 선택된 모드: {getModeText()}</h3>

          {/* 검사 결과 박스 */}
          <div className={`prediction-box ${prediction}`}>
            <h3>검사 결과</h3>
            <div className={`prediction-result ${prediction}`}>
              <h3>{prediction.toUpperCase()}</h3>
              {prediction === 'ng' && <p>불량입니다</p>}
            </div>
          </div>

          {/* 검사 카운트 표시 */}
          <div className="count-box">
            <p>총 검사 횟수: <strong>{okCount + ngCount}</strong></p>
            <p>OK: <strong>{okCount}</strong></p>
            <p>NG: <strong>{ngCount}</strong></p>
          </div>

        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      <div>
        <button onClick={startCapturing} disabled={intervalId !== null}>Start</button>
        <button onClick={stopCapturing} disabled={intervalId === null}>Stop</button>
      </div>
    </div>
  );
}

export default WebcamCapture;
