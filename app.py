from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO

from AggData import AggData
from RemoveOutliers import Remove_Suspect, iqr_method

app = Flask(__name__)
socketio = SocketIO(app)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@app.route("/")
def hello_world():
    return "Hello, cross-origin-world!"


@app.route("/api/data/<variable>", methods=['GET'])
def get_data(variable):
    days = request.args.get('days', default=1, type=int)
    remove_outliers = request.args.get('remove_outliers', default=True, type=bool)

    try:
        data_instance = AggData(variable, days)

        # Remove suspects and perform IQR if needed
        data_instance.df = Remove_Suspect(data_instance.df)
        if remove_outliers:
            data_instance.df = iqr_method(data_instance.df)

        # Down-sample the data
        data_instance.df_downsampled = data_instance.df
        data_instance.downsample()

        print("Down-sampled")
        return jsonify(data_instance.df_downsampled.to_dict(orient='records')), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    socketio.run(app, debug=True)  # Integrating SocketIO with Flask and enabling debug
