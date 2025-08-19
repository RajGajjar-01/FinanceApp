# portfolio/utils/sector_map.py
from portfolio.models import SectorChoices

FINNHUB_TO_SECTOR = {
    "Technology": SectorChoices.TECHNOLOGY,
    "Information Technology": SectorChoices.TECHNOLOGY,
    "Software": SectorChoices.TECHNOLOGY,
    "Semiconductors": SectorChoices.TECHNOLOGY,

    "Financial Services": SectorChoices.FINANCIALS,
    "Banks": SectorChoices.FINANCIALS,
    "Insurance": SectorChoices.FINANCIALS,
    "Capital Markets": SectorChoices.FINANCIALS,

    "Healthcare": SectorChoices.HEALTHCARE,
    "Health Care": SectorChoices.HEALTHCARE,
    "Biotechnology": SectorChoices.HEALTHCARE,
    "Pharmaceuticals": SectorChoices.HEALTHCARE,

    "Industrials": SectorChoices.INDUSTRIALS,
    "Aerospace & Defense": SectorChoices.INDUSTRIALS,
    "Machinery": SectorChoices.INDUSTRIALS,
    "Transportation": SectorChoices.INDUSTRIALS,

    "Consumer Cyclical": SectorChoices.CONSUMER,
    "Consumer Defensive": SectorChoices.CONSUMER,
    "Consumer Staples": SectorChoices.CONSUMER,
    "Retail": SectorChoices.CONSUMER,

    "Energy": SectorChoices.ENERGY,
    "Oil & Gas": SectorChoices.ENERGY,
}

def map_sector(finnhub_sector: str) -> str:
    if not finnhub_sector:
        return SectorChoices.OTHER
    return FINNHUB_TO_SECTOR.get(finnhub_sector.strip(), SectorChoices.OTHER)
