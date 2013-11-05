
return;
var Nacha = require('../');

var nacha = Nacha({
    // routing
    destination: '123456789',
    destinationName: 'ACME BANK',

    // fein
    origin: '12345678',
    originName: 'ACME INC'
});

// write company batch/header
var batch = nacha.batch({
    companyName: 'ACME INC',
    // fein again
    companyIdentification: '123456789',
    entryDescription: 'ACME ACH'
});

var user = {
    routing: '021200339',
    account: 12345,
    amount: 10.00,
    user_id: 10,
    name: 'John Smith'
};

batch.entry({
    routing: user.routing,
    account: user.account,
    amount: user.amount,
    individualId: user.user_id,
    individualName: user.name || user.user_id,
});

// a batch ends when a new batch is requested or when .end() is called

// finalize remainder of the nacha file, write fillers and end block
// and render the nacha file
var res = nacha.end();

return process.stdout.write(res);

