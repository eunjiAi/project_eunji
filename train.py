import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 데이터셋 생성 및 전처리 (예시로 이미지 폴더 사용)
train_datagen = ImageDataGenerator(rescale=1./255)
train_generator = train_datagen.flow_from_directory(
    'data/train',  # 학습용 데이터 경로
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

# CNN 모델 정의 (예측 코드에 맞춘 CNN 구조)
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Flatten(),
    Dense(512, activation='relu'),
    Dense(1, activation='sigmoid')  # 이진 분류 (OK/NG)
])

# 모델 컴파일
model.compile(loss='binary_crossentropy',
              optimizer='adam',
              metrics=['accuracy'])

# 모델 학습
model.fit(train_generator, epochs=10)

# 학습된 모델 저장
model.save('models/1022train.h5')
