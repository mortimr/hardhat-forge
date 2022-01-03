import { existsSync } from "fs";
import { extendConfig, task } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";
const { spawn, exec } = require("child_process");

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

const checkIfVersionExists = async (version: string): Promise<boolean> => {
  const forgeVersionOutput = await getInstalledBinaryVersions();
  return forgeVersionOutput.toLowerCase().includes(version.toLowerCase());
};

const getInstalledBinaryVersions = async (): Promise<string> =>
  new Promise((ok, ko) => {
    exec("cargo install --list", (error, stdout, stderr) => {
      if (error) {
        return ko(error);
      }
      const ret: { [key: string]: string } = {};
      const output = stdout
        .split("\n")
        .slice(0, -1)
        .map((v) => v.replace(/ /g, ""));
      const forgeIdx = output.indexOf("forge");
      if (forgeIdx === -1) {
        ok(null);
      }
      for (let idx = forgeIdx; idx >= 0; --idx) {
        if (output[idx].includes("foundry-cli")) {
          ok(output[idx]);
        }
      }
      ok(null);
    });
  });

const installForgeVersion = async (
  version: string,
  force: boolean = false
): Promise<void> =>
  new Promise((ok, ko) => {
    const cargoInstall = spawn("cargo", [
      "install",
      "--git",
      "https://github.com/gakonst/foundry",
      "--bin",
      "forge",
      "--locked",
      "--rev",
      version,
      ...(force ? ["--force"] : []),
    ]);

    cargoInstall.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    cargoInstall.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    cargoInstall.on("close", (code: number) => {
      if (code === 0) {
        return ok();
      } else {
        return ko(new Error(`Process exited with error code ${code}`));
      }
    });
  });

const forgeTest = async (): Promise<void> =>
  new Promise((ok, ko) => {
    const cargoInstall = spawn("forge", [
      "test",
      "--hardhat",
      "--out",
      "forge-artifacts",
    ]);

    cargoInstall.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    cargoInstall.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    cargoInstall.on("close", (code: number) => {
      if (code === 0) {
        return ok();
      } else {
        return ko(new Error(`Process exited with error code ${code}`));
      }
    });
  });

const checkAndInstall = async (hre) => {
  if (!(await checkIfVersionExists(hre.config.forgeVersion))) {
    try {
      await installForgeVersion(hre.config.forgeVersion);
      console.log(`Installed forge (version=${hre.config.forgeVersion})`);
    } catch (e) {
      console.error(`An error occured while installing foundry`);
      console.error(e);
    }
  }
};

task(
  "forge-test",
  "Runs forge test. Also installs forge if missing."
).setAction(async (args, hre) => {
  await checkAndInstall(hre);
  try {
    await forgeTest();
  } catch (e) {}
});

task(
  "forge-install",
  "Forces installation of configured forge version"
).setAction(async (args, hre) => {
  try {
    console.log(`Force installing forge (version=${hre.config.forgeVersion})`);
    await installForgeVersion(hre.config.forgeVersion, true);
    console.log(`Force installed forge (version=${hre.config.forgeVersion})`);
  } catch (e) {
    console.error(`An error occured while installing foundry`);
    console.error(e);
  }
});

const DEFAULT_FORGE_COMMIT_HASH = "ecdafc5";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.forgeVersion = userConfig.forgeVersion || DEFAULT_FORGE_COMMIT_HASH;
    // retrieve version and check
  }
);
