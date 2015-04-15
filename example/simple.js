/*
 * switchboard
 * https://github.com/THEtheChad/switchboard
 *
 * Copyright (c) 2015 Chad Elliott
 * Licensed under the MIT license.
 */

'use strict';

var Switchboard = require('../');

var switchboard = new Switchboard();

switchboard.directory({
	'Harry S Truman': '922-122-1333',
	'Paul White': '777-244-3333'
});

switchboard.contact('Charlie Brown', '421-212-1212');

switchboard.action('Phone Home', function(){
	console.log('Calling outerspace....');
});

switchboard.action('Prank Call', function(){
	console.log('Heyuk heyuk heyuk');
});

var carol = switchboard.operator('Carol');

carol
	.caller('Harry S Truman')
		.then('Prank Call')
  .caller('Paul White')
  .caller('Charlie Brown')
		.then('Phone Home');
