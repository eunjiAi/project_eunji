import React, { useState, useEffect, useRef } from 'react';

function WebcamCapture() {
  const [prediction, setPrediction] = useState(''); // 서버에서 받은 예측 결과
  const [intervalId, setIntervalId] = useState(null); // 타이머 ID 저장
  const [mode, setMode] = useState(''); // 현재 모드 ('capture', 'inspect', 'inspectSave')
  const videoRef = useRef(null); // 웹캠 스트림을 표시할 비디오 엘리먼트
  const canvasRef = useRef(null); // 이미지를 캡처할 캔버스

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
    return () => {
      // 컴포넌트 언마운트 시 웹캠 스트림 종료
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // prediction 상태 변경 감지
  useEffect(() => {
    if (prediction === 'ng') {
      console.log('불량입니다!');
    } else if (prediction === 'ok') {
      console.log('양품입니다!');
    }
  }, [prediction]);

  // 1초마다 이미지 캡처하여 서버로 전송
  const startCapturing = () => {
    if (!intervalId && mode) {
      const id = setInterval(async () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // video가 로드되면 width와 height에 접근
        if (video && video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

          if (mode === 'capture') {
            console.log("Captured image, no classification.");
          } else {
            // 검사 모드에서는 서버로 이미지 전송
            const formData = new FormData();
            formData.append('image', imageBlob, 'webcam.png');
            formData.append('mode', mode); // 모드에 따라 다르게 처리

            try {
              const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                body: formData,
              });
              const result = await response.json();
              setPrediction(result.prediction);

              if (mode === 'inspectSave') {
                console.log(`Saved image with prediction: ${result.prediction}`);
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }
        }
      }, 1000); // 1초마다 실행
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
      case 'capture':
        return '기본 촬영 모드';
      case 'inspect':
        return '검사(기본) 모드';
      case 'inspectSave':
        return '검사(촬영) 모드';
      default:
        return '선택 전';
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>웹캠 모드 선택</h2>

      {/* 모드 선택 버튼 */}
      <div>
        <button onClick={() => setMode('capture')}>캡쳐 모드</button>
        <button onClick={() => setMode('inspect')}>검사(기본) 모드</button>
        <button onClick={() => setMode('inspectSave')}>검사(저장) 모드</button>
      </div>

      {/* 현재 선택된 모드 표시 */}
      <h3 style={{ marginTop: '20px' }}>현재 선택된 모드: {getModeText()}</h3>

      <video ref={videoRef} autoPlay style={{ width: '600px', height: '600px', border: '1px solid black', marginTop: '20px' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={startCapturing} disabled={intervalId !== null}>Start</button>
        <button onClick={stopCapturing} disabled={intervalId === null}>Stop</button>
      </div>

      {/* 검사 결과에 따른 UI 표시 */}
      {prediction && (
        <div style={{
          marginTop: '20px', 
          border: prediction === 'ok' ? '5px solid green' : '5px solid red', 
          padding: '20px'
        }}>
          <h3>검사 결과: {prediction.toUpperCase()}</h3>
          {prediction === 'ng' && <p style={{ color: 'red', fontSize: '18px' }}>불량입니다!</p>}
        </div>
      )}
    </div>
  );
}

export default WebcamCapture;
