import { calcSourceHash } from '../function/common/utility';

test('calc_source_hash', () => {
  const hashSource = calcSourceHash('any|key|obj|10');
  const hashValue =
    '64d97ad66c2aafb5772c68e4a51a5b23256d3c68a99db300af9f160246452ce6';
  expect(hashSource).not.toBe(undefined);
  expect(hashValue).toBe(
    '64d97ad66c2aafb5772c68e4a51a5b23256d3c68a99db300af9f160246452ce6'
  );
  console.debug(hashSource);
  console.debug(hashValue);
});
