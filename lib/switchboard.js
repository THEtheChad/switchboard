/*
 * operator
 * https://github.com/THEtheChad/operator
 *
 * Copyright (c) 2015 Chad Elliott
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');

function Filter() {
	this.callers = [];
	this.actions = [];
}
Filter.prototype = {
	caller: function (regex) {
		if(regex === undefined){
			throw new Error('Valid regex was not provided for filter caller.');
		}

		this.callers.push(regex);

		return this;
	},
	action: function (func) {
		if(!_.isFunction(func)){
			throw new Error('Valid function was not provided for filter action.')
		}

		this.actions.push(func);

		return this;
	},
	isCaller: function(phone_number){
		var callers = this.callers;
		var l = callers.length;

		while(l--) {
			if(callers[l].test(phone_number)) {
				return true;
			}
		}
		return false;
	},
	doActions: function(req, res){
		var actions = this.actions;
		var l = actions.length;

		for(var i = 0; i < l; i++){
			actions[i](req, res);
		}
		return this;
	},
	matches: function (req, res) {
		if(this.isCaller(req.query.From)){
			this.doActions(req, res);
			return true;
		}

		return false;
	}
};

function Operator(switchboard){
	if (!(this instanceof Operator)){
		return new Operator(switchboard);
	}

	this.index = -1;
	this.filters = [];
	this.mode = 'initializing';
	this.switchboard = switchboard;
}
Operator.prototype = {
	caller: function(name){
		if (this.mode !== 'callers') {
			this.filter(true);
			this.mode = 'callers';
		}

		var regex = this.switchboard._directory[name];

		this.filter().caller(regex);

		return this;
	},
	then: function(name) {
		this.mode = 'actions';

		var action = this.switchboard._actions[name];

		this.filter().action(action);

		return this;
	},
	filter: function(next) {
		if (next) {
			this.filters[++this.index] = new Filter();
		}
		return this.filters[this.index];
	},
	handleCall: function(req, res){
		var filters = this.filters;
		var l = filters.length;

		for(var i = 0; i < l; i++){
			if(filters[i].matches(req, res)){
				return true;
			}
		}
		return false;
	}
};

function Switchboard() {
	if (!(this instanceof Switchboard)){
		return new Switchboard();
	}

	this._directory = {};
	this._actions = {};
	this._operators = {};
}
Switchboard.prototype = {
	contact: function(name, phone){
		var regex;

		if (_.isString(phone)) {
			regex = phone.match(/\d+/g).join('');
		}

		this._directory[name] = new RegExp(regex);

		return this;
	},
	action: function(name, func){
		this._actions[name] = func;

		return this;
	},
	directory: function(directory){
		for(var caller in directory) {
			this.contact(caller, directory[caller]);
		}
	},
	operator: function(name){
		if(!this._operators[name]){
			this._operators[name] = new Operator(this);
		}

		return this._operators[name];
	}
};

module.exports = Switchboard;
