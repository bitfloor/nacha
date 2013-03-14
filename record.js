// builtin
var assert = require('assert');

var records = require('./records.json');
var Field = require('./field');

var Record = function(fields) {

    var Obj = function() {
        if (!(this instanceof Obj)) {
            return new Obj();
        }

        var self = this;

        self.fields = fields.map(Field);
        self.fields.forEach(function(field) {
            Object.defineProperty(self, field.name, {
                get: function() {
                    return field.get();
                },
                set: function(val) {
                    field.set(val);
                }
            });
        });
    };

    Obj.prototype.serialize = function() {
        var self = this;

        var out = '';
        self.fields.forEach(function(field) {
            out += field.serialize();

        });

        assert.equal(out.length, 94, 'invalid record length');
        return out;
    };

    return Obj;
}

for (var rec in records) {
    module.exports[rec] = Record(records[rec]);
}

