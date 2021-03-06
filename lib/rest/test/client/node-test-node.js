/*
 * Copyright 2012-2013 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

(function (buster, define) {
	'use strict';

	var assert, refute, fail, failOnThrow;

	assert = buster.assertions.assert;
	refute = buster.assertions.refute;
	fail = buster.assertions.fail;
	failOnThrow = buster.assertions.failOnThrow;

	define('rest/client/node-test', function (require) {

		var rest, client, http, server;

		rest = require('rest');
		client = require('rest/client/node');
		http = require('http');
		server = http.createServer();

		buster.testCase('rest/client/node', {
			setUp: function () {
				server.on('request', function (request, response) {
					var requestBody = '';
					request.on('data', function (chunk) {
						requestBody += chunk;
					});
					request.on('end', function () {
						var responseBody = requestBody ? requestBody : 'hello world';
						response.writeHead(200, 'OK', {
							'content-length': responseBody.length,
							'content-type': 'text/plain'
						});
						response.write(responseBody);
						response.end();
					});
					request.on('error', function () { console.log('server error'); });
				});

				// TODO handle port conflicts
				server.listen(8080);
			},
			tearDown: function () {
				server.close();
			},

			'should make a GET by default': function (done) {
				var request = { path: 'http://localhost:8080/' };
				client(request).then(function (response) {
					assert(response.raw.request instanceof http.ClientRequest);
					// assert(response.raw.response instanceof http.ClientResponse);
					assert(response.raw.response);
					assert.same(request, response.request);
					assert.equals(response.request.method, 'GET');
					assert.equals(response.entity, 'hello world');
					assert.equals(response.status.code, 200);
					assert.equals('text/plain', response.headers['Content-Type']);
					assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
					refute(request.canceled);
				}).otherwise(fail).ensure(done);
			},
			'should make an explicit GET': function (done) {
				var request = { path: 'http://localhost:8080/', method: 'GET' };
				client(request).then(function (response) {
					assert.same(request, response.request);
					assert.equals(response.request.method, 'GET');
					assert.equals(response.entity, 'hello world');
					assert.equals(response.status.code, 200);
					refute(request.canceled);
				}).otherwise(fail).ensure(done);
			},
			'should make a POST with an entity': function (done) {
				var request = { path: 'http://localhost:8080/', entity: 'echo' };
				client(request).then(function (response) {
					assert.same(request, response.request);
					assert.equals(response.request.method, 'POST');
					assert.equals(response.entity, 'echo');
					assert.equals(response.status.code, 200);
					assert.equals('text/plain', response.headers['Content-Type']);
					assert.equals(response.entity.length, parseInt(response.headers['Content-Length'], 10));
					refute(request.canceled);
				}).otherwise(fail).ensure(done);
			},
			'should make an explicit POST with an entity': function (done) {
				var request = { path: 'http://localhost:8080/', entity: 'echo', method: 'POST' };
				client(request).then(function (response) {
					assert.same(request, response.request);
					assert.equals(response.request.method, 'POST');
					assert.equals(response.entity, 'echo');
					refute(request.canceled);
				}).otherwise(fail).ensure(done);
			},
			'should abort the request if canceled': function (done) {
				var request = { path: 'http://localhost:8080/' };
				client(request).then(
					fail,
					failOnThrow(function (/* response */) {
						assert(request.canceled);
					})
				).ensure(done);
				refute(request.canceled);
				request.cancel();
			},
			'should propogate request errors': function (done) {
				var request = { path: 'http://localhost:1234' };
				client(request).then(
					fail,
					failOnThrow(function (response) {
						assert(response.error);
					})
				).ensure(done);
			},
			'should not make a request that has already been canceled': function (done) {
				var request = { canceled: true, path: 'http://localhost:1234' };
				client(request).then(
					fail,
					failOnThrow(function (response) {
						assert.same(request, response.request);
						assert(request.canceled);
						assert.same('precanceled', response.error);
					})
				).ensure(done);
			},
			'should be the default client': function () {
				assert.same(client, rest);
			},
			'should support interceptor chaining': function () {
				assert(typeof client.chain === 'function');
			}
		});

	});

}(
	this.buster || require('buster'),
	typeof define === 'function' && define.amd ? define : function (id, factory) {
		var packageName = id.split(/[\/\-]/)[0], pathToRoot = id.replace(/[^\/]+/g, '..');
		pathToRoot = pathToRoot.length > 2 ? pathToRoot.substr(3) : pathToRoot;
		factory(function (moduleId) {
			return require(moduleId.indexOf(packageName) === 0 ? pathToRoot + moduleId.substr(packageName.length) : moduleId);
		});
	}
	// Boilerplate for AMD and Node
));
