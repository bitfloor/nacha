var assert = require('assert');

var Field = function(details) {
    if (!(this instanceof Field)) {
        return new Field(details);
    }

    var self = this;
    self.name = details.name;
    self.size = details.size;
    self.val = details.default;

    // regex format check
    if (details.format[0] === '/') {
        self.formatter = new RegExp(details.format.slice(1, -1));
        return;
    }

    var formatter = /.*/;

    switch (details.format) {
    case 'Alpha':
        formatter = /[a-zA-Z0-9]*/;
        break;
    case 'Numeric':
    case 'Amount':
        self._numeric = true;
        formatter = new RegExp('[0-9]{0,' + details.size + '}');
        break;
    default:
        throw new Error('unknown format: ' + details.format);
    }

    self.formatter = formatter;
};

Field.prototype.set = function(val) {
    if (!this.formatter.test(val)) {
        throw new Error('invalid value `' + val + '` for field: `' + this.name + '` expected: ' + this.formatter.toString());
    }

    this.val = '' + val;
};

Field.prototype.get = function(val) {
    return this.val;
};

Field.prototype.serialize = function() {
    var self = this;
    var val = this.val;

    if (val === undefined) {
        throw new Error('undefined value for field: ' + this.name);
    }

    var out = '' + val;

    assert(out.length <= self.size, 'value `' + out + '` is too big for field: ' + this.name);

    var pads = Array(self.size - out.length + 1);

    if (self._numeric) {
        return pads.join('0') + out;
    }

    return out + pads.join(' ');
}

module.exports = Field;
