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

