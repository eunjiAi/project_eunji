from flask import Flask, request, jsonify
import tensorflow as tf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 모델 로드
resnet_model = tf.keras.models.load_model('models/resnet50_image_classifier_model.h5')
cnn_model = tf.keras.models.load_model('models/small_cnn_model.h5')

@app.route('/predict', methods=['POST'])
def predict():
    model_type = request.form.get('model_type')
    image_data = request.files['image'].read()

    # 이미지 전처리 코드 (예시)
    img = tf.image.decode_image(image_data, channels=3)
    img = tf.image.resize(img, [224, 224])
    img = tf.expand_dims(img, axis=0)

    # 모델 선택
    if model_type == 'resnet':
        prediction = resnet_model.predict(img)
    else:
        prediction = cnn_model.predict(img)

    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(debug=True)
