import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from uuid import uuid4

# pip3 freeze > requirements.txt
# pip3 install -r requirements.txt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
app.config['CORS_HEADERS'] = 'Content-Type'

data = ["your", "data", "here"]

@app.route('/api/route', methods=['GET'])
def get_route():
    wp0 = request.args.get('wp0')
    wp1 = request.args.get('wp1')

    url = "https://dev.virtualearth.net/REST/V1/Routes/Walking"
    print(os.environ.get('REACT_APP_BING_MAPS_API_KEY'))
    response = requests.get(f"{url}?wp.0={wp0}&wp.1={wp1}&key={os.environ.get('REACT_APP_BING_MAPS_API_KEY')}&routeAttributes=routePath")

    return jsonify(response.json())

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
    app.run(port=4000, debug=True)
