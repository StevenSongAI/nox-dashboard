import json

# Read the corrupted file
with open('data/investments.json', 'r') as f:
    content = f.read()

# Find where the file got corrupted - look for the extra closing brace before intel-040
# The corruption starts after "dataSource": "Market Data"\n},
# and the intel-040 was appended after that

# Let's parse up to the corruption point
# Find the position of the last valid part
end_marker = '"dataSource": "Market Data"'
end_pos = content.find(end_marker)
if end_pos == -1:
    print("Could not find end marker")
    exit(1)

# Get the valid JSON portion (up to and including the end marker and its closing)
# We need to find where the main object actually ends
# The structure is: ... "dataSource": "Market Data"\n}  <-- this is the closing of the main object
# Then the corrupted intel-040 starts

# Let's find the first occurrence of intel-040 and truncate before it
corruption_start = content.find(',\n    {\n      "id": "intel-040"')
if corruption_start == -1:
    print("Could not find corruption start")
    exit(1)

# Valid JSON is everything before the corruption
valid_json = content[:corruption_start]

# Parse the valid JSON
data = json.loads(valid_json)

# Create new intelligence item
new_intel = {
    "id": "intel-040",
    "date": "2026-02-16T19:17:00Z",
    "topic": "NVDA Q4 Earnings Preview - Wall Street Bets on Massive Beat ($1.52 EPS, +71% YoY)",
    "source": "CoinCentral / TipRanks / UBS / Wolfe Research / KeyBanc",
    "content": "Fresh pre-earnings intelligence (Feb 16): (1) NVDA reports Q4 FY26 on Feb 25 with Wall Street expecting EPS $1.52 (+71% YoY) and revenue $65.58B (+67% YoY), (2) UBS analyst Timothy Arcuri raised price target to $245, expects Q4 revenue $67.5B ($2.5B above guidance), Q1 FY27 outlook $76B (vs consensus $74-75B), (3) Alphabet announced $175-185B 2026 capex for AI infrastructure - massive tailwind for NVDA GPU demand, (4) Wolfe Research's Chris Caso raised FY2028 EPS estimate to $11.50 ($1.50 above consensus), citing Rubin/Rubin Ultra chip pricing power, (5) KeyBanc's John Vinh highlights CUDA software moat as competitive barrier, (6) NVDA trades at just 25x forward earnings despite 61% growth forecast - CHEAPER than Alphabet (28x) and Broadcom (34x), (7) 37 Buy ratings, 1 Hold, 1 Sell - average price target $260.38 implying 42.4% upside from ~$183 current price, (8) Stock down 2% YTD amid competition concerns but analysts see attractive entry. Key insight: Valuation has compressed to discount vs slower-growing peers while growth trajectory remains strongest in mega-cap tech. Binary catalyst on Feb 25 - beat/raise scenario tests $200+, miss could see $150-160. Steven positioning: Existing NVDA position - hold through earnings, attractive risk/reward at 25x forward earnings with 61% growth.",
    "impact": "bullish",
    "tickers": ["NVDA", "AMD", "GOOGL", "AVGO"],
    "riskFactors": [
        "High expectations - $1.52 EPS leaves zero room for disappointment",
        "Earnings binary outcome risk - miss could trigger 15-20% correction",
        "China export restrictions remain headwind",
        "Big Tech capex sustainability concerns per Seeking Alpha bear thesis"
    ],
    "confidence": "high",
    "catalystDate": "2026-02-25",
    "catalyst": "Q4 FY2026 Earnings - EPS $1.52 expected, revenue $65.58B",
    "priceTarget": "$260.38",
    "currentPrice": "$182.81",
    "impliedUpside": "42.4%"
}

# Append to intelligence array
data['intelligence'].append(new_intel)
data['lastUpdated'] = "2026-02-16T19:17:00Z"

# Write back clean JSON
with open('data/investments.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Fixed JSON and added intel-040. Total intelligence items: {len(data['intelligence'])}")
