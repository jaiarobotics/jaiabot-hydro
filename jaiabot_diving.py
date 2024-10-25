# importing the requests library
import requests
import time

API_ENDPOINT = "http://localhost:40001/jaia/v0/command"

# define the headers for the request
headers = {'clientid': 'backseat-control', 'Content-Type' : 'application/json; charset=utf-8'}

activate_command = {'bot_id':1,'type':"ACTIVATE"}

resp_activate_command = requests.post(url=API_ENDPOINT, json=activate_command, headers=headers)

# extracting response text
pastebin_url1 = resp_activate_command.text
print("The Activate Command pastebin URL is:%s"%pastebin_url1)


time.sleep(5)

# Lat lon is used to convert global coordinate system into local grid
rc_command = {'bot_id':1,'time':0,'type':"MISSION_PLAN",'plan':{'start':"START_IMMEDIATELY",'movement':"REMOTE_CONTROL",'recovery':{'recover_at_final_goal':False,'location':{"lat":41.661725,"lon":-71.272264}}}}

resp_rc_command = requests.post(url=API_ENDPOINT, json=rc_command, headers=headers)

# extracting response text
pastebin_url2 = resp_rc_command.text
print("The RC Command pastebin URL is:%s"%pastebin_url2)


time.sleep(3)

dive_command = {'bot_id':1,'type':"REMOTE_CONTROL_TASK",'rc_task':{'type':"DIVE",'dive':{'maxDepth':10,'depthInterval':10,'holdTime':0},'surface_drift':{'driftTime':10}}}

resp_dive_command = requests.post(url=API_ENDPOINT, json=dive_command, headers=headers)

# extracting response text
pastebin_url3 = resp_dive_command.text
print("The Dive Command pastebin URL is:%s"%pastebin_url3)

# The script above will:
# 1. activate bot 1 so it is waiting for mission plan
# 2. Put bot 1 into rc mode
# 3. Then send a dive command to bot 1

# Steps 1 and 2 are only needed initially for the state machine. Once the bot is in the rc state then it can be sent the dive command without the first two steps.

# Let me know if you have questions or if more detail is needed.

# I tested this using the simulator.
