import contextily as ctx
import matplotlib.pyplot as plt
import pandas as pd
import plotly.graph_objects as go
from ipywidgets import widgets
import geopandas as gpd


# Line Graph
def plot_line_graph(df, aggdata_instance, ax=None, figsize=(15, 10)):
    """
    Plots a line graph for sensor data over time.

    Parameters:
    - df (DataFrame): A pandas DataFrame containing the sensor data with columns 'Sensor Name', 'Timestamp', and 'Value'.
    - aggdata_instance (object): An instance of a class that contains attributes 'data_params' (dict) and 'units' (str).
    - ax (matplotlib.axes.Axes, optional): Pre-existing axes for the plot. Defaults to None, in which case a new figure and axes will be created.
    - figsize (tuple, optional): Figure size in inches (width, height). Defaults to (15, 10).

    Returns:
    - None: Modifies the ax object with the line plot or creates a new plot.
    """

    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)

    for sensor_name, sensor_data in df.groupby('Sensor Name'):
        datetimes = pd.to_datetime(sensor_data['Timestamp'])
        ax.plot(datetimes, sensor_data['Value'], color='#70A7C9')  # Set color to blue and remove label
        # FF7F50
        ax.set_xlabel("MMDDHH")
        # Add units to the y-axis label
        ylabel = f"{aggdata_instance.data_params['data_variable']} ({aggdata_instance.units})"
        ax.set_ylabel(ylabel)

    # ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left', ncol=2, fontsize=10)
    plt.tight_layout()


# Scatter Graph
def plot_scatter_graph(df, aggdata_instance, ax=None, figsize=(15, 10)):
    """
    Plots a scatter graph for sensor data points over time.

    Parameters:
    - df (DataFrame): A pandas DataFrame containing the sensor data with columns 'Sensor Name', 'Timestamp', and 'Value'.
    - aggdata_instance (object): An instance with attributes including 'data_params' (dict) which contains information about the data variable and 'units' (str) for measurement units.
    - ax (matplotlib.axes.Axes, optional): Pre-existing axes for the plot. If None, a new figure and axes will be created.
    - figsize (tuple, optional): The dimension of the figure in inches (width, height). Defaults to (15, 10).

    Returns:
    - None: Outputs a scatter plot either on the provided axes or on a new figure.
    """

    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)

    for sensor_name, sensor_data in df.groupby('Sensor Name'):
        datetimes = pd.to_datetime(sensor_data['Timestamp'])
        ax.scatter(datetimes, sensor_data['Value'], color='#70A7C9')

        ##2B8CBE
        # AED9E0.
        ax.set_xlabel("MMDDHH")
        # Add units to the y-axis label
        ylabel = f"{aggdata_instance.data_params['data_variable']} ({aggdata_instance.units})"
        ax.set_ylabel(ylabel)

    plt.tight_layout()


import seaborn as sns


# All dist plots
def distribution_plots(df, data_params):
    """
    Generates various distribution plots including box plots, KDE, and histograms for a given dataset.

    Parameters:
    - df (DataFrame): Pandas DataFrame containing the data with a 'Value' column to be analyzed.
    - data_params (dict): Dictionary containing details about the data such as 'data_variable' which describes the type of data being analyzed.

    Returns:
    - None: Displays multiple figures with distribution plots for the dataset.
    """

    sns.set_style("whitegrid")

    # Box plot with outliers
    plt.figure(figsize=(10, 6))
    sns.boxplot(x=df['Value'], width=0.6, color="#70A7C9",
                flierprops=dict(markerfacecolor='0.75', markersize=5, linestyle='none'))
    plt.title(f'Box Plot of {data_params["data_variable"]}', size=20, color="darkblue")
    plt.xlabel('Value', size=15, color="darkblue")
    plt.show()

    # Box plot without outliers
    plt.figure(figsize=(10, 6))
    sns.boxplot(x=df['Value'], width=0.6, color="#70A7C9", showfliers=False)
    plt.title(f'Box Plot of {data_params["data_variable"]} (outliers removed)', size=20, color="darkblue")
    plt.xlabel('Value', size=15, color="darkblue")
    plt.show()

    # kde plot
    plt.figure(figsize=(10, 6))
    sns.displot(data=df, x=df['Value'], kind="kde", color="darkorange", fill=True)
    plt.title('KDE Plot of Values', size=20, color="darkblue")
    plt.xlabel('Value', size=15, color="darkblue")
    plt.show()

    # Histogram plot
    plt.figure(figsize=(10, 6))
    sns.displot(data=df, x=df['Value'], color="#70A7C9", bins=30)
    plt.title('Histogram of Values', size=20, color="darkblue")
    plt.xlabel('Value', size=15, color="darkblue")
    plt.show()

    # Violin plot
    plt.figure(figsize=(12, 8))
    sns.violinplot(x=df['Value'], palette=["#70A7C9", "darkorange"], bw=.2, cut=1, linewidth=1)
    plt.title(f'Violin Plot of {data_params["data_variable"]}', size=20, color="darkblue")
    plt.xlabel('Value', size=15, color="darkblue")
    plt.ylabel('Frequency', size=15, color="darkblue")
    plt.show()


