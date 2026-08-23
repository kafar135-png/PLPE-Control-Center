import { useEffect, useState } from "react";
import { getChartData } from "../services/chart";

export function useChartData() {
  const [data, setData] = useState<any[]>([]);

  async function load() {
    try {
      const chart = await getChartData();
      setData(chart);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return data;
}