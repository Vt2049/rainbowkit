import { Wallet } from "../../Wallet";
import { getWalletConnectConnector } from "../../getWalletConnectConnector";
import { getInjectedConnector } from "../../getInjectedConnector";

declare global {
  interface Window {
    evmproviders?: Record<string, any>;
    avalanche?: any;
  }
}

export interface CoreWalletOptions {
  projectId: string;
}

function getCoreWalletInjectedProvider(): any {
  const injectedProviderExist =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  // No injected providers exist.
  if (!injectedProviderExist) {
    return;
  }

  // Core implements EIP-5749 and creates the window.evmproviders
  if (window["evmproviders"]?.["core"]) {
    return window["evmproviders"]?.["core"];
  }

  // Core was injected into window.avalanche.
  if (window.avalanche) {
    return window.avalanche;
  }

  // Core was injected into window.ethereum.
  if (
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isAvalanche === true
  ) {
    return window.ethereum;
  }
}

export const coreWallet = ({ projectId }: CoreWalletOptions): Wallet => {
  const isCoreInjected = Boolean(getCoreWalletInjectedProvider());

  const shouldUseWalletConnect = !isCoreInjected;
  return {
    id: "core",
    name: "Core",
    iconUrl: async () => (await import("./coreWallet.svg")).default,
    iconBackground: "#1A1A1C",
    installed: !shouldUseWalletConnect ? isCoreInjected : undefined,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=com.avaxwallet",
      ios: "https://apps.apple.com/us/app/core-wallet/id6443685999",
      mobile: "https://core.app/?downloadCoreMobile=1",
      qrCode: "https://core.app/?downloadCoreMobile=1",
      chrome:
        "https://chrome.google.com/webstore/detail/core-crypto-wallet-nft-ex/agoakfejjabomempkjlepdflaleeobhb",
      browserExtension: "https://extension.core.app/",
    },
    mobile: {
      getUri: shouldUseWalletConnect ? (uri: string) => uri : undefined,
    },
    qrCode: shouldUseWalletConnect
      ? {
          getUri: (uri: string) => uri,
          instructions: {
            learnMoreUrl:
              "https://support.avax.network/en/articles/6115608-core-mobile-how-to-add-the-core-mobile-to-my-phone",
            steps: [
              {
                description: "wallet_connectors.core.qr_code.step1.description",
                step: "install",
                title: "wallet_connectors.core.qr_code.step1.title",
              },
              {
                description: "wallet_connectors.core.qr_code.step2.description",
                step: "create",
                title: "wallet_connectors.core.qr_code.step2.title",
              },
              {
                description: "wallet_connectors.core.qr_code.step3.description",
                step: "scan",
                title: "wallet_connectors.core.qr_code.step3.title",
              },
            ],
          },
        }
      : undefined,
    extension: {
      instructions: {
        learnMoreUrl: "https://extension.core.app/",
        steps: [
          {
            description: "wallet_connectors.core.extension.step1.description",
            step: "install",
            title: "wallet_connectors.core.extension.step1.title",
          },
          {
            description: "wallet_connectors.core.extension.step2.description",
            step: "create",
            title: "wallet_connectors.core.extension.step2.title",
          },
          {
            description: "wallet_connectors.core.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.core.extension.step3.title",
          },
        ],
      },
    },
    createConnector: () => {
      const connector = shouldUseWalletConnect
        ? getWalletConnectConnector({
            projectId,
          })
        : getInjectedConnector({
            target: getCoreWalletInjectedProvider(),
          });

      return connector;
    },
  };
};
