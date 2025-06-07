declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      isConnected: boolean;
      publicKey?: { toString(): string };
      signMessage(encodedMessage: Uint8Array, display?: string): Promise<{
        signature: Uint8Array;
        publicKey: { toString(): string };
      }>;
    };
  }
}

export {}; 