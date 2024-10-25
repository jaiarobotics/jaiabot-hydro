# Description:
#   This script manually controls a Jaiabot forward motion and dive. 
#   All the API endpoints are configured for Hub 1 (10.23.10.11) in this script.
#   The parameters of the bots — bot id, timeout, throttle, speed, heading, maximum depth, hold time, etc — can be updated in the section below labeled 'Target parameters'.

# import the libraries
import requests
import json
import keyboard
import time 

###########################################
#        Different control types
###########################################
# There are four control types, and in this script, type (4) is used.
# (1) using throttle and rudder -> Data = data1
# (2) using throttle and heading -> Data = data2
# (3) using speed and rudder -> Data = data3
# (4) using speed and heading -> Data = data4

###########################################
#        Target parameters
###########################################
# for motion
bot_ID = 1 # bot id
timeout_t = 3 # target timeout
speed_t = 0 # target speed
heading_t = 0 # target heading
throttle_t = 10 # target trottle
rudder_t = 0 # target rudder

# for dive
max_depth = 1
depth_interval = 1
hold_time = 30
drift_time = 0

# Run time
forward_motion_duration = 10 # runtime in seconds

current_bot_state = None  # Initialize the variable with a default value

# (A) Take control:
###########################################
#        Api-endpoints
###########################################
# defining the api-endpoint
API_ENDPOINT_ALL_STOP =  "http://10.23.10.11/jaia/all-stop" # when running on Hub 11
API_ENDPOINT_MANUAL = "http://10.23.10.11/jaia/ep-command" # when running on Hub 11
API_ENDPOINT_STATUS =  "http://10.23.10.11/jaia/status" # when running on Hub 11
API_ENDPOINT_RC = "http://10.23.10.11/jaia/command" # when running on Hub 11

#API_ENDPOINT_ALL_STOP =  "http://localhost:40001/jaia/v0/all-stop" # when running on Hub 11
#API_ENDPOINT_MANUAL = "http://localhost:40001/jaia/v0/ep-command" # when running on Hub 11
#API_ENDPOINT_STATUS =  "http://localhost:40001/jaia/v0/status" # when running on Hub 11
#API_ENDPOINT_RC = "http://localhost:40001/jaia/v0/command" # when running on Hub 11

# define the headers for the request
headers = {'clientid': 'backseat-control', 'Content-Type' : 'application/json; charset=utf-8'}

# Function to check bot mission state is correct
def check_bot_expected_mission_state(expected_states):
    global current_bot_state  # Use the global variable
    while current_bot_state not in expected_states:
        resp = requests.get(url=API_ENDPOINT_STATUS, headers=headers)
        data = json.loads(resp.text)
        # Extract the mission state for bot
        current_bot_state = data['bots'][str(bot_ID)]['mission_state']
        print(f"\nWaiting for bot mission state to enter: {expected_states} \n Current bot {bot_ID} mission state: {current_bot_state}")
        time.sleep(1)
    print(f"\nMission state for bot {bot_ID}: {current_bot_state} == one of the expected states {expected_states}")

# Make sure the bot is in one of the expected states to send activate
check_bot_expected_mission_state(["PRE_DEPLOYMENT__IDLE", "POST_DEPLOYMENT__IDLE", "PRE_DEPLOYMENT__FAILED", "IN_MISSION__UNDERWAY__MOVEMENT__REMOTE_CONTROL__SURFACE_DRIFT"])

###########################################
#             Activate bots
###########################################
# activate bots
activate_command = {'bot_id':bot_ID,'type':"ACTIVATE"}
resp_activate_command = requests.post(url=API_ENDPOINT_RC, json=activate_command, headers=headers)
# extracting response text
pastebin_url1 = resp_activate_command.text
print("The Activate Command pastebin URL is:%s"%pastebin_url1)

# Make sure the bot is in one of the expected states to activate rc mode
check_bot_expected_mission_state(["PRE_DEPLOYMENT__WAIT_FOR_MISSION_PLAN", "IN_MISSION__UNDERWAY__MOVEMENT__REMOTE_CONTROL__SURFACE_DRIFT", "IN_MISSION__UNDERWAY__RECOVERY__STOPPED", "IN_MISSION__UNDERWAY__MOVEMENT__REMOTE_CONTROL__SURFACE_DRIFT"])

