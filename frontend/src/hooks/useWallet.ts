import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
} from "wagmi";

export function useWallet() {
  const {
    address,
    isConnected,
    connector,
    chainId,
    status,
  } = useAccount();

  const {
    connect,
    connectAsync,
    connectors,
    isPending,
    error: connectError,
    reset: resetConnect,
  } = useConnect();

  const { disconnect, disconnectAsync } =
    useDisconnect();

  const {
    signMessageAsync,
    isPending: isSigning,
    error: signError,
    reset: resetSign,
  } = useSignMessage();

  return {
    address,
    isConnected,
    connector,
    chainId,
    status,
    connect,
    connectAsync,
    connectors,
    isPending,
    connectError,
    resetConnect,
    disconnect,
    disconnectAsync,
    signMessageAsync,
    isSigning,
    signError,
    resetSign,
  };
}
