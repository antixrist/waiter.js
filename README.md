# waiter.js
Waiting for triggering custom sync/async condition with any timeout and interval.

Running callback if:
* condition is ```true``` (first argument will be ```null```);
* time is over (first argument will be ```Error``` instance).


### Setup
#### Frontend:
```html
<script type="text/javascript" src="waiter.js"></script>
```

#### Backend (```node.js``` or ```io.js```):

Install with ```npm```:
```
npm i waiter.js --save
```

And ```require``` into your module:
```javascript
var waiter = require('waiter.js');
```


### Using
Waiter take four arguments:

* ```timeout``` *{Number}* Max waiting time in milliseconds;
* ```interval``` *{Number}* Interval for check in milliseconds;
* ```condition``` *{Function}* Return your condition's result **or** run callback with this result as first argument (if your handling is async). **Not both together!**
  If you return array then its will be passed to Waiter-```callback``` at the end of the list of arguments.
  This function take three arguments:
  * ```elapsedTime``` *{Number}* How much time elapsed in milliseconds;
  * ```iteration``` *{Number}* Index of the current iteration;
  * ```callback``` *{Function}* Call this function with condition's result if your handling is async.
* ```callback``` *{Function}* Take three and more arguments:
  * ```error``` *{null|Error}* ```Error``` instance will be passed if your ```timeout``` is elapsed but ```condition``` still ```false```;
  * ```elapsedTime``` *{Number}* How much time elapsed in milliseconds;
  * ```iteration``` *{Number}* Index of the last iteration;
  * If ```condition``` return array then its will be passed to callback at the end of the list of arguments.


#### Demo
##### Simplified demo
Sync:
```javascript
// Each 100 milliseconds will be check your condition.
// After 2000 milliseconds (2 sec) callback will be runned forcibly (or early if your condition will be 'true' or Array)
waiter(2000, 100, function (elapsedTime, iteration, cb) {
  // return boolean
  return true;
}, function (err, elapsedTime, iteration) {
  // do something
});
```

Async:
```javascript
waiter(2000, 100, function (elapsedTime, iteration, cb) {
  // it's async
  setTimeout(function () {
    // return boolean
    cb(true);
  }, 1000);

  // don't return a value!
}, function (err, elapsedTime, iteration) {
  // do something
});
```

Custom arguments:
```javascript
waiter(2000, 100, function (elapsedTime, iteration, cb) {
  return ['arg1', true];
}, function (err, elapsedTime, iteration, arg1, arg2) {
  // arg1 === 'arg1'
  // arg2 === true
});
```


#### Real demo
Synchronous condition ([demo](http://jsfiddle.net/antixrist/o3vL99z8/))
```javascript
var testIt = false;
setTimeout(function () {
  testIt = true;
}, 1200); // 1.2 sec

var timeout = 2000; // 2 sec
var interval = 200 // 0.2 sec

// run waiter!
waiter(timeout, interval, function (elapsedTime, iteration) {
  console.log('check!', 'testIt:', testIt, '; elapsed time:', elapsedTime +'ms', '; iteration:', iteration);

  return testIt === true;
}, function (err, elapsedTime, iteration) {
  if (err) {
    // throw err;
    console.log('Fail! Time left but condition still "false"!', 'testIt:', testIt, ';', elapsedTime +'ms', 'and', iteration, 'iteration');
    return;
  }

  console.log('done!', 'testIt:', testIt, ';', elapsedTime +'ms', 'and', iteration, 'iteration');
});
```


Asynchronous condition with custom arguments ([demo](http://jsfiddle.net/antixrist/m6hd2n8a/))
```javascript
var testIt = false;
setTimeout(function () {
  testIt = true;
}, 1200); // 1.2 sec

var timeout = 2000; // 2 sec
var interval = 200 // 0.2 sec

// run waiter!
waiter(timeout, interval, function (elapsedTime, iteration, cb) {
  console.log('check start!', 'testIt:', testIt, '; elapsed time:', elapsedTime +'ms', '; iteration:', iteration);

  var tstart = waiter.getTimeInMs();

  // async
  window.setTimeout(function () {
    console.log('check end!', 'testIt:', testIt, '; elapsed time:', (elapsedTime + Waiter.getTimeInMs() - tstart) +'ms', '; iteration:', iteration);
    var result = (testIt === true);

    if (result) {
      result = ['custom argument 1', 'custom argument 2'];
    }

    // return condition result
    cb(result);
  }, 100);
}, function (err, elapsedTime, iteration, customArg1, customArg2) {
  // customArg1 == 'custom argument 1'
  // customArg2 == 'custom argument 2'
  if (err) {
    // throw err;
    console.log('Fail! Time left but condition still "false"!', 'testIt:', testIt, ';', elapsedTime +'ms', 'and', iteration, 'iteration');
    return;
  }

  console.log('done!', 'testIt:', testIt, ';', elapsedTime +'ms', 'and', iteration, 'iteration');
});
```


# LICENCE (WTFPL)
DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE

Version 2, December 2004

Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

1. You just DO WHAT THE FUCK YOU WANT TO.