import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    forge?: {
      version?: string;
      verbosity?: number;
    }
  }

  export interface HardhatConfig {
    forge: {
      version: string;
      verbosity: number;
    }
  }
}
