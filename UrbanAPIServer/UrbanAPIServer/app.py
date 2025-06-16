from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from AggData import AggData
from RemoveOutliers import Remove_Suspect, iqr_method

app = Flask(__name__)
CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'


@app.route("/")
@cross_origin()
def helloWorld():
    return "Hello, cross-origin-world!"


if __name__ == '__main__':
    app.run()

@app.route('/data', methods=['POST'])
def process_data():
    content = request.json
    variable = content['variable']
    days = content.get('days', 1)

    # Initialize AggData
    data_instance = AggData(variable, days)
    data_instance.downsample()

    # Remove suspect and outlier data
    clean_data = Remove_Suspect(data_instance.df)
    clean_data = iqr_method(clean_data)

    # Convert to JSON
    result = clean_data.to_json(orient='records')
    return jsonify({'data': result})


if __name__ == '__main__':
    app.run(debug=True)
