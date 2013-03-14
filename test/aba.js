var assert = require('assert');
var aba = require('../aba');

test('valid', function() {
    assert(aba.isValid('322281578'));
    assert(aba.isValid('021200339'));
    assert(aba.isValid('031176110'));
    assert(aba.isValid('256074974'));
    assert(aba.isValid('121042882'));
});

test('invalid', function() {
    assert(!aba.isValid('322281579'));
    assert(!aba.isValid('021210339'));
    assert(!aba.isValid('031176111'));
    assert(!aba.isValid('252074974'));
    assert(!aba.isValid('121042782'));
});

