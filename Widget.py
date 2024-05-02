from ipywidgets import interactive, Layout, widgets
import matplotlib.pyplot as plt
from IPython.display import display, clear_output
import time
import geopandas as gpd
import plotly.graph_objects as go

from AggData import AggData
from Forecasting import prophet_forecast
from GraphGeneration import plot_scatter_graph, distribution_plots, plot_choropleth, create_spinner, create_gauge
from MapGeneration import create_sensor_spike_map_folium, plot_sensor_spikes
from RemoveOutliers import iqr_method, Remove_Suspect


def plot_line_graph_tab(var1, var2, remove_outliers):
    with line_graph_output:
        clear_output(wait=True)

        # Remove suspects and perform IQR if needed
        if remove_outliers:
            var1.df_downsampled = iqr_method(Remove_Suspect(var1.df))
            var2.df_downsampled = iqr_method(Remove_Suspect(var2.df))
            print("Outliers Removed")
        else:
            var1.df_downsampled = Remove_Suspect(var1.df)
            var2.df_downsampled = Remove_Suspect(var2.df)
            print("Outliers Included")

        # Downsample the data
        if not var1.downsampled:
            var1.downsample()
        if not var2.downsampled:
            var2.downsample()

        print("Downsampled")
        # Plot the line graphs
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 12), sharex=True)
        plot_scatter_graph(var1.df_downsampled, var1, ax=ax1)
        plot_scatter_graph(var2.df_downsampled, var2, ax=ax2)
        plt.show()


def plot_kde_plot_tab(var1, remove_outliers):
    with kde_plot_output:
        kde_plot_output.clear_output(wait=True)
        df1 = Remove_Suspect(var1.df)

        if remove_outliers:
            df1 = iqr_method(df1)
        print("Outliers Removed:" if remove_outliers else "Outliers Included:")


def plot_distribution_analysis_tab(var1, remove_outliers):
    with distribution_analysis_output:
        clear_output(wait=True)

        df1 = Remove_Suspect(var1.df)
        if remove_outliers:
            df1 = iqr_method(df1)

        print("Outliers Removed:" if remove_outliers else "Outliers Included:")

        distribution_plots(df1, var1.data_params)
        plt.show()


def plot_sensor_spike_map_tab(var1, scale_factor):
    # FOLIUM
    with sensor_spike_map_output:
        sensor_spike_map_output.clear_output()
        df1 = Remove_Suspect(var1.df)

        # Group by 'Sensor Centroid Latitude' and 'Sensor Centroid Longitude', and take the maximum 'Value'
        df_max = df1.groupby(['Sensor Centroid Latitude', 'Sensor Centroid Longitude'])['Value'].max().reset_index()

        # Convert the DataFrame to a GeoDataFrame
        gdf_max = gpd.GeoDataFrame(df_max, geometry=gpd.points_from_xy(df_max['Sensor Centroid Longitude'],
                                                                       df_max['Sensor Centroid Latitude']))

        sensor_spike_map = create_sensor_spike_map_folium(gdf_max, location=[54.9714, -1.6174], zoom_start=12,
                                                          scale_factor=scale_factor)
        display(sensor_spike_map)


def plot_sensor_map_tab(var1, scale_factor):
    with sensor_map_output:
        sensor_map_output.clear_output()
        a = AggData("PM2.5")
        df1 = Remove_Suspect(var1.df)

        # Group by 'Sensor Centroid Latitude' and 'Sensor Centroid Longitude', and take the maximum 'Value'
        df_max = df1.groupby(['Sensor Centroid Latitude', 'Sensor Centroid Longitude'])['Value'].max().reset_index()

        # Convert the DataFrame to a GeoDataFrame
        gdf_max = gpd.GeoDataFrame(df_max, geometry=gpd.points_from_xy(df_max['Sensor Centroid Longitude'],
                                                                       df_max['Sensor Centroid Latitude']))

        plot_sensor_spikes(gdf_max, scale_factor=scale_factor)


def plot_prophet_forecast_tab(var1):
    with prophet_forecast_output:
        prophet_forecast_output.clear_output()

        prophet_forecast(var1)


