import React, { useState } from 'react';

function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [imagePath, setImagePath] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('model_type', 'resnet'); // 'cnn'으로 변경 가능

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setPrediction(result.prediction);
      setImagePath(result.image_path);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Upload an image for classification</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Submit</button>
      </form>
      {prediction && (
        <div>
          <h2>Prediction: {prediction}</h2>
          <p>Saved image path: {imagePath}</p>
        </div>
      )}
    </div>
  );
}

export default Upload;
