export {
    ChainId,
    supportedChainIds
} from "./chainid";

export {
    Networks,
    supportedNetworks
} from "./networks";

export type {ChainIdTypeMap, AddressMap, DecimalsMap} from "./types";

export {SynapseContracts} from "./synapse_contracts";

import {
    contractsForChainId,
    executePopulatedTransaction
} from "./utils";

export const utils = { contractsForChainId, executePopulatedTransaction };

export type {SignerOrProvider} from "./utils";