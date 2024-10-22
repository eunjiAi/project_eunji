import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam

# 즉시 실행 모드 활성화 (디버깅을 위해)
tf.config.run_functions_eagerly(True)

# ResNet50 모델 불러오기 (ImageNet 가중치 사용, Fully Connected Layer는 제외)
base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(150, 150, 3))

# ResNet50의 기존 레이어는 학습되지 않도록 고정 (전이 학습을 위해)
base_model.trainable = False

# 모델 구조 정의 (ResNet50을 기본으로, 상단에 나만의 레이어 추가)
model = Sequential([
    base_model,
    Flatten(),  # 2D -> 1D 변환
    Dense(512, activation='relu'),  # 완전 연결 레이어
    Dense(1, activation='sigmoid')  # 이진 분류 레이어 (OK/NG)
])

# 모델 컴파일 (Adam 옵티마이저와 이진 교차 엔트로피 손실 사용, run_eagerly=True 추가)
model.compile(optimizer=Adam(learning_rate=0.0001), loss='binary_crossentropy', metrics=['accuracy'], run_eagerly=True)

# 데이터 준비
train_dir = 'data/train'
validation_dir = 'data/validation'

train_datagen = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

validation_datagen = ImageDataGenerator(rescale=1.0/255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

validation_generator = validation_datagen.flow_from_directory(
    validation_dir,
    target_size=(150, 150),
    batch_size=32,
    class_mode='binary'
)

# 모델 학습
history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // train_generator.batch_size,
    epochs=10,  # 학습 에포크 수 (필요에 따라 조정 가능)
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // validation_generator.batch_size
)

# 모델 저장
model.save('resnet50_image_classifier_model.h5')
