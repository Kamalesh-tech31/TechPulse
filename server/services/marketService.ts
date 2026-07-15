import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function getStock(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol);

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