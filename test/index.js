const chai = require('chai');
const sdk = require('../lib');
const _ = require('underscore');
const op = require('object-path');
const pkg = require('../package');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect, should } = chai;

describe('BreakThrew', () => {
    sdk.init('init');
    _.times(10, i => sdk.push('test', i));

    it('brkthrw.init()', () => expect(sdk.app).to.equal('init'));

    it('brkthrw.push()', () => expect(sdk.q).to.have.lengthOf(10));

    // prettier-ignore
    it(`${pkg.name}@${pkg.version}`, () => expect(sdk.version).to.equal(pkg.version));
});
