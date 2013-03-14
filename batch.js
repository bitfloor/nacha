// builtin
var assert = require('assert');

var aba = require('./aba');
var record = require('./record');

var Batch = function(details) {
    if (!(this instanceof Batch)) {
        return new Batch(details);
    }

    var self = this;

    self.details = details;
    self.entries = [];

    self._entry_hash = 0;
    self._debit = 0;
    self._credit = 0;
};

// add an entry to the batch
Batch.prototype.entry = function(opt) {
    var self = this;

    var routing = opt.routing;
    var transit = routing.slice(0, 8);
    var check = routing[8];

    if (!check) {
        throw new Error('no check digit ' + JSON.stringify(opt));
    }

    assert(aba.isValid(routing), JSON.stringify(opt));

    // offset for cents and truncate any leftover
    var amount = Number(opt.amount * 100).toFixed(0);

    // check for amount field overflow
    assert(amount <= 9999999999, 'amount is too large');

    var rec = record.EntryDetail();

    // transaction code is whatever you are doing to the beneficiaries account

    rec.transactionCode = '22';
    rec.receivingDFIIdentification = transit;
    rec.checkDigit = check;
    rec.receivingDFIAccountNumber = opt.account;
    rec.amount = amount.toString();
    rec.individualIdentificationNumber = opt.individualId;
    rec.individualName = opt.individualName;
    rec.traceNumber = self.entries.length + 1;

    self.entries.push(rec);

    self._entry_hash += (transit - 0);

    // TODO track debits and credits
    self._credit += (amount.toString() - 0);
};

Batch.prototype.header = function() {
    var rec = record.BatchHeader();

    var opt = this.details;

    rec.serviceClassCode = 200;
    rec.companyName = opt.companyName;
    // fein
    rec.companyIdentification = opt.companyIdentification;
    rec.standardEntryClassCode = 'PPD';
    rec.companyEntryDescription = opt.companyEntryDescription;
    rec.effectiveEntryDate = opt.effectiveEntryDate;
    // our routing
    rec.originatingFinancialInstitution = opt.originatingFIIdentification;
    rec.batchNumber = 0;

    return rec;
};

// get the control record for the batch
Batch.prototype.control = function() {
    var self = this;

    var rec = record.BatchControl();

    var opt = this.details;

    rec.serviceClassCode = '200';
    rec.entryCount = self.entries.length;
    rec.entryHash = self._entry_hash;
    rec.debitAmount = self._debit;
    rec.creditAmount = self._credit;
    // fein
    rec.companyIdentification = opt.companyIdentification;
    // routing
    rec.originatingDFIIdentification = opt.originatingFIIdentification;

    // rec.batchNumber is set by whomever adds this record to a file
    // Batch only manages information for itself
    return rec;
};

module.exports = Batch;
