var supertest = require("supertest");

const express = require('express');

const app = express();

var server = supertest.agent("http://localhost:5000");

//==================== user API test ====================

/**
 * Testing get all user endpoint
 */
describe('GET /getGames', function () {
    it('respond with json containing a list of all games', function (done) {
        server
            .get('/apis/games/getGames')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
});
describe('GET /getAdminSimulations', function () {
    it('respond with json containing a list of all game instances created by an admin', function (done) {
        server
            .get('/apis/gameinstances/getAdminSimulations/:id')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
});
describe('GET /getGameSimulationById', function () {
    it('respond with json containing a specific game instance', function (done) {
        server
            .get('/apis/gameinstances/getGameSimulationById/:id/:gid')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
});
describe('POST /createGames', function () {
    it('respond with newly created game', function (done) {
        server
        .post('/apis/games/createGames')
        .send({ name: "Muskan", createdtimestamp: null, gameroles: null, status: 'active' })
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
           console.log('Game created successfully: ' + JSON.stringify(res.body));
           done();
        }).catch(done);
    });
});
describe('POST /NewGameSimulation', function () {
    it('respond with newly created game instance', function (done) {
        server
        .post('/apis/gameinstances/NewGameSimulation')
        .send({ createdtimestamp: null, gamestate: null, url: 'abc@example.com' })
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
           console.log('Game Instance created successfully: ' + JSON.stringify(res.body));
           done();
        }).catch(done);
    });
});
describe('Put /UpdateGameSimulation', function () {
    it('respond with updated game instance', function (done) {
        server
        .put('/apis/gameinstances//updateGameSimulation/:gid')
        .send({ createdtimestamp: null, gamestate: null, url: 'abc@example.com' })
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
           console.log('Game Instance updated successfully: ' + JSON.stringify(res.body));
           done();
        }).catch(done);
    });
});