import requests

#response = requests.get('https://fleet1.jaia.tech/jaia/v1/task_packets/all?api_key=7iqwX29We76V7eaTvPF78g&start_time=1724617502000000&end_time=1724689502000000', verify='/home/ferrom/repos/jaiabot/jaia-fleet1.pem')
#response = requests.get('https://fleet1.jaia.tech/jaia/v1/status/all?api_key=7iqwX29We76V7eaTvPF78g', verify='/home/ferrom/repos/jaiabot/jaia-fleet1.pem')

response = requests.get('https://fleet3.jaia.tech/jaia/v1/task_packets/all?api_key=hjmQf1KsIJRTYcAmuEHsbg&start_time=1725944400000000&end_time=1726030800000000', verify='/home/ferrom/jaia-fleet3.crt')

pastebin_url = response.text
print("The pastebin URL is:%s"%pastebin_url)