def create_gauge(variable, value):
    """
    Creates a gauge chart for environmental variables like PM2.5, NO2, or PM10.

    Parameters:
    - variable (str): The environmental variable for which the gauge is to be created ('PM2.5', 'NO2', 'PM10').
    - value (float): The current measured value for the specified variable.

    Returns:
    - go.Figure: A Plotly Gauge figure object that visually represents the specified value within defined safe and unsafe thresholds.

    Raises:
    - ValueError: If the specified variable is not one of the expected types ('PM2.5', 'NO2', 'PM10').
    """

    # Red start value at unsafe values
    if variable == 'PM2.5':
        max_value = 105
        red_start = 35
    elif variable == 'NO2':
        max_value = 75
        red_start = 25
    elif variable == 'PM10':
        max_value = 135
        red_start = 45

    else:
        raise ValueError("Invalid variable specified")

    gauge = go.Figure(go.Indicator(
        mode="gauge+number",
        value=value,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={'text': f"{variable}", 'font': {'size': 22}},
        gauge={
            'axis': {'range': [0, max_value], 'tickwidth': 1, 'tickcolor': "black"},
            'bar': {'color': "black"},
            'bgcolor': "white",
            'borderwidth': 0,
            'bordercolor': "white",
            'steps': [
                {'range': [0, red_start], 'color': '#70A7C9'},
                {'range': [red_start, max_value], 'color': '#FF8C00'}
            ],
        }
    ))

    # Set the size and margins of the gauge chart
    gauge.update_layout(
        width=300,
        height=300,
        margin=dict(l=20, r=20, t=20, b=20)
    )

    gauge.update_layout(autosize=True)
    return gauge


def plot_choropleth(gdf):
    """
    Plots a choropleth map using GeoDataFrame data, showing spatial distribution of values.

    Parameters:
    - gdf (GeoDataFrame): A GeoDataFrame with a 'Value' column to plot and geometries set in EPSG:4326 coordinate reference system.

    Returns:
    - None: Displays the choropleth map in a matplotlib figure with a basemap from contextily.
    """

    merged_gdf = gdf
    # Set CRS for the merged GeoDataFrame
    merged_gdf = merged_gdf.set_crs("EPSG:4326")
    merged_gdf = merged_gdf.to_crs("EPSG:3857")

    # Plot the choropleth map
    fig, ax = plt.subplots(figsize=(10, 10))
    merged_gdf.plot(column='Value', cmap='plasma', legend=True, ax=ax)
    plt.axis('equal')  # Set equal aspect ratio

    # Add basemap
    ctx.add_basemap(ax, source=ctx.providers.CartoDB.Positron)
    ax.set_axis_off()

    plt.show()


def create_spinner():
    spinner = widgets.HTML("""
        <div style="display: flex; justify-content: center;">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>
        <style>
        .lds-ring {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
        .lds-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          width: 64px;
          height: 64px;
          margin: 8px;
          border: 8px solid #5bc0de;
          border-radius: 50%;
          animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: #5bc0de transparent transparent transparent;
        }
        .lds-ring div:nth-child(1) {
          animation-delay: -0.45s;
        }
        .lds-ring div:nth-child(2) {
          animation-delay: -0.3s;
        }
        .lds-ring div:nth-child(3) {
          animation-delay: -0.15s;
        }
        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        </style>
    """)
    return spinner