def plot_choropleth_tab(var1):
    with choropleth_output:
        choropleth_output.clear_output(wait=True)
        var1.df_downsampled = Remove_Suspect(var1.df)
        var1.downsample()
        gdf = gpd.GeoDataFrame(var1.df_downsampled,
                               geometry=gpd.points_from_xy(var1.df_downsampled['Sensor Centroid Longitude'],
                                                           var1.df_downsampled['Sensor Centroid Latitude']))
        plot_choropleth(gdf)


from IPython.display import HTML
from ipywidgets import Tab, VBox, Output, HBox


# Create separate output widgets for each tab
line_graph_output = Output()
distribution_analysis_output = Output()
sensor_spike_map_output = Output()
sensor_map_output = Output()
prophet_forecast_output = Output()
choropleth_output = Output()
kde_plot_output = Output()

# Create the dropdown widgets for selecting the data variables
variable_selector1 = widgets.Dropdown(
    options=['PM2.5', 'PM10', 'O3', 'Humidity', 'Wind Speed'],
    value='PM2.5',
    description='Variable 1:'
)

variable_selector2 = widgets.Dropdown(
    options=['PM2.5', 'PM10', 'O3', 'Humidity', 'Wind Speed'],
    value='O3',
    description='Variable 2:'
)

variable_selector1.options = ['PM2.5', 'PM10', 'O3', 'NO2', 'Humidity', 'Wind Speed', 'CO']
variable_selector2.options = ['PM2.5', 'PM10', 'O3', 'NO2', 'Humidity', 'Wind Speed', 'CO']

remove_outliers_checkbox = widgets.Checkbox(
    value=True,
    description='Remove Outliers',
    disabled=False,
    indent=False
)


def fetch_agg(variable1, _days):
    print(f"Fetching data for variable {variable1} and days {_days}")

    # Find the AggData instance with the selected data variables and days
    selected_agg_data1 = None

    for instance in AggData.instances:
        if instance.data_params["data_variable"] == variable1 and instance.days == _days:
            selected_agg_data1 = instance
        if selected_agg_data1 is not None:
            break

    # If an instance isn't found, create a new one
    if selected_agg_data1 is None:
        selected_agg_data1 = AggData(variable1, _days)

    return selected_agg_data1


last_selected_variables = [None, None]


def update_scale_factor(change):
    selected_index = tab_widget.selected_index
    if selected_index == 2:
        spinner = create_spinner()
        display(spinner)
        time.sleep(0.5)  # Add a small delay to make the spinner visible
        selected_agg_data1 = fetch_agg(variable_selector1.value, days_slider.value)
        with sensor_spike_map_output:  # Use the sensor_spike_map_output context to update the plot
            clear_output(wait=True)
            plot_sensor_spike_map_tab(selected_agg_data1, scale_factor_slider.value)
        clear_output(wait=True)
        display(tab_widget)


def update_choropleth_output(change=None, force_update=False):
    selected_agg_data1 = fetch_agg(variable_selector1.value, days_slider.value)
    plot_choropleth_tab(selected_agg_data1)


# Define a function to update the plot output based on the selected tab
def update_plot_output(change=None, force_update=False):
    global last_selected_variables
    selected_index = tab_widget.selected_index
    current_selected_variables = [variable_selector1.value, variable_selector2.value]

    if current_selected_variables == last_selected_variables and not force_update:
        return

    last_selected_variables = current_selected_variables

    # Fetch the AggData instances for the selected variables and days
    selected_agg_data1 = fetch_agg(variable_selector1.value, days_slider.value)
    selected_agg_data2 = fetch_agg(variable_selector2.value, days_slider.value)

    # Line Graph
    if selected_index == 0:
        plot_line_graph_tab(selected_agg_data1, selected_agg_data2, remove_outliers_checkbox.value)
    # KDE
    elif selected_index == 1:
        plot_distribution_analysis_tab(selected_agg_data1, remove_outliers_checkbox.value)
    # Sensor Spike
    elif selected_index == 2:
        plot_sensor_spike_map_tab(selected_agg_data1, scale_factor_slider.value)
    # Sensor Map
    elif selected_index == 3:
        plot_sensor_map_tab(selected_agg_data1, scale_factor_slider.value)
    # Prophet
    elif selected_index == 4:
        plot_prophet_forecast_tab(selected_agg_data1)
    elif selected_index == 5:
        plot_choropleth_tab(selected_agg_data1)


