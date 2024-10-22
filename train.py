import os
from flask import Flask, request, jsonify
import tensorflow as tf
from datetime import datetime

app = Flask(__name__)

# CNN 모델 로드
cnn_model = tf.keras.models.load_model('models/small_cnn_model.h5')

# 결과를 저장할 경로 설정
RESULT_DIR = r'C:\Users\ict01-20\OneDrive\바탕 화면\projectUpload\result'

# 결과 폴더 생성 함수
def create_result_folder():
    if not os.path.exists(RESULT_DIR):
        os.makedirs(RESULT_DIR)
    ok_path = os.path.join(RESULT_DIR, 'ok')
    ng_path = os.path.join(RESULT_DIR, 'ng')
    if not os.path.exists(ok_path):
        os.makedirs(ok_path)
    if not os.path.exists(ng_path):
        os.makedirs(ng_path)

@app.route('/predict', methods=['POST'])
def predict():
    # 이미지 파일 받기
    image_file = request.files['image']
    
    # 파일 이름 가져오기
    image_filename = image_file.filename

    # 이미지 전처리 (모델이 기대하는 크기: 150x150)
    img = tf.image.decode_image(image_file.read(), channels=3)
    img = tf.image.resize(img, [150, 150])
    img = tf.expand_dims(img, axis=0)  
    img = img / 255.0  

    # 모델 예측
    prediction = cnn_model.predict(img)

    # 예측 결과에 따라 라벨 설정 (0.5 기준)
    label = 'ok' if prediction[0][0] > 0.5 else 'ng'

    # 결과 파일 저장
    create_result_folder()
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    image_path = os.path.join(RESULT_DIR, label, f'{timestamp}_{label}.png')

    # 이미지를 저장
    tf.keras.preprocessing.image.save_img(image_path, img[0])

    # 콘솔 출력
    print(f"Image: {image_filename} | Prediction: {label} | Saved at: {image_path}")

    return jsonify({'prediction': label, 'image_path': image_path})

if __name__ == '__main__':
    app.run(debug=True)
