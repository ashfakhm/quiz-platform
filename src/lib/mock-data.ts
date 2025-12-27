// Mock data for development - 50 NISM Finance questions
import type { Question, QuizResponse } from './types';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    question: 'On which of these small savings product can an investor have a tax benefit on the interest income earned?',
    options: ['National Savings Certificate', 'Kisan Vikas Patra', 'Post Office Time Deposit', 'All of the above'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Investments made in the NSC VIII issue enjoy tax benefits under section 80C of Income Tax Act, 1961. Accrued interest is taxable, but it is deemed to be reinvested and therefore the interest becomes eligible for Section 80C benefits.\n\nIn Kisan Vikas Patra - There is no tax incentive for the investment made and the interest earned is taxed on accrual basis.\n\nIn Post Office Time Deposit - The interest earned on these investments is added to the depositor\'s total annual income in the year of receipt and is liable to be taxed as per the tax rate of the investor.'
    },
    mark: 1
  },
  {
    id: 'q2',
    question: 'A person is investing in shares whose market prices are lower than their book value. This style of investing is generally known as ______.',
    options: ['Stock Picking', 'Conservative Investing', 'Growth Investing', 'Value Investing'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'Value investing is an investment strategy that involves picking stocks that appear to be trading for less than their intrinsic or book value.\n\nIt is an investment strategy that involves purchasing stocks or securities that are under-priced.'
    }
  },
  {
    id: 'q3',
    question: 'Bond A carries an interest rate of 9%. Interest rates in the economy for such similar bonds increase to 9.5%. Other things remaining the same, the price of Bond A in secondary market will _____.',
    options: ['Increase', 'Decrease', 'Remain unchanged', 'Cannot predict'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'The price of the bonds in the secondary market will respond to changes in interest rates. An increase in interest rates sees the price of existing bonds depreciate and vice versa.'
    }
  },
  {
    id: 'q4',
    question: 'In the New Fund Offer (NFO) of a Mutual Fund, the units are offered at _____.',
    options: ['Net Asset Value (NAV)', 'Market Value', 'Face Value', 'None of the above'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Allotment of units in a Mutual Fund NFO are at the issue price which is typically at the face value of the units.'
    }
  },
  {
    id: 'q5',
    question: 'Which of these complaint(s) cannot be addressed on SCORES?',
    options: ['Complaints in respect of unlisted companies', 'Complaints which are sub-judice', 'Complaints in respect of insurance products or companies', 'All of the above'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'SCORES is the online investor redressal mechanism set up by SEBI to deal with the complaints of investors related to all products and entities regulated by it.\n\nIt does not deal with the following complaints:\n• Complaints against unlisted/delisted/wound up/liquidated/sick companies\n• Complaints that are sub-judice (relating to cases which are under consideration by court of law, quasi-judicial proceedings etc.)\n• Complaints falling under the purview of other regulatory bodies\n\nInsurance sector is not regulated by SEBI. It\'s regulated by Insurance Regulatory and Development Authority of India (IRDAI).'
    }
  },
  {
    id: 'q6',
    question: 'Mr. Sumeet invested Rs 5000 in a Mutual Fund on 1 Jan 2020 and when he redeemed on 31 Dec 2021 he got Rs 12000. Calculate the CAGR.',
    options: ['54.90%', '69.75%', '70.80%', '125%'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'The number of years from 1 Jan 2020 to 31 Dec 2021 = 2 years\n\nFormula for calculating Compounded Annual Growth Rate:\n\nCAGR = { Ending Value / Beginning Value } ^ (1 / No. of years) - 1\n= {12000 / 5000} ^ 1/2 - 1\n= {2.4} ^ 0.5 - 1\n= 1.549 - 1\n= 0.549 × 100 = **54.90%**'
    }
  },
  {
    id: 'q7',
    question: 'To have better clarity in the Investment Policy Document, the goals of the investor should be categorised on the basis of ______.',
    options: ['Risk and Returns', 'Time period and Priority', 'Returns and Time period', 'Time priority and Returns'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'The Investment policy document would normally list out the goals of the investor along with their priorities. This is followed by listing out the investment objectives along with the time horizon. Clarity on this front is essential because the portfolio manager can then frame strategies accordingly.'
    }
  },
  {
    id: 'q8',
    question: 'Which of these is TRUE with respect to liquidity in a solution-oriented mutual fund scheme?',
    options: ['Solution-oriented mutual fund schemes are close-end funds and can be traded on a stock exchange', 'Solution-oriented mutual fund schemes are open-end funds and can be easily sold and purchased', 'Solution-oriented mutual fund schemes can only be purchased during a NFO and are locked in for the entire term', 'Solution-oriented mutual fund schemes have a lock-in of 5 years'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'SEBI has categorised the open-end solution oriented schemes as follows:\n- Retirement Fund: Schemes will have a lock-in for at least 5 years or till retirement age whichever is earlier.\n- Children\'s Fund: Schemes will have a lock-in of 5 years or till the age of majority whichever is earlier.'
    }
  },
  {
    id: 'q9',
    question: 'Identify the securities which can be dematerialized as per Indian regulations?',
    options: ['Unlisted securities', 'Equity Shares', 'Government securities', 'All of the above'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'Under the SEBI (Depository and Participants) Regulations of 1996, the categories of securities eligible for dematerialisation include:\n1. Shares, scrips, stocks, bonds, debentures, debenture stock or other marketable security\n2. Units of a mutual fund, rights under a collective investment scheme, venture capital funds, certificates of deposit, commercial paper, money market instruments, government securities and unlisted securities.'
    }
  },
  {
    id: 'q10',
    question: 'Identify which of these is a part of the Code of Conduct prescribed for intermediaries under the SEBI (Intermediaries) Regulations?',
    options: ['During the conduct of the business, the intermediary will be responsible for acts of commission and omission of its employees', 'The fees charged by an intermediary for the services which he has rendered will be in line with other intermediaries offering similar service', 'Permission has to be taken from the client by the intermediary before disclosing information of the client in compliance with any law', 'All of the above'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'As per the Securities and Exchange Board of India (Intermediaries) Regulations, 2008 Code of Conduct and Ethics:\n\nHigh Standards of Service - An intermediary shall ensure that it and its key management personnel, employees, contractors and agents, shall in the conduct of their business, observe high standards of integrity, dignity, fairness, ethics and professionalism.\n\nAn intermediary shall be responsible for the acts or omissions of its employees and agents in respect to the conduct of its business.'
    }
  },
  {
    id: 'q11',
    question: 'The Modern Portfolio Theory uses Expected Returns, Standard deviation of asset classes and _________ to create an optimal portfolio.',
    options: ['Expected market performance', 'Portfolio variance', 'Correlation Coefficient of the Asset classes', 'All of the above'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Modern Portfolio Theory (MPT) — developed by Harry Markowitz — is used to construct an optimal portfolio by balancing risk and return. It uses:\n- Expected Returns of each asset\n- Standard Deviation (risk/volatility) of each asset\n- **Correlation Coefficient** (or Covariance) between assets\n\nDiversification benefit comes from combining assets that are not perfectly correlated.'
    }
  },
  {
    id: 'q12',
    question: 'Identify the TRUE statement with respect to lock-in period in children\'s funds.',
    options: ['Units in a children\'s fund are locked in for 5 years or till the end of tenor of scheme, whichever is earlier', 'Units in a children\'s fund are locked in for 5 years or till age of majority, whichever is earlier', 'Units in a children\'s fund are locked in for a minimum of 5 years and a maximum of 10 years', 'Units in a children\'s fund are locked in for 5 years before child\'s majority'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'Children\'s Fund are schemes oriented towards saving for children\'s needs. Schemes will have a lock-in of **5 years or till the age of majority whichever is earlier**.'
    }
  },
  {
    id: 'q13',
    question: 'For which category of goals can an investor consider a high yield credit risk fund?',
    options: ['Near term goals which have a high priority', 'Near term goals which have a low priority', 'Long term goals which have a high priority', 'All of the above'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'People have many low priority goals - goals that are not particularly painful if they are not achieved. These could range from buying a farm house to a luxury car. For these goals, more-aggressive investment approaches are usually taken like high yield credit risk funds.'
    }
  },
  {
    id: 'q14',
    question: '_____ fall within the ambit of Financial Planning.',
    options: ['Investments in retirement', 'Savings in retirement', 'Large unexpected expenses', 'All of the above'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'Financial planning encompasses a broad range of activities related to managing your money:\n- **Investments in retirement**: Planning for retirement is a core component\n- **Savings in retirement**: Determining how much to save for retirement\n- **Large unexpected expenses**: Preparing for unforeseen expenses through emergency funds'
    }
  },
  {
    id: 'q15',
    question: 'Identify the true statement(s) about Risk?\nA. Semi Variance is quite an accurate measure of risk\nB. Downside risk is concerned about worse than expected return of the investment',
    options: ['Only A', 'Only B', 'Both A and B', 'Neither A nor B'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Risk can be defined as:\n- Variability in the expected return (total risk)\n- Losses or worse than expected outcomes only (downside risk)\n\nTwo measures of total risk: variance and standard deviation.\nDownside risk includes concepts such as semi-variance/standard deviation.'
    }
  },
  {
    id: 'q16',
    question: 'In case of Exchange Traded Funds (ETFs), what is the minimum investment in securities of the index which is being tracked as a percent of total assets?',
    options: ['80%', '85%', '90%', '95%'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'Exchange Traded Funds (ETFs) hold a portfolio of securities that replicates an index and are listed on the stock exchange. **At least 95%** of the total assets should be in securities represented in the index being tracked.'
    }
  },
  {
    id: 'q17',
    question: 'Identify the CORRECT statement.',
    options: ['Sortino ratio is excess returns per unit downside risk', 'Sharpe ratio when multiplied by the downside Risk is called Sortino ratio', 'Sortino ratio and Sharpe ratio both measure the same excess returns', 'Sortino ratio is the excess returns per unit of total risk'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Sortino Ratio = (Portfolio Return – Risk-Free Rate) / Downside Deviation\n\nIt focuses only on **downside volatility** (negative deviations), unlike Sharpe ratio which uses total volatility.'
    }
  },
  {
    id: 'q18',
    question: 'What is the reason which increases the potential of big losses in a derivative product?',
    options: ['Derivatives are high cost products', 'Derivatives are leveraged products', 'Derivatives are complex products', 'Derivatives are low liquidity products'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'In derivatives trading, by leveraging, investors can control large positions for little amount paid as margins. This has the scope of high returns but **higher losses too**.'
    }
  },
  {
    id: 'q19',
    question: 'A person has lodged a complaint against an entity on SCORES. The concerned entity is required to respond to this complaint within _______.',
    options: ['10 days', '15 days', '21 days', '30 days'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Under the SEBI SCORES 2.0 framework, the entity is required to respond and submit an Action Taken Report (ATR) within **21 calendar days** of receiving the complaint.'
    }
  },
  {
    id: 'q20',
    question: 'The investment objective of Ms. Meeta is to have a regular income. She approaches a PMS firm for this purpose. Among the given four choices, which will be the preferred choice of the portfolio manager?',
    options: ['Small and Mid cap equity shares', 'New IPOs', 'Zero coupon bonds', 'Dividend paying equity shares'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'If regular income is the investment objective, funds will be invested in asset classes generating periodical income like **dividend paying stocks**, interest paying bonds or rent paying realty.'
    }
  },
  {
    id: 'q21',
    question: 'Which of the following statement is TRUE with respect to change in nomination?',
    options: ['Nomination once made cannot be changed', 'Only the first holder has to sign the change in nomination application', 'All the joint holders have to authorise the change in nomination', 'Before a new nomination is made, the existing nomination has to be cancelled'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Nomination can be changed or cancelled at any time. **All the joint holders must sign** to make the nomination, change it or cancel it.'
    }
  },
  {
    id: 'q22',
    question: 'Which of these is pre-defined in an equity investment?',
    options: ['Dividend Yield', 'Frequency of Return', 'Level of Return', 'Type of Return'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'In an equity investment, returns and dividend yields are not guaranteed. However, the **type of return** is pre-defined:\n- Capital appreciation (increase in stock price)\n- Dividends (if declared by the company)'
    }
  },
  {
    id: 'q23',
    question: 'A bank customer has made a complaint to the bank regarding an issue he had. The bank responded to his complaint but he was not satisfied with the response. To whom should he complain next?',
    options: ['Bank Ombudsman', 'Reserve Bank of India', 'SEBI', 'SCORES'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'If customer is not satisfied with the bank\'s response, he can approach **Banking Ombudsmen**, appointed by Reserve Bank of India in various locations across the country.'
    }
  },
  {
    id: 'q24',
    question: 'Identify what best describes the role of the intermediary and the investor while making an investment in a mutual fund?',
    options: ['The distributor is responsible for investment choices and execution in the regular option of mutual funds', 'In the direct investment option of mutual funds, the distributor helps make investment choices but execution is done by investor', 'The registered investment advisor will assist in investment choices and the investor/distributor will execute the investment decisions', 'The registered investment advisor is responsible for advising as well as executing investment decisions'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Fee-only Investment Advisers usually do not take on the execution of the plan or advice. They refer the client to other agencies who may enable execution of the recommended investment transactions. This ensures commissions earned on selling products does not influence their advice.'
    }
  },
  {
    id: 'q25',
    question: 'How are Corporate Bonds primarily raised?',
    options: ['Over the Counter', 'By Public Issue', 'By Private Placement', 'By Auction'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Typically, Governments issue debt through "Auctions" while corporates issue debt papers like corporate bonds through "**Private Placement**" - an offer made to a select group of investors such as financial institutions, banks and mutual funds.'
    }
  },
  {
    id: 'q26',
    question: 'Identify which of these is NOT a method for a company to raise capital in the primary market?',
    options: ['Offer For Sale (OFS)', 'Private placement', 'Qualified Institutional Placement (QIP)', 'Rights Issue'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: '**Offer for Sale (OFS)** is when existing shareholders sell their shares to the public. Since the company does not raise fresh capital, it is considered a secondary market transaction, not a primary market method.'
    }
  },
  {
    id: 'q27',
    question: 'A person cannot register a complaint on SCORES against a/an __________.',
    options: ['Insurance Company', 'Depository', 'Venture Capital Fund', 'Distributor of Mutual Fund'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'SCORES deals with complaints related to entities regulated by SEBI. **Insurance companies are regulated by IRDAI**, not SEBI. IRDAI offers the Integrated Grievance Management System (IGMS) for insurance complaints.'
    }
  },
  {
    id: 'q28',
    question: 'Identify the situation in which the geometric mean return from an investment will be less than its arithmetic mean return?',
    options: ['When the investment period is more than one year', 'When the investment period is one year', 'When the investment period is less than one year', 'For all investment periods'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'For a one-year holding period, arithmetic and geometric returns are identical. Over **longer holding periods**, the geometric average return is always less than the arithmetic return (except when all yearly returns are exactly the same).'
    }
  },
  {
    id: 'q29',
    question: '________ is not considered a part of Rebalancing cost.',
    options: ['PMS fees payable', 'Stamp duty levied', 'Securities Transaction Tax (STT)', 'Brokerage cost'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Rebalancing costs include:\n- **Transaction cost**: research cost, brokerage, etc.\n- **Tax cost**: STT, Stamp duty, etc.\n\n**PMS fees are not part of Rebalancing Cost**.'
    }
  },
  {
    id: 'q30',
    question: 'If the investor is in 30% tax bracket, then 8.4% post-tax return is equivalent to ____ in pre-tax terms.',
    options: ['13%', '14%', '12%', '15%'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Pre-tax returns = Post-tax return / (1 - tax rate)\n= 8.4% / (1 - 0.30)\n= 8.4% / 0.70\n= **12%**'
    }
  },
  {
    id: 'q31',
    question: 'What is the primary purpose of asset allocation in portfolio management?',
    options: ['To maximize returns regardless of risk', 'To balance risk and return according to investor objectives', 'To invest only in equity markets', 'To time the market effectively'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'Asset allocation is the process of dividing investments among different asset categories. Its primary purpose is to **balance risk and return** according to an investor\'s goals, risk tolerance, and investment horizon.'
    }
  },
  {
    id: 'q32',
    question: 'Financial Planning also pertains to __________.',
    options: ['Income during the retirement phase', 'Expenses during the retirement phase', 'Budgeting during the retirement phase', 'All of the above'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'Providing for retirement is one of the primary financial goals. Financial Planning includes:\n- Income during retirement\n- Expenses during retirement\n- Budgeting during retirement\n- Strategies to meet any shortfall'
    }
  },
  {
    id: 'q33',
    question: 'In which of these investment structures does the investor have NO say in the way his investments are managed?',
    options: ['Discretionary portfolio management services', 'Non-Discretionary portfolio management services', 'Both have equal say', 'Neither allows investor input'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'In **Discretionary PMS**, the portfolio manager independently manages the funds. In **Non-Discretionary PMS**, the manager manages funds in accordance with the directions of the investors.'
    }
  },
  {
    id: 'q34',
    question: 'Sector specific risk can be reduced through the process of _______.',
    options: ['Remaining in the most popular sector', 'Diversification across sectors', 'Changing sectors as trends change', 'Including both large and mid caps from the sector'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'Sector specific risk affects only businesses in a particular sector. This risk can be diversified away by **investing in shares across different sectors**.'
    }
  },
  {
    id: 'q35',
    question: 'In the avalanche mode of repayment of loan the amount paid first is the -',
    options: ['Loan with the highest amount', 'Loan with the lowest amount', 'Loan with the highest interest rate', 'Loan with the lowest interest rate'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'The avalanche strategy involves paying off loans with the **highest interest rates first**. This is logical because highest interest rate loans are the most costly and brings down the interest burden fastest.'
    }
  },
  {
    id: 'q36',
    question: 'Mr. Pawar requires Rs.10 lakhs in six months\' time to pay his son\'s admission fees. An appropriate investment to set aside money for his goal would be -',
    options: ['Short term debt fund', 'Equity shares of high-growth companies', 'Real estate', 'Long term corporate bond'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Six months is too short a period for equities and real estate (risky and volatile). Debt funds are safe and since the horizon is only six months, **short term debt funds** is the correct option.'
    }
  },
  {
    id: 'q37',
    question: 'Rebalancing the portfolio has to be done -',
    options: ['Daily', 'At regular intervals', 'Every decade', 'Never'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'Portfolio needs to be continuously monitored and **periodically rebalanced**. The need arises due to price changes in portfolio holdings. Regular intervals keep the portfolio aligned with original risk-return characteristics.'
    }
  },
  {
    id: 'q38',
    question: 'An AIF consists of __________ funds',
    options: ['Lumpsum', 'Mass market', 'Limited', 'Privately pooled'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'SEBI defines Alternative Investment Fund (AIF) as one which is primarily a **privately pooled investment vehicle**. "Privately pooled" means the fund is pooled from select investors (institutions, HNIs) and not from the general public.'
    }
  },
  {
    id: 'q39',
    question: 'One of the features of \'Art\' is that there are no ________.',
    options: ['Standard products', 'Art funds', 'Sellers', 'Art experts'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Art and paintings are emerging as attractive long-term investments. However, art is **not a standard investment product** as each work is unique. The market is also unregulated.'
    }
  },
  {
    id: 'q40',
    question: 'An Investment Adviser has to preserve records for a minimum period of ____',
    options: ['7 years', '5 years', '3 years', '10 years'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'An investment adviser is required to maintain records in physical or electronic format for a minimum period of **5 years**.'
    }
  },
  {
    id: 'q41',
    question: 'If an investor chooses to re-materialize their securities held in electronic (demat) form, what is the effect on his electronic holdings?',
    options: ['The securities continue in digital format but with a different ISIN', 'The securities become permanently locked within the depository system', 'A statement of electronic holdings is provided, rather than physical certificates', 'The depository debits the investor\'s account and issues fresh physical certificates'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'When an investor requests re-materialization:\n- Securities are **debited from the demat account**\n- **Physical certificates are issued**\n- Securities are removed from the electronic system'
    }
  },
  {
    id: 'q42',
    question: 'How should the benchmark chosen for a portfolio be managed?',
    options: ['Any change in the portfolio\'s holdings necessitates an immediate change in the benchmark', 'The benchmark has to be regularly reviewed to ensure continued suitability', 'The benchmark has to be retained for the entire duration of the investment', 'The benchmark has to be approved by the regulators'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'A benchmark evaluates portfolio performance. As market conditions, objectives, or composition change, the benchmark may no longer be appropriate. **Regular review** ensures the benchmark remains aligned with the portfolio\'s strategy.'
    }
  },
  {
    id: 'q43',
    question: 'Fundamental analysis operates under several key assumptions. Which of the following is NOT one of these underlying beliefs?',
    options: ['Market values exhibit predictable patterns', 'A security\'s actual value can be different from its current trading price', 'The market price of a security will go towards its intrinsic value over time', 'Fundamental analysis helps identify undervalued stocks'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: '"**Market values exhibit predictable patterns**" is an assumption of **technical analysis**, not fundamental analysis. Technical analysis studies price movements, trends, and charts to predict future stock behavior.'
    }
  },
  {
    id: 'q44',
    question: 'A portfolio manager has several key responsibilities in managing client investments. Which of the following is NOT a responsibility of the portfolio manager?',
    options: ['Gaining direct financial benefits from client funds', 'To ensure segregation of client securities holdings', 'Managing client funds with fiduciary accountability', 'Resolving client concerns in a timely manner'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Portfolio managers have fiduciary duties to act in clients\' best interests. **Deriving direct benefit from client funds is unethical** and violates fiduciary duties.'
    }
  },
  {
    id: 'q45',
    question: 'How is Risk Profiling utilized in the financial advising process?',
    options: ['Risk Profiling is conducted only once at the start of the advisor-client relationship', 'Risk Profiling is reassessed each time a new investment product is added to the portfolio', 'Risk Profiling is applied only if the client agrees with the results', 'Risk Profiling is regularly recorded and updated over time'],
    correctIndex: 3,
    explanation: {
      format: 'markdown',
      content: 'Risk profiling assesses an investor\'s ability and willingness to take risks. It should be:\n- **Documented (recorded)** for compliance\n- **Updated periodically** when there are significant changes in goals, financial situation, or market conditions'
    }
  },
  {
    id: 'q46',
    question: 'A bond\'s coupon payment is calculated as a percentage of which value?',
    options: ['Market value', 'Face value', 'Intrinsic value', 'Redemption value'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'The coupon on a bond is always expressed as a percentage of the bond\'s **Face Value**.\n\nExample: Face value = Rs. 1,000, Coupon = 7% → Annual payment = Rs. 70'
    }
  },
  {
    id: 'q47',
    question: '________ are the two costs which influence the Portfolio Rebalancing decisions.',
    options: ['Taxes and General Expenses', 'Bid Ask spreads and Taxes', 'Transaction costs and Taxes', 'Equity Research costs and Transaction costs'],
    correctIndex: 2,
    explanation: {
      format: 'markdown',
      content: 'Portfolio rebalancing involves a trade-off between costs and benefits. Two types of cost:\n- **Transaction cost**: brokerage, research cost\n- **Tax cost**: STT, stamp duty, etc.'
    }
  },
  {
    id: 'q48',
    question: 'In which of the following situations will dealing in securities be deemed NOT to be fraudulent?',
    options: ['Buying, Selling or pledging of securities either in physical or dematerialized form', 'Entering in securities transaction without intention of performing it', 'Inducing a person to transact in a security for artificially inflating or depressing the price of the security', 'Inducing a person who is new to stock investing, to subscribe to shares by providing information of large short-term profits made in shares of illiquid stocks'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'Fraud includes acts to induce another person to deal in securities through deception. **Buying, selling, or pledging securities** in physical or demat form is a legal act and not a fraud.'
    }
  },
  {
    id: 'q49',
    question: 'A company issues bonds through a public issue. In such a case which of these is mandatory?',
    options: ['The minimum tenor of the bonds should be five years', 'The bonds have to be listed on a stock exchange', 'The company issuing the bonds should already be listed on a stock exchange', 'All of the above'],
    correctIndex: 1,
    explanation: {
      format: 'markdown',
      content: 'Debentures/bonds issued under a **public offer have to mandatorily be listed on a stock exchange** as per SEBI rules and regulations.'
    }
  },
  {
    id: 'q50',
    question: 'If an investor wants to know the costs and fees associated with a Portfolio Management Scheme (PMS), he will have to read the _______.',
    options: ['Disclosure document', 'Scheme offer document', 'Scheme Information Document', 'Fact Sheet'],
    correctIndex: 0,
    explanation: {
      format: 'markdown',
      content: 'The Portfolio Manager must provide a **Disclosure Document** containing specified particulars including the range of fees charged under various heads.'
    }
  }
];

export const getMockQuizResponse = (quizId: string = 'nism-practice-1'): QuizResponse => {
  return {
    quizId,
    title: 'NISM Series Investment Advisor Practice Test',
    questions: mockQuestions,
  };
};

export { mockQuestions };
