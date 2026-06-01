export const loadLayersModel = () => Promise.resolve(null);
export const setBackend = () => Promise.resolve();
export const ready = () => Promise.resolve();
export const getBackend = () => 'webgl';
export const sequential = () => ({
  add: () => {},
  compile: () => {},
  layers: [],
  getWeights: () => [],
  predict: () => ({ dataSync: () => new Float32Array(512), dispose: () => {} }),
  dispose: () => {},
});
export const layers = {
  conv2d: () => ({ activation: 'relu', padding: 'same' }),
  maxPooling2d: () => {},
  flatten: () => {},
  dense: () => ({ activation: 'relu' }),
};
export const tensor = () => ({ dataSync: () => new Float32Array(512), dispose: () => {} });
export const tidy = (fn: Function) => fn();
