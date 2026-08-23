import { useReadContract } from "wagmi";
import { formatUnits } from "viem";

const CONTRACT = "0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7";

const ABI = [
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [
      {
        name: "owner",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
  },
] as const;

export function usePLPEBalance(address?: string) {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT,
    abi: ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data ? Number(formatUnits(data, 18)) : 0,
    loading: isLoading,
    error,
  };
}