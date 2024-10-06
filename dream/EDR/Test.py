import requests

# Define the endpoint with the actual collection and feature IDs
datetime = "2024-10-05T00:00:00Z--2024-10-08T00:00:00Z"
parameters = "wind_speed_10m:ms"
locations = "27.6386,80.3973"
username = "studentucf_hoffman_kamryn"
password = "5hX4m0InNk"
url = f"https://{username}:{password}@api.meteomatics.com/{datetime}/{parameters}/{locations}/html"




# Make the GET request
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    data = response.json()  # Parse the JSON response
    print("Data:", data)
else:
    print("Error:", response.status_code, response.text)
