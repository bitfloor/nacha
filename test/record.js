var assert = require('assert');
var record = require('../record');

test('file header', function() {
    var rec = record.FileHeader();

    rec.immediateDestinationName = 'ACME BANK';
    rec.immediateDestination = '123456789';
    rec.immediateOrigin = '1234567890';
    rec.immediateOriginName = 'ACME INC';
    rec.fileCreationDate = '999999';
    rec.fileCreationTime = '9999';
    rec.fileId = 'A';

    assert.equal(rec.type, '1');
    assert.equal(rec.priorityCode, '01');
    assert.equal(rec.immediateDestination, '123456789');

    var act = rec.serialize();
    var exp = '101 12345678912345678909999999999A094101ACME BANK              ACME INC                       ';

    assert.equal(act.length, 94);
    assert.equal(exp, act);
});

test('batch header', function() {
    var rec = record.BatchHeader();

    rec.serviceClassCode = 200;
    rec.companyName = 'ACME INC';
    rec.companyIdentification = '1234567890';
    rec.standardEntryClassCode = 'PPD';
    rec.companyEntryDescription = 'NACHOS';
    rec.effectiveEntryDate = '999999';
    rec.originatingFinancialInstitution = '12345678';
    rec.batchNumber = 1;

    var act = rec.serialize();
    var exp = '5200ACME INC                            1234567890PPDNACHOS          999999   1123456780000001';

    assert.equal(act.length, 94);
    assert.equal(act, exp);
});

test('entry detail', function() {
    var rec = record.EntryDetail();

    rec.transactionCode = '22';
    rec.receivingDFIIdentification = '12345678';
    rec.checkDigit = 9;
    rec.receivingDFIAccountNumber = '123';
    rec.amount = '10000'
    rec.individualIdentificationNumber = '123',
    rec.individualName = 'John Smith';
    rec.discretionaryData = '';
    rec.addendaRecordIdentifier = 0;
    rec.traceNumber = 123456780000001;

    var act = rec.serialize();
    var exp = '622123456789123              0000010000123            John Smith              0123456780000001';

    assert.equal(act.length, 94);
    assert.equal(act, exp);
});

test('batch control', function() {
    var rec = record.BatchControl();

    rec.serviceClassCode = '200';
    rec.entryCount = 20;
    rec.entryHash = 5555555555;
    rec.debitAmount = '0';
    rec.creditAmount = '6223098';
    rec.companyIdentification = '1234567890';
    rec.messageAuthenticationCode = '';
    rec.originatingDFIIdentification = '12345678';
    rec.batchNumber = 1;

    var act = rec.serialize();
    var exp = '820000002055555555550000000000000000062230981234567890                         123456780000001';

    assert.equal(act.length, 94);
    assert.equal(act, exp);
});

test('file control', function() {
    var rec = record.FileControl();

    rec.batchCount = 1;
    rec.blockCount = 3;
    rec.entryCount = 20;
    rec.entryHash = 378898555;
    rec.totalDebitAmount = 0;
    rec.totalCreditAmount = 6223098;

    var act = rec.serialize();
    var exp = '9000001000003000000200378898555000000000000000006223098                                       ';

    assert.equal(act.length, 94);
    assert.equal(act, exp);
});
