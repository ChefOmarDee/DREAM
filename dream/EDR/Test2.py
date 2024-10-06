import requests

def get_average_wind_speed(start_date, end_date, latitude, longitude):
    # Define the Open-Meteo API endpoint
    url = "https://api.open-meteo.com/v1/forecast"

    # Set the parameters for the API request
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start": start_date,
        "end": end_date,
        "hourly": "wind_speed_10m",
        "timezone": "auto"  # Automatically adjust for the local timezone
    }

    # Make the API request
    response = requests.get(url, params=params)

    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        # Extract wind speeds from the data
        wind_speeds = data['hourly']['wind_speed_10m']
        
        # Calculate the average wind speed
        average_wind_speed = sum(wind_speeds) / len(wind_speeds) if wind_speeds else 0
        return average_wind_speed
    else:
        print("Error:", response.status_code, response.text)
        return None

# Example usage
start_date = "2023-10-01T00:00:00Z"
end_date = "2024-10-02T00:00:00Z"
latitude = 27.6388  # Vero Beach, Florida
longitude = -80.3970

average_wind_speed = get_average_wind_speed(start_date, end_date, latitude, longitude)
