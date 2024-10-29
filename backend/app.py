from flask import Flask, request, jsonify
import tensorflow as tf
from flask_cors import CORS
import os
from datetime import datetime
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)  

# 모델이 저장된 디렉토리 설정
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
            return os.path.join(models_dir, file), file      # 파일 경로와 파일명을 함께 반환
    return None, None

# 분류 모델 로드 함수
def load_classification_model():
    model_path, model_filename = find_model_file(MODELS_DIR)
    if model_path:
        model = tf.keras.models.load_model(model_path)
        print(f"Classification Model loaded: {model_path}")
        return model, model_filename
    else:
        print("No classification model file found in models directory.")
        return None, None

# 객체 탐지 모델 로드 함수
def load_object_detection_model():
    # TensorFlow Object Detection API 모델 로드
    detection_model_dir = os.path.join(MODELS_DIR, 'object_detection', 'ssd_mobilenet_v2_fpnlite_320x320_coco17_tpu-8', 'saved_model')
    detection_model = tf.saved_model.load(detection_model_dir)
    print(f"Object Detection Model loaded from: {detection_model_dir}")
    return detection_model

# 라벨 맵 로드
def load_labels(path):
    with open(path, 'r') as file:
        labels = {}
        for line in file:
            if "id:" in line:
                id = int(line.strip().split(' ')[-1])
            if "display_name:" in line:
                name = line.strip().split(' ')[-1].strip('"')
                labels[id] = name
    return labels

# 모델 로드
classification_model, classification_model_filename = load_classification_model()
object_detection_model = load_object_detection_model()
labels_path = os.path.join(MODELS_DIR, 'object_detection', 'mscoco_label_map.pbtxt')
labels = load_labels(labels_path)

if classification_model and classification_model_filename:
    model_name = classification_model_filename.replace('.h5', '')  # 파일명에서 .h5를 제거한 모델명
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

# 객체 탐지 함수
def detect_objects(image):
    input_tensor = tf.convert_to_tensor(image)
    input_tensor = input_tensor[tf.newaxis, ...]
    detections = object_detection_model(input_tensor)

    # 결과 처리
    num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0, :num_detections].numpy()
                  for key, value in detections.items()}
    detections['num_detections'] = num_detections

    # detection_classes는 1부터 시작
    detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

    # 필터링 (신뢰도 0.5 이상)
    confidence_threshold = 0.5
    boxes = detections['detection_boxes']
    classes = detections['detection_classes']
    scores = detections['detection_scores']

    detected_objects = []
    for box, cls, score in zip(boxes, classes, scores):
        if score < confidence_threshold:
            continue
        ymin, xmin, ymax, xmax = box
        detected_objects.append({
            'class': labels.get(cls, 'N/A'),
            'score': float(score),
            'box': [float(xmin), float(ymin), float(xmax), float(ymax)]
        })
    return detected_objects

@app.route('/predict', methods=['POST'])
def predict():
    global ok_count, ng_count  # OK/NG 카운트 접근

    if not classification_model:
        return jsonify({'error': 'No classification model loaded'}), 500

    # 이미지 파일 받기
    image_file = request.files['image']
    
    # 파일 이름 가져오기
    image_filename = image_file.filename

    # 이미지 전처리 (분류)
    img = tf.image.decode_image(image_file.read(), channels=3)
    img_resized = tf.image.resize(img, [150, 150]) 
    img_resized = tf.expand_dims(img_resized, axis=0)

    # 분류 모델 예측
    classification_prediction = classification_model.predict(img_resized)
    classification_label = 'ok' if classification_prediction[0][0] > 0.5 else 'ng'

    # OK/NG 카운트 증가
    if classification_label == 'ok':
        ok_count += 1
    else:
        ng_count += 1

    # 이미지 다시 로드 (객체 탐지를 위해)
    image_file.seek(0)  # 파일 포인터를 처음으로 되돌림
    image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # 객체 탐지 수행
    detected_objects = detect_objects(image_rgb)

    # 콘솔에 예측 결과 출력
    print(f"Classification result for {image_filename}: {classification_label}")
    print(f"Detected Objects: {detected_objects}")

    # 모드에 따라 다른 처리 수행
    mode = request.form.get('mode')  # 클라이언트에서 모드 받아오기 (inspect, inspectSave)

    response = {
        'prediction': classification_label,
        'ok_count': ok_count,
        'ng_count': ng_count,
        'detected_objects': detected_objects
    }

    if mode == 'capture':
        # 기본 촬영 모드: Capture 폴더에 저장
        create_folder_if_not_exists(CAPTURE_DIR)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_path = os.path.join(CAPTURE_DIR, f'{timestamp}_capture.png')
        cv2.imwrite(image_path, image)
        response['message'] = f'Image saved at {image_path}'

    elif mode == 'inspect':
        # 검사(기본) 모드: 로그에 저장
        log_inspection_result(classification_label)
        response['message'] = 'Result logged'

    elif mode == 'inspectSave':
        # 검사(촬영) 모드: Result 폴더에 저장
        create_folder_if_not_exists(RESULT_DIR)
        create_folder_if_not_exists(os.path.join(RESULT_DIR, classification_label))
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        image_path = os.path.join(RESULT_DIR, classification_label, f'{timestamp}_{classification_label}.png')
        cv2.imwrite(image_path, image)
        response['message'] = f'Image saved at {image_path}'

    else:
        return jsonify({'error': 'Invalid mode selected'}), 400

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
