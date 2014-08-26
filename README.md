# BambooHR for node.js

## Install

```bash
$ npm install node-bamboohr
```

## Example

```js
var bamboohr = new (require('node-bamboohr'))({apikey: '123', subdomain: 'test'})
bamboohr.employee(100).get('firstName', 'lastName', function (err, employee) {
    if (err) { throw err }
    console.log(employee.firstName, employee.lastName)
    employee.firstName = 'Updated'
    employee.update(function (err) {
        if (err) { throw err }
        console.log('Employee updated!')
    })
})
```

## Test

Tests are written using [mocha](visionmedia.github.io/mocha/) and [nock](https://github.com/pgte/nock) and can be found in the [test](test) folder.  Execute `npm test` to run the test suite.

## API

### bamboohr

#### bamboohr.employees(callback)

Get a list of all employees.  `callback` is required.

```js
bamboohr.employees(function (err, employees) {
    for (var employee in employees) {
        console.log(employee)
    }
})
```

#### bambaoohr.employee([id, fields])

Get an `Employee` object initialized with supplied `id` and/or `fields`

```js
// No API call is made by instantiating an employee object
var employee = bamboohr.employee(1)

// You can supply some field values if you want
var employee = bamboohr.employee(1, {firstName: 'Testy', lastName: 'McTesterson'})

// This notation is generally only going to be used for adding a new employee
var new_employee = bamboohr.employee({firstName: 'Testy', lastName: 'McTesterson'})
```

### Employee

#### employee.get([fieldName, fieldName, fieldName ], callback)

Get `employee` data.  Only supplied fields are retrieved, you can get a list of fields from the metadata api or the default field list from the [Single Dimensional Data](http://www.bamboohr.com/api/documentation/employees.php) documentation

`callback` takes an error and an employee object as its arguments

```js
var employee = bamboohr.employee(1)

// request firstName, lastName, displayName for employee w/ id 1
employee.get('firstName', 'lastName', 'displayName', function (err, emp) {
    if (err) { throw err }
    console.log(emp.firstName, emp.lastName, emp.displayName)
})
```

#### employee.update(callback)

Update an employee's information

`callback` takes an error, if no error, then it worked

```js
bamboohr.employee(1).get(function (err, employee) {
    employee.fields.firstName = 'Testy'
    employee.fields.lastName = 'McTesterson'
    employee.update(function (err) {
        if (err) { throw err }
        console.log('employee updated successfully')
    })
})
```

#### employee.add(callback)

Add a new employee

`callback` take an error and the employee object as arguments

```js
var employee = bamboohr.employee({firstName: 'Testy', lastName: 'McTesterson'})

employee.add(function (err, self) {
    if (err) { throw err }
    console.log(employee.id, self.id)
    asset(self, employee)
})
```

#### employee.jobInfo(\[id, ]\[data, ]callback),  employee.employmentStatus(\[id, ]\[data, ]callback),  employee.compensation(\[id, ]\[data, ]callback),  employee.dependents(\[id, ]\[data, ]callback),  employee.contacts(\[id, ]\[data, ]callback)

Shorthand accessors for [Tabular Data](http://www.bamboohr.com/api/documentation/tables.php)

##### Get the data

Only supply `callback`

```js
bamboohr.employee(1).jobInfo(function (err, jobs) {
    if (err) { throw err }
    console.log(jobs)
})
```
##### Add a row

Supply `data` and `callback`

```js
bamboohr.employee(1).jobInfo({
    date: '2010-06-01',
    location: 'New York Office',
    division: 'Sprockets',
    department: 'Research and Development',
    jobTitle: 'Machinist',
    reportsTo: 'John Smith'
}, function (err) {
    if (err) { throw err }
})
```

##### Update a row

Supply `id`, `data` and `callback`

```js
bamboohr.employee(1).jobInfo(1, {
    date: '2010-06-01',
    location: 'New York Office',
    division: 'Sprockets',
    department: 'Research and Development',
    jobTitle: 'Machinist',
    reportsTo: 'John Smith'
}, function (err) {
    if (err) { throw err }
})
```

#### employee.customTable(tableName, \[id, ]\[data, ]callback)

Uses the same setup as the above table accessors, but you have to supply the table name.  Get a list of tables from the Metadata API.

```js
bamboohr.employee(1).customTable('customTableName', function (err, data) {
    if (err) { throw err }
    console.log(data)
})
```

## License
Copyright &copy; 2014 Brian Hartvigsen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
