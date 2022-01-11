// Gets an element with this id
function el(id) {
  return document.getElementById(id)
}

function setupOther(id) {
  el(id).onclick = function() {
    sendCommand()
  }
}

function setupSlider(name) {
  let slider = el(name + "Slider")
  let value = el(name + "Value")
  value.innerHTML = slider.value
  
  slider.oninput = function() {
    value.innerHTML = slider.value
    sendCommand()
  }
}

function changeSlider(name, amount) {
  let slider = el(name + "Slider")
  let value = el(name + "Value")
  slider.value = Number(slider.value) + amount
  value.innerHTML = slider.value
}

function setSlider(name, v) {
  let slider = el(name + "Slider")
  let value = el(name + "Value")
  slider.value = v
  value.innerHTML = slider.value
}

////////// Dead man's switch / throttle lock ////////

class DeadMansSwitch {
  static #on = false

  static setOn(_on) {
    DeadMansSwitch.on = _on
    el("throttleTitle").textContent = _on ? "🟢" : "❌"
  }
}

window.onblur = function() {
  DeadMansSwitch.setOn(false)
}

////////// Setup hotkeys /////////

activeKey = null

function keyDown(e) {
  if (e.code == 'ShiftLeft' || e.code == 'ShiftRight') {
    DeadMansSwitch.setOn(true)
    return
  }

  activeKey = e.code
}

function keyUp(e) {
  if (e.code == 'ShiftLeft' || e.code == 'ShiftRight') {
    DeadMansSwitch.setOn(false)
    return
  }

  if (e.code == activeKey) {
    activeKey = null
  }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp)

setInterval(function() {
  
  switch (activeKey) {
    case 'KeyC':
      setSlider('throttle', 0)
      setSlider('speed', 0)
      setSlider('rudder', 0)
      setSlider('heading', 0)
      setSlider('portElevator', 0)
      setSlider('stbdElevator', 0)
      setSlider('roll', 0)
    break
    case 'KeyW':
      section = el('throttleRadioButton').checked ? 'throttle' : 'speed'
      changeSlider(section, -1)
      break
    case 'KeyR':
      section = el('throttleRadioButton').checked ? 'throttle' : 'speed'
      changeSlider(section, 1)
      break
    case 'KeyS':
      section = el('rudderRadioButton').checked ? 'rudder' : 'heading'
      changeSlider(section, -1)
      break
    case 'KeyF':
      section = el('rudderRadioButton').checked ? 'rudder' : 'heading'
      changeSlider(section, 1)
      break
    case 'KeyA':
      changeSlider('portElevator', -1)
      break
    case 'KeyQ':
      changeSlider('portElevator', 1)
      break
    case 'KeyG':
      changeSlider('stbdElevator', -1)
      break
    case 'KeyT':
      changeSlider('stbdElevator', 1)
      break
    case 'KeyD':
      if (el('elevatorsRadioButton').checked) {
        changeSlider('portElevator', -1)
        changeSlider('stbdElevator', -1)
      }
      else {
        changeSlider('roll', -1)
      }
      break
    case 'KeyE':
      if (el('elevatorsRadioButton').checked) {
        changeSlider('portElevator', 1)
        changeSlider('stbdElevator', 1)
      }
      else {
        changeSlider('roll', 1)
      }
      break
      
  }

}, 25)

////////// Throttle //////////////

setupOther("throttleRadioButton")
setupSlider("throttle")

////////// Speed //////////////

setupSlider("speed")
setupOther("speed_submit")
setupOther("speedRadioButton")

////////// Rudder //////////////

setupSlider("rudder")
setupOther("rudderRadioButton")

////////// Heading //////////////

setupSlider("heading")
setupOther("heading_submit")
setupOther("headingRadioButton")

////////// Elevators //////////////

setupSlider("portElevator")
setupSlider("stbdElevator")
setupOther("elevatorsRadioButton")

////////// Heading //////////////

setupSlider("roll")
setupOther("roll_submit")
setupOther("rollRadioButton")

////////// Browser location ////////////

// Get our location

my_location = { "lat": 0.0, "lon": 0.0 }

navigator.geolocation.getCurrentPosition(function(position) {
  my_location.lat = position.coords.latitude
  my_location.lon = position.coords.longitude
})

////////// Command Sender //////////////

function sendCommand() {
  command = {}
  
  // Timeout
  command.timeout = el("timeout").value
  
  if (DeadMansSwitch.on) {

    // Throttle
    if (el("throttleRadioButton").checked) {
    
      command.throttle = el("throttleSlider").value
    
    }
  
    // Speed
    if (el("speedRadioButton").checked) {
  
      command.speed = {
        target: el("speedSlider").value,
        Kp: el("speed_Kp").value,
        Ki: el("speed_Ki").value,
        Kd: el("speed_Kd").value
      }
      
    }
  
  }
  else {
    // Man is dead!  Send zero throttle...
    command.throttle = 0
  }
  
  // Rudder
  if (el("rudderRadioButton").checked) {
  
    command.rudder = el("rudderSlider").value
  
  }

  // Heading
  if (el("headingRadioButton").checked) {

    command.heading = {
      target: el("headingSlider").value,
      Kp: el("heading_Kp").value,
      Ki: el("heading_Ki").value,
      Kd: el("heading_Kd").value
    }
    
  }
  
  // Elevators
  if (el("elevatorsRadioButton").checked) {
  
    command.portElevator = el("portElevatorSlider").value
    command.stbdElevator = el("stbdElevatorSlider").value
  
  }

  // Roll
  if (el("rollRadioButton").checked) {

    command.roll = {
      target: el("rollSlider").value,
      Kp: el("roll_Kp").value,
      Ki: el("roll_Ki").value,
      Kd: el("roll_Kd").value
    }
    
  }
  
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/jaia/command", true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(command));
    
  // Get vehicle status
  
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/jaia/getStatus", true);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        updateStatus(JSON.parse(xhr.responseText))
      } else {
        console.error(xhr.statusText);
        el("status").innerHTML = xhr.statusText
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
    el("status").innerHTML = xhr.statusText
  };
  xhr.send(null);
}

const interval = setInterval(sendCommand, 1000);


// Updates the status element with a status response object
function updateStatus(status) {
  bots = status["bots"]
  if (bots.length > 0) {
    bot = bots[0]
    el("bot_id").innerHTML = bot["botID"]
    
    bot_location = bot["location"]
      el("latitude").innerHTML = bot_location["lat"]
      el("longitude").innerHTML = bot_location["lon"]
      
    el("distance").innerHTML = latlon_distance(bot_location, my_location)  
      
    el("speed").innerHTML = bot["velocity"]
    el("heading").innerHTML = bot["heading"]
    el("time_to_ack").innerHTML = bot["time"]["time_to_ack"] / 1e6
  }
}


// Calculate xyz position of lat/lon point
function xyz(pt) {
  deg = 3.14159265358 / 180.0
  r_e = 6.3781e6
  return [ r_e * Math.cos(pt.lon * deg) * Math.sin(pt.lat * deg), 
           r_e * Math.sin(pt.lon * deg) * Math.sin(pt.lat * deg),
           r_e * Math.cos(pt.lat * deg)]
}


// Calculate Euclidean distance
function distance(x, y) {
  return Math.sqrt((x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2)
}


// Calculate distance between two lat/lon points
function latlon_distance(pt1, pt2) {
  xyz1 = xyz(pt1)
  xyz2 = xyz(pt2)
  return distance(xyz1, xyz2)
}

