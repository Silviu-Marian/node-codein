import { expect } from 'chai';

import fileExists from './fileExists';

describe('fileExists API', () => {
  it('should return true for files that exist', () =>
    expect(fileExists(__filename)).to.be.true);

  it('should return false for non-existing files', () =>
    expect(fileExists(`no-file-${Date.now()}.xxx`)).to.be.false);
});
