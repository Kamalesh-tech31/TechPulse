export interface Section {
  heading: string;
  body: string;
}

export interface LessonData {
  id: string;
  title: string;
  readTime: string;
  introduction: string;
  sections: Section[];
  importantConcept: string;
  realWorldExample: string;
  keyTakeaways: string[];
  commonMistakes: string[];
  quickRecap: string;
  widgetType?: 'budget' | 'compound' | 'emergency' | 'growth' | 'risk';
}

export interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ModuleData {
  id: number; // 0 to 6
  number: number; // 1 to 7
  title: string;
  description: string;
  duration: string;
  lessons: LessonData[];
  quiz: QuizQuestionData[];
}

export const MODULES_DATA: ModuleData[] = [
  {
    id: 0,
    number: 1,
    title: "Personal Finance & Saving Foundations",
    description: "Master the essentials of budgeting, managing compound interest, and establishing emergency funds to build solid financial security.",
    duration: "30 min",
    lessons: [
      {
        id: "m1-l1",
        title: "The Basics of Budgeting (The 50/30/20 Rule)",
        readTime: "5 min",
        introduction: "Budgeting is the cornerstone of financial freedom. Without a roadmap for your money, it's easy to overspend and fail to reach your financial goals. One of the most effective and simple frameworks is the 50/30/20 budgeting rule.",
        sections: [
          {
            heading: "Demystifying the 50/30/20 Allocation",
            body: "Popularized by Senator Elizabeth Warren, this rule splits your after-tax income into three distinct buckets: Needs, Wants, and Savings. Needs (50%) covers absolute essentials like rent, utilities, groceries, and debt minimums. Wants (30%) covers lifestyle choices like dining out, entertainment, and hobbies. Savings (20%) goes directly to retirement funds, emergency savings, and high-interest debt payoffs."
          },
          {
            heading: "How to Implement Your Budget",
            body: "To start, track your spending for 30 days. Categorize every transaction into Needs, Wants, or Savings. If you find your Needs exceed 50%, look for ways to cut fixed costs, like renegotiating subscriptions or finding cheaper housing. The goal is automation—setting up automatic transfers to your savings account on payday."
          }
        ],
        importantConcept: "After-Tax Income: Your budget should always be built on your take-home pay (after taxes and deductions), not your gross salary. Building a budget on gross income leads to overestimating your monthly cash flow.",
        realWorldExample: "Imagine Sarah earns ₹50,000 per month after taxes. Under the 50/30/20 rule, she allocates ₹25,000 to Needs (rent, food, electricity), ₹15,000 to Wants (weekend trips, Netflix, cafes), and ₹10,000 to Savings (mutual funds, emergency fund). Even with a modest income, she consistently saves ₹120,000 every year.",
        keyTakeaways: [
          "Budgeting provides clarity and control over your financial destiny.",
          "The 50/30/20 rule simplifies budgeting by focusing on three main categories.",
          "Needs should never exceed 50% of your take-home income.",
          "Automating savings removes temptation and ensures consistent growth."
        ],
        commonMistakes: [
          "Confusing wants with needs (e.g., classifying a premium gym membership or daily luxury coffee as a 'need').",
          "Forgetting irregular expenses (like yearly insurance premiums or medical checkups) in the monthly budget."
        ],
        quickRecap: "The 50/30/20 rule is a simple guide: spend 50% on what you need, 30% on what you want, and save 20%. Adjust as needed but prioritize savings.",
        widgetType: "budget"
      },
      {
        id: "m1-l2",
        title: "Understanding Debt: Good Debt vs. Bad Debt",
        readTime: "4 min",
        introduction: "Debt is a financial tool that can either build your wealth or destroy it. Understanding the difference between 'good' debt and 'bad' debt is critical to maintaining a healthy financial life.",
        sections: [
          {
            heading: "What is Good Debt?",
            body: "Good debt is money borrowed that has the potential to increase your net worth or generate future income. Examples include student loans (which increase your earning capacity) and home loans (since real estate generally appreciates over time and provides shelter). Good debt typically comes with lower interest rates and tax benefits."
          },
          {
            heading: "The Dangers of Bad Debt",
            body: "Bad debt involves borrowing money to purchase depreciating assets or consumable items that do not generate income. The worst offender is credit card debt, which carries extremely high interest rates (often 30-40% annually). Car loans, personal loans for vacations, and buy-now-pay-later schemes also fall into this category."
          }
        ],
        importantConcept: "Debt-to-Income (DTI) Ratio: Your monthly debt obligations divided by your monthly gross income. A DTI ratio below 36% is considered healthy, while anything above 43% indicates high risk.",
        realWorldExample: "Raj borrows ₹10,00,000 as an education loan to study Data Science, resulting in a salary jump from ₹4,00,000 to ₹12,00,000. This is good debt. On the flip side, Amit borrows ₹2,00,000 on his credit card to buy a luxury watch. He pays ₹8,000 monthly in interest alone while the watch loses value. This is bad debt.",
        keyTakeaways: [
          "Good debt builds long-term wealth; bad debt drains your monthly cash flow.",
          "Avoid paying interest on items that depreciate or disappear quickly.",
          "Prioritize paying off high-interest debt using the Avalanche or Snowball method.",
          "Keep your Debt-to-Income ratio below 36% for financial stability."
        ],
        commonMistakes: [
          "Using credit cards as an extension of income rather than a convenience tool.",
          "Focusing only on the monthly payment amount instead of the total interest cost over the loan's life."
        ],
        quickRecap: "Borrow to invest in yourself or appreciating assets (good debt). Avoid borrowing to fund lifestyle expenses or depreciating items (bad debt)."
      },
      {
        id: "m1-l3",
        title: "Setting Up an Emergency Fund",
        readTime: "5 min",
        introduction: "Life is full of unexpected events—job loss, medical emergencies, or urgent car repairs. An emergency fund is your financial seatbelt. It provides peace of mind and keeps you from falling into debt when crisis strikes.",
        sections: [
          {
            heading: "How Much Do You Need?",
            body: "Financial experts recommend saving 3 to 6 months' worth of essential living expenses. If your monthly essential expenses (Needs) total ₹30,000, your emergency fund should be between ₹90,000 to ₹1,80,000. If you have irregular income (like freelancers) or work in volatile industries, aim for 9 to 12 months."
          },
          {
            heading: "Where to Store Your Fund",
            body: "Liquidity and safety are key. An emergency fund is not meant to make you rich; it is meant to protect you. Store it in a safe, liquid account, separate from your daily spending. Do not invest it in volatile stocks or locked-in mutual funds."
          }
        ],
        importantConcept: "Liquidity: The ease with which an asset can be converted into cash without losing its value. Cash in a bank account is highly liquid, whereas physical real estate is highly illiquid.",
        realWorldExample: "When the pandemic hit, Priya lost her marketing job. Because she had a 6-month emergency fund of ₹1,80,000, she was able to pay rent, buy groceries, and pay her insurance premiums without stress for 5 months until she landed a new role. Her colleague, who had zero savings, had to take a high-interest personal loan.",
        keyTakeaways: [
          "An emergency fund is the foundation of any financial plan.",
          "Aim for 3-6 months of essential living expenses, not total income.",
          "Keep the funds in a safe, liquid account, separate from your daily spending.",
          "Rebuild the fund immediately after using it for a true emergency."
        ],
        commonMistakes: [
          "Investing emergency money in the stock market hoping for quick gains, only to see the market drop when you need cash.",
          "Using the fund for non-emergencies (like a holiday discount or a new smartphone)."
        ],
        quickRecap: "Build a buffer of 3-6 months of essential expenses. Keep it in a separate, easily accessible savings account, and use it only for real emergencies.",
        widgetType: "emergency"
      },
      {
        id: "m1-l4",
        title: "The Power of Compound Interest",
        readTime: "6 min",
        introduction: "Albert Einstein famously called compound interest the 'eighth wonder of the world.' Understanding how compounding works—and starting early—is the single most important factor in building long-term wealth.",
        sections: [
          {
            heading: "What is Compound Interest?",
            body: "Simple interest is paid only on the initial principal. Compound interest is interest earned on interest. Every time interest is paid, it is added to your account balance, and the next interest payment is calculated on that larger amount. Over time, your money snowballs."
          },
          {
            heading: "The Time Factor",
            body: "The magic ingredient of compounding is time. The longer your money has to grow, the more explosive the compounding effect becomes. This is why starting to invest at age 20 rather than age 30 can result in double or triple the final wealth, even if you invest less money total."
          }
        ],
        importantConcept: "Rule of 72: A quick way to estimate how long it takes for your investment to double. Divide 72 by your annual interest rate. For example, at an 8% return, your money doubles in 9 years (72 / 8).",
        realWorldExample: "Karan starts investing ₹5,000 a month at age 25. By age 55 (30 years), at a 10% average return, he invests a total of ₹18 Lakhs, but his portfolio grows to over ₹1.1 Crore. If he waited until age 35, he would end up with only ₹38 Lakhs, showing the massive cost of delay.",
        keyTakeaways: [
          "Compounding makes your money work for you, earning returns on previous returns.",
          "Starting early is more valuable than investing larger amounts later.",
          "Consistency and reinvestment of dividends are key to maximizing compounding.",
          "Use the Rule of 72 to quickly estimate investment doubling times."
        ],
        commonMistakes: [
          "Interrupting the compounding process by constantly withdrawing earnings.",
          "Thinking you don't have enough money to start. Even small contributions compound significantly over decades."
        ],
        quickRecap: "Compound interest multiplies your savings over time by paying returns on your returns. Start early, invest consistently, and let time do the heavy lifting.",
        widgetType: "compound"
      },
      {
        id: "m1-l5",
        title: "Credit Scores & Credit Health",
        readTime: "5 min",
        introduction: "Your credit score is your financial passport. It is a three-digit number that tells lenders how risky it is to lend you money, determining your eligibility for home loans, car loans, and credit cards.",
        sections: [
          {
            heading: "What is a Credit Score?",
            body: "A credit score (typically ranging from 300 to 900 in frameworks like CIBIL) is calculated based on your credit history. Lenders check this score to assess your creditworthiness. A score above 750 is considered excellent, giving you leverage to negotiate lower interest rates on loans."
          },
          {
            heading: "How to Build and Protect Your Credit Health",
            body: "Your credit score is driven by five main factors: Payment History (35% - whether you pay bills on time), Credit Utilization Ratio (30% - how much of your available credit card limit you use), Credit History Length (15%), Credit Mix (10%), and New Credit Inquiries (10%). To keep it healthy, always pay your bills in full on time and keep your credit utilization below 30%."
          }
        ],
        importantConcept: "Credit Utilization Ratio: The percentage of your total available credit card limits that you spend. If your limit is ₹1,00,000 and you spend ₹25,000, your utilization is 25%. Spending over 30% regularly damages your score, signaling dependency on credit.",
        realWorldExample: "Siddharth pays all his credit card bills in full every month and keeps his spending at 15% of his credit limit. His score is 810. When he applies for a home loan, the bank offers him a special 8.2% interest rate. His friend, who regularly misses payments and has a score of 620, is rejected by prime lenders and has to pay 11.5% at a subprime lender.",
        keyTakeaways: [
          "A high credit score saves you lakhs in interest over your lifetime.",
          "Payment history is the single largest factor affecting your credit score.",
          "Keep your monthly credit card usage under 30% of your maximum limit.",
          "Avoid applying for multiple credit cards or loans in a short timeframe."
        ],
        commonMistakes: [
          "Paying only the 'minimum due' on credit cards, which avoids late fees but leaves you paying 40% interest on the remaining balance and hurts credit health."
        ],
        quickRecap: "Your credit score measures your creditworthiness. Maintain a high score by paying bills in full and on time, and keeping debt utilization low."
      }
    ],
    quiz: [
      {
        id: "m1-q1",
        question: "According to the 50/30/20 rule, how should your net income be allocated?",
        options: [
          "50% Wants, 30% Needs, 20% Savings",
          "50% Needs, 30% Savings, 20% Wants",
          "50% Needs, 30% Wants, 20% Savings",
          "50% Savings, 30% Needs, 20% Wants"
        ],
        correctAnswerIndex: 2,
        explanation: "The standard 50/30/20 rule allocates 50% to essential Needs, 30% to flexible Lifestyle Wants, and 20% to Savings, investments, and debt reduction."
      },
      {
        id: "m1-q2",
        question: "Which of the following is generally classified as 'Good Debt'?",
        options: [
          "A credit card balance used for dining out",
          "A low-interest home loan for an appreciating primary residence",
          "A personal loan taken to buy a high-end smartphone",
          "A high-interest cash advance to fund a vacation"
        ],
        correctAnswerIndex: 1,
        explanation: "Good debt is debt that has the potential to increase your net worth or generate future income, like a mortgage or an educational loan."
      },
      {
        id: "m1-q3",
        question: "Where is the best place to keep an Emergency Fund?",
        options: [
          "In high-growth tech stocks for quick capital gains",
          "Locked in a 5-year tax-saver equity mutual fund",
          "In a safe, liquid savings account or short-term fixed deposit",
          "Under the mattress in cash only"
        ],
        correctAnswerIndex: 2,
        explanation: "An emergency fund requires safety and high liquidity. A high-yield savings account or short-term fixed deposits ensure capital preservation and quick access."
      },
      {
        id: "m1-q4",
        question: "Using the Rule of 72, if an investment earns a 9% annual return, how long will it take to double in value?",
        options: [
          "6 years",
          "8 years",
          "12 years",
          "72 years"
        ],
        correctAnswerIndex: 1,
        explanation: "The Rule of 72 is calculated by dividing 72 by the annual rate of return: 72 / 9 = 8 years."
      },
      {
        id: "m1-q5",
        question: "What is the recommended limit for your Credit Utilization Ratio to maintain a healthy credit score?",
        options: [
          "Under 10%",
          "Under 30%",
          "Exactly 50%",
          "Between 70% and 80%"
        ],
        correctAnswerIndex: 1,
        explanation: "Keeping your credit card spending below 30% of your total credit limit indicates responsible borrowing and helps keep your score high."
      },
      {
        id: "m1-q6",
        question: "Which of the following has the biggest impact on your credit score calculation?",
        options: [
          "The number of active credit cards you hold",
          "Your income level and employment status",
          "Your payment history and whether you pay bills on time",
          "The amount of cash you have in savings"
        ],
        correctAnswerIndex: 2,
        explanation: "Payment history is the single largest component of credit score calculations, making up roughly 35% of the total score."
      },
      {
        id: "m1-q7",
        question: "If your monthly essential needs cost ₹40,000, what is the recommended size of your emergency fund?",
        options: [
          "₹40,000 to ₹80,000",
          "₹1,20,000 to ₹2,40,000",
          "₹4,00,000 to ₹8,00,000",
          "Exactly one year's gross salary"
        ],
        correctAnswerIndex: 1,
        explanation: "Financial planners recommend saving 3 to 6 months of essential living expenses (3 * 40k = 120k; 6 * 40k = 240k) for an emergency buffer."
      },
      {
        id: "m1-q8",
        question: "What is the critical danger of paying only the 'Minimum Amount Due' on your credit card bill?",
        options: [
          "Your credit card will be immediately cancelled.",
          "You will be charged a late fee but no interest.",
          "The remaining balance accumulates interest at extremely high rates (often 30-40% annually), leading to a debt trap.",
          "The bank will confiscate your savings account."
        ],
        correctAnswerIndex: 2,
        explanation: "Paying the minimum due avoids late fees but does not stop interest from compounding on the outstanding balance, which accumulates quickly at subprime rates."
      }
    ]
  },
  {
    id: 1,
    number: 2,
    title: "Stock Market Essentials",
    description: "Understand equities, stock exchanges, the pricing mechanism, and order types to comfortably navigate the trading simulator.",
    duration: "25 min",
    lessons: [
      {
        id: "m2-l1",
        title: "Introduction to Equities & Stock Exchanges",
        readTime: "4 min",
        introduction: "When you buy a share, you are not just trading ticker symbols on a screen—you are buying a fractional ownership stake in a real business. Let's look at how this marketplace functions.",
        sections: [
          {
            heading: "What is Equity?",
            body: "Equity represents ownership. If a company has 1,000 shares outstanding and you buy 10 shares, you own 1% of the company. As an equity holder, you participate in the company's financial success through price appreciation and dividends, but you also bear the risk if the company fails."
          },
          {
            heading: "The Role of Stock Exchanges",
            body: "A stock exchange is a centralized, regulated marketplace where buyers and sellers trade shares. Major exchanges include the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE) in India, and the NYSE or Nasdaq in the US. Exchanges ensure transparency, liquidity, and fair execution."
          }
        ],
        importantConcept: "Market Capitalization: The total value of a company's outstanding shares, calculated by multiplying current share price by total outstanding shares. It determines if a stock is Large-cap, Mid-cap, or Small-cap.",
        realWorldExample: "Reliance Industries has billions of shares. When you buy 1 share on the NSE, you become a shareholder of Reliance. You now have voting rights (proportionate to your share) and are entitled to dividends paid out by the board.",
        keyTakeaways: [
          "A stock represents fractional ownership in a corporation.",
          "Stock exchanges connect buyers and sellers in a secure and regulated environment.",
          "Share prices fluctuate based on supply, demand, corporate news, and macroeconomic events.",
          "Market capitalization represents the total market value of a company."
        ],
        commonMistakes: [
          "Thinking a stock with a low share price (e.g., ₹10) is cheaper than a stock with a high share price (e.g., ₹1000). A stock's value depends on its valuation ratios, not its absolute share price."
        ],
        quickRecap: "Buying shares makes you a part-owner of a business. Exchanges facilitate the buying and selling of these shares, pricing them in real-time."
      },
      {
        id: "m2-l2",
        title: "How the Market Pricing Mechanism Works",
        readTime: "5 min",
        introduction: "Why does a stock price go up or down? At its core, the price of a stock is determined by the balance of supply and demand, mediated through an electronic system called the order book.",
        sections: [
          {
            heading: "Supply, Demand, and the Order Book",
            body: "The order book is a real-time list of buy orders (bids) and sell orders (asks). Bids represent the maximum price buyers are willing to pay, while asks represent the minimum price sellers are willing to accept. When a buyer's bid matches a seller's ask, a trade occurs, and that price becomes the new market price."
          },
          {
            heading: "Market Sentiment & Information Flow",
            body: "What shifts supply and demand? Information. Positive news (strong earnings reports, new product launches, economic growth) makes buyers willing to pay higher bids, driving the price up. Negative news (legal issues, falling profits, high inflation) causes sellers to accept lower asks, driving the price down."
          }
        ],
        importantConcept: "Bid-Ask Spread: The difference between the highest bid price and the lowest ask price. High-volume stocks have tiny spreads (high liquidity), while low-volume stocks have wide spreads (illiquidity risk).",
        realWorldExample: "If Stock XYZ has a bid of ₹100.00 and an ask of ₹100.05, the spread is ₹0.05. If a buyer places a market order, they immediately buy at ₹100.05. If positive earnings are released, sellers might raise their ask to ₹105, and buyers will chase it, raising the stock price.",
        keyTakeaways: [
          "Stock prices change because of supply and demand imbalances.",
          "The order book matches bids (buyers) and asks (sellers) continuously.",
          "Liquidity determines how easily you can enter and exit trades without moving the price.",
          "Information and expectation drive trading sentiment."
        ],
        commonMistakes: [
          "Assuming stock prices always reflect the true inner value of a company. Short-term prices are driven by sentiment, whereas long-term prices reflect business fundamentals."
        ],
        quickRecap: "Prices are set by buyers and sellers negotiating in real-time via the order book. Sentiment shifts bids and asks, changing the price."
      },
      {
        id: "m2-l3",
        title: "Order Types: Market, Limit, & Stop Loss",
        readTime: "5 min",
        introduction: "When trading in the simulator, you need to know how to place orders. Choosing the right order type is crucial for controlling your entry price and managing risk.",
        sections: [
          {
            heading: "Market Orders vs. Limit Orders",
            body: "A Market Order instructs the broker to buy or sell immediately at the best available current market price. Execution is guaranteed, but the price is not. A Limit Order specifies the exact maximum price you are willing to pay (for buying) or the minimum price you will accept (for selling). Execution is not guaranteed, but the price is controlled."
          },
          {
            heading: "The Essential Stop Loss Order",
            body: "A Stop Loss Order is a risk-management order that automatically sells your stock once it drops to a specific trigger price. This prevents a small loss from turning into a devastating financial blow. It acts as an automated safety net."
          }
        ],
        importantConcept: "Slippage: The difference between the expected price of a trade and the price at which the trade actually executes, common when using market orders during periods of high volatility.",
        realWorldExample: "You want to buy stock ABC which is trading at ₹500. If you place a Market Order, you might buy it at ₹500.50 due to slippage. If you place a Limit Order at ₹495, your order will sit in the book and only execute if the price drops to ₹495. If you buy at ₹500 and place a Stop Loss at ₹475, your position will automatically liquidate if the stock falls 5%, protecting your capital.",
        keyTakeaways: [
          "Use Market Orders when speed of execution is more important than price.",
          "Use Limit Orders to control your entry and exit prices precisely.",
          "Stop Loss orders are non-negotiable tools for professional risk management.",
          "Order type selection directly impacts transaction costs and trading success."
        ],
        commonMistakes: [
          "Failing to set a stop loss, leading to sitting on a declining stock that drops 50% or more.",
          "Using market orders on low-liquidity penny stocks, resulting in execution at unfavorable prices far from the last traded price."
        ],
        quickRecap: "Use market orders for speed, limit orders for price control, and stop loss orders to cap potential losses automatically."
      },
      {
        id: "m2-l4",
        title: "Dividends & Corporate Actions",
        readTime: "4 min",
        introduction: "Investing in stocks yields returns in two ways: capital appreciation (increase in share price) and dividends. Let's look at how dividends and other corporate actions affect you.",
        sections: [
          {
            heading: "What are Dividends?",
            body: "When a company makes a profit, it can choose to reinvest it in the business or distribute a portion of it to shareholders as cash. This cash distribution is a dividend, usually quoted as an amount per share or dividend yield. Companies with stable, mature businesses (like utilities or consumer staples) are major dividend payers."
          },
          {
            heading: "Understanding Stock Splits & Bonuses",
            body: "Corporate actions like stock splits divide existing shares to make them more affordable. In a 2-for-1 stock split, you receive double the shares, but the share price is halved, keeping your total investment value identical. Bonus issues are free additional shares given to existing shareholders."
          }
        ],
        importantConcept: "Ex-Dividend Date: The cutoff date for dividend eligibility. You must own the shares before the ex-dividend date to receive the dividend payout. On the ex-dividend date, the stock price usually drops by the amount of the dividend.",
        realWorldExample: "TCS announces a dividend of ₹10 per share. If you own 100 shares before the ex-dividend date, TCS will credit ₹1,000 directly to your bank account. If the stock was trading at ₹3,500, it will likely open at ₹3,490 on the ex-dividend date to account for the cash outflow.",
        keyTakeaways: [
          "Dividends represent a direct share of company profits sent to your bank account.",
          "Dividend yield is the annual dividend per share divided by the share price.",
          "Stock splits increase liquidity but do not change the fundamental value of your holdings.",
          "Pay close attention to key dates like Record Date and Ex-Dividend Date."
        ],
        commonMistakes: [
          "Buying a stock solely for a high dividend yield without checking the payout ratio, which could indicate the dividend is unsustainable and about to be cut."
        ],
        quickRecap: "Dividends are cash payments from profits. Stock splits and bonus issues change share counts but do not alter your overall investment value."
      },
      {
        id: "m2-l5",
        title: "Market Psychology & Market Cycles",
        readTime: "6 min",
        introduction: "The stock market is a collection of humans. As a result, the market behaves in cyclical patterns driven by shifting human emotions—from extreme optimism (greed) to extreme panic (fear).",
        sections: [
          {
            heading: "Understanding the Phases of a Market Cycle",
            body: "A typical market cycle consists of four distinct phases: Accumulation (smart money buys slowly at bottom values), Markup (sentiment turns positive, prices rise as retail investors FOMO in), Distribution (sentiment is euphoric, smart money quietly sells to latecomers), and Markdown (prices crash as panic takes over, bottoming back out into accumulation)."
          },
          {
            heading: "Behavioral Traps: FOMO and Loss Aversion",
            body: "Traders frequently fall into psychological traps. Fear of Missing Out (FOMO) causes them to buy stocks at peak valuations during the markup phase. Loss aversion makes them refuse to cut losses when a stock is dropping, holding onto declining assets in hope of a recovery that may never happen."
          }
        ],
        importantConcept: "Market Sentiment: The overall attitude of investors toward a stock or the market. It is often measured by indices like the Fear & Greed Index. Sentiment dictates short-term prices, causing them to deviate from actual company values.",
        realWorldExample: "During the 2000 Dot-com bubble, investors eagerly bought any tech stock with a '.com' suffix, regardless of revenue or business plans (euphoric markup phase). When reality set in, investors panicked and dumped everything, sending stocks down 90% (markdown phase), showing how emotion drives cycles.",
        keyTakeaways: [
          "Market cycles repeat because human psychology remains constant.",
          "Buy during quiet accumulation phases; cut exposure during euphoric peaks.",
          "Do not let FOMO drive your buying decisions near highs.",
          "Manage emotions by maintaining a solid trading plan with set exit rules."
        ],
        commonMistakes: [
          "Trying to time the absolute bottom or top of a cycle, which is virtually impossible. Focus instead on buying value and selling overvaluation."
        ],
        quickRecap: "Human emotions drive market cycles through phases of accumulation, markup, distribution, and markdown. Avoid emotional buying near peaks."
      }
    ],
    quiz: [
      {
        id: "m2-q1",
        question: "If a company has 10 million shares outstanding and the current share price is ₹150, what is its Market Capitalization?",
        options: [
          "₹15 million",
          "₹150 million",
          "₹1.5 billion (₹150 Crores)",
          "₹15 billion"
        ],
        correctAnswerIndex: 2,
        explanation: "Market Cap = Share Price * Outstanding Shares. ₹150 * 10,000,000 = ₹1,500,000,000 (which is ₹150 Crores or ₹1.5 Billion)."
      },
      {
        id: "m2-q2",
        question: "Which order type guarantees execution but does not guarantee the execution price?",
        options: [
          "Limit Order",
          "Market Order",
          "Stop Loss Limit Order",
          "GTC (Good till Cancelled) Order"
        ],
        correctAnswerIndex: 1,
        explanation: "Market orders execute immediately at the best available current market price, guaranteeing execution, but they are vulnerable to price slippage."
      },
      {
        id: "m2-q3",
        question: "What happens to the share price of a company on the Ex-Dividend date?",
        options: [
          "The price surges upward because buyers want the dividend.",
          "The price remains completely unchanged.",
          "The price typically drops by roughly the amount of the dividend payment.",
          "The stock trading is halted for 24 hours."
        ],
        correctAnswerIndex: 2,
        explanation: "On the ex-dividend date, the exchange adjusts the stock price downwards by the dividend amount since that cash value is leaving the company's balance sheet."
      },
      {
        id: "m2-q4",
        question: "What is a 'Stop Loss' order used for?",
        options: [
          "To lock in profits when a stock goes up",
          "To prevent a trade from being executed if the fees are too high",
          "To automatically limit losses by selling a stock if it falls to a pre-defined trigger price",
          "To buy more shares when the market is rising"
        ],
        correctAnswerIndex: 2,
        explanation: "A Stop Loss order acts as an automated safety net to cap losses by trigger-selling a position when the stock drops to a specific price."
      },
      {
        id: "m2-q5",
        question: "During which market cycle phase does smart money quietly accumulate shares while the general public is fearful?",
        options: [
          "Markup Phase",
          "Distribution Phase",
          "Accumulation Phase",
          "Markdown Phase"
        ],
        correctAnswerIndex: 2,
        explanation: "The Accumulation Phase occurs at the bottom of a market cycle, where experienced investors buy undervalued assets when sentiment is depressed."
      },
      {
        id: "m2-q6",
        question: "What does the 'Bid-Ask Spread' represent in an order book?",
        options: [
          "The broker commissions charged per transaction",
          "The difference between the highest bid (buy) price and lowest ask (sell) price",
          "The difference between the day's high price and low price",
          "The percentage margin required to short a stock"
        ],
        correctAnswerIndex: 1,
        explanation: "The bid-ask spread is the gap between the highest price buyers want to pay (bid) and the lowest price sellers want to accept (ask)."
      },
      {
        id: "m2-q7",
        question: "What behavioral bias is characterized by buying a stock at a high price because everyone else is buying it?",
        options: [
          "Loss Aversion",
          "FOMO (Fear Of Missing Out)",
          "Anchoring Bias",
          "Confirmation Bias"
        ],
        correctAnswerIndex: 1,
        explanation: "FOMO drives investors to purchase assets at inflated prices out of anxiety that they will miss out on upward momentum."
      },
      {
        id: "m2-q8",
        question: "How does a stock split affect your holdings in a company?",
        options: [
          "It increases the total value of your investment.",
          "It increases your share count while proportionately lowering the share price, leaving total investment value unchanged.",
          "It gives you free additional cash payouts.",
          "It increases your voting rights without changing share count."
        ],
        correctAnswerIndex: 1,
        explanation: "A stock split divides existing shares to increase liquidity. You own more shares, but their price is halved, keeping your total value identical."
      }
    ]
  },
  {
    id: 2,
    number: 3,
    title: "Analyzing Corporate Fundamentals",
    description: "Learn to read corporate financial statements and calculate key valuation metrics (like P/E ratios) to evaluate if a stock is cheap or expensive.",
    duration: "30 min",
    lessons: [
      {
        id: "m3-l1",
        title: "Income Statement & Profitability",
        readTime: "5 min",
        introduction: "The Income Statement (or Profit & Loss statement) tells you how much revenue a company generated over a period and how much profit it kept. It's the scorecard of business operations.",
        sections: [
          {
            heading: "Revenue to Net Profit Flow",
            body: "It starts with Topline Revenue (total sales). From revenue, we subtract Cost of Goods Sold (COGS) to get Gross Profit. Subtracting operating expenses (rent, salaries, marketing) gives Operating Profit (EBITDA). Finally, subtracting interest, taxes, and depreciation yields Net Profit (the Bottomline)—the actual earnings available to shareholders."
          },
          {
            heading: "Key Profitability Margins",
            body: "Looking at absolute numbers isn't enough; margins matter. Operating Margin (EBITDA / Revenue) shows how efficiently a company runs its core business. Net Profit Margin (Net Profit / Revenue) shows overall profitability. High, stable, or rising margins indicate strong competitive positioning."
          }
        ],
        importantConcept: "Earnings Per Share (EPS): Net Profit divided by the total number of outstanding shares. It represents the portion of a company's profit allocated to each share of common stock.",
        realWorldExample: "Company A and Company B both make ₹10 Lakhs in revenue. Company A has a Net Profit of ₹2 Lakhs (20% margin) while Company B has a Net Profit of ₹50,000 (5% margin). Company A is far more efficient and has a better buffer to survive industry downturns.",
        keyTakeaways: [
          "The income statement shows revenue, expenses, and profits over a specific timeframe.",
          "Net Profit (Bottomline) represents the actual earnings belonging to shareholders.",
          "Margin percentages are crucial for comparing companies of different sizes.",
          "EPS measures the earnings generated per individual share."
        ],
        commonMistakes: [
          "Focusing purely on revenue growth (topline) while ignoring falling net profits or margins, which could signal that the company is buying growth at a loss."
        ],
        quickRecap: "The income statement tracks revenue down to net profit. Always analyze margins and EPS growth, not just total revenue."
      },
      {
        id: "m3-l2",
        title: "Balance Sheet Essentials: Assets & Liabilities",
        readTime: "5 min",
        introduction: "Unlike the income statement, which tracks performance over time, the Balance Sheet is a snapshot of a company's financial position at a single point in time. It details what the company owns, what it owes, and the equity left over.",
        sections: [
          {
            heading: "The Accounting Equation",
            body: "The balance sheet must balance: Assets = Liabilities + Shareholders' Equity. Assets are what the company uses to run its business (cash, inventory, factories, intellectual property). Liabilities are what it owes to outsiders (bank loans, trade payables). Equity represents the net worth belonging to shareholders if all assets were liquidated and debts paid."
          },
          {
            heading: "Assessing Financial Health & Debt",
            body: "A clean balance sheet is key to business survival. Check the Debt-to-Equity (D/E) ratio. A D/E ratio of over 1.5 indicates high leverage, which is risky during economic recessions. Look at Current Assets vs. Current Liabilities (the Current Ratio) to ensure the company has enough liquid resources to pay its short-term bills."
          }
        ],
        importantConcept: "Return on Equity (ROE): Net income divided by shareholders' equity. It measures how effectively a company uses shareholders' capital to generate profits.",
        realWorldExample: "If a company has ₹10 Crores in assets and ₹6 Crores in liabilities, its shareholders' equity is ₹4 Crores. If it earns ₹80 Lakhs in net profit, its ROE is 20% (₹80L / ₹4Cr). This is a strong return on capital, indicating an efficient business.",
        keyTakeaways: [
          "Assets are resources owned; Liabilities are obligations owed; Equity is net worth.",
          "The accounting equation (Assets = Liabilities + Equity) must always balance.",
          "High debt increases financial risk and limits growth options.",
          "ROE measures the efficiency of utilizing shareholders' capital."
        ],
        commonMistakes: [
          "Ignoring off-balance-sheet liabilities or debt hidden in subsidiaries.",
          "Assuming high asset value is always positive; obsolete inventory or inflated goodwill are low-quality assets."
        ],
        quickRecap: "The balance sheet lists assets, liabilities, and equity. Keep a close eye on debt ratios and capital efficiency (ROE)."
      },
      {
        id: "m3-l3",
        title: "Valuation Ratios: P/E, P/B, EV/EBITDA",
        readTime: "6 min",
        introduction: "How do you know if a stock is cheap or expensive? A stock trading at ₹1,00,0 can be cheaper than one trading at ₹50, depending on its valuations. Valuation ratios compare price to underlying business earnings and assets.",
        sections: [
          {
            heading: "Price-to-Earnings (P/E) Ratio",
            body: "The P/E ratio is the most popular valuation metric. It is calculated by dividing current Share Price by Earnings Per Share (EPS). It represents how much investors are willing to pay for every ₹1 of profit. A high P/E (e.g. 50x) suggests high expected growth, whereas a low P/E (e.g. 10x) could signal undervaluation or structural problems."
          },
          {
            heading: "P/B and EV/EBITDA Ratios",
            body: "The Price-to-Book (P/B) ratio compares market price to book value per share, commonly used for asset-heavy firms like banks. EV/EBITDA compares Enterprise Value (market cap + debt - cash) to core operating profits, providing a debt-neutral valuation metric."
          }
        ],
        importantConcept: "P/E Expansion/Contraction: When investors pay more or less per rupee of earnings due to shifting confidence, which can drive massive price changes independent of actual earnings growth.",
        realWorldExample: "HDFC Bank trades at a P/E of 18, while a speculative startup trades at a P/E of 120. HDFC is cheaper relative to its earnings, meaning you pay less for its profits. However, the startup might be valued higher because investors expect its earnings to grow 50% year-on-year.",
        keyTakeaways: [
          "Valuation ratios put share prices in context of company financials.",
          "P/E ratio measures price relative to earnings; compare it to industry averages.",
          "P/B ratio is ideal for financial and asset-heavy companies.",
          "Do not evaluate valuation ratios in isolation; consider growth rates and capital return."
        ],
        commonMistakes: [
          "Buying low P/E stocks without realizing they are in a declining industry—this is a 'value trap.'",
          "Assuming high P/E always means overpriced. Fast-growing companies often justify high multiples."
        ],
        quickRecap: "Use P/E to value earnings, P/B for book assets, and EV/EBITDA for debt-adjusted operations. Compare to historical and sector averages."
      },
      {
        id: "m3-l4",
        title: "Cash Flow & Dividend Sustainability",
        readTime: "5 min",
        introduction: "Profits are an accounting construct; cash is reality. A company can show large paper profits on its income statement but run out of cash and go bankrupt. Understanding cash flow is the ultimate reality check.",
        sections: [
          {
            heading: "The Three Cash Flow Activities",
            body: "The Cash Flow Statement tracks movement of actual money. Operating Cash Flow (OCF) measures cash generated from core business. Investing Cash Flow shows cash spent on capital expenditures (machinery, R&D). Financing Cash Flow tracks transactions with lenders and shareholders (issuing shares, paying dividends, debt repayment)."
          },
          {
            heading: "Free Cash Flow & Dividend Coverage",
            body: "Free Cash Flow (FCF) is Operating Cash Flow minus Capital Expenditures. FCF is the raw cash left to pay dividends, buy back shares, or reduce debt. The Dividend Payout Ratio measures dividends paid relative to net income. If a company pays out 90% of its earnings as dividends and has negative FCF, the dividend is highly unsustainable."
          }
        ],
        importantConcept: "Earnings Quality: High quality earnings are backed by strong operating cash flows. If net profits rise but cash from operations falls, it suggests accounts receivable are stacking up, indicating potential trouble.",
        realWorldExample: "Retailer ABC reports a net profit of ₹5 Crores. However, their Cash Flow from Operations is negative ₹2 Crores because customers haven't paid their bills yet. Because they lack actual cash, they have to borrow to pay salaries, demonstrating why profit is not the same as cash.",
        keyTakeaways: [
          "The cash flow statement tracks the actual movement of currency.",
          "Free Cash Flow is the cash available after capital investments (CapEx).",
          "High earnings quality exists when net income is matched by operating cash flow.",
          "Ensure dividend payouts are comfortably covered by Free Cash Flow."
        ],
        commonMistakes: [
          "Relying on net profits to determine dividend safety. Always check FCF first."
        ],
        quickRecap: "Look at the cash flow statement to verify that profits translate to cash. Prioritize companies with positive, growing Free Cash Flow."
      },
      {
        id: "m3-l5",
        title: "Identifying Economic Moats",
        readTime: "5 min",
        introduction: "Coined by Warren Buffett, an 'Economic Moat' is a business's ability to maintain a competitive advantage over its competitors to protect its long-term profits and market share.",
        sections: [
          {
            heading: "Types of Economic Moats",
            body: "There are four primary categories of moats: 1. Brand Equity / Pricing Power (customers are willing to pay a premium, e.g., Apple); 2. Switching Costs (it is too painful or expensive for customers to change services, e.g., Microsoft Windows or corporate software); 3. Network Effects (the service becomes more valuable as more people use it, e.g., Visa or MasterCard); 4. Cost Advantage / Scale (producing goods at a cost competitors cannot match, e.g., Walmart)."
          },
          {
            heading: "Moats in Stock Valuations",
            body: "Companies with wide economic moats can sustain high margins and Return on Equity (ROE) for decades because competitors cannot easily eat their lunch. When valuing companies, wide-moat stocks deserve a premium valuation (higher P/E ratio) because their future earnings are highly predictable."
          }
        ],
        importantConcept: "Wide Moat vs. Narrow Moat: A wide moat represents a structural barrier that keeps competitors away for 20+ years. A narrow moat protects profits for 10 years. A company with no moat will see its profits quickly competed away, leading to falling share values.",
        realWorldExample: "Consider Visa. It connects billions of cardholders with millions of merchants. If a new competitor launches a credit card system, they cannot succeed unless merchants accept it and customers hold it. This network effect forms a massive, wide moat that protects Visa's high profit margins.",
        keyTakeaways: [
          "An economic moat protects long-term corporate profits from competitors.",
          "Brand value, high switching costs, and network effects are powerful moats.",
          "Scale allows cost advantages that competitors cannot easily match.",
          "Wide-moat companies command premium valuations due to earnings predictability."
        ],
        commonMistakes: [
          "Confusing a good product with a moat. A product can be easily copied; a structural moat (like network effects) cannot."
        ],
        quickRecap: "Identify wide-moat companies with brand power, network effects, or cost advantages. These companies protect profits and yield superior long-term returns."
      }
    ],
    quiz: [
      {
        id: "m3-q1",
        question: "Which financial statement provides a snapshot of a company's assets, liabilities, and equity at a specific point in time?",
        options: [
          "Income Statement",
          "Cash Flow Statement",
          "Balance Sheet",
          "Statement of Retained Earnings"
        ],
        correctAnswerIndex: 2,
        explanation: "The Balance Sheet acts as a static snapshot of what a company owns (assets) and owes (liabilities), along with net worth (equity) on a specific date."
      },
      {
        id: "m3-q2",
        question: "If a company has a Net Income of ₹10 Crores and has 5 million shares outstanding, what is its Earnings Per Share (EPS)?",
        options: [
          "₹2 per share",
          "₹20 per share",
          "₹50 per share",
          "₹200 per share"
        ],
        correctAnswerIndex: 1,
        explanation: "EPS = Net income / Shares outstanding. ₹100,000,000 / 5,000,000 = ₹20 per share."
      },
      {
        id: "m3-q3",
        question: "A stock trades at ₹800 and its EPS is ₹40. What is its P/E ratio?",
        options: [
          "20x",
          "32x",
          "10x",
          "40x"
        ],
        correctAnswerIndex: 0,
        explanation: "P/E Ratio = Stock Price / EPS. ₹800 / ₹40 = 20."
      },
      {
        id: "m3-q4",
        question: "What is Free Cash Flow (FCF) defined as?",
        options: [
          "Revenue minus cost of goods sold",
          "Operating Cash Flow minus Capital Expenditures (CapEx)",
          "Net Income plus dividends paid",
          "Total assets minus total liabilities"
        ],
        correctAnswerIndex: 1,
        explanation: "Free Cash Flow represents the cash generated after spending money on maintaining or expanding physical assets: FCF = Operating Cash Flow - CapEx."
      },
      {
        id: "m3-q5",
        question: "What does a high Return on Equity (ROE) indicate about a company?",
        options: [
          "The company relies heavily on debt to survive.",
          "The company effectively utilizes shareholders' capital to generate profit.",
          "The stock is currently overvalued.",
          "The company has negative free cash flow."
        ],
        correctAnswerIndex: 1,
        explanation: "ROE measures capital efficiency, specifically how much profit a company generates for every rupee of shareholders' equity."
      },
      {
        id: "m3-q6",
        question: "If a company has ₹20 Crores in current assets and ₹10 Crores in current liabilities, what is its Current Ratio?",
        options: [
          "0.5",
          "1.0",
          "2.0",
          "10.0"
        ],
        correctAnswerIndex: 2,
        explanation: "Current Ratio = Current Assets / Current Liabilities. ₹20 Crores / ₹10 Crores = 2.0. A ratio above 1.5 is generally considered healthy."
      },
      {
        id: "m3-q7",
        question: "Which type of Economic Moat is characterized by the product becoming more valuable as the user base grows?",
        options: [
          "High Switching Costs",
          "Network Effects",
          "Cost Advantage",
          "Regulatory Moat"
        ],
        correctAnswerIndex: 1,
        explanation: "Network effects occur when each new user adds value to the network, making it harder for competitors to displace (like Visa or social networks)."
      },
      {
        id: "m3-q8",
        question: "What does negative Free Cash Flow paired with positive Net Income suggest?",
        options: [
          "The company is highly profitable and paying dividends.",
          "The company's earnings might be of low quality, possibly due to uncollected sales (receivables) or high capital investments.",
          "The company has no debt.",
          "The P/E ratio is contracting."
        ],
        correctAnswerIndex: 1,
        explanation: "If profits are high but cash is negative, it indicates that cash is locked in working capital (uncollected receivables) or heavy capital spending, showing low earnings quality."
      }
    ]
  },
  {
    id: 3,
    number: 4,
    title: "Reading Charts & Technical Indicators",
    description: "Master chart patterns, support/resistance lines, moving averages, and momentum tools to time your simulator trades effectively.",
    duration: "35 min",
    lessons: [
      {
        id: "m4-l1",
        title: "Candlestick Charting Principles",
        readTime: "5 min",
        introduction: "Technical analysis uses charts to analyze market price action and volume. The foundation of modern charting is the Japanese candlestick, which visualizes price action over a given timeframe.",
        sections: [
          {
            heading: "Anatomy of a Candlestick",
            body: "A candlestick represents price movement over a specific period (e.g., 1 day, 1 hour). It consists of a real body and wicks (shadows). The body represents the range between the open and close price. If the close is higher than the open, the candle is green (bullish). If the close is lower, it is red (bearish). The wicks represent the highest and lowest prices hit during the period."
          },
          {
            heading: "Common Candlestick Patterns",
            body: "Patterns tell a story of battle between buyers (bulls) and sellers (bears). A 'Doji' candle has a tiny body, indicating indecision. A 'Hammer' candle has a long lower wick, showing that sellers drove the price down, but buyers pushed it back up before the close, signaling a bullish reversal."
          }
        ],
        importantConcept: "Timeframes: Different charts represent different time periods. Scalpers look at 1-minute charts, swing traders look at daily charts, and long-term investors look at weekly or monthly charts.",
        realWorldExample: "A stock opens at ₹100, spikes to ₹105, drops to ₹98, and closes at ₹104. This daily candle will have a green body from ₹100 to ₹104, an upper wick pointing to ₹105, and a lower wick pointing to ₹98.",
        keyTakeaways: [
          "Candlesticks show Open, High, Low, and Close prices for a set timeframe.",
          "Green bodies indicate buying pressure; red bodies show selling pressure.",
          "Wicks represent extreme price volatility and potential exhaustion points.",
          "Patterns like Doji or Hammers suggest potential trend reversals."
        ],
        commonMistakes: [
          "Trading candlestick patterns in isolation without checking the overall market trend. Reversal signals are only valid at key support or resistance levels."
        ],
        quickRecap: "Candlesticks pack four price points into a visual body and wicks. Study hammer, doji, and engulfing patterns to gauge price sentiment."
      },
      {
        id: "m4-l2",
        title: "Support, Resistance, & Trends",
        readTime: "5 min",
        introduction: "Prices do not move in straight lines; they move in waves. The peaks and troughs of these waves form support and resistance levels, which act as barriers to price movements.",
        sections: [
          {
            heading: "Support: The Floor",
            body: "Support is the price level where a downtrend tends to pause due to a concentration of buying interest (demand). At this level, buyers see the asset as a bargain, and sellers are reluctant to sell, causing the downward price momentum to stop and reverse."
          },
          {
            heading: "Resistance: The Ceiling",
            body: "Resistance is the price level where an uptrend tends to pause due to a concentration of selling interest (supply). As the price climbs toward resistance, sellers look to lock in profits, and buyers become hesitant to buy at high prices, capping the upward momentum."
          }
        ],
        importantConcept: "Role Reversal: Once a resistance level is broken by a significant margin (a breakout), it frequently flips and acts as a new support level. Similarly, broken support levels become resistance.",
        realWorldExample: "Nifty index drops to 19,000 three times, and each time it bounces back up. 19,000 is a strong support line. If Nifty rallies to 20,000 twice and falls back, 20,000 is a key resistance ceiling. If Nifty breaks above 20,000, that level will likely serve as support on future pullbacks.",
        keyTakeaways: [
          "Support acts as a price floor; resistance acts as a price ceiling.",
          "Draw horizontal lines connecting multiple historical price turning points.",
          "Breakouts occur when price decisively breaches support or resistance.",
          "A broken resistance often turns into a support on subsequent retests."
        ],
        commonMistakes: [
          "Buying immediately at a resistance line, rather than waiting for a confirmed breakout or a pullback to support.",
          "Placing stop losses exactly on the support line, making them targets for market noise. Place them slightly below support."
        ],
        quickRecap: "Support is a buying floor; resistance is a selling ceiling. Look for breaches of these levels to identify trend breakouts."
      },
      {
        id: "m4-l3",
        title: "Moving Averages (SMA, EMA, Golden Cross)",
        readTime: "5 min",
        introduction: "To see through short-term market noise, traders use indicators. Moving Averages smooth out price data to create a single flowing line, helping to identify the underlying trend direction.",
        sections: [
          {
            heading: "Simple vs. Exponential Moving Averages",
            body: "A Simple Moving Average (SMA) calculates the average price over a set number of periods (e.g., 50 days). An Exponential Moving Average (EMA) places a higher weight on recent prices, making it react faster to new price changes. Common moving averages include the 20-day (short-term), 50-day (medium-term), and 200-day (long-term)."
          },
          {
            heading: "Crossover Signals: Golden Cross & Death Cross",
            body: "Traders look for crossovers between short-term and long-term averages. A 'Golden Cross' occurs when a fast moving average (like 50-day) crosses above a slow moving average (like 200-day), signaling a powerful bullish trend. A 'Death Cross' is the opposite, signaling a major bearish decline."
          }
        ],
        importantConcept: "Lagging Indicator: Moving averages are based on historical data. They do not predict future trends; they confirm trends that have already begun.",
        realWorldExample: "Reliance stock is trading at ₹2,500. Its 50-day SMA is ₹2,400 and its 200-day SMA is ₹2,200. Because the price is above both averages, and the 50-day is above the 200-day, the stock is in a confirmed long-term uptrend. When the 50-day crosses above the 200-day, technical traders buy heavy.",
        keyTakeaways: [
          "Moving averages smooth out volatility to identify trends.",
          "EMA reacts quicker to price changes; SMA is better for long-term trends.",
          "Golden Cross (50 SMA crossing above 200 SMA) is a major bullish signal.",
          "Death Cross (50 SMA crossing below 200 SMA) is a major bearish signal."
        ],
        commonMistakes: [
          "Using moving average crossovers in sideways, rangebound markets. Moving averages perform poorly in choppy consolidations, generating false buy/sell signals."
        ],
        quickRecap: "Moving averages smooth out volatility. Buy during a Golden Cross and exit or short during a Death Cross."
      },
      {
        id: "m4-l4",
        title: "Volatility and Momentum (RSI, MACD)",
        readTime: "6 min",
        introduction: "Momentum indicators measure the speed and strength of price movements, helping to identify whether a trend is gaining strength or losing steam.",
        sections: [
          {
            heading: "Relative Strength Index (RSI)",
            body: "RSI is a momentum oscillator that ranges from 0 to 100. Traditionally, an RSI value above 70 indicates that a stock is overbought (potentially overvalued and due for a pullback). An RSI below 30 indicates that a stock is oversold (potentially undervalued and due for a rebound)."
          },
          {
            heading: "MACD: Moving Average Convergence Divergence",
            body: "MACD uses the relationship between two EMAs to identify changes in trend direction and momentum. It consists of the MACD line, the Signal line, and a histogram. A buy signal occurs when the MACD line crosses above the Signal line, while a sell signal occurs when it crosses below."
          }
        ],
        importantConcept: "Divergence: When the stock price makes a new high, but the momentum indicator (like RSI) fails to make a new high. This signals that the price trend is weakening and a reversal may be close.",
        realWorldExample: "Infosys stock rises rapidly from ₹1,400 to ₹1,700, pushing the RSI to 85. Investors are euphoric. However, an RSI of 85 signals extreme overbuying. Swing traders start trimming positions or buying puts, expecting a correction back to support.",
        keyTakeaways: [
          "Momentum oscillators measure the velocity of price changes.",
          "RSI levels: >70 is overbought (sell signal candidate); <30 is oversold (buy signal candidate).",
          "MACD crossovers signal shifts in short-term trend momentum.",
          "Look for divergences between price and momentum to spot major reversals."
        ],
        commonMistakes: [
          "Blindly buying a stock just because RSI is under 30. During strong bear markets, stocks can remain oversold (RSI < 30) for weeks while continuing to drop."
        ],
        quickRecap: "RSI spots overbought and oversold extremes. MACD line crossovers signal trend momentum changes."
      },
      {
        id: "m4-l5",
        title: "Volume Analysis & Confirmations",
        readTime: "5 min",
        introduction: "Price tells you what is happening; volume tells you how much conviction is behind the move. Volume represents the total number of shares traded during a given period.",
        sections: [
          {
            heading: "The Meaning of Volume",
            body: "Volume is the fuel of price action. For a price trend or breakout to be sustainable, it must be accompanied by high volume. High volume indicates that large institutional buyers (mutual funds, foreign investors) are participating in the move. Low-volume moves are easily reversed."
          },
          {
            heading: "Volume and Trend Confirmation",
            body: "If a stock price rises on high volume, it shows bullish conviction. If it rises on low volume, the trend is weak and likely a trap. If a stock breaks above resistance on high volume, it is a confirmed breakout. A breakout on low volume is highly likely to fail (a fakeout)."
          }
        ],
        importantConcept: "Accumulation and Distribution: Accumulation occurs when large players buy shares slowly, keeping prices stable while volume rises. Distribution occurs when institutions sell positions to retail investors near market peaks.",
        realWorldExample: "Stock DEF consolidates between ₹100 and ₹105 for a month on low volume. Suddenly, it breaks above ₹105, closing at ₹110 on 5x the average daily volume. This massive volume confirms that institutions are buying, making it a high-probability trade entry.",
        keyTakeaways: [
          "Volume represents the total quantity of shares traded.",
          "High volume confirms price movements; low volume flags weak conviction.",
          "Breakouts must be verified with above-average volume levels.",
          "Price rise with dropping volume indicates exhaustion of the trend."
        ],
        commonMistakes: [
          "Trading breakouts on low volume, which often result in sharp reversals and trigger stop losses."
        ],
        quickRecap: "Never analyze price without looking at volume. High volume validates breakouts, whereas low volume signals caution."
      }
    ],
    quiz: [
      {
        id: "m4-q1",
        question: "What does a daily 'Hammer' candlestick pattern typically signal?",
        options: [
          "A continuation of the current downtrend",
          "A potential bullish reversal after a price decline",
          "A sudden drop in trading volume",
          "A sideways consolidation phase"
        ],
        correctAnswerIndex: 1,
        explanation: "A hammer candlestick has a small body and a long lower wick, indicating that sellers pushed the price down, but buyers aggressively recovered it before the close, suggesting a bullish reversal."
      },
      {
        id: "m4-q2",
        question: "When a stock breaks out above a key resistance level, what is expected of the resistance level?",
        options: [
          "It disappears completely and is never referenced again.",
          "It flips to become a new support level.",
          "It immediately triggers a trading halt.",
          "It doubles in value."
        ],
        correctAnswerIndex: 1,
        explanation: "Under technical analysis principles, once a resistance ceiling is decisively breached, it reverses roles to act as a support floor on future price pullbacks."
      },
      {
        id: "m4-q3",
        question: "What occurs during a 'Golden Cross' technical crossover?",
        options: [
          "The stock price crosses above the 52-week high.",
          "A short-term moving average (like 50 SMA) crosses above a long-term average (like 200 SMA).",
          "RSI goes above 70 while MACD goes below the signal line.",
          "A stock experiences a 2-for-1 stock split."
        ],
        correctAnswerIndex: 1,
        explanation: "A Golden Cross is a bullish signal that occurs when a faster moving average crosses above a slower moving average, confirming a strong upward trend."
      },
      {
        id: "m4-q4",
        question: "What does an RSI value of 82 typically suggest?",
        options: [
          "The stock is heavily oversold and due for a bounce.",
          "The trading volume is extremely low.",
          "The stock is overbought and may experience a short-term pullback.",
          "The stock has hit its absolute maximum valuation."
        ],
        correctAnswerIndex: 2,
        explanation: "An RSI above 70 is considered overbought, indicating that the price rise may be overextended and a correction or pullback is likely."
      },
      {
        id: "m4-q5",
        question: "Which indicator is best suited for measuring the speed and velocity of price trends to identify overbought levels?",
        options: [
          "Simple Moving Average",
          "Relative Strength Index (RSI)",
          "Volume Profile",
          "Accumulation / Distribution line"
        ],
        correctAnswerIndex: 1,
        explanation: "The RSI is a momentum oscillator specifically designed to measure price velocity and mark extremes above 70 as overbought."
      },
      {
        id: "m4-q6",
        question: "What is a 'fakeout' in technical analysis?",
        options: [
          "When a broker refuses to execute a trade",
          "When a price temporarily breaks support or resistance but quickly reverses, trapping traders",
          "When trading volumes drop to zero",
          "When a company splits its stock unexpectedly"
        ],
        correctAnswerIndex: 1,
        explanation: "A fakeout occurs when a breakout lacks follow-through and reverses rapidly, creating a bull or bear trap for breakout traders."
      },
      {
        id: "m4-q7",
        question: "Why do traders analyze trading volume alongside price action?",
        options: [
          "Volume determines the dividend yield of the stock.",
          "Volume shows whether institutional buying power is confirming the price movement.",
          "Volume predicts the PE ratio of the company.",
          "Volume changes the company's market cap."
        ],
        correctAnswerIndex: 1,
        explanation: "High volume shows institutional conviction, which validates price movements and breakouts. Low volume indicates weak retail participation."
      },
      {
        id: "m4-q8",
        question: "What is the primary difference between a Simple Moving Average (SMA) and an Exponential Moving Average (EMA)?",
        options: [
          "The SMA measures volume; the EMA measures price.",
          "The EMA places greater weight on recent prices, making it react faster to trend shifts.",
          "The SMA is a leading indicator; the EMA is lagging.",
          "The EMA only calculates opening prices."
        ],
        correctAnswerIndex: 1,
        explanation: "The Exponential Moving Average (EMA) applies a weighting factor that favors recent price points, causing it to react faster to price shifts than the SMA."
      }
    ]
  },
  {
    id: 4,
    number: 5,
    title: "Portfolio Design & Asset Allocation",
    description: "Learn how to diversify, calculate risk-reward ratios, match asset classes to your goals, and rebalance your virtual portfolio.",
    duration: "30 min",
    lessons: [
      {
        id: "m5-l1",
        title: "Defining Asset Classes & Diversification",
        readTime: "5 min",
        introduction: "You've heard the phrase, 'Don't put all your eggs in one basket.' In finance, this is the rule of diversification. The key to diversification is mixing asset classes that do not move in tandem.",
        sections: [
          {
            heading: "What are Asset Classes?",
            body: "An asset class is a grouping of financial instruments with similar characteristics and market behaviors. The main classes are: Equities (high risk, high return), Fixed Income/Debt (low risk, stable income), Cash/Cash Equivalents (ultra-safe, low return), and Commodities like Gold (inflation hedges)."
          },
          {
            heading: "The Power of Non-Correlation",
            body: "True diversification is about correlation. When equities crash, bonds and gold often hold their value or rise. By owning a mix, you reduce the overall volatility of your portfolio. Diversification is the only 'free lunch' in finance, offering lower risk without sacrificing expected returns."
          }
        ],
        importantConcept: "Correlation Coefficient: A measure from -1 to +1 showing how two assets move relative to each other. A correlation of +1 means they move in lockstep; -1 means they move in opposite directions; 0 means their movements are completely independent.",
        realWorldExample: "If you invest all your money in 5 different tech stocks, you are not diversified—if the tech sector crashes, your entire portfolio drops. However, if you split your capital across 3 tech stocks, 1 banking stock, a gold ETF, and short-term bonds, your losses are buffered.",
        keyTakeaways: [
          "Asset classes respond differently to economic cycles.",
          "Diversification reduces portfolio volatility and downside risk.",
          "Choose non-correlated assets to maximize diversification benefits.",
          "Diversification does not guarantee profit, but it guards against ruin."
        ],
        commonMistakes: [
          "Over-diversification—owning 50+ stocks, which dilutes your returns to match index performance, while increasing transaction fees."
        ],
        quickRecap: "Diversification spreads risk across non-correlated asset classes (stocks, bonds, gold) to cushion your portfolio from market drops."
      },
      {
        id: "m5-l2",
        title: "Balancing Risk & Return Profiles",
        readTime: "5 min",
        introduction: "Risk and return are inseparable twins. You cannot earn high returns without taking on higher risk. Understanding your risk tolerance is key to building a portfolio you can stick with during market storms.",
        sections: [
          {
            heading: "Risk Tolerance vs. Risk Capacity",
            body: "Risk Tolerance is your psychological ability to handle market drops without panicking and selling. Risk Capacity is your financial ability to take risks based on your age, timeline, and cash flow. A young professional has a high risk capacity, while someone near retirement has a low capacity."
          },
          {
            heading: "Designing Your Asset Mix",
            body: "Your asset allocation should match your risk profile. Conservative investors prefer a 70/30 split in favor of debt and gold. Moderate investors lean toward a balanced 50/50 mix. Aggressive growth-oriented investors opt for an 80/20 equity-to-debt allocation."
          }
        ],
        importantConcept: "Volatility: The rate at which the price of an asset increases or decreases. High volatility means wide price swings, which translates to higher risk but potential for rapid returns.",
        realWorldExample: "During a market crash, an aggressive portfolio of 100% equity might drop 30%, causing a trader to panic and liquidate. A balanced portfolio (60% equity, 40% bonds) might only drop 12%, which is far easier to tolerate psychologically.",
        keyTakeaways: [
          "High returns require taking on volatility and risk.",
          "Risk tolerance is mental; risk capacity is determined by your financial timeline.",
          "Match your asset allocation percentage to your personal risk score.",
          "Review your asset mix annually to ensure alignment with goals."
        ],
        commonMistakes: [
          "Assuming you have a high risk tolerance until a real market correction occurs, leading to panic-selling at the bottom."
        ],
        quickRecap: "Find your ideal equity-to-debt split based on your financial timeline and psychological risk limits. Take our quiz to check your profile.",
        widgetType: "risk"
      },
      {
        id: "m5-l3",
        title: "Core-and-Satellite Investing Strategy",
        readTime: "4 min",
        introduction: "How do you combine safe, long-term investing with opportunistic trading? Many professional fund managers use the 'Core-and-Satellite' portfolio model.",
        sections: [
          {
            heading: "The Core: The Anchor",
            body: "The 'Core' represents 70-80% of your portfolio. It is invested in low-cost, highly diversified index funds, blue-chip stocks, and high-quality bonds. The goal of the core is safety, tracking market returns, and compounding wealth steadily over time."
          },
          {
            heading: "The Satellite: The Engine",
            body: "The 'Satellite' represents the remaining 20-30% of your portfolio. It is reserved for active trading, individual growth stocks, sectoral bets, or short-term swing trading in the simulator. It allows you to chase outsized returns without risking your base wealth."
          }
        ],
        importantConcept: "Alpha vs. Beta: Beta is the market return (tracked by the Core). Alpha is the excess return generated relative to the market benchmark through active selection (sought by the Satellite).",
        realWorldExample: "Rahul has a ₹10 Lakh portfolio. He places ₹7 Lakhs (Core) in a Nifty 50 Index Fund and a liquid debt fund. He reserves ₹3 Lakhs (Satellite) to trade volatile stocks in the virtual simulator, testing technical breakouts. If his trades fail, his core wealth is still safe.",
        keyTakeaways: [
          "Core-and-Satellite splits portfolio into steady foundations and active bets.",
          "Keep 70-80% of capital in safe, diversified, low-cost assets.",
          "Allocate 20-30% to high-potential individual stocks or active trading.",
          "This strategy checks behavioral urges to over-trade your core assets."
        ],
        commonMistakes: [
          "Letting the satellite grow to 80% of the portfolio due to overconfidence, exposing the entire net worth to high volatility."
        ],
        quickRecap: "Anchor 70-80% of your wealth in passive core indexes. Use the remaining 20-30% satellite to trade and chase market-beating alpha."
      },
      {
        id: "m5-l4",
        title: "Portfolio Rebalancing Framework",
        readTime: "5 min",
        introduction: "Over time, different assets grow at different rates, causing your initial asset allocation to drift. Portfolio rebalancing is the disciplined process of restoring your original asset mix.",
        sections: [
          {
            heading: "The Asset Allocation Drift",
            body: "Suppose you start with a 60% Equity and 40% Debt allocation. After a major stock market rally, your equities grow faster, and your mix drifts to 75% Equity and 25% Debt. You are now exposed to far more risk than you originally planned. If a crash occurs, you will suffer deeper losses."
          },
          {
            heading: "How to Rebalance",
            body: "Rebalancing forces you to sell a portion of your winning assets (equities) and buy more of your underperforming assets (debt). This systematically forces you to 'buy low and sell high' without emotional bias. Rebalance once a year or whenever your mix drifts by more than 5%."
          }
        ],
        importantConcept: "Tactical Asset Allocation: Temporarily deviating from your long-term target allocation to take advantage of short-term market opportunities (e.g., buying more stocks during a panic).",
        realWorldExample: "In a stock bull run, Arjun's portfolio drifts from 50/50 to 65/35. He sells 15% of his equity holdings and buys debt mutual funds. When the market subsequently corrects, his losses are muted, and he has cash in debt funds to buy cheap stocks.",
        keyTakeaways: [
          "Market movements cause your asset allocation mix to drift over time.",
          "Drifting increases portfolio risk during bull runs.",
          "Rebalancing forces the discipline of buying low and selling high.",
          "Schedule rebalancing checks annually or based on 5% drift thresholds."
        ],
        commonMistakes: [
          "Letting winners run indefinitely without rebalancing, resulting in a single stock or sector dominating your net worth."
        ],
        quickRecap: "Restore your target asset mix periodically. Sell overperforming winners to buy underperforming assets, maintaining your risk profile."
      },
      {
        id: "m5-l5",
        title: "Managing Investment Psychology & FOMO",
        readTime: "6 min",
        introduction: "Even the best asset allocation plan fails if you cannot manage your own emotions. Behavioral finance studies suggest that investor psychology is the single largest determinant of investment success.",
        sections: [
          {
            heading: "Loss Aversion Bias",
            body: "Psychologists Kahneman and Tversky proved that the pain of losing money is twice as intense as the pleasure of gaining an equivalent amount. This 'loss aversion' leads to bad decisions, such as selling winners too early (to secure small profits) and holding losers too long (hoping to break even)."
          },
          {
            heading: "Overcoming FOMO and Herd Behavior",
            body: "Herd behavior is the tendency to copy the actions of a larger group, assuming they know more. When a hot stock surges, herd behavior triggers massive FOMO. Investors jump in without researching, buying at peaks just before the smart money exits. Overcoming this requires automation, journaling, and strict adherence to valuation buy-limits."
          }
        ],
        importantConcept: "Behavioral Gap: The difference between the returns of an investment fund and the actual, lower returns achieved by the investors inside that fund, caused by emotional timing issues (buying high and selling low).",
        realWorldExample: "In 2021, speculative stocks surged. Driven by social media and herd behavior, retail investors bought heavy at peak prices. When interest rates rose, these stocks collapsed 80%. Investors who bought due to FOMO panicked and sold at the absolute bottom, locking in major losses while long-term balanced portfolios remained steady.",
        keyTakeaways: [
          "Your biggest enemy in investing is likely your own emotional response.",
          "Loss aversion causes investors to hold bad assets in hopes of recovering losses.",
          "FOMO leads to buying at market tops; panic leads to selling at market bottoms.",
          "Mitigate emotional drift by automating investments (SIPs) and respecting stop losses."
        ],
        commonMistakes: [
          "Constantly checking portfolio values daily, which increases anxiety and triggers unnecessary active trading."
        ],
        quickRecap: "Maintain discipline by ignoring media noise. Loss aversion and FOMO are major traps; combat them with automation and set strategies."
      }
    ],
    quiz: [
      {
        id: "m5-q1",
        question: "What is the primary benefit of diversifying across assets with a negative correlation?",
        options: [
          "It guarantees that all assets will rise simultaneously.",
          "It lowers transaction costs and taxes.",
          "It reduces overall portfolio volatility and limits downside losses.",
          "It increases the Beta of the portfolio."
        ],
        correctAnswerIndex: 2,
        explanation: "Assets with negative correlation move in opposite directions, cushioning the portfolio's downside when one asset class declines."
      },
      {
        id: "m5-q2",
        question: "Which investor profile has the highest capacity to bear investment volatility?",
        options: [
          "A retiree relying on a portfolio for monthly living expenses",
          "A young professional saving for a retirement 35 years away",
          "A family saving for a house down payment needed in 6 months",
          "A conservative student with no cash inflow"
        ],
        correctAnswerIndex: 1,
        explanation: "Risk capacity is highly dependent on timeline. A young professional with decades before retirement can easily weather short-term market corrections."
      },
      {
        id: "m5-q3",
        question: "In a Core-and-Satellite portfolio, what is the role of the 'Core'?",
        options: [
          "To trade high-risk options and futures",
          "To hold low-cost, highly diversified index funds for steady growth",
          "To invest in speculative penny stocks",
          "To keep cash under a mattress"
        ],
        correctAnswerIndex: 1,
        explanation: "The core represents the majority (70-80%) of the portfolio, anchored in stable, diversified, index-tracking assets for steady compounding."
      },
      {
        id: "m5-q4",
        question: "Why is portfolio rebalancing important?",
        options: [
          "It maximizes short-term day trading returns.",
          "It systematically restores your target risk profile by correcting asset drift.",
          "It increases your dividend payouts automatically.",
          "It eliminates the need for stock analysis."
        ],
        correctAnswerIndex: 1,
        explanation: "Rebalancing corrects the drift caused by varying asset growth rates, restoring the portfolio to its planned risk level."
      },
      {
        id: "m5-q5",
        question: "What does a correlation coefficient of 0.0 indicate between two assets?",
        options: [
          "They move in exact opposite directions.",
          "Their price movements are completely independent of each other.",
          "They rise and fall in perfect lockstep.",
          "One asset is twice as risky as the other."
        ],
        correctAnswerIndex: 1,
        explanation: "A correlation coefficient of 0.0 indicates no linear relationship, meaning the assets move independently, which helps in diversification."
      },
      {
        id: "m5-q6",
        question: "What is 'Loss Aversion' in behavioral finance?",
        options: [
          "The practice of avoiding all high-risk assets",
          "A psychological bias where the pain of losing is twice as intense as the pleasure of gaining",
          "An automated stop-loss order set by a broker",
          "A strategy to minimize portfolio drawdowns"
        ],
        correctAnswerIndex: 1,
        explanation: "Loss aversion refers to the human tendency to fear losses significantly more than valuing equivalent gains, leading to holding onto losing investments."
      },
      {
        id: "m5-q7",
        question: "How does the 'Behavioral Gap' affect typical retail investors?",
        options: [
          "It expands their wallet balance automatically.",
          "It leads to lower investor returns compared to fund returns due to emotional market timing.",
          "It represents the fee charged by financial planners.",
          "It increases their risk capacity."
        ],
        correctAnswerIndex: 1,
        explanation: "The behavioral gap occurs when investors buy high (due to FOMO) and sell low (due to panic), lagging behind passive buy-and-hold returns."
      },
      {
        id: "m5-q8",
        question: "If a moderate investor's target is 50% Equity / 50% Debt, but a bull market shifts it to 70% Equity / 30% Debt, what action is recommended?",
        options: [
          "Do nothing and let the equity holdings grow further.",
          "Rebalance by selling 20% of equity and purchasing debt to restore the risk profile.",
          "Sell all debt and buy equity to maximize returns.",
          "Withdraw all cash and hold physical gold."
        ],
        correctAnswerIndex: 1,
        explanation: "Rebalancing restores the original 50/50 risk profile. Selling the outperforming equity and buying debt ensures the portfolio is not overexposed to market volatility."
      }
    ]
  },
  {
    id: 5,
    number: 6,
    title: "Fixed Income & Mutual Funds",
    description: "Understand bond mechanics, active vs. passive mutual funds, Systematic Investment Plans (SIPs), and how fees affect performance.",
    duration: "25 min",
    lessons: [
      {
        id: "m6-l1",
        title: "Understanding Bonds & Debt Yields",
        readTime: "4 min",
        introduction: "While stocks make you an owner, bonds make you a lender. Bonds are debt securities issued by corporations or governments to raise capital.",
        sections: [
          {
            heading: "How Bonds Work",
            body: "When you buy a bond, you lend money to the issuer. In return, they agree to pay you a fixed rate of interest (the coupon) periodically, and return the face value (principal) of the bond on a set maturity date. Government bonds (G-Secs) are backed by the sovereign, making them virtually risk-free."
          },
          {
            heading: "The Inverse Relationship of Price and Yield",
            body: "A crucial concept is that bond prices and interest rates move in opposite directions. When market interest rates rise, existing bonds with lower coupon rates become less attractive, causing their market prices to fall. When interest rates fall, bond prices rise."
          }
        ],
        importantConcept: "Yield to Maturity (YTM): The total return anticipated on a bond if the bond is held until its maturity date, reflecting interest payments and capital gain/loss.",
        realWorldExample: "You buy a 10-year government bond with a face value of ₹10,000 and a 7% coupon rate. Every year, the government pays you ₹700 in interest. After 10 years, they return your ₹10,000. It is a predictable, low-risk income stream.",
        keyTakeaways: [
          "Bonds represent a loan from the investor to the issuer.",
          "Bonds provide predictable interest payments (coupons) and capital return.",
          "Government bonds have lower default risk than corporate bonds.",
          "Bond prices move inversely to prevailing interest rates."
        ],
        commonMistakes: [
          "Thinking bonds are completely risk-free. Corporate bonds carry default (credit) risk, and all bonds carry interest rate risk."
        ],
        quickRecap: "Bonds pay fixed interest for lending cash. Government bonds are ultra-safe; corporate bonds pay higher interest for higher risk."
      },
      {
        id: "m6-l2",
        title: "Mutual Funds vs. ETFs (Active vs. Passive)",
        readTime: "5 min",
        introduction: "Not everyone has the time to analyze individual stocks. Mutual Funds and Exchange Traded Funds (ETFs) allow investors to pool their money to buy a diversified basket of securities managed by professionals.",
        sections: [
          {
            heading: "Active Mutual Funds",
            body: "In an active fund, a professional portfolio manager handpicks stocks aiming to beat a benchmark index (like Nifty 50). This requires heavy research, resulting in higher management fees (expense ratios). Research shows the majority of active managers fail to beat their benchmarks over long periods."
          },
          {
            heading: "Passive Index Funds and ETFs",
            body: "Passive funds simply match a market index (like Nifty 50). No active selection is done, leading to rock-bottom expense ratios. ETFs are similar to index funds but trade on stock exchanges like regular shares, allowing real-time trading during market hours."
          }
        ],
        importantConcept: "Expense Ratio: The annual fee charged by a fund to cover management and operating costs, expressed as a percentage of assets under management. A 1% difference in expense ratios can cost lakhs in compound growth over decades.",
        realWorldExample: "Fund manager Rohit runs an active fund charging a 2% fee, returning 12% annual growth. Passive ETF matching Nifty 50 charges a 0.1% fee, returning 11.5%. After fees, the passive ETF delivers a higher net return to investors, showing the power of low costs.",
        keyTakeaways: [
          "Mutual funds pool investor money to buy diversified stock/bond portfolios.",
          "Active funds try to beat the market; passive funds try to match the market.",
          "Passive funds feature significantly lower expense ratios.",
          "ETFs are passive funds traded in real-time on stock exchanges."
        ],
        commonMistakes: [
          "Buying mutual funds based purely on last year's performance. Past performance is rarely a predictor of future returns."
        ],
        quickRecap: "Choose active funds for potential outperformance, or passive index funds/ETFs for low fees and guaranteed market tracking."
      },
      {
        id: "m6-l3",
        title: "Systematic Investment Plans (SIP) vs. Lumpsum",
        readTime: "5 min",
        introduction: "How should you deploy your capital? Should you invest all your money at once (Lumpsum) or invest fixed amounts at regular intervals (SIP)? Let's analyze the mechanics of both strategies.",
        sections: [
          {
            heading: "The SIP and Rupee Cost Averaging",
            body: "A Systematic Investment Plan (SIP) automates investing by deducting a fixed amount weekly or monthly. This leverages 'Rupee Cost Averaging.' When the market falls, your fixed budget buys more units; when the market rises, you buy fewer units. This removes market-timing anxiety."
          },
          {
            heading: "Lumpsum Investing",
            body: "Lumpsum is investing a large sum of money all at once. Historically, since markets rise over time, investing early in a lumpsum beats SIPs if you have the cash. However, if you invest a lumpsum right before a crash, it takes a heavy psychological toll."
          }
        ],
        importantConcept: "Dollar/Rupee Cost Averaging: Systematically investing equal amounts of money at regular intervals, reducing the impact of volatility and eliminating the need to time the market.",
        realWorldExample: "Rahul invests ₹10,000 monthly via SIP. In Month 1, the fund NAV is ₹100 (buys 100 units). In Month 2, the market crashes and NAV is ₹50 (buys 200 units). In Month 3, NAV recovers to ₹100. Rahul invested ₹20,000 total and owns 300 units worth ₹30,000. He made a profit even though the market only returned to its start point.",
        keyTakeaways: [
          "SIPs automate savings and build strong financial discipline.",
          "Rupee cost averaging lowers average unit acquisition costs.",
          "Lumpsum investing is mathematically optimal but behaviorally risky.",
          "SIPs are ideal for salaried individuals investing monthly savings."
        ],
        commonMistakes: [
          "Stopping your SIP during a market crash. The crash is exactly when your SIP buys units on discount; stopping it defeats the purpose of cost averaging."
        ],
        quickRecap: "SIPs buy more units when markets are low and fewer when they are high. Use our calculator to see how regular investments compound.",
        widgetType: "growth"
      },
      {
        id: "m6-l4",
        title: "Evaluating Expense Ratios & Performance Metrics",
        readTime: "6 min",
        introduction: "When choosing a mutual fund or ETF, you need to look beyond the basic return numbers. You must audit fund performance using risk-adjusted return metrics.",
        sections: [
          {
            heading: "Understanding the Impact of Fees",
            body: "Expense ratios represent a direct leak in compounding. Direct plans of mutual funds do not pay broker commissions, resulting in lower expense ratios than Regular plans. Direct plans can boost your final returns by 1-1.5% annually, which compounds to massive sums."
          },
          {
            heading: "Sharpe Ratio & Beta",
            body: "The Sharpe Ratio measures the excess return generated per unit of risk. A Sharpe ratio above 1 is considered good, showing high efficiency. Beta measures how volatile the fund is relative to the index. A Beta of 0.8 means the fund fluctuates less than the market; 1.2 means it fluctuates more."
          }
        ],
        importantConcept: "Tracking Error: The difference between a passive fund's performance and the performance of the benchmark index it replicates. Lower tracking error means better management execution.",
        realWorldExample: "Fund X and Fund Y both return 15% in a year. However, Fund X took twice the volatility (Beta of 1.5) compared to Fund Y (Beta of 0.7). Fund Y has a higher Sharpe ratio, indicating it generated its returns with far less stress and risk.",
        keyTakeaways: [
          "Choose direct plans over regular plans to avoid broker commissions.",
          "The Sharpe Ratio evaluates whether fund returns justify its risk levels.",
          "Beta indicates a fund's sensitivity to broad market movements.",
          "Seek passive funds with low expense ratios and minimal tracking errors."
        ],
        commonMistakes: [
          "Overlooking the impact of expense ratios, which drain your wealth silently over long holding periods."
        ],
        quickRecap: "Choose Direct plans to save on fees. Analyze the Sharpe ratio to ensure your mutual fund is generating efficient, risk-adjusted returns."
      },
      {
        id: "m6-l5",
        title: "Tax Implications of Mutual Funds",
        readTime: "5 min",
        introduction: "It's not what you make; it's what you keep. Understanding the tax implications of your mutual fund investments is essential for calculating your true net returns.",
        sections: [
          {
            heading: "Equity Mutual Fund Taxation",
            body: "Funds that invest at least 65% of their assets in equities are classified as equity funds. Profits realized within 1 year are Short-Term Capital Gains (STCG), taxed at a higher rate (typically 15% or 20% depending on region). Profits held for over 1 year are Long-Term Capital Gains (LTCG). In systems like India's, LTCG is taxed at 10% or 12.5% on gains exceeding ₹1.25 Lakhs per fiscal year."
          },
          {
            heading: "Debt Mutual Fund Taxation",
            body: "Debt funds invest in bonds and fixed income. Tax rules vary, but many modern tax codes treat debt fund gains as normal income. This means gains are added to your personal taxable income and taxed at your progressive tax slab rate, regardless of how long you hold the units. High-income earners must plan carefully."
          }
        ],
        importantConcept: "Capital Gain Realization: Taxes are only triggered when you sell (redeem) your mutual fund units. Simply holding units that have appreciated in value does not trigger a tax liability, allowing your capital to compound tax-free.",
        realWorldExample: "Neha invests ₹1,00,000 in an equity fund. Two years later, she sells it for ₹1,80,000, making a ₹80,000 gain. Because she held the units for over 1 year, this is LTCG. In India, since the total gain is below the ₹1.25 Lakh tax-free limit, she pays ₹0 in tax. If she sold it within 9 months, she would pay ₹12,000 (15% STCG) in tax.",
        keyTakeaways: [
          "Taxation rates differ significantly between equity and debt mutual funds.",
          "Equity holdings over 1 year enjoy lower Long-Term Capital Gains tax rates.",
          "Debt fund gains are generally added to your taxable income and taxed at your slab rate.",
          "Taxes are only triggered upon selling (realization) of mutual fund units."
        ],
        commonMistakes: [
          "Selling mutual fund units right before the 1-year mark, triggering high STCG tax rates instead of waiting for lower LTCG rates."
        ],
        quickRecap: "Equity gains held over 1 year are taxed at lower LTCG rates. Debt fund gains are added to your tax slab. Hold investments longer to minimize tax drag."
      }
    ],
    quiz: [
      {
        id: "m6-q1",
        question: "When prevailing market interest rates rise, what typically happens to the prices of existing fixed-coupon bonds?",
        options: [
          "Bond prices rise.",
          "Bond prices fall.",
          "Bond prices remain completely unchanged.",
          "The coupon rate of the existing bonds increases automatically."
        ],
        correctAnswerIndex: 1,
        explanation: "Bond prices and interest rates move in opposite directions. When rates rise, existing fixed-rate bonds become less valuable, pushing their prices down."
      },
      {
        id: "m6-q2",
        question: "What is the key difference between a Direct plan and a Regular plan of a Mutual Fund?",
        options: [
          "Direct plans invest in large-cap stocks, while Regular plans invest in small-caps.",
          "Direct plans do not charge transaction taxes.",
          "Direct plans bypass brokers, resulting in lower expense ratios and higher net returns.",
          "Regular plans offer guaranteed monthly dividends."
        ],
        correctAnswerIndex: 2,
        explanation: "Direct plans are bought directly from the fund house without agent commission fees, resulting in lower expense ratios and higher compound growth."
      },
      {
        id: "m6-q3",
        question: "How does Rupee Cost Averaging work during a Systematic Investment Plan (SIP)?",
        options: [
          "It locks in a single purchase price for the entire duration.",
          "It buys more mutual fund units when prices are low and fewer units when prices are high.",
          "It guarantees that the investor will never face a negative return.",
          "It eliminates all expense ratios of the fund."
        ],
        correctAnswerIndex: 1,
        explanation: "SIP investing allocates a constant amount of cash, which naturally buys more mutual fund units when prices decline and fewer units when prices rise."
      },
      {
        id: "m6-q4",
        question: "Which Sharpe Ratio indicates the most risk-efficient fund?",
        options: [
          "0.2",
          "0.5",
          "1.4",
          "-0.3"
        ],
        correctAnswerIndex: 2,
        explanation: "A higher Sharpe ratio signifies higher returns generated per unit of investment risk. A ratio of 1.4 is the most risk-efficient among the choices."
      },
      {
        id: "m6-q5",
        question: "What does the 'Expense Ratio' of a mutual fund cover?",
        options: [
          "The government transaction tax",
          "The annual fund management fees, administrative costs, and operating expenses",
          "The interest paid on outstanding fund loans",
          "The tax paid on dividends distributed"
        ],
        correctAnswerIndex: 1,
        explanation: "The Expense Ratio represents the operational cost of managing the mutual fund, charged annually as a percentage of your total asset value."
      },
      {
        id: "m6-q6",
        question: "What does a high 'Tracking Error' in a passive Index Fund indicate?",
        options: [
          "The fund manager is successfully beating the index returns.",
          "The fund is failing to replicate the benchmark index returns accurately.",
          "The fund has zero transaction fees.",
          "The fund has high sovereign default risk."
        ],
        correctAnswerIndex: 1,
        explanation: "Tracking error measures the deviation of a passive fund from its benchmark. A high error indicates poor replication execution by the manager."
      },
      {
        id: "m6-q7",
        question: "Under most tax codes, how are gains from debt mutual funds typically treated?",
        options: [
          "They are completely tax-free.",
          "They are added to your personal taxable income and taxed at your progressive tax slab rate.",
          "They are taxed at a flat 10% LTCG rate after 1 month.",
          "They are taxed only if you hold them for over 10 years."
        ],
        correctAnswerIndex: 1,
        explanation: "Debt mutual fund returns are added directly to your taxable income and taxed according to your tax slab, unlike equity funds which have capital gains rates."
      },
      {
        id: "m6-q8",
        question: "When are Capital Gains taxes triggered for mutual fund investments?",
        options: [
          "Every day when the NAV changes",
          "Only when you sell (redeem) your mutual fund units",
          "Annually on the first day of the fiscal year",
          "Only when the fund pays out dividends"
        ],
        correctAnswerIndex: 1,
        explanation: "Capital gains taxes are realized taxes, meaning they are only triggered when you liquidate (sell) your units and pocket the gain."
      }
    ]
  },
  {
    id: 6,
    number: 7,
    title: "Introduction to Derivatives & Trading Tactics",
    description: "Learn about futures, options, call/put mechanics, hedging strategies, and essential risk management to protect your capital.",
    duration: "30 min",
    lessons: [
      {
        id: "m7-l1",
        title: "What are Futures & Options?",
        readTime: "5 min",
        introduction: "Derivatives are financial contracts whose value is derived from an underlying asset (like a stock or index). The most common derivatives are Futures and Options.",
        sections: [
          {
            heading: "Understanding Futures",
            body: "A Futures contract is a binding agreement to buy or sell an asset at a predetermined price on a specified future date. Futures allow traders to leverage their capital, control large positions with a small margin, and profit from rising or falling markets."
          },
          {
            heading: "Understanding Options",
            body: "An Options contract gives the buyer the right, but not the obligation, to buy or sell an asset at a set price (strike price) within a specific timeframe. The buyer pays a fee (premium) to the seller. Options provide flexibility and asymmetric risk-reward setups."
          }
        ],
        importantConcept: "Leverage: Using borrowed capital or margin to increase potential returns. Leverage acts as a double-edged sword—it amplifies both gains and losses in equal measure.",
        realWorldExample: "To buy 500 shares of Reliance at ₹2,500 requires ₹12.5 Lakhs. A Futures contract allows you to control the same 500 shares by putting up only a 20% margin (₹2.5 Lakhs). If the stock rises 5%, you double your margin capital; if it falls 5%, you lose half your margin.",
        keyTakeaways: [
          "Derivatives derive their value from underlying assets like stocks.",
          "Futures bind both parties to execute the trade at a set future price.",
          "Options give the buyer rights without obligations, paid for via a premium.",
          "Leverage magnifies both gains and losses, making derivatives high-risk."
        ],
        commonMistakes: [
          "Trading futures and options with high leverage without understanding that you can lose more than your initial margin deposit."
        ],
        quickRecap: "Futures bind you to trade at a future date; options give you the choice. Both use high leverage, which carries significant risk."
      },
      {
        id: "m7-l2",
        title: "Mechanics of Call and Put Options",
        readTime: "5 min",
        introduction: "To trade options, you must master its two basic types: Calls and Puts. Each represents a different market expectation and trading strategy.",
        sections: [
          {
            heading: "Call Options: The Bullish Contract",
            body: "A Call option gives the buyer the right to BUY the underlying stock at the strike price. You buy calls when you expect a stock's price to rise significantly. If the price goes above the strike price plus premium, you profit. If the stock falls, your loss is capped at the premium paid."
          },
          {
            heading: "Put Options: The Bearish Contract",
            body: "A Put option gives the buyer the right to SELL the underlying stock at the strike price. You buy puts when you expect the stock's price to fall. If the stock falls below the strike price minus premium, you profit. Puts act as insurance policies against market drops."
          }
        ],
        importantConcept: "Strike Price: The set price at which the option contract owner can buy (for calls) or sell (for puts) the underlying stock. The stock price relative to the strike price determines if an option is In-the-Money (ITM) or Out-of-the-Money (OTM).",
        realWorldExample: "Stock ABC trades at ₹1,000. You buy a ₹1,050 Strike Call Option for a premium of ₹20. If ABC rises to ₹1,100, your option is worth at least ₹50. Subtracting your ₹20 premium, you make a ₹30 profit per share. If ABC drops to ₹900, you simply let the option expire, losing only your ₹20 premium.",
        keyTakeaways: [
          "Call buyers profit when stock prices rise above the strike price.",
          "Put buyers profit when stock prices drop below the strike price.",
          "Option buyers have limited risk (premium paid) and unlimited potential gains.",
          "Option sellers have capped gains (premium received) and unlimited risk."
        ],
        commonMistakes: [
          "Buying cheap Out-of-the-Money options hoping for a miracle. Most options expire worthless, draining premium buyers slowly."
        ],
        quickRecap: "Buy calls to profit from rising markets; buy puts to profit from falling markets. Risk is limited to the premium paid."
      },
      {
        id: "m7-l3",
        title: "Hedging Strategies & Risk Mitigation",
        readTime: "4 min",
        introduction: "Derivatives are not just for speculation; their original purpose was risk reduction. Hedging is the practice of taking an offsetting position in a derivative to limit potential price drops in your main assets.",
        sections: [
          {
            heading: "The Protective Put Strategy",
            body: "If you own 100 shares of a stock and are worried about a market drop, you can buy a Put option. If the stock price crashes, the value of your shares drops, but the value of your put option rises, offsetting the loss. It acts like car insurance—you pay a premium to protect against disaster."
          },
          {
            heading: "Index Hedging",
            body: "If you own a diversified portfolio of Nifty blue-chip stocks, you can hedge against macro events by shorting Nifty Futures. If the market crashes, your short futures trade gains profits, balancing out the paper losses in your stock portfolio."
          }
        ],
        importantConcept: "Hedging Cost: The premium paid for options acting as insurance. Consistently hedging drags down your long-term returns during bull markets, so apply hedges selectively.",
        realWorldExample: "You own ₹5,00,000 in shares. You pay ₹10,000 to buy a Put option with a strike price 10% below market value. If a crash occurs and your shares drop by ₹1,50,000 (30%), your put option gains ₹1,00,000, limiting your net loss to ₹60,000 (including premium).",
        keyTakeaways: [
          "Hedging uses derivatives to offset risk in underlying holdings.",
          "Protective puts act as insurance, capping the maximum drawdown of a stock.",
          "Shorting index futures hedges portfolio-wide market risk.",
          "Hedging has costs (premiums) that reduce returns in strong markets."
        ],
        commonMistakes: [
          "Over-hedging, which creates high premium expenses and eliminates all potential upside profits in a rising market."
        ],
        quickRecap: "Use options and futures as insurance to cap your downside. Protect your portfolio prior to major risk events."
      },
      {
        id: "m7-l4",
        title: "Risk Management & Capital Preservation",
        readTime: "5 min",
        introduction: "The golden rule of trading is: 'Live to trade another day.' In the virtual simulator and in real life, capital preservation is far more important than winning percentages. Let's look at how professional traders manage risk.",
        sections: [
          {
            heading: "The 1% Risk Rule",
            body: "Never risk more than 1% to 2% of your total account capital on a single trade. If you have a ₹10,00,000 virtual balance, you should structure your stop loss so that if a trade fails, you lose no more than ₹10,000. This ensures you can survive a string of 10 consecutive losses."
          },
          {
            heading: "Risk-Reward Ratios",
            body: "Always target trades with a favorable Risk-to-Reward ratio (at least 1:2 or 1:3). This means if you risk ₹1,000 (stop loss distance), your profit target should be ₹2,000 to ₹3,000. With a 1:3 ratio, you can be wrong 60% of the time and still remain profitable."
          }
        ],
        importantConcept: "Drawdown: The peak-to-trough decline in your account balance during a specific period. Surviving drawdowns requires strict position sizing and emotional discipline.",
        realWorldExample: "Trader A has a ₹1,00,000 balance and risks 10% per trade. If they lose 5 trades in a row, they lose 50% of their capital. Trader B risks 1% per trade. After 5 consecutive losses, Trader B has ₹95,000 left. Trader B is in a prime position to recover, while Trader A faces ruin.",
        keyTakeaways: [
          "Capital preservation is the ultimate priority of professional traders.",
          "Limit single-trade losses to 1-2% of aggregate capital.",
          "Structure trades targeting a minimum 1:2 Risk-Reward ratio.",
          "Position sizing determines your survival rate in trading."
        ],
        commonMistakes: [
          "Averaging down on losing positions (adding more capital to a stock that is crashing) hoping it rebounds, which escalates risk rapidly."
        ],
        quickRecap: "Risk only 1% of your account per trade, aim for a 1:2 risk-to-reward ratio, and respect your stop losses without fail."
      },
      {
        id: "m7-l5",
        title: "Option Greeks: Delta, Gamma & Theta",
        readTime: "6 min",
        introduction: "Option prices do not move randomly. Their behavior is governed by mathematical risk parameters called the 'Option Greeks.' Let's look at the three most critical Greeks: Delta, Gamma, and Theta.",
        sections: [
          {
            heading: "Delta and Gamma: Price Sensitivity",
            body: "Delta measures how much an option's premium changes for a ₹1 move in the underlying stock. Call options have positive Delta (0 to 1), while Put options have negative Delta (0 to -1). Gamma measures the rate of change of Delta. A high Gamma means Delta will increase rapidly as the stock price approaches the strike price."
          },
          {
            heading: "Theta: The Silent Enemy of Buyers",
            body: "Theta represents time decay. Options have an expiration date; as time passes, the probability of the stock hitting the strike price falls, reducing the option's value. Theta measures how much premium value the option loses every single day, assuming other factors remain constant. Theta decay accelerates dramatically in the final 30 days before expiration, working against option buyers and in favor of option sellers."
          }
        ],
        importantConcept: "Time Decay (Theta): The decay of an option's extrinsic value over time. For options buyers, time is an enemy. For options sellers (writers), time is a friend that melts away contract liabilities daily.",
        realWorldExample: "You buy a Call option on stock XYZ with a premium of ₹30. Its Theta is -1.5. This means that even if the stock price remains unchanged, your option premium will drop to ₹28.50 tomorrow, and to ₹27.00 the day after. If you hold it until expiration without the stock moving, the premium decays to zero.",
        keyTakeaways: [
          "Option Greeks measure how price, volatility, and time affect option premiums.",
          "Delta shows how much the option price moves relative to the stock.",
          "Theta decay reduces option values daily; it is the buyer's primary headwind.",
          "Option sellers benefit from Theta decay as time melts away premiums."
        ],
        commonMistakes: [
          "Holding options through high-decay weekends or final weeks before expiration, causing the position value to drop solely due to Theta decay."
        ],
        quickRecap: "Delta tracks price sensitivity, Gamma tracks Delta acceleration, and Theta represents daily time decay. Respect time decay when buying options."
      }
    ],
    quiz: [
      {
        id: "m7-q1",
        question: "What is leverage in derivatives trading best described as?",
        options: [
          "A method to eliminate all trading losses",
          "Using margin to control a large trade position with small capital, magnifying both gains and losses",
          "Buying stocks that pay dividends automatically",
          "Trading only on government stock exchanges"
        ],
        correctAnswerIndex: 1,
        explanation: "Leverage allows a trader to control a high contract value using a small margin deposit, multiplying both returns and losses."
      },
      {
        id: "m7-q2",
        question: "You expect a stock's price to experience a major rally over the next month. Which option contract should you buy to profit from this move?",
        options: [
          "Put Option",
          "Call Option",
          "Short Future",
          "Direct Dividend Plan"
        ],
        correctAnswerIndex: 1,
        explanation: "A Call Option gives the owner the right to buy the asset at a strike price, appreciating in value as the underlying stock price rises."
      },
      {
        id: "m7-q3",
        question: "What is a 'Protective Put' strategy used for?",
        options: [
          "To guarantee a dividend payout",
          "To act as portfolio insurance, capping losses if the underlying stock drops",
          "To leverage your account by borrowing extra margin",
          "To short a stock without buying it first"
        ],
        correctAnswerIndex: 1,
        explanation: "A Protective Put strategy combines owning a stock with buying a put option, guaranteeing a minimum selling price and locking in downside protection."
      },
      {
        id: "m7-q4",
        question: "If you follow the 1% risk rule on a ₹10,00,000 trading account, what is the maximum amount you should lose on a single trade?",
        options: [
          "₹1,000",
          "₹10,000",
          "₹1,00,000",
          "₹5,000"
        ],
        correctAnswerIndex: 1,
        explanation: "1% of ₹10,00,000 = ₹10,00,000 * 0.01 = ₹10,000."
      },
      {
        id: "m7-q5",
        question: "Which Option Greek measures the daily decay in the value of an option's premium over time?",
        options: [
          "Delta",
          "Gamma",
          "Theta",
          "Vega"
        ],
        correctAnswerIndex: 2,
        explanation: "Theta measures time decay, representing the daily drop in option premium as the contract moves closer to its expiration date."
      },
      {
        id: "m7-q6",
        question: "If your call option has a Delta of 0.60, how much will your premium change if the underlying stock price rises by ₹10?",
        options: [
          "It will rise by ₹0.60.",
          "It will rise by ₹6.00.",
          "It will drop by ₹6.00.",
          "It will rise by ₹60.00."
        ],
        correctAnswerIndex: 1,
        explanation: "Delta measures price sensitivity: Change in premium = Delta * Change in Stock Price = 0.60 * ₹10 = ₹6.00."
      },
      {
        id: "m7-q7",
        question: "Why does leverage act as a 'double-edged sword' in futures trading?",
        options: [
          "Because futures contracts require buying two stocks at once.",
          "Because it amplifies profit percentages on winning trades while equally multiplying losses on losing trades, risking rapid ruin.",
          "Because it reduces transaction taxes but doubles broker commission fees.",
          "Because it is only allowed during market bubbles."
        ],
        correctAnswerIndex: 1,
        explanation: "Leverage allows trading large values with small margins. This multiplies return rates on correct trades, but can wipe out account balances on tiny adverse price swings."
      },
      {
        id: "m7-q8",
        question: "How can an investor hedge a broad portfolio of large-cap equities against an imminent market crash?",
        options: [
          "By purchasing call options on individual small-cap stocks",
          "By shorting Nifty index futures or buying index put options",
          "By selling all bonds and holding cash only under a mattress",
          "By borrowing money on credit cards to buy more shares"
        ],
        correctAnswerIndex: 1,
        explanation: "Shorting index futures or buying index put options offsets portfolio losses by yielding gains as the general market benchmark drops."
      }
    ]
  }
];

