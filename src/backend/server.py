from flask import Flask, request, jsonify
from flask_cors import CORS
from uuid import uuid4

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

data = ["your", "data", "here"]

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def add_data():
    new_data = request.get_json()
    new_data['id'] = str(uuid4())
    data.append(new_data)
    return jsonify(new_data)

@app.route('/api/data/<id>', methods=['DELETE'])
def delete_data(id):
    global data
    data = [item for item in data if item['id'] != id]
    return jsonify({'id': id})

if __name__ == '__main__':
    app.run(debug=True)
