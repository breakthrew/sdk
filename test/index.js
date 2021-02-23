const sdk = require('../lib');
const _ = require('underscore');
const op = require('object-path');
const expect = require('chai').expect;

describe('BreakThrew', () => {
    it('brkthrw.init()', () => {
        sdk.init('init');
        expect(sdk.app).to.equal('init');
    });

    it('brkthrw.push()', () => {
        _.times(10, i => sdk.push('test', i));
        expect(sdk.q).to.have.lengthOf(10);
    });
});
