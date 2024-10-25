import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate로 변경
import './WebcamCapture.css'; // Import the CSS

function WebcamCapture() {
  const [modelName, setModelName] = useState(''); // State to hold the model name
  const [prediction, setPrediction] = useState('검사전'); // 초기 상태는 '검사전'
  const [okCount, setOkCount] = useState(0); // OK 카운트
  const [ngCount, setNgCount] = useState(0); // NG 카운트
  const [intervalId, setIntervalId] = useState(null); // 타이머 ID 저장
  const [mode, setMode] = useState(''); // 현재 모드 ('inspect', 'inspectSave')
  const [captureInterval, setCaptureInterval] = useState(1000); // 몇 초마다 촬영할지 (기본값 1초)
  const videoRef = useRef(null); // 웹캠 스트림을 표시할 비디오 엘리먼트
  const canvasRef = useRef(null); // 이미지를 캡처할 캔버스
  const navigate = useNavigate(); // 페이지 이동을 감지하는 useNavigate 훅 사용

  // 웹캠 스트림 시작
  useEffect(() => {
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }

    startWebcam();

    // 페이지 이동 시 웹캠 종료 처리
    const stopWebcam = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };

    // 페이지가 언마운트되거나 닫힐 때 웹캠 스트림 중지
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
        setModelName(data.model_name);
      } catch (error) {
        console.error('Error fetching model name:', error);
      }
    };

    fetchModelName();
  }, []);

  // prediction 상태 변경 감지
  useEffect(() => {
    if (prediction === 'ng') {
      console.log('불량입니다!');
      stopCapturing(); // NG일 경우 자동으로 Stop
    } else if (prediction === 'ok') {
      console.log('양품입니다!');
    }
  }, [prediction]);

  // n초마다 이미지 캡처하여 서버로 전송
  const startCapturing = () => {
    if (!intervalId && mode) {
      setPrediction('검사중'); // 검사 중으로 변경
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
            setPrediction(result.prediction); // OK 또는 NG로 변경
            setOkCount(result.ok_count); // OK 카운트 업데이트
            setNgCount(result.ng_count); // NG 카운트 업데이트
          } catch (error) {
            console.error('Error:', error);
          }
        }
      }, captureInterval); // 지정된 시간 간격으로 실행
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
    stopCapturing(); // 모드가 바뀔 때 캡처를 중지
  }, [mode]);

  // 모드에 따른 텍스트 표시
  const getModeText = () => {
    switch (mode) {
      case 'inspect':
        return '검사(기본) 모드';
      case 'inspectSave':
        return '검사(촬영) 모드';
      default:
        return '선택 전';
    }
  };

  return (
    <div className="container">
      <h2>OspreyAI System - {modelName}</h2>

      <div className="main-content">
        {/* 왼쪽: 비디오 촬영 박스 */}
        <div className="left-panel">
          <div className={`video-container ${prediction}`}>
            <video ref={videoRef} autoPlay />
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
