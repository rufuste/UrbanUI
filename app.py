from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO

from AggData import AggData
from Forecasting import prophet_forecast
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
    remove_outliers = request.args.get('remove_outliers', default='true').lower() in ['true', '1', 'yes']

    try:
        data_instance = AggData(variable, days)

        # Remove suspects and perform IQR if needed
        data_instance.df = Remove_Suspect(data_instance.df)
        if remove_outliers:
            data_instance.df = iqr_method(data_instance.df)

        # Down-sample the data, downsampling is performed upon the aggdata df downsampled attribute
        data_instance.df_downsampled = data_instance.df
        data_instance.downsample()

        print("Down-sampled")
        return jsonify(data_instance.df_downsampled.to_dict(orient='records')), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/forecast/<variable>", methods=['GET'])
def get_forecast(variable):
    days = request.args.get('days', default=30, type=int)
    try:
        data_instance = AggData(variable, days)
        forecast, mae = prophet_forecast(data_instance)
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict(orient='records')
        return jsonify({"forecast": forecast_data, "mae": mae}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/averages", methods=['GET'])
def get_averages():
    try:
        variable = request.args.get('variable')
        if not variable:
            return jsonify({"error": "Variable parameter is required"}), 400

        data_instance = AggData(variable, 1)
        mean_average = data_instance.get_mean_average()

        return jsonify({variable: mean_average}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    socketio.run(app, debug=True)  # Integrating SocketIO with Flask and enabling debug
