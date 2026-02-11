declare module '@m-lab/ndt7' {
  const ndt7: {
    discoverServerURLs: (config: any, callbacks?: any) => Promise<Record<string, string>>;
    downloadTest: (config: any, callbacks?: any, urlPromise?: Promise<Record<string, string>>) => Promise<number>;
    uploadTest: (config: any, callbacks?: any, urlPromise?: Promise<Record<string, string>>) => Promise<number>;
    test: (config: any, callbacks?: any) => Promise<number>;
  };

  export = ndt7;
}
