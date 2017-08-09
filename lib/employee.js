var util = require('util'),
    xml2js = require('xml2js'),
    utilities = require('./utilities')

//-- Employee Class

function Employee(parent) {
    var args = Array.prototype.slice.call(arguments, 1)
    this.parent = parent

    var fields = args.pop()
    if (fields instanceof Object) {
        this.fields = fields
        this.id = args[0] || null
    }
    else {
        this.id = fields
        this.fields = {}
    }
}

Employee.prototype.__parse_fields = function (fields) {
    for (var i in fields) {
        this.fields[fields[i].$.id] = fields[i]._
    }
}

Employee.prototype.__to_xml = function () {
    var f = { employee: utilities.buildFields(this.fields) }
    return (new xml2js.Builder()).buildObject(f)
}

Employee.prototype.get = function () {
    var options
    var args = Array.prototype.slice.call(arguments, 0)
    var callback = args.pop()

    options = args.length ? { fields: args.join(',') } : {}

    var self = this
    this.parent.__get('employees/' + (this.id || 0), options, function (err, response) {
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
    end = utilities.formatDate(end)

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
        var f = { row : utilities.buildFields(rowdata) }
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

module.exports = Employee