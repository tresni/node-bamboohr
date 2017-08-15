var utilities = require('./utilities')

var allowedFields = ['employeeId', 'status', 'start', 'end', 'timeOffTypeId', 'amount', 'notes', 'dates', 'previousRequest']

function TimeOffRequest(parent, id, fields) {
    if (id instanceof Object) {
        fields = id
        id = null
    }
    fields = fields || {}

    this.parent = parent
    this.id = id
    var self = this

    allowedFields.forEach(function (field) {
        if (field in fields) {
            self[field] = fields[field]
        }
    })

    formatDates(self)
}

function formatDates(self) {
    // Just to make sure everything is consistent
    self.start = utilities.formatDate(self.start)
    self.end = utilities.formatDate(self.end)
    if (self.dates) {
        self.dates.forEach(function (obj) {
            obj.date = utilities.formatDate(obj.date)
        })
    }
}

TimeOffRequest.prototype.__parse_fields = function (object) {
    this.employeeId = object.employee[0].$.id
    this.employeeName = object.employee[0]._
    this.status = object.status[0]._
    this.statusLastChanged = object.status[0].$.lastChanged
    this.statusLastChangedByUserId = object.status[0].$.lastChangedByUserId
    this.start = object.start[0]
    this.end = object.end[0]
    this.created = object.created[0]
    this.type = object.type[0]._
    this.typeId = object.type[0].$.id
    this.amount = object.amount[0]._
    this.amountUnit = object.amount[0].$.unit
    var notes = object.notes && object.notes[0].note;
    this.notes = notes && notes.map(function (note) {
        return {
            from: note.$.from,
            note: note._
        }
    }) || []
    var dates = object.dates && object.dates[0].date;
    this.dates = dates && dates.map(function (date) {
        return {
            date: date.$.ymd,
            amount: date.$.amount
        }
    })
}

TimeOffRequest.prototype.add = function (callback) {
    formatDates(this)

    var data = {
        status: this.status,
        start: this.start,
        end: this.end,
        timeOffTypeId: this.timeOffTypeId,
        amount: this.amount,
        previousRequest: this.previousRequest
    }

    if (this.notes) {
        data.notes = {
            note: this.notes.map(function (note) {
                return {
                    $: { from: note.from },
                    _: note.note
                }
            })
        }
    }

    if (this.dates) {
        data.dates = {
            date: this.dates.map(function (date) {
                return { $: {
                    amount: date.amount,
                    ymd: date.date
                }}
            })
        }
    }

    this.parent.__request('put', 'employees/' + this.employeeId + '/time_off/request/', null,
        { request: data }, callback);
}

TimeOffRequest.prototype.changeStatus = function (data, callback) {
    this.parent.__request('put', 'time_off/requests/' + this.id + '/status/', null, {
        request: data
    }, callback);
}

module.exports = TimeOffRequest
