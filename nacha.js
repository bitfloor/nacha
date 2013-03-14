// builtin
var assert = require('assert');

var aba = require('./aba');
var record = require('./record');
var Batch = require('./batch');

function Nacha(opt) {
    if (!(this instanceof Nacha)) {
        return new Nacha(opt);
    }

    var self = this;

    assert(aba.isValid(opt.destinationRouting));

    // number of records including the header and footer must be a multiple of this
    self._blocking_factor = 10;

    self._batches = [];

    var rec = self.header = record.FileHeader();
    rec.immediateDestinationName = opt.destinationName;
    rec.immediateDestination = opt.destinationRouting;
    rec.immediateOrigin = opt.companyIdentification;
    rec.immediateOriginName = opt.companyName;
    rec.fileCreationDate = opt.fileCreationDate;
    rec.fileCreationTime = opt.fileCreationTime;
    rec.fileId = opt.fileId;
}

// new batch
Nacha.prototype.batch = function(opt) {
    var self = this;

    var batch = Batch(opt);
    self._batches.push(batch);
    return batch;
};

Nacha.prototype.end = function() {
    var self = this;
    var out = '';

    var records = 0;
    function write(record) {
        out += record.serialize() + '\n';
        records++;
    }

    write(self.header);

    // write all batches
    var entryCount = 0;
    var entryHash = 0;
    var debits = 0;
    var credits = 0;
    self._batches.forEach(function(batch, idx) {
        var batchNumber = idx + 1;
        var header = batch.header();
        header.batchNumber = batchNumber;
        write(header);

        batch.entries.forEach(function(entry) {
            entryCount++;
            write(entry);
        });
        var control = batch.control();
        control.batchNumber = batchNumber;

        entryHash += control.entryHash - 0;
        credits += control.creditAmount;
        debits += control.debitAmount;
        write(control);
    });

    // make file control record

    var blockCount = Math.ceil(records / self._blocking_factor);

    var control = record.FileControl();
    control.batchCount = self._batches.length;
    control.blockCount = blockCount;
    control.entryCount = entryCount;
    control.entryHash = entryHash;
    control.totalDebitAmount = debits;
    control.totalCreditAmount = credits;

    write(control);

    // pad to blocking factor if needed using rows of 9's
    var need_pad = records % self._blocking_factor;
    if (need_pad > 0) {
        need_pad = self._blocking_factor - need_pad;
    }

    for (var i=0 ; i<need_pad ; ++i) {
        out += Array(95).join('9') + '\n';
        records++;
    }

    assert(records % self._blocking_factor === 0);
    return out;
};

module.exports = Nacha;

