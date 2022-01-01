import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    forgeVersion?: string;
  }

  export interface HardhatConfig {
    forgeVersion: string;
  }
}
