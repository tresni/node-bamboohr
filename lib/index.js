var request = require('request'),
    xml2js = require('xml2js'),
    util = require('util'),
    Employee = require('./employee'),
    TimeOffRequest = require('./time-off-request'),
    utilities = require('./utilities')

/* CLASSES */

function BambooHR(options) {
    this.options = options
    this.request = request.defaults({
        auth: {
          username: this.options.apikey,
          password: 'x'
        },
        headers: {
            'User-Agent': 'node-bamboohr/' + require('../package.json').version + ' (node/' + process.version + ')'
        }
    })
}

BambooHR.prototype.__request = function (method, uri, options, data, callback) {
    if (data instanceof Object) {
        data = (new xml2js.Builder()).buildObject(data)
    }
    this.request(util._extend({
        method: method,
        url: 'https://api.bamboohr.com/api/gateway.php/' + this.options.subdomain + '/v1/' + uri,
        body: data,
        data: data
    }, options), function (err, response, body) {
        if (err) {
            return callback(err)
        }

        if (response.statusCode >= 400 & response.statusCode <= 599) {
            return callback(response.statusCode)
        }

        if (response.statusCode == 201) {
            return callback(null, response.headers.location)
        }

        if (body) {
            xml2js.parseString(body, callback)
        }
        else {
            callback(null, null)
        }
    })
}

BambooHR.prototype.__post = function (uri, options, data, callback) {
    this.__request('post', uri, options, data, function (error, response) {
        callback(error, response)
    })
}

BambooHR.prototype.__get = function (uri, options, callback) {
    var qs = options ? { qs: options } : {}
    this.__request('get', uri, qs, null, callback)
}

BambooHR.prototype.employee = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    var fields = args.pop()

    if (fields instanceof Object) {
        return new Employee(this, args[0] || null, fields)
    }
    else {
        return new Employee(this, fields)
    }
}

BambooHR.prototype.employees = function (callback) {
    var self = this
    this.__get('employees/directory', null, function (err, response) {
        if (err) { return callback(err) }

        var list = []
        var employees = response.directory.employees[0].employee
        for (var e in employees) {
            var emp = new Employee(self, employees[e].$.id)
            emp.__parse_fields(employees[e].field)
            list.push(emp)
        }
        callback(null, list)
    })
}

BambooHR.prototype.timeOffRequests = BambooHR.prototype.requests = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    var callback = args.pop()
    var opts = args[0] || {}
    var self = this;

    this.__get('time_off/requests/', opts, function (err, response) {
        if (err) { return callback(err) }
        var requests = response.requests.request

        var list = requests.map(function (object) {
            var request = new TimeOffRequest(self, object.$.id)
            request.__parse_fields(object)
            return request
        })

        return callback(null, list)
    })
}

BambooHR.prototype.timeOffRequest = function (id, fields) {
    return new TimeOffRequest(this, id, fields)
}

BambooHR.prototype.whosOut = function (start, end, callback) {
    start = utilities.formatDate(start)
    end = utilities.formatDate(end)

    this.__get('time_off/whos_out', {
        start: start,
        end: end
    }, callback)
}

module.exports = BambooHR
