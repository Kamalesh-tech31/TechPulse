import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getStock(symbol: string) {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const quote: any = await yahooFinance.quote(symbol);

      console.log("================================");
      console.log("Symbol:", quote.symbol);
      console.log("Price:", quote.regularMarketPrice);
      console.log("Previous:", quote.regularMarketPreviousClose);
      console.log("Time:", new Date(quote.regularMarketTime * 1000));
      console.log("State:", quote.marketState);
      console.log("================================");

      return {
        symbol: quote.symbol,
        name: quote.shortName,
        price: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose,
        open: quote.regularMarketOpen,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        currency: quote.currency,
        exchange: quote.fullExchangeName,
        marketState: quote.marketState,
        time: quote.regularMarketTime,
      };
    } catch (err: any) {
      const is429 =
        err?.message?.includes("429") ||
        err?.message?.includes("Too Many Requests");

      if (is429 && attempt < MAX_RETRIES) {
        console.log(
          `429 for ${symbol}. Retry ${attempt}/${MAX_RETRIES} in ${
            attempt * 3
          } seconds...`
        );

        await sleep(attempt * 3000);
        continue;
      }

      console.error(`Failed to fetch ${symbol}:`, err);
      throw err;
    }
  }

  throw new Error(`Unable to fetch ${symbol}`);
}

export async function getMultipleStocks(symbols: string[]) {
  const stocks = [];

  for (const symbol of symbols) {
    try {
      const stock = await getStock(symbol);

      stocks.push(stock);

      // Wait 300ms before requesting the next stock
      await sleep(300);
    } catch (err) {
      console.error(`Failed to fetch ${symbol}:`, err);
    }
  }

  return stocks;
}

export async function getStockHistory(symbol: string) {
  try {
    const today = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 14);

    const result: any = await yahooFinance.chart(symbol, {
      period1: fourteenDaysAgo,
      period2: today,
      interval: "1d",
    });

    const quotes = result.quotes || [];

    return quotes.slice(-7).map((q: any) => ({
      date: q.date,
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      adjclose: q.adjclose,
      volume: q.volume,
    }));
  } catch (err) {
    console.error(`Failed to fetch history for ${symbol}:`, err);
    throw err;
  }
}