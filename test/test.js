const chai = require('chai')
const assert = chai.assert;
const expect = chai.expect;
const request = require('request');

describe('Localhost', () => {
  it('should return statusCode of 200 when online', (done) => {
    request.get(
      {
        url: "http://localhost"
      },
      function (error, response, body) {
        var _body = {};
        try {
          _body = JSON.parse(body);
        }
        catch (e) {
          _body = {};
        }
        expect(response.statusCode).to.equal(200);
        done();
      }
    );
  });
})

