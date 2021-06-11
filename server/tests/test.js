var supertest = require("supertest");

const express = require('express');
const gameinstances = require("../models/simulatordb/GameInstances");

const app = express();

var server = supertest.agent("http://localhost:5000");

//==================== user API test ====================

/**
 * Testing get all user endpoint
 */
describe('GET /getGames', function () {
    it('respond with json containing a list of all games', function (done) {
        server
            .get('/games/getGames')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
});
describe('GET /getAdminSimulations', function () {
    it('respond with json containing a list of all game instances created by an admin', function (done) {
        const adminid = "6d960e3e-5063-48eb-9d06-3e5b1e07a2f7"
        server
            .get('/gameinstances/'+ adminid)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
});
describe('GET /getGameSimulationById', function () {
    it('respond with json containing a specific game instance', function (done) {
        const adminid = "6d960e3e-5063-48eb-9d06-3e5b1e07a2f7"
        const gameid = "1cffee2b-465e-42bc-8dfa-5ddd4e4c0c11"
        server
            .get('/gameinstances/getGameInstance/'+adminid+'/'+gameid)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200,done);
    });
});
describe('POST /createGames', function () {
    it('respond with newly created game', function (done) {
        server
        .post('/games/createGames')
        .send({ name: "Muskan", createdtimestamp: "123", gameroles: null, status: 'active' })
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
        .post('/gameinstances/createGameInstance')
        .send({ createdtimestamp: "123", gamestate: null, url: 'abc@example.com' })
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
        const id = "1cffee2b-465e-42bc-8dfa-5ddd4e4c0c11"
        server
        .put('/gameinstances/update/'+id)
        .send({ createdtimestamp: "123", gamestate: null, url: 'abc@example.com' })
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