import { CreationBalanceService } from "./creation-balance-service";
import { CreationPolicyService } from "./creation-policy-service";
import { MockCreationBalanceRepository } from "./mock-creation-balance-repository";

const repository = new MockCreationBalanceRepository(() => window.localStorage);

export const creationBalanceService = new CreationBalanceService(repository);
export const creationPolicyService = new CreationPolicyService(creationBalanceService);

