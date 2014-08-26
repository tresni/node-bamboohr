var BambooHR = require('./../index')

var nock = require('nock')
nock.disableNetConnect();

var assert = require('assert')

suite('BambooHR', function () {
    var bamboo;
    setup(function () {
        bamboo = new BambooHR({apikey: '123', subdomain: 'test'})

    })

    suite('Employee', function() {
        var scope;

        suiteSetup(function () {
            scope = nock('https://api.bamboohr.com', {
                reqheaders: {
                    'authorization': 'Basic MTIzOng='
                }
            })
                // .employees()
                .get('/api/gateway.php/test/v1/employees/directory')
                .reply(200, '<directory><fieldset><field id="displayName">Display name</field><field id="firstName">First name</field><field id="lastName">Last name</field><field id="jobTitle">Job title</field><field id="workPhone">Work Phone</field><field id="workPhoneExtension">Work Extension</field></fieldset><employees><employee id="123"><field id="displayName">John Doe</field><field id="firstName">John</field><field id="lastName">Doe</field><field id="jobTitle">Customer Service Representative</field><field id="workPhone">555-555-5555</field><field id="workPhoneExtension"/></employee></employees></directory>')
                // .add()
                .post('/api/gateway.php/test/v1/employees/', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<employee>\n  <field id="firstName">John</field>\n  <field id="lastName">Doe</field>\n</employee>')
                .reply(201, '', {'Location': 'https://api.bamboohr.com/api/gateway.php/test/v1/employees/124'})
                // .get()
                .get('/api/gateway.php/test/v1/employees/0')
                .reply(200, '<employee id="123"></employee>')
                // employee(123).get()
                .get('/api/gateway.php/test/v1/employees/123')
                .reply(200, '<employee id="123"></employee>')
                // .get(123, firstname, lastname)
                .get('/api/gateway.php/test/v1/employees/123?fields=firstName%2ClastName')
                .reply(200, '<employee id="123"><field id="firstName">John</field><field id="lastName">Doe</field></employee>')
                // .employee(123).get(firstname, lastname)
                .get('/api/gateway.php/test/v1/employees/123?fields=firstName%2ClastName')
                .reply(200, '<employee id="123"><field id="firstName">John</field><field id="lastName">Doe</field></employee>')
                // employee(123).get() & update()
                .get('/api/gateway.php/test/v1/employees/123?fields=firstName%2ClastName')
                .reply(200, '<employee id="123"><field id="firstName">John</field><field id="lastName">Doe</field></employee>')
                .post('/api/gateway.php/test/v1/employees/123', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<employee>\n  <field id="firstName">Jane</field>\n  <field id="lastName">Doe</field>\n</employee>')
                .reply(200, '')
                // .employee(123).requests()
                .get('/api/gateway.php/test/v1/time_off/requests/?employeeId=123')
                .reply(200, '<requests><request id="1"><employee id="1">Jon Doe</employee><status lastChanged="2011-08-14" lastChangedByUserId="1">approved</status><start>2001-01-01</start><end>2001-01-06</end><created>2011-08-13</created><type id="1">Vacation</type><amount unit="days">5</amount><notes><note from="employee">Relaxing in the country for a few days.</note><note from="manager">Have fun!</note></notes><dates> <!-- This element may not be available for all requests --><date ymd="2001-01-01" amount="1"/><date ymd="2001-01-02" amount="1"/><date ymd="2001-01-03" amount="1"/><!-- dates with a 0 amount may not be included in the results. Included here for clarity --><date ymd="2001-01-04" amount="0"/> <date ymd="2001-01-05" amount="1"/><date ymd="2001-01-06" amount="1"/></dates></request></requests>')
                // .employee(100).jobInfo()
                .get('/api/gateway.php/test/v1/employees/100/tables/jobInfo/')
                .reply(200, '<table><row id="1" employeeId="100"><field id="date">2010-06-01</field><field id="location">New York Office</field><field id="division">Sprockets</field><field id="department">Research and Development</field><field id="jobTitle">Machinist</field><field id="reportsTo">John Smith</field></row><row id="2" employeeId="100"><field id="date">2009-03-01</field><field id="location">New York Office</field><field id="division">Sprockets</field><field id="department">Sales</field><field id="jobTitle">Salesman</field><field id="reportsTo">Jane Doe</field></row></table>')
                // .employee(100).jobInfo(w/ data)
                .post('/api/gateway.php/test/v1/employees/100/tables/jobInfo', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<row>\n  <field id="date">2010-06-01</field>\n  <field id="location">New York Office</field>\n  <field id="division">Sprockets</field>\n  <field id="department">Research and Development</field>\n  <field id="jobTitle">Machinist</field>\n  <field id="reportsTo">John Smith</field>\n</row>')
                .reply(201, '')
                // .employee(100).jobInfo(rowId, w/ data)
                .post('/api/gateway.php/test/v1/employees/100/tables/jobInfo/1', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<row>\n  <field id="date">2010-06-01</field>\n  <field id="location">New York Office</field>\n  <field id="division">Sprockets</field>\n  <field id="department">Research and Development</field>\n  <field id="jobTitle">Machinist</field>\n  <field id="reportsTo">John Smith</field>\n</row>')
                .reply(201, '')
                // .employee(1).estimates(w/ string)
                .get('/api/gateway.php/test/v1/employees/1/time_off/calculator/?end=2013-12-31')
                .reply(200, '<estimates end="2013-12-31"><estimate timeOffType="5" name="Bereavement" balance="-2.5"/> <estimate timeOffType="6" name="Jury duty" balance="-8.0"/> <estimate timeOffType="2" name="Sick" balance="16.0"/><estimate timeOffType="1" name="Vacation" balance="40.0"/> </estimates>')
                // .employee(1).estimates(w/ Date)
                .get('/api/gateway.php/test/v1/employees/1/time_off/calculator/?end=2013-12-31')
                .reply(200, '<estimates end="2013-12-31"><estimate timeOffType="5" name="Bereavement" balance="-2.5"/> <estimate timeOffType="6" name="Jury duty" balance="-8.0"/> <estimate timeOffType="2" name="Sick" balance="16.0"/><estimate timeOffType="1" name="Vacation" balance="40.0"/> </estimates>')
        })

        test('.employees should returns a list of employees', function (done) {
            bamboo.employees(function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        test('.add should get a result', function (done) {
            bamboo.employee(null, {firstName: 'John', lastName: 'Doe'}).add(function (err, resp) {
                if (err){ return done(err) }
                assert(resp instanceof Object)
                assert.equal(resp.id, 124)

                done()
            })
        })

        test('.get accepts only a callback, returns user with id', function (done) {
            bamboo.employee().get(function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Object)
                assert(resp.id)

                done()
            })
        })

        test('.get gets the right person if you supplied id to employee()', function (done) {
            bamboo.employee(123).get(function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Object)
                assert(resp.id)
                assert.equal(resp.id, 123)

                done()
            })
        })

        test('.get knows to get additional fields', function (done) {
            bamboo.employee(123).get('firstName', 'lastName', function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Object)
                assert.equal(resp.id, 123)
                assert(resp.fields)
                assert(resp.fields.firstName)
                assert(resp.fields.lastName)

                done()
            })
        })

        test('.get knows to get additional fields when id is suppled to employee()', function (done) {
            bamboo.employee(123).get('firstName', 'lastName', function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Object)
                assert.equal(resp.id, 123)
                assert(resp.fields)
                assert(resp.fields.firstName)
                assert(resp.fields.lastName)

                done()
            })
        })

        test('.update works', function (done) {
            bamboo.employee(123).get('firstName', 'lastName', function (err, resp) {
                if (err) { return done(err) }
                resp.fields.firstName = 'Jane'
                resp.update(function (err, resp) {
                    if (err) { return done (err) }
                    done()
                })
            })
        })

        test('.requests returns a list of requests', function (done) {
            bamboo.employee(123).requests(function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        test('.jobInfo returns list of jobs', function (done) {
            bamboo.employee(100).jobInfo(function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        test('.jobInfo(w/ data) creates a new row', function (done) {
            var data = {
                date: '2010-06-01',
                location: 'New York Office',
                division: 'Sprockets',
                department: 'Research and Development',
                jobTitle: 'Machinist',
                reportsTo: 'John Smith'
            }

            bamboo.employee(100).jobInfo(data, function (err, resp) {
                if (err) { return done(err) }

                done()
            })
        })

        test('.jobInfo(rowId, w/ data) updates a row', function (done) {
            var data = {
                date: '2010-06-01',
                location: 'New York Office',
                division: 'Sprockets',
                department: 'Research and Development',
                jobTitle: 'Machinist',
                reportsTo: 'John Smith'
            }

            bamboo.employee(100).jobInfo(1, data, function (err, resp) {
                if (err) { return done(err) }

                done()
            })
        })

        test('.estimates(w/ string) returns time off estimates', function (done) {
            bamboo.employee(1).estimates('2013-12-31', function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        test('.estimates(w/ Date) returns time off estimates', function (done) {
            bamboo.employee(1).estimates(new Date(2013, 11, 31), function (err, resp) {
                if (err) { return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        suiteTeardown(function() {
            scope.done()
        })
    })

    suite('TimeOffRequests', function () {
        var scope;

        suiteSetup(function() {
            scope = nock('https://api.bamboohr.com', {
                reqheaders: {
                    'authorization': 'Basic MTIzOng='
                }
            })
                .get('/api/gateway.php/test/v1/time_off/requests/')
                .reply(200, '<requests><request id="1"><employee id="1">Jon Doe</employee><status lastChanged="2011-08-14" lastChangedByUserId="1">approved</status><start>2001-01-01</start><end>2001-01-06</end><created>2011-08-13</created><type id="1">Vacation</type><amount unit="days">5</amount><notes><note from="employee">Relaxing in the country for a few days.</note><note from="manager">Have fun!</note></notes><dates> <!-- This element may not be available for all requests --><date ymd="2001-01-01" amount="1"/><date ymd="2001-01-02" amount="1"/><date ymd="2001-01-03" amount="1"/><!-- dates with a 0 amount may not be included in the results. Included here for clarity --><date ymd="2001-01-04" amount="0"/> <date ymd="2001-01-05" amount="1"/><date ymd="2001-01-06" amount="1"/></dates></request></requests>')
                .get('/api/gateway.php/test/v1/time_off/requests/?start=2011-09-01&end=2011-09-11&type=1&status=approved')
                .reply(200, '<requests><request id="1"><employee id="1">Jon Doe</employee><status lastChanged="2011-08-14" lastChangedByUserId="1">approved</status><start>2001-01-01</start><end>2001-01-06</end><created>2011-08-13</created><type id="1">Vacation</type><amount unit="days">5</amount><notes><note from="employee">Relaxing in the country for a few days.</note><note from="manager">Have fun!</note></notes><dates> <!-- This element may not be available for all requests --><date ymd="2001-01-01" amount="1"/><date ymd="2001-01-02" amount="1"/><date ymd="2001-01-03" amount="1"/><!-- dates with a 0 amount may not be included in the results. Included here for clarity --><date ymd="2001-01-04" amount="0"/> <date ymd="2001-01-05" amount="1"/><date ymd="2001-01-06" amount="1"/></dates></request></requests>')
        })

        test('We should get a list of time off requests with no supplied arguments', function (done) {

            bamboo.requests(function (err, resp) {
                if (err){ return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        test('We should get a list of time off requests with supplied arguments', function (done) {
            bamboo.requests({start: '2011-09-01', end: '2011-09-11', type: 1, status: 'approved'}, function (err, resp) {
                if (err){ return done(err) }
                assert(resp instanceof Array)

                done()
            })
        })

        suiteTeardown(function() {
            scope.done()
        })
    })
})
