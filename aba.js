
// return true if the routing number is valid
function valid_aba(routing) {
    if (routing.length !== 9 || !/\d{9}/.test(routing)) {
        return false;
    }

    var d = routing.split('').map(Number);
    var sum =
        3 * (d[0] + d[3] + d[6]) +
        7 * (d[1] + d[4] + d[7]) +
        1 * (d[2] + d[5] + d[8]);

    return sum % 10 === 0;
}

module.exports.isValid = valid_aba;

