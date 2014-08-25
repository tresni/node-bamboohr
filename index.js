var request = require('request'),
    xml2js = require('xml2js'),
    util = require('util')

/* UTILITY FUNCTIONS */
function __Date_Helper(date) {
    /* if it's a Date, translate to appropriate format, otherwise assume we are
     * passing in the correct format
     */

    if (date instanceof Date) {
        return date.getFullYear() + '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' :'') + date.getDate()
    }
    else {
        return date
    }
}

function __Field_Builder(fields) {
    var f = []
    for (var i in fields) {
        f.push({
            $: { id: i },
            _: fields[i] || ''
        })
    }

    return { field: f }
}

/* CLASSES */

function BambooHR(options) {
    this.options = options
    this.request = request.defaults({
        auth: {
          username: this.options.apikey,
          password: 'x'
        },
        headers: {
            'User-Agent': 'node-bamboohr/' + require('./package.json').version + ' (node/' + process.version + ')'
        }
    })
}

BambooHR.prototype.__request = function (method, uri, options, data, callback) {
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

BambooHR.prototype.employee = function (id, fields) {
    return new Employee(this, id, fields)
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

BambooHR.prototype.requests = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    var callback = args.pop()
    var opts = args[0] || {}

    this.__get('time_off/requests/', opts, function (err, response) {
        if (err) { return callback(err) }
        var requests = response.requests.request
        return callback(null, requests)

        for (var i in requests) {
            // Create a timeoffrequest with a new employee() linked
        }
    })
}

BambooHR.prototype.whosOut = function (start, end, callback) {
    start = __Date_Helper(start)
    end = __Date_Helper(end)

    this.__get('time_off/whos_out', {
        start: start,
        end: end
    }, callback)
}

//-- Employee Class

function Employee(parent, id, fields) {
    this.parent = parent
    this.id = id
    this.fields = fields || {}
}

Employee.prototype.__parse_fields = function (fields) {
    for (var i in fields) {
        this.fields[fields[i].$.id] = fields[i]._
    }
}

Employee.prototype.__to_xml = function () {
    var f = { employee: __Field_Builder(this.fields) }
    return (new xml2js.Builder()).buildObject(f)
}

Employee.prototype.get = function () {
    var options, id
    var args = Array.prototype.slice.call(arguments, 0)
    var callback = args.pop()

    if (!this.id) {
        id = args.shift()
    }

    options = args.length ? { fields: args.join(',') } : {}

    var self = this
    this.parent.__get('employees/' + (this.id || id || 0), options, function (err, response) {
        if (err) { return callback(err) }

        var emp = new Employee(self.parent);
        emp.__parse_fields(response.employee.field)
        emp.id = response.employee.$.id
        if (callback) callback(err, emp)
    })
}

Employee.prototype.update = function (callback) {
    this.parent.__post('employees/' + this.id, null, this.__to_xml(), callback)
}

Employee.prototype.add = function (callback) {
    var self = this

    this.parent.__post('employees/', null, this.__to_xml(), function (err, response) {
        if (err) { return callback(err) }

        var id = /employees\/(\d+)/.exec(response)[1]
        self.id = id
        callback(null, self)
    })
}

// Just a utility function for bamboohr.requests({employeeId: this.id})
Employee.prototype.requests = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    var callback = args.pop()

    var options = util._extend({employeeId: this.id}, args[0] || {})

    self = this
    this.parent.requests(options, function (err, response) {
        if (err) { return callback(err) }

        for (var req in response) {
            // Set parent to this object
        }

        callback(null, response);
    })
}

Employee.prototype.estimates = function(end, callback) {
    end = __Date_Helper(end)

    this.parent.__get('employees/' + this.id + '/time_off/calculator/', {end: end}, function (err, resp) {
        if (err) { return callback(err) }
        callback(null, resp.estimates.estimate)
    })
}

Employee.prototype.__table_handler = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    var table = args.shift()
    var callback = args.pop()

    // getter
    if (args.length === 0) {
        this.parent.__get('employees/' + this.id + '/tables/' + table + '/', null, function (err, resp) {
            if (err) { return callback(err) }
            callback(null, resp.table.row)
        })
    }
    else {
        var rowdata = args.pop()
        var f = { row : __Field_Builder(rowdata) }
        var xml = (new xml2js.Builder()).buildObject(f)

        if (args.length) {
            var rowid = args[0]
            this.parent.__post('employees/' + this.id + '/tables/' + table + '/' + rowid, null, xml, callback)
        }
        else {
            this.parent.__post('employees/' + this.id + '/tables/' + table, null, xml, callback)
        }
    }
}

Employee.prototype.jobInfo = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('jobInfo')
    return this.__table_handler.apply(this, args)
}

Employee.prototype.employmentStatus = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('employmentStatus')
    return this.__table_handler.apply(this, args)
}

Employee.prototype.compensation = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('compensation')
    return this.__table_handler.apply(this, args)
}

Employee.prototype.dependents = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('dependents')
    return this.__table_handler.apply(this, args)
}

Employee.prototype.contacts = function () {
    var args = Array.prototype.slice.call(arguments, 0)
    args.unshift('contacts')
    return this.__table_handler.apply(this, args)
}

Employee.prototype.customTable = function () {
    //var args = Array.prototype.slice.call(arguments, 0)
    //args.unshift('contacts')
    return this.__table_handler.apply(this, args)
}

module.exports = BambooHR
