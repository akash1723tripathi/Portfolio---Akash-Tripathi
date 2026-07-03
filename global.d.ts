/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    __freshLoad?: boolean;
    __welcomeComplete?: boolean;
    __welcomeHandoff?: boolean;
  }

  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: any;
      meshLineMaterial: any;
    }
  }
}

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

export {};