export const FINAL_ASSESSMENT_QUESTIONS: QuizQuestionData[] = [
  {
    id: "f-q1",
    question: "Under the 50/30/20 budget framework, which bucket is correctly matched to its example?",
    options: [
      "Needs: Premium video streaming membership",
      "Wants: High-interest credit card debt minimums",
      "Savings: Automating payments into index funds",
      "Needs: Weekend gourmet dining out"
    ],
    correctAnswerIndex: 2,
    explanation: "Savings includes long-term investments like mutual funds. Essential debt minimums are Needs, while premium streaming and dining out are Wants."
  },
  {
    id: "f-q2",
    question: "Why is credit card debt considered 'Bad Debt'?",
    options: [
      "It has tax-deductible interest payments.",
      "It represents borrowing at extremely high interest rates to fund depreciating items.",
      "It helps build long-term real estate equity.",
      "It is backed by government collateral."
    ],
    correctAnswerIndex: 1,
    explanation: "Credit card debt has extremely high compound interest rates (30-40% per year) and is used to purchase non-appreciating consumable goods."
  },
  {
    id: "f-q3",
    question: "If a company has a Price-to-Earnings (P/E) ratio of 15x and an EPS of ₹30, what is the current market price of its stock?",
    options: [
      "₹2",
      "₹150",
      "₹450",
      "₹300"
    ],
    correctAnswerIndex: 2,
    explanation: "Since P/E = Price / EPS, we can multiply P/E by EPS to get the stock price: 15 * ₹30 = ₹450."
  },
  {
    id: "f-q4",
    question: "What does a 'Golden Cross' pattern signal on a stock chart?",
    options: [
      "The stock price has reached its absolute historic low.",
      "A shorter-term moving average crosses above a longer-term moving average, indicating a bullish trend change.",
      "The stock's RSI has exceeded 90.",
      "The company has announced a 5-for-1 stock split."
    ],
    correctAnswerIndex: 1,
    explanation: "A Golden Cross (e.g., 50 SMA crossing above 200 SMA) confirms strong upward price momentum, serving as a bullish trigger."
  },
  {
    id: "f-q5",
    question: "Which ratio is most appropriate for evaluating the risk-adjusted return efficiency of an active mutual fund?",
    options: [
      "Current Ratio",
      "Debt-to-Equity Ratio",
      "Sharpe Ratio",
      "Price-to-Book Ratio"
    ],
    correctAnswerIndex: 2,
    explanation: "The Sharpe Ratio measures the excess return generated per unit of volatility or investment risk. A higher Sharpe ratio indicates better risk-adjusted performance."
  },
  {
    id: "f-q6",
    question: "If two assets have a correlation coefficient of -0.85, what does this indicate?",
    options: [
      "They move in exact lockstep in the same direction.",
      "Their price movements are completely random and unrelated.",
      "They move in opposite directions the vast majority of the time, providing excellent diversification.",
      "One asset is 85% more volatile than the other."
    ],
    correctAnswerIndex: 2,
    explanation: "A correlation close to -1 means that when one asset falls, the other rises, offering strong risk offset and diversification benefits."
  },
  {
    id: "f-q7",
    question: "What happens to the buyer of a Put option contract if the underlying stock price rises significantly above the strike price?",
    options: [
      "They face unlimited financial losses.",
      "Their maximum loss is strictly limited to the option premium they paid to enter the contract.",
      "They are forced to buy the stock at the strike price.",
      "They receive a dividend payout automatically."
    ],
    correctAnswerIndex: 1,
    explanation: "An option buyer has rights but no obligations. If the trade goes against them, they let the option expire worthless, limiting loss to the premium paid."
  },
  {
    id: "f-q8",
    question: "How does the '1% Risk Rule' help preserve capital?",
    options: [
      "It limits your overall portfolio return to 1% per year.",
      "It structures your trade position sizing and stop loss to prevent losing more than 1% of account capital on a single trade.",
      "It requires you to pay 1% broker commission fees.",
      "It restricts you to buying only stocks that pay a 1% dividend."
    ],
    correctAnswerIndex: 1,
    explanation: "The 1% rule protects you against ruin by capping the risk of a single trade's failure to a tiny fraction (1%) of your account equity."
  },
  {
    id: "f-q9",
    question: "What is an advantage of passive Index Funds over active Mutual Funds?",
    options: [
      "They guarantee that you will beat the market average.",
      "They feature substantially lower expense ratios due to lack of active management research overhead.",
      "They invest only in high-risk derivative instruments.",
      "They are exempt from capital gains tax."
    ],
    correctAnswerIndex: 1,
    explanation: "Passive index funds simply track a market index, meaning no active fund manager salaries or research overhead, translating to very low expense ratios."
  },
  {
    id: "f-q10",
    question: "What does 'Rupee Cost Averaging' in an automated monthly SIP achieve?",
    options: [
      "It eliminates all stock market corrections.",
      "It buys more mutual fund units when the NAV is low and fewer units when the NAV is high, lowering average purchase cost over time.",
      "It locks in a 10% annual return guarantee.",
      "It automatically converts all your debt holdings into equities."
    ],
    correctAnswerIndex: 1,
    explanation: "SIP investing allocates a constant amount of cash, which naturally buys more units when prices fall and fewer when prices rise, smoothing out volatility."
  },
  {
    id: "f-q11",
    question: "An investor has a portfolio consisting entirely of small-cap tech stocks. Which action would most effectively improve the portfolio's diversification?",
    options: [
      "Buying five more tech startups listed on the NASDAQ",
      "Allocating 30% of capital to government debt funds and gold ETFs",
      "Shorting the same small-cap tech stocks in the futures market",
      "Applying for a new credit card to buy mid-cap tech stocks"
    ],
    correctAnswerIndex: 1,
    explanation: "True diversification requires allocating money to non-correlated asset classes, such as fixed income (government bonds) and gold, reducing sector concentration."
  },
  {
    id: "f-q12",
    question: "A company's current stock price is ₹1,200, its EPS is ₹40, and the book value per share is ₹300. Which statement is correct?",
    options: [
      "The P/E ratio is 30x and P/B ratio is 4x.",
      "The P/E ratio is 40x and P/B ratio is 10x.",
      "The P/E ratio is 30x and P/B ratio is 30x.",
      "The P/E ratio is 4x and P/B ratio is 30x."
    ],
    correctAnswerIndex: 0,
    explanation: "P/E = Share Price / EPS = 1200 / 40 = 30x. P/B = Share Price / Book Value = 1200 / 300 = 4x."
  },
  {
    id: "f-q13",
    question: "What chart pattern represents a key price floor where downward momentum repeatedly pauses and bounces back?",
    options: [
      "Resistance Line",
      "Support Line",
      "Death Cross Line",
      "Exponential Moving Average Line"
    ],
    correctAnswerIndex: 1,
    explanation: "Support acts as a price floor where buying interest concentration matches or exceeds selling pressure, causing downtrends to halt."
  },
  {
    id: "f-q14",
    question: "If a bond's coupon rate is 8% but market interest rates rise to 10%, what will happen to the bond's market price?",
    options: [
      "The market price of the bond will rise.",
      "The market price of the bond will fall.",
      "The price will remain completely fixed at face value.",
      "The coupon rate will automatically climb to 10%."
    ],
    correctAnswerIndex: 1,
    explanation: "Since bond prices move inversely to interest rates, rising market rates make existing 8% bonds less attractive, lowering their market price."
  },
  {
    id: "f-q15",
    question: "What is the tax implication of selling an equity mutual fund held for 15 months with a capital gain of ₹50,000?",
    options: [
      "It is taxed under short-term capital gains at slab rates.",
      "It is classified as Long-Term Capital Gains (LTCG) and enjoys lower tax rates, possibly being tax-free if overall annual gains are below threshold limits.",
      "It is completely exempt from tax forever, regardless of gain sizes.",
      "The fund house pays the tax directly on your behalf."
    ],
    correctAnswerIndex: 1,
    explanation: "Equity holdings sold after 12 months are classified as LTCG, enjoying lower tax rates than short-term gains."
  },
  {
    id: "f-q16",
    question: "Which option strategy behaves as an insurance policy by locking in a minimum selling price for stocks you own?",
    options: [
      "Selling Call Options (Covered Call)",
      "Buying Put Options (Protective Put)",
      "Buying Call Options",
      "Shorting Futures contracts without holding stock"
    ],
    correctAnswerIndex: 1,
    explanation: "A Protective Put strategy offsets stock holdings with put options, ensuring you can sell the stock at the strike price even if the market collapses."
  },
  {
    id: "f-q17",
    question: "Under the 1% risk rule, if you hold a ₹5,00,000 trading account, how should you size your trade positions?",
    options: [
      "You should only buy ₹5,000 worth of shares in total.",
      "You must structure your stop-loss order so that a failed trade results in a maximum loss of ₹5,000.",
      "You should keep ₹4,95,000 under your mattress.",
      "You must invest 1% of your account in 100 different stocks."
    ],
    correctAnswerIndex: 1,
    explanation: "The 1% rule caps the maximum loss on a single transaction to 1% of your total balance (1% of 500k = ₹5,000) using stop loss parameters."
  },
  {
    id: "f-q18",
    question: "What is 'Theta Decay' in options trading?",
    options: [
      "The rate at which option Delta accelerates relative to stock price shifts",
      "The daily drop in option premium value as the contract moves closer to expiration",
      "The volatility adjustment of options contracts",
      "The transaction tax applied to derivatives"
    ],
    correctAnswerIndex: 1,
    explanation: "Theta decay represents time decay. Options lose value every day as they approach expiration, which hurts option buyers and benefits option sellers."
  },
  {
    id: "f-q19",
    question: "What represents a structural competitive barrier that enables a firm to maintain high profit margins for decades?",
    options: [
      "A seasonal sales surge",
      "An Economic Moat (e.g., brand pricing power, network effects, high switching costs)",
      "A low P/E ratio",
      "A high Current Ratio"
    ],
    correctAnswerIndex: 1,
    explanation: "An economic moat represents structural competitive advantages (like Visa's network effects or Apple's brand) that shield profits from competition."
  },
  {
    id: "f-q20",
    question: "If a stock's RSI jumps to 88 during a rapid markup phase, what does this suggest about the asset?",
    options: [
      "The stock is oversold and represents a bargain buying opportunity.",
      "The stock is extremely overbought, indicating price momentum may be overextended and a correction could be near.",
      "The company's earnings have doubled.",
      "The bid-ask spread has reached zero."
    ],
    correctAnswerIndex: 1,
    explanation: "An RSI above 70 (and especially at 88) marks overbought extremes, suggesting the stock price is overextended and due for a pullback."
  }
];
