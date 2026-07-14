import { NseIndia } from "stock-nse-india";
import { NIFTY_25 } from "../nifty25";


const nse = new NseIndia();

let cache: any[] = [];
let isFetching = false;

export function startMarketUpdater() {
    console.log("Starting Market Updater...");
  
    // Initial fetch
    getNifty25Stocks();
  
    // Refresh every 10 seconds
    setInterval(() => {
      console.log("Refreshing market data...");
      getNifty25Stocks();
    }, 15000);
  }


export async function getStock(symbol: string) {
    return await Promise.race([
      nse.getEquityDetails(symbol),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      ),
    ]);
  }

  export async function getNifty25Stocks() {
    if (isFetching) {
      return cache;
    }
  
    isFetching = true;
  
    try {
      const stocks = [];
  
      for (const symbol of NIFTY_25) {
        console.log("Fetching:", symbol);
  
        try {
          const stock = await getStock(symbol);
          console.log(symbol, stock);
          console.log("Success:", symbol);
          stocks.push(stock);
        } catch (err: any) {
          console.log("Failed:", symbol, err.message);
        }
      }
  
      cache = stocks;
      return cache;
    } finally {
      isFetching = false;
    }
  }