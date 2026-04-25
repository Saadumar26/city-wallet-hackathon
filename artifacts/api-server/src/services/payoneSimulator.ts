interface MerchantDemand {
  merchantId: string;
  volume: number;
  status: "low" | "normal";
}

export function simulateMerchantDemand(
  merchantId: string,
  threshold = 60,
): MerchantDemand {
  const volume = Math.floor(Math.random() * 60) + 20; // 20-80
  return {
    merchantId,
    volume,
    status: volume < threshold ? "low" : "normal",
  };
}
