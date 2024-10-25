from flask import Flask, request, jsonify
import tensorflow as tf
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # CORS 설정 추가

# 모델이 저장된 디렉토리 설정 (주어진 경로로 변경)
MODELS_DIR = r'D:\eunjiAi\project_eunji\backend\models'

# 기본 저장 경로 설정
BASE_DIR = r'C:\Users\ict01-20\OneDrive\바탕 화면\projectUpload'
RESULT_DIR = os.path.join(BASE_DIR, 'result')
CAPTURE_DIR = os.path.join(BASE_DIR, 'Capture')
LOG_FILE_PATH = os.path.join(BASE_DIR, 'inspection_log.txt')

# OK/NG 카운트
ok_count = 0
ng_count = 0

# 폴더가 없으면 생성하는 함수
def create_folder_if_not_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

# models 폴더의 하위에서 .h5 파일 찾는 함수
def find_model_file(models_dir):
    for file in os.listdir(models_dir):
        if file.endswith('.h5'):
            return os.path.join(models_dir, file), file  #  파일 경로와 파일명을 함께 반환
    return None, None

# 모델 로드 함수
def load_model():
    model_path, model_filename = find_model_file(MODELS_DIR)
    if model_path:
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded: {model_path}")
        return model, model_filename
    else:
        print("No model file found in models directory.")
        return None, None

# 모델 로드 및 파일명에서 .h5를 제외한 모델명 추출
resnet_model, model_filename = load_model()
if resnet_model and model_filename:
    model_name = model_filename.replace('.h5', '')  # 파일명에서 .h5를 제거한 모델명
else:
    model_name = 'No model loaded'

# 검사(기본) 모드 시 로그 기록 함수
def log_inspection_result(label):
    # 로그 파일이 저장될 폴더가 없으면 생성
    create_folder_if_not_exists(BASE_DIR)
    # 로그 파일에 결과 기록
    with open(LOG_FILE_PATH, 'a') as log_file:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_file.write(f"{timestamp} - Prediction: {label}\n")

# 모델 이름을 반환하는 엔드포인트 추가
@app.route('/model-name', methods=['GET'])
def get_model_name():
    return jsonify({'model_name': model_name})

@app.route('/predict', methods=['POST'])
def predict():
    global ok_count, ng_count  # OK/NG 카운트 접근

    if not resnet_model:
        return jsonify({'error': 'No model loaded'}), 500

    # 이미지 파일 받기
    image_file = request.files['image']
    
    # 파일 이름 가져오기
    image_filename = image_file.filename

    # 이미지 전처리
    img = tf.image.decode_image(image_file.read(), channels=3)
    img = tf.image.resize(img, [150, 150]) 
    img = tf.expand_dims(img, axis=0)

    # 모델 예측
    prediction = resnet_model.predict(img)

    # 예측 결과에 따라 라벨 설정 (0.5 기준)
    label = 'ok' if prediction[0][0] > 0.5 else 'ng'

    # OK/NG 카운트 증가
    if label == 'ok':
        ok_count += 1
    else:
        ng_count += 1

    # 콘솔에 예측 결과 출력
    print(f"Prediction result for {image_filename}: {label}")

    # 모드에 따라 다른 처리 수행
    mode = request.form.get('mode')  # 클라이언트에서 모드 받아오기 (capture, inspect, inspectSave)

    if mode == 'capture':
        # 기본 촬영 모드: Capture 폴더에 저장
        create_folder_if_not_exists(CAPTURE_DIR)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_path = os.path.join(CAPTURE_DIR, f'{timestamp}_capture.png')
        tf.keras.preprocessing.image.save_img(image_path, img[0])
        return jsonify({'message': f'Image saved at {image_path}'})

    elif mode == 'inspect':
        # 검사(기본) 모드: 로그에 저장
        log_inspection_result(label)
        return jsonify({'message': 'Result logged', 'prediction': label, 'ok_count': ok_count, 'ng_count': ng_count})

    elif mode == 'inspectSave':
        # 검사(촬영) 모드: Result 폴더에 저장
        create_folder_if_not_exists(RESULT_DIR)
        create_folder_if_not_exists(os.path.join(RESULT_DIR, label))
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_path = os.path.join(RESULT_DIR, label, f'{timestamp}_{label}.png')
        tf.keras.preprocessing.image.save_img(image_path, img[0])
        return jsonify({'message': f'Image saved at {image_path}', 'prediction': label, 'ok_count': ok_count, 'ng_count': ng_count})

    else:
        return jsonify({'error': 'Invalid mode selected'}), 400

if __name__ == '__main__':
    app.run(debug=True)
