// craco.config.ts
export {}; // 이 한 줄을 추가하면 모듈로 인식됩니다.

module.exports = {
  devServer: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  }
};
