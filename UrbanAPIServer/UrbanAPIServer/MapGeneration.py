
def plot_sensor_spikes(df, scale_factor=100):
    """
    Plots geographical spikes on a map based on sensor data values and their locations.

    Parameters:
    - df (DataFrame): DataFrame with sensor data including 'Sensor Centroid Longitude', 'Sensor Centroid Latitude', and 'Value'.
    - scale_factor (int, optional): A factor to scale the spike lengths by, defaulting to 100.

    Returns:
    - None: Displays a plot with spikes indicating sensor data values at different locations.
    """

    scale_factor = scale_factor * 10
    # Convert the DataFrame to a GeoDataFrame
    gdf = gpd.GeoDataFrame(df,
                           geometry=gpd.points_from_xy(df['Sensor Centroid Longitude'], df['Sensor Centroid Latitude']))

    # Set CRS for the GeoDataFrame
    gdf = gdf.set_crs("EPSG:4326")
    gdf = gdf.to_crs("EPSG:3857")

    # Set all angles to 0 degrees (up)
    gdf['angle'] = 0

    # Create the create_spike function as before, but set the angle to 0 degrees (up)
    def create_spike(row, scale_factor):
        centroid = row.geometry.centroid

        # Apply the log transformation to the 'Value' column
        # Use np.log1p to compute the natural logarithm of one plus the input array, element-wise
        # This function provides greater precision for small input values
        spike_length = np.log1p(row['Value']) * scale_factor

        angle = 0  # Set the angle to 0 degrees (up)

        end_y = centroid.y + spike_length * np.cos(np.deg2rad(angle))
        end_x = centroid.x + spike_length * np.sin(np.deg2rad(angle))
        spike_line = LineString([(centroid.x, centroid.y), (end_x, end_y)])

        return spike_line

    # Create a copy of the GeoDataFrame and apply the create_spike function
    gdf_spikes = gdf.copy()
    gdf_spikes['geometry'] = gdf.apply(create_spike, scale_factor=scale_factor, axis=1)

    # Plot the spikes on the map
    fig, ax = plt.subplots(figsize=(10, 10))
    # gdf.geometry.plot(ax=ax, markersize=10, color='blue')  # Sensor locations dots
    gdf_spikes.plot(ax=ax, linewidth=2, color='#FF7518')
    plt.axis('equal')  # Set equal aspect ratio

    # Add basemap
    ctx.add_basemap(ax, source=ctx.providers.CartoDB.Positron)
    ax.set_axis_off()
    print("Logarithm")
    plt.show()


import folium
from joblib import Parallel, delayed
from scipy.stats.mstats import winsorize
from branca.colormap import linear
import geopandas as gpd
from shapely.geometry import LineString
import numpy as np


def create_folium_spike(row, scale_factor):
    """
    Creates a GeoJSON feature representing a spike for a single sensor reading. For use by folium map generator.

    Parameters:
    - row (Series): A pandas Series that must include 'Value' and 'geometry' representing the sensor's location.
    - scale_factor (float): Scaling factor to adjust the length of the spike.

    Returns:
    - dict: A GeoJSON dictionary representing the spike from the sensor's location upward.
    """

    centroid = row.geometry.centroid
    spike_length = row['Value'] * scale_factor
    angle = 0  # Set the angle to 0 degrees (up)

    end_y = centroid.y + spike_length * np.cos(np.deg2rad(angle))
    end_x = centroid.x + spike_length * np.sin(np.deg2rad(angle))
    spike_line = LineString([(centroid.x, centroid.y), (end_x, end_y)])

    # Convert the spike's coordinates from Web Mercator to WGS84
    spike_wgs84 = gpd.GeoSeries(spike_line, crs="EPSG:3857").to_crs("EPSG:4326").iloc[0]

    # Calculate the coordinates for the top of the spike
    top_coords = [spike_wgs84.coords[1][0], spike_wgs84.coords[1][1]]

    # Return a GeoJSON Feature for the spike
    return {
        "type": "Feature",
        "properties": {
            "Value": row["Value"],
            "TopCoords": top_coords  # Include the top coordinates in the properties
        },
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [spike_wgs84.coords[0][0], spike_wgs84.coords[0][1]],  # Start of the line (base of the spike)
                [spike_wgs84.coords[1][0], spike_wgs84.coords[1][1]]  # End of the line (tip of the spike)
            ]
        }
    }


def create_sensor_spike_map_folium(gdf, location=[54.9714, -1.6174], zoom_start=12, scale_factor=100):
    """
    Creates an interactive map using Folium with spikes representing sensor data values.

    Parameters:
    - gdf (GeoDataFrame): GeoDataFrame containing sensor data with a 'Value' column and geometry defined.
    - location (list, optional): The initial center for the Folium map in latitude and longitude. Defaults to [54.9714, -1.6174].
    - zoom_start (int, optional): Initial zoom level for the Folium map. Defaults to 12.
    - scale_factor (int, optional): Factor to scale the sensor data values for spike representation. Defaults to 100.

    Returns:
    - folium.Map: A Folium Map object with spikes representing sensor data values.
    """

    # Create an empty Folium Map object centered at Newcastle upon Tyne
    m = folium.Map(
        location=location,
        zoom_start=zoom_start,
        tiles='cartodbpositron',
        control_scale=True,
        prefer_canvas=True,
        background_color='black',
        fill_color='rgba(0, 0, 0, 0.2)'
    )

    # Set CRS for the GeoDataFrame
    gdf = gdf.set_crs("EPSG:4326", allow_override=True)
    gdf = gdf.to_crs("EPSG:3857")

    # Filter out rows with missing values
    gdf_filtered = gdf.dropna(subset=['Value'])

    # Winsorize the 'Value' column
    gdf_filtered['Value'] = winsorize(gdf_filtered['Value'], limits=[0.05, 0.05])

    gdf_filtered['geometry'] = gdf.geometry.buffer(0.001)

    # Create a colormap for the 'Value' column
    colormap = linear.Oranges_09.scale(gdf_filtered['Value'].min(), gdf_filtered['Value'].max())
    colormap.caption = 'Values'  # Set the legend label here

    # Parallelize the spike creation
    n_jobs = -1  # Use all available cores
    spikes = Parallel(n_jobs=n_jobs) \
        (delayed(create_folium_spike)(row, scale_factor) for index, row in gdf_filtered.iterrows())

    # Add the spikes to the map as GeoJSON
    folium.GeoJson(
        data={
            "type": "FeatureCollection",
            "features": spikes
        },
        style_function=lambda feature: {
            "color": colormap(feature["properties"]["Value"]),
            "weight": 2.5,
            "opacity": 0.8,
        },
        tooltip=folium.GeoJsonTooltip(
            fields=["Value"],
            aliases=["Top Value"],
            localize=True
        )
    ).add_to(m)

    colormap.add_to(m)

    return m
