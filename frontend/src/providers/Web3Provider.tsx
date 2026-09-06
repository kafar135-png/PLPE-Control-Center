import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [mainnet],

  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],

  transports: {
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
  },

  ssr: false,
});

interface Props {
  children: ReactNode;
}

export default function Web3Provider({ children }: Props) {
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}