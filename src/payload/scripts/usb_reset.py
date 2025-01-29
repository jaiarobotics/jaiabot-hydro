import subprocess
import os 
import time

# Uses the unbind command to disconnect USB 1-1 from the Pi, pauses for 2 seconds, then re-binds the USB. This cuts power to the USB port, rebooting the payload board. 
rpistr = "echo '1-1' | sudo tee /sys/bus/usb/drivers/usb/unbind"
p = subprocess.Popen(rpistr, shell=True, preexec_fn=os.setsid)

time.sleep(2)

rpistr = "echo '1-1' | sudo tee /sys/bus/usb/drivers/usb/bind"
p = subprocess.Popen(rpistr, shell=True, preexec_fn=os.setsid)
