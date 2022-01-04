// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";

import { useEnvironment } from "./helpers";
const DEFAULT_FORGE_COMMIT_HASH = "ecdafc5";

describe("Integration tests examples", function () {
  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the forge config to the config", function () {
      assert.equal(this.hre.config.forge.version, DEFAULT_FORGE_COMMIT_HASH);
      assert.equal(this.hre.config.forge.verbosity, 3);
    });
  });
});
