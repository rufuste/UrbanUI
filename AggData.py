import requests
from IPython.display import GeoJSON
import pandas as pd
import io
import seaborn as sns
import numpy as np
from datetime import datetime, timedelta

from pathlib import Path


class AggData:
    instances = []
    data_params = {}
    df = pd.DataFrame()
    df_downsampled = pd.DataFrame()
    downsampled = False
    days = 0
    units = ""

    def __init__(self, variable, _days=1):
        self.days = _days

        self.data_params = dict(
            data_variable=variable,
            agg_method='median',
            agg_period='15mins',
            starttime=(datetime.now() - timedelta(days=_days)).strftime("%Y%m%d%H%M%S"),
            endtime=datetime.now().strftime("%Y%m%d%H%M%S"),
            sensor_type=variable
        )

        self.df = self.fetch_agg_data(self.data_params)

        try:
            self.units = self.df["Units"].iloc[0]  # Set units attribute
        except KeyError:
            print("Units column not found in DataFrame. Setting self.units to an empty string.")
            self.units = ""
        except IndexError:
            print("Units column is empty. Setting self.units to an empty string.")
            self.units = ""

        self.df_downsampled = self.df
        AggData.instances.append(self)

    def fetch_agg_data(self, data_params):
        # Set up filename with variable and number of days
        csv_filename = f"{data_params['data_variable']}_{(datetime.now() - datetime.strptime(data_params['starttime'], '%Y%m%d%H%M%S')).days}_days.csv"
        csv_path = Path(csv_filename)

        try:
            # Attempt to fetch data from API
            r = requests.get('http://uoweb3.ncl.ac.uk/api/v1.1/sensors/data/agg/csv/', data_params)

            # If site down for maintenance, catch
            if r.text.startswith("<!doctype html>\n<title>Site Maintenance</title>"):
                raise Exception("Maintenance")
            else:
                # Else set up dataframe and update csv
                df = pd.read_csv(io.StringIO(r.text))
                df.to_csv(csv_path, index=False)
                return df
        except Exception as e:
            # If site down for maintenance, attempt to load most recent csv
            if csv_path.exists():
                print(f"Loading data from {csv_path} due to API error: {e}")
                df = pd.read_csv(csv_path)
                return df
            else:
                raise Exception("Data not available due to API error and no local CSV file found.")

    def downsample(self):
        days = self.days
        if self.downsampled:
            print("Data is already downsampled.")
            return

        # Set target frequency based on the number of days
        target_frequency = self.get_target_frequency(days)

        # Resample the data
        self.df_downsampled['Timestamp'] = pd.to_datetime(self.df_downsampled['Timestamp'])
        self.df_downsampled.set_index('Timestamp', inplace=True)
        df_resampled = self.df_downsampled['Value'].resample(target_frequency).mean()
        df_resampled = df_resampled.to_frame().reset_index()
        df_resampled = pd.merge(df_resampled, self.df_downsampled.drop('Value', axis=1), on='Timestamp')

        # Update the object attributes
        self.df_downsampled = df_resampled
        # self.downsampled = True
        self.target_frequency = target_frequency
        print(f"Data has been downsampled to {target_frequency} resolution.")

    def get_target_frequency(self, days):
        if days == 1:
            return '15min'
        elif days == 3:
            return '1H'
        elif days == 7:
            return '2H'
        else:
            return '6H'

    def get_mean_average(self):
        return self.df['Value'].mean()

    def __str__(self):
        return f"{self.data_params['data_variable']}"

#
