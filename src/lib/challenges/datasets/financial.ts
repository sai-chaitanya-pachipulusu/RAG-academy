import { Dataset } from "./types";

/**
 * Financial Services Dataset
 * 
 * Use case: Investment research, financial Q&A, market analysis
 * Real-world inspiration: Bloomberg Terminal, Morningstar, Yahoo Finance
 * 
 * Note: This is educational/demo data only, not investment advice.
 */
export const FINANCIAL_DATASET: Dataset = {
  id: "financial-services",
  name: "Financial Services Knowledge Base",
  description: "Investment concepts, market terminology, and financial regulations for RAG systems in fintech.",
  docs: [
    {
      id: "fin_etf_001",
      content: "Exchange-Traded Funds (ETFs) are investment funds traded on stock exchanges, much like stocks. They hold assets such as stocks, commodities, or bonds and generally operate with an arbitrage mechanism designed to keep trading close to net asset value. Most ETFs track an index like the S&P 500. Benefits include lower expense ratios than mutual funds, tax efficiency, and intraday trading. Popular ETFs include SPY (S&P 500), QQQ (Nasdaq 100), and VTI (Total Stock Market).",
      metadata: { category: "products", topic: "etf", complexity: "beginner" },
    },
    {
      id: "fin_etf_002",
      content: "ETF expense ratios typically range from 0.03% to 1.00%. Index ETFs like Vanguard's VTI charge 0.03%, while actively managed or thematic ETFs may charge 0.50-1.00%. The expense ratio is the annual fee expressed as a percentage of assets. A 0.03% expense ratio means you pay $3 per $10,000 invested annually. Over 30 years, the difference between 0.03% and 1.00% can amount to tens of thousands of dollars due to compounding.",
      metadata: { category: "products", topic: "etf", subtopic: "fees" },
    },
    {
      id: "fin_401k_001",
      content: "A 401(k) is an employer-sponsored retirement savings plan that allows employees to contribute a portion of their salary before taxes. For 2024, the contribution limit is $23,000 ($30,500 for those 50 and older). Many employers offer matching contributions, typically 50-100% of employee contributions up to 3-6% of salary. Investments grow tax-deferred until withdrawal in retirement.",
      metadata: { category: "retirement", topic: "401k", complexity: "beginner" },
    },
    {
      id: "fin_401k_002",
      content: "Roth 401(k) contributions are made with after-tax dollars, meaning you pay taxes now but withdrawals in retirement are tax-free. Traditional 401(k) contributions reduce current taxable income but are taxed upon withdrawal. Choose Roth if you expect to be in a higher tax bracket in retirement, or Traditional if you expect lower taxes later. Many plans allow splitting contributions between both types.",
      metadata: { category: "retirement", topic: "401k", subtopic: "roth_vs_traditional" },
    },
    {
      id: "fin_ira_001",
      content: "Individual Retirement Accounts (IRAs) are tax-advantaged accounts for retirement savings. Traditional IRAs may offer tax-deductible contributions with tax-deferred growth. Roth IRAs use after-tax contributions but offer tax-free growth and withdrawals. For 2024, the contribution limit is $7,000 ($8,000 for those 50+). Income limits apply for Roth IRA contributions: $161,000 single, $240,000 married filing jointly.",
      metadata: { category: "retirement", topic: "ira", complexity: "beginner" },
    },
    {
      id: "fin_pe_ratio_001",
      content: "Price-to-Earnings (P/E) ratio is calculated by dividing a company's stock price by its earnings per share (EPS). A P/E of 20 means investors pay $20 for every $1 of earnings. The S&P 500 historical average P/E is around 15-16. High P/E (>25) may indicate growth expectations or overvaluation. Low P/E (<10) may signal undervaluation or declining business. Forward P/E uses estimated future earnings.",
      metadata: { category: "analysis", topic: "valuation", metric: "pe_ratio" },
    },
    {
      id: "fin_dividend_001",
      content: "Dividend yield is calculated by dividing annual dividends per share by the stock price. A $100 stock paying $3 annual dividends has a 3% yield. Dividend aristocrats are S&P 500 companies that have increased dividends for 25+ consecutive years. High yields (>5%) may indicate risk or declining stock price. Qualified dividends are taxed at capital gains rates (0-20%), while ordinary dividends are taxed as income.",
      metadata: { category: "income", topic: "dividends", complexity: "intermediate" },
    },
    {
      id: "fin_bond_001",
      content: "Bonds are fixed-income securities where investors lend money to issuers (governments or corporations) in exchange for regular interest payments and principal return at maturity. Key terms: coupon rate (annual interest), yield to maturity (total return if held to maturity), duration (price sensitivity to interest rates). Bond prices move inversely to interest rates. Credit ratings from AAA (safest) to D (default) indicate risk.",
      metadata: { category: "fixed_income", topic: "bonds", complexity: "intermediate" },
    },
    {
      id: "fin_diversification_001",
      content: "Diversification reduces portfolio risk by investing across different asset classes, sectors, and geographies. A simple diversified portfolio might include: 60% stocks (domestic and international), 30% bonds, 10% alternatives. Modern Portfolio Theory shows that combining uncorrelated assets can reduce volatility without sacrificing returns. Target-date funds automatically diversify and adjust allocation based on retirement date.",
      metadata: { category: "strategy", topic: "diversification", complexity: "beginner" },
    },
    {
      id: "fin_tax_loss_001",
      content: "Tax-loss harvesting involves selling investments at a loss to offset capital gains taxes. You can deduct up to $3,000 of net capital losses against ordinary income annually, with excess losses carried forward. The wash-sale rule prohibits buying substantially identical securities within 30 days before or after the sale. Automated services like Wealthfront and Betterment offer daily tax-loss harvesting.",
      metadata: { category: "tax", topic: "tax_loss_harvesting", complexity: "advanced" },
    },
    {
      id: "fin_rebalancing_001",
      content: "Portfolio rebalancing maintains your target asset allocation by periodically buying and selling to return to desired percentages. Methods include: calendar-based (quarterly or annually), threshold-based (rebalance when allocation drifts 5%+ from target), and cash-flow based (direct new contributions to underweight assets). Automatic rebalancing in retirement accounts avoids tax consequences.",
      metadata: { category: "strategy", topic: "rebalancing", complexity: "intermediate" },
    },
    {
      id: "fin_sec_001",
      content: "The Securities and Exchange Commission (SEC) regulates securities markets, protects investors, and enforces securities laws. Key regulations include: Regulation FD (fair disclosure), Sarbanes-Oxley Act (corporate accountability), and Dodd-Frank Act (financial reform). Investment advisors managing $100M+ must register with SEC. Smaller advisors register with state regulators. SEC Form 13F requires quarterly disclosure of institutional holdings.",
      metadata: { category: "regulation", topic: "sec", complexity: "intermediate" },
    },
  ],
  queries: [
    {
      id: "q_etf_vs_mutual",
      text: "what are the advantages of ETFs over mutual funds",
      relevantDocs: ["fin_etf_001", "fin_etf_002"],
    },
    {
      id: "q_401k_limit",
      text: "how much can I contribute to my 401k in 2024",
      relevantDocs: ["fin_401k_001"],
    },
    {
      id: "q_roth_traditional",
      text: "should I choose Roth or traditional 401k contributions",
      relevantDocs: ["fin_401k_002"],
    },
    {
      id: "q_ira_income",
      text: "what are the income limits for Roth IRA contributions",
      relevantDocs: ["fin_ira_001"],
    },
    {
      id: "q_pe_meaning",
      text: "what does a high P/E ratio indicate about a stock",
      relevantDocs: ["fin_pe_ratio_001"],
    },
    {
      id: "q_dividend_tax",
      text: "how are dividends taxed differently",
      relevantDocs: ["fin_dividend_001"],
    },
    {
      id: "q_bond_rates",
      text: "how do interest rates affect bond prices",
      relevantDocs: ["fin_bond_001"],
    },
    {
      id: "q_simple_portfolio",
      text: "what is a simple diversified portfolio allocation",
      relevantDocs: ["fin_diversification_001"],
    },
    {
      id: "q_tax_harvest",
      text: "how does tax loss harvesting work and what are the rules",
      relevantDocs: ["fin_tax_loss_001"],
    },
    {
      id: "q_rebalance_when",
      text: "how often should I rebalance my investment portfolio",
      relevantDocs: ["fin_rebalancing_001"],
    },
  ],
};
