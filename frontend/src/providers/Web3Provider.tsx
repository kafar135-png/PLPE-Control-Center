import type { ReactNode } from "react";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  WagmiProvider,
  createConfig,
  http,
} from "wagmi";

import { mainnet } from "wagmi/chains";

import {
  injected,
  walletConnect,
} from "wagmi/connectors";

const queryClient = new QueryClient();

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    "[WEB3] VITE_WALLETCONNECT_PROJECT_ID is missing."
  );
}

const config = createConfig({
  chains: [mainnet],

  connectors: [
    injected({
      shimDisconnect: true,
    }),

    ...(walletConnectProjectId
      ? [
          walletConnect({
            projectId: walletConnectProjectId,

            metadata: {
              name: "PLPE OS",

              description:
                "PolishPepe Operating System",

              url:
                "https://plpe-control-center.vercel.app",

              icons: [
                "https://plpe-control-center.vercel.app/pwa-512x512.png",
              ],
            },

            showQrModal: true,
          }),
        ]
      : []),
  ],

  transports: {
    [mainnet.id]: http(
      "https://ethereum-rpc.publicnode.com"
    ),
  },

  ssr: false,
});

interface Props {
  children: ReactNode;
}

export default function Web3Provider({
  children,
}: Props) {
  return (
    <WagmiProvider
      config={config}
      reconnectOnMount={false}
    >
      <QueryClientProvider
        client={queryClient}
      >
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}