def update_plot_output_with_spinner(change=None, force_update=False):
    # Create and display spinner, update plot and clear
    print("Updating plot output with spinner")
    spinner = create_spinner()
    display(spinner)
    update_plot_output(change, force_update=True)
    print("Finished updating plot output")
    clear_output(wait=True)
    display(dashboard)


# Create the tab widget and add the update_plot_output function as a callback
tab_widget = Tab()
tab_widget.observe(update_plot_output, names='selected_index')

# Create scale factor slider
scale_factor_slider = widgets.FloatSlider(value=12, min=1, max=100, step=1, description='Scale Factor:',
                                          layout=Layout(width='50%'))
days_slider = widgets.SelectionSlider(
    options=[1, 3, 7, 28],
    value=7,
    description='Days:',
    layout=Layout(width='50%'),
    continuous_update=False
)

# Observe changes, update plot outputs
variable_selector1.observe(update_plot_output_with_spinner, names='value')
variable_selector2.observe(update_plot_output_with_spinner, names='value')
remove_outliers_checkbox.observe(update_plot_output_with_spinner, names='value')
scale_factor_slider.observe(update_scale_factor, names='value')
days_slider.observe(update_plot_output_with_spinner, names='value')
variable_selector1.observe(update_choropleth_output, names='value')
days_slider.observe(update_choropleth_output, names='value')

box_layout = widgets.Layout(display='flex', flex_flow='column', align_items='stretch', width='100%')

layout = widgets.Layout(width='100%', height='800px')

# Create the tab content
line_graph_tab = VBox(
    [variable_selector1, variable_selector2, remove_outliers_checkbox, days_slider, line_graph_output])
distribution_analysis_tab = VBox(
    [variable_selector1, remove_outliers_checkbox, days_slider, distribution_analysis_output])
sensor_spike_map_tab = VBox([variable_selector1, sensor_spike_map_output, scale_factor_slider, days_slider],
                            layout=layout)
sensor_map_tab = VBox([variable_selector1, sensor_map_output, scale_factor_slider, days_slider])
prophet_forecast_tab = VBox([variable_selector1, prophet_forecast_output, days_slider])
choropleth_map_tab = VBox([variable_selector1, choropleth_output, days_slider])

# Configure the tab widget
tab_widget.children = [line_graph_tab, distribution_analysis_tab, sensor_spike_map_tab, sensor_map_tab,
                       choropleth_map_tab, prophet_forecast_tab]

tab_widget.set_title(0, 'Scatter Graph')
tab_widget.set_title(1, 'Distribution Analysis')
tab_widget.set_title(2, 'Sensor Spike Map')
tab_widget.set_title(3, 'Sensor Map')
tab_widget.set_title(4, 'Choropleth Map')
tab_widget.set_title(5, 'Prophet Forecast')

tab_widget.observe(update_plot_output, names='selected_index')


def initialize_plots():
    loading_screen = create_loading_screen()
    display_loading_screen(loading_screen)

    update_all_plot_outputs()

    clear_output(wait=True)
    display(tab_widget)

    clear_output(wait=True)
    display(dashboard)


def create_loading_screen():
    loading_screen = Output()
    with loading_screen:
        print("Loading...")
    return loading_screen


def display_loading_screen(loading_screen):
    display(loading_screen)
    time.sleep(1)
    clear_output(wait=True)


def update_all_plot_outputs():
    for index in range(len(tab_widget.children)):
        tab_widget.selected_index = index
        update_plot_output(force_update=True)
        time.sleep(1)


def create_gauges():
    pm25 = fetch_agg('PM2.5', 1)
    pm10 = fetch_agg('PM10', 1)
    no2 = fetch_agg('NO2', 1)
    # Create the gauge charts
    # Pass in 24hr mean
    pm25_gauge = create_gauge("PM2.5", pm25.get_mean_average())
    pm10_gauge = create_gauge("PM10", pm10.get_mean_average())
    no2_gauge = create_gauge("NO2", no2.get_mean_average())
    # Create a VBox for the gauges
    return VBox([go.FigureWidget(pm25_gauge), go.FigureWidget(no2_gauge)])
    # return VBox([go.FigureWidget(pm25_gauge), go.FigureWidget(pm10_gauge)])


def display_gauges():
    global gauges
    gauges = create_gauges()
    dashboard.children = [tab_widget, gauges]


gauges = create_gauges()
gauges.layout.width = '35%'
dashboard = HBox([tab_widget, gauges])
initialize_plots()
