import subprocess
import os 
import time

rpistr = "echo '1-1' | sudo tee /sys/bus/usb/drivers/usb/unbind"
p = subprocess.Popen(rpistr, shell=True, preexec_fn=os.setsid)

time.sleep(2)

rpistr = "echo '1-1' | sudo tee /sys/bus/usb/drivers/usb/bind"
p = subprocess.Popen(rpistr, shell=True, preexec_fn=os.setsid)
