var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
  _ = require('underscore'),
  lights = [5,6,13,19,26], pinButton = 21,
  leds, button, iv, ivc = 0;

function initLeds(lights) {
  var leds = _.map(lights, function(pin) {
    return new Gpio(pin, 'low');      // Export GPIO #pin as an output.
  });
  return leds;
}

function initButton(button) {
  return new Gpio(button, 'in', 'falling');
}

function exit() {
  clearInterval(iv);
  _.each(leds, function(led) {
    led.writeSync(0);  // Turn LED off.
    led.unexport();    // Unexport GPIO and free resources
  });
  button.unwatch();
  button.unexport();
  process.exit();
}

function lightOff(led) {
  led.write(0, function (err) {
    if (err) { throw err; }
  });
}

function lightsOn(leds) {
  var first = _.first(leds);
  if (first) {
    first.write(1, function (err) {
      if (err) { throw err; }
      setTimeout(function () {
	lightOff(first);
	lightsOn(_.rest(leds));
      }, 250);
    });
  }
}

function blink() {
  if (ivc++ > 3) {
    clearInterval(iv);
  }
  lightsOn(leds);
}

(function () {
  leds = initLeds(lights);
  button = initButton(pinButton);
  button.watch(function(err, value) {
    if (err) {
      throw err;
    }
    clearInterval(iv);
    console.log('click');
    ivc = 0;
    iv = setInterval(blink, 1500);
  });
  console.log('Ready!');
})();

process.on('SIGINT', exit);
