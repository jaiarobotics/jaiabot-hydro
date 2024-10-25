import requests
from pprint import pprint

url = 'http://localhost:40001/jaia/v0/annotations'

pointFeature = b'{"type": "Feature", "id": 1, "geometry": {"type": "Point", "coordinates": [41.64777, -71.27177]}, "properties": {"title": "Tada!", "marker-size": "large", "marker-color": "green", "data": {"depth": 50000, "salinity": 10}}}'

def show(response):
    try:
        # Check if the response is in JSON format
        if response.headers.get('Content-Type') == 'application/json':
            pprint(response.json())
        else:
            print("Response is not in JSON format:", response.text)
    except json.JSONDecodeError:
        print("Failed to decode JSON:", response.text)


response = requests.post(url, json=pointFeature)
show(response)
