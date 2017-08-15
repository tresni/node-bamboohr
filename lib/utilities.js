/* UTILITY FUNCTIONS */
exports.formatDate = function (date) {
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

exports.buildFields = function (fields) {
    var f = []
    for (var i in fields) {
        f.push({
            $: { id: i },
            _: fields[i] || ''
        })
    }

    return { field: f }
}
