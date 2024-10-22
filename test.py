
# USAGE:
# python test.py -m model -d testdata -i result

import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import os
import shutil
import argparse

# 이미지 전처리 함수
def preprocess_image(image_path, target_size=(150, 150)):
    """
    이미지를 모델 입력에 맞게 전처리
    이미지 크기 조정 및 정규화 수행함
    """
    img = load_img(image_path, target_size=target_size)
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # 0~1 범위로 정규화
    return img_array

# 모델 경로에서 .h5 파일을 자동으로 찾는 함수
def find_model_file(model_path):
    """
    입력된 경로가 디렉토리일 경우 해당 디렉토리에서 .h5 파일을 찾아 반환.
    """
    if os.path.isdir(model_path):
        for file_name in os.listdir(model_path):
            if file_name.endswith('.h5'):
                return os.path.join(model_path, file_name)
        raise FileNotFoundError("디렉토리 내에 .h5 모델 파일이 없습니다.")
    elif os.path.isfile(model_path) and model_path.endswith('.h5'):
        return model_path
    else:
        raise ValueError("유효한 모델 파일(.h5)이 아닙니다.")

# 이미지 예측 및 분류 함수
def classify_images_in_directory(model, dataset_directory, result_directory):

    ok_dir = os.path.join(result_directory, 'OK')
    ng_dir = os.path.join(result_directory, 'NG')
    
    os.makedirs(ok_dir, exist_ok=True)
    os.makedirs(ng_dir, exist_ok=True)

    for filename in os.listdir(dataset_directory):
        file_path = os.path.join(dataset_directory, filename)
        
        # Only process image files
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            print(f"Processing file: {file_path}") 

            # Preprocess the image
            processed_image = preprocess_image(file_path)

            prediction = model.predict(processed_image)
            print(f"Prediction result: {prediction}")  

            prediction_value = prediction[0][0]

            result = 'OK' if prediction_value > 0.5 else 'NG'
            target_folder = ok_dir if result == 'OK' else ng_dir

            shutil.move(file_path, os.path.join(target_folder, filename))
            
            print(f"Image: {filename}, Classified as: {result}, Probability: {prediction_value:.4f}")


# 명령줄 인수 처리
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="이미지 분류기")
    
    parser.add_argument('-d', '--directory', type=str, required=True, help="이미지가 저장된 폴더 경로")
    parser.add_argument('-i', '--result', type=str, required=True, help="결과를 저장할 폴더명")
    parser.add_argument('-m', '--model', type=str, required=True, help="모델 파일 또는 모델 디렉토리 경로")
    
    # 인수 파싱
    args = parser.parse_args()
    
    # 모델 파일 로드 (경로가 디렉토리일 경우 .h5 파일을 찾아서 로드)
    model_file = find_model_file(args.model)
    model = load_model(model_file)

    # 결과 폴더 경로 생성
    result_directory = os.path.join(args.result)
    os.makedirs(result_directory, exist_ok=True)
    
    # 이미지 분류 수행
    classify_images_in_directory(model, args.directory, result_directory)
