import { useWallet } from "./useWallet";
import { usePLPEBalance } from "./usePLPEBalance";
import { useMarketData } from "./useMarketData";

const TOTAL_SUPPLY = 1_000_000_000;

export function useWalletProfile(selectedAddress?: string) {
  const {
    address: connectedAddress,
    isConnected,
  } = useWallet();

  const address = selectedAddress ?? connectedAddress;

  const {
    balance,
    loading: balanceLoading,
  } = usePLPEBalance(address);

  const {
    data,
    loading: marketLoading,
  } = useMarketData();

  const value = data
    ? balance * data.price
    : 0;

  const share =
    balance > 0
      ? (balance / TOTAL_SUPPLY) * 100
      : 0;

  return {
    address,
    connectedAddress,
    isConnected,
    balance,
    value,
    share,
    marketPrice: data?.price ?? 0,
    marketData: data,
    loading: balanceLoading || marketLoading,
  };
}