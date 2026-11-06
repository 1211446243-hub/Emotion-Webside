import type { Product } from "@/types/commerce";

interface CommerceConfig {
  freeCreationCount: number;
  products: { starterPack: Product };
}

export const commerceConfig = {
  freeCreationCount: 3,
  products: {
    starterPack: {
      id: "starter-pack",
      name: "初心作品包",
      type: "creation_pack",
      priceCny: 19.9,
      creationCount: 5,
      active: true,
    },
  },
} as const satisfies CommerceConfig;

