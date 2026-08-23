import { useAccount, useConnect, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected } = useAccount();

  const { connect, connectors, isPending } = useConnect();

  const { disconnect } = useDisconnect();

  return {
    address,
    isConnected,
    connect,
    connectors,
    disconnect,
    isPending,
  };
}