#------------------------------------------
#                   Activate RC mode
#------------------------------------------
# Lat lon is used to convert global coordinate system into local grid
rc_command = {'bot_id':bot_ID,'time':0,'type':"MISSION_PLAN",'plan':{'start':"START_IMMEDIATELY",'movement':"REMOTE_CONTROL",'recovery':{'recover_at_final_goal':False,'location':{"lat":41.661725,"lon":-71.272264}}}}
resp_rc_command = requests.post(url=API_ENDPOINT_RC, json=rc_command, headers=headers)
# extracting response text
pastebin_url2 = resp_rc_command.text
print("The RC Command pastebin URL is:%s"%pastebin_url2)

# Make sure the bot is in one of the expected states to send bot commands
check_bot_expected_mission_state(["IN_MISSION__UNDERWAY__MOVEMENT__REMOTE_CONTROL__SURFACE_DRIFT"])

# (B) Send engineering commands:
def data_def(bot_ID, timeout_t, throttle_t, rudder_t, speed_t, heading_t):
    # Define the data dictionary
    # data1(throttle_t,rudder_t); data2(throttle_t,heading_t); data3(speed_t,rudder_t); data4(speed_t,heading_t)
    data = {"bot_id":bot_ID,"pid_control":{"timeout":timeout_t,"throttle":throttle_t,"rudder":rudder_t}}
    # data = {"bot_id":bot_ID,"pid_control":{"timeout":timeout_t,"throttle":throttle_t,"heading":{"target":heading_t}}}
    # data = {"bot_id":bot_ID,"pid_control":{"timeout":timeout_t,"speed":{"target":speed_t},"rudder":rudder_t}}
    # data = {"bot_id":bot_ID,"pid_control":{"timeout":timeout_t,"speed":{"target":speed_t},"heading":{"target":heading_t}}}
    return data

def data2JasonString_def(DATA):
    # Convert the data to a JSON string
    data_string = json.dumps(DATA) 
    parsed_dict = json.loads(data_string)    
    return parsed_dict

# define the headers for the request
headers = {'clientid': 'backseat-control', 'Content-Type' : 'application/json; charset=utf-8'}

###########################################
#                 Timer
###########################################
# timer starts
starttime = time.time()
lasttime = starttime

# define a counter
counter = 0

while True:
    print(f"\n*** while True: {counter} ***\n")
    #------------------------------------------
    #              Forward motion
    #------------------------------------------
    # call data_def function
    DATA = data_def(bot_ID, timeout_t, throttle_t, rudder_t, speed_t, heading_t)
    # Convert the data to a JSON string
    parsed_dict = data2JasonString_def(DATA)         
    # sending post request and saving response as response object
    manual_resp = requests.post(url=API_ENDPOINT_MANUAL, json=parsed_dict, headers=headers)  
    # extracting response text 
    pastebin_url = manual_resp.text
    print("The Forward Motion pastebin URL is:%s"%pastebin_url)      

    # The current lap-time
    laptime = round((time.time() - lasttime), 2)
    totaltime = round((time.time() - starttime), 2)
    lasttime = time.time()

    print("-------- Lap Time --------: "+str(laptime))
    print("Total Time: "+str(totaltime))

    if totaltime >= forward_motion_duration:
        print("\n ------- Diving -------\n")
        #------------------------------------------
        #                   Dive
        #------------------------------------------
        dive_command = {'bot_id':bot_ID,'type':"REMOTE_CONTROL_TASK",'rc_task':{'type':"DIVE",'dive':{'maxDepth':max_depth,'depthInterval':depth_interval,'holdTime':hold_time},'surface_drift':{'driftTime':drift_time}}}
        resp_dive_command = requests.post(url=API_ENDPOINT_RC, json=dive_command, headers=headers)
        # extracting response text
        pastebin_url3 = resp_dive_command.text
        print("The Dive Command pastebin URL is:%s"%pastebin_url3)  

        # Make sure the bot is diving
        check_bot_expected_mission_state(["IN_MISSION__UNDERWAY__TASK__DIVE__DIVE_PREP", "IN_MISSION__UNDERWAY__TASK__DIVE__POWERED_DESCENT", "IN_MISSION__UNDERWAY__TASK__DIVE__REACQUIRE_GPS"])

        # Make sure the bot is has finished dive states
        check_bot_expected_mission_state(["IN_MISSION__UNDERWAY__MOVEMENT__REMOTE_CONTROL__SURFACE_DRIFT"])
        break
    
    time.sleep(0.5)
    counter = counter + 1
print("\n --- END ---")
