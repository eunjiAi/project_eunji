import React, { useState } from 'react';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(''); // 서버에서 받은 예측 결과
  const [imagePreview, setImagePreview] = useState(''); // 이미지 미리보기

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    // 이미지 미리보기 URL 생성
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model_type', 'cnn'); // CNN 모델 사용

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json(); // 서버에서 반환된 예측 결과 가져오기
      console.log(result); // 서버 응답을 확인하기 위한 로그
      setPrediction(result.prediction); // 예측 결과를 prediction 상태에 저장
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>분류할 이미지 업로드</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Submit</button>
      </form>

      {/* 이미지 미리보기 */}
      {imagePreview && (
        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Image</h3>
          <img src={imagePreview} alt="preview" style={{ maxWidth: '300px', maxHeight: '300px' }} />
        </div>
      )}

      {/* 예측 결과에 따른 OK 또는 NG 버튼 표시 */}
      {prediction && (
        <div style={{ marginTop: '20px' }}>
          {prediction === 'ok' ? ( // prediction 값이 'ok'일 경우
            <button style={{
              fontSize: '24px',
              padding: '20px 40px',
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>OK</button>
          ) : ( // prediction 값이 'ng'일 경우
            <button style={{
              fontSize: '24px',
              padding: '20px 40px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}>NG</button>
          )}
        </div>
      )}
    </div>
  );
}

export default Upload;
