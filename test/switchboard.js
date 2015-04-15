'use strict';

var Switchboard = require('../');
var assert = require('should');

var switchboard = new Switchboard();
var action1;
var action2;

switchboard.directory({
	'Chad Elliott': '911-911-9111',
	'Hai Chen': '922-922-9222'
});

switchboard.action('Phone Home', function(){
	action1 = 'COMPLETE';
});

switchboard.action('Prank Call', function(){
	action2 = 'COMPLETE';
});

var operator = switchboard.operator('Carol');

operator
	.caller('Chad Elliott')
		.then('Phone Home')
	.caller('Hai Chen')
		.then('Prank Call');

describe('Switchboard', function () {

	it('should properly set up a directory.', function () {

		switchboard._directory.should.have.properties('Chad Elliott', 'Hai Chen');
	});

	it('should properly store actions.', function (){

		switchboard._actions.should.have.properties('Phone Home', 'Prank Call');
	});
});

describe('Operator', function () {

  it('should properly create filter sets', function () {
		operator.filters.length.should.equal(2);
  });
});

describe('Filter', function(){

	var callFromChad;
	var callFromHai;

	beforeEach(function(){
		callFromChad = {query:{From:'+19119119111'}};
		callFromHai = {query:{From:'+19229229222'}};
	});

	it('should properly create filter sets', function () {
		(action1 == undefined).should.not.be.okay;
		(action2 == undefined).should.not.be.okay;

		operator.handleCall(callFromChad, {});
		action1.should.equal('COMPLETE');

		operator.handleCall(callFromHai, {});
		action2.should.equal('COMPLETE');
	});
});
