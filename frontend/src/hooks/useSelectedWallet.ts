import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useWallet } from "./useWallet";

export function useSelectedWallet() {
  const { address, isConnected } = useWallet();

  const [searchParams] = useSearchParams();

  const urlAddress = searchParams.get("address");

  const selectedAddress = useMemo(() => {
    if (
      urlAddress &&
      /^0x[a-fA-F0-9]{40}$/.test(urlAddress)
    ) {
      return urlAddress;
    }

    return address;
  }, [urlAddress, address]);

  const usingExternalWallet =
    !!urlAddress &&
    urlAddress.toLowerCase() !==
      (address ?? "").toLowerCase();

  return {
    address: selectedAddress,
    isConnected:
      isConnected || !!selectedAddress,
    usingExternalWallet,
    connectedAddress: address,
  };
}