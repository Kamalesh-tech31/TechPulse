import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function getStock(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol);

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
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getMultipleStocks(symbols: string[]) {
  const stocks = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return await getStock(symbol);
      } catch (err) {
        console.error(`Failed to fetch ${symbol}`);
        return null;
      }
    })
  );

  return stocks.filter(Boolean);
}

export async function getStockHistory(symbol: string) {
  try {
    const today = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 14);

    const result = await yahooFinance.chart(symbol, {
      period1: fourteenDaysAgo,
      period2: today,
      interval: "1d",
    });

    const quotes = result.quotes || [];
    // slice the last 7 trading days
    const last7Quotes = quotes.slice(-7);

    return last7Quotes.map((q: any) => ({
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