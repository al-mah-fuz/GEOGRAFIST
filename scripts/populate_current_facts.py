#!/usr/bin/env python3
import json

current_facts = [
    {
        "factId": "FACT-CUR-UNM",
        "topic": "International Organizations",
        "eventDate": "1945–Present",
        "organizationOrEvent": "United Nations (UN)",
        "stableFactSummary": "As of 2024, the United Nations comprises 193 sovereign member states, along with 2 non-member permanent observer states: the Holy See (Vatican City) and the State of Palestine.",
        "verifiedSource": "United Nations Protocol and Liaison Service / Member States Registry (un.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2026-12"
    },
    {
        "factId": "FACT-CUR-NTO-SWE",
        "topic": "International Alliances",
        "eventDate": "March 7, 2024",
        "organizationOrEvent": "North Atlantic Treaty Organization (NATO)",
        "stableFactSummary": "Sweden officially became the 32nd member state of NATO after depositing its instrument of accession in Washington, D.C., concluding over 200 years of military non-alignment.",
        "verifiedSource": "NATO Press Release / US Department of State Treaty Archives",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-NTO-FIN",
        "topic": "International Alliances",
        "eventDate": "April 4, 2023",
        "organizationOrEvent": "North Atlantic Treaty Organization (NATO)",
        "stableFactSummary": "Finland officially joined NATO on its 74th anniversary, becoming the alliance's 31st member and doubling NATO's direct border with the Russian Federation.",
        "verifiedSource": "NATO Office of the Secretary General / Government of Finland",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-G20-AU",
        "topic": "International Summits",
        "eventDate": "September 9, 2023",
        "organizationOrEvent": "G20 (Group of Twenty)",
        "stableFactSummary": "At the 18th G20 Summit in New Delhi, the 55-nation African Union (AU) was formally admitted as a permanent member, granting Africa equal status with the European Union inside the bloc.",
        "verifiedSource": "G20 New Delhi Leaders' Declaration / African Union Commission",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-AFCFTA",
        "topic": "African Regional Commerce",
        "eventDate": "August 2020",
        "organizationOrEvent": "African Continental Free Trade Area (AfCFTA)",
        "stableFactSummary": "The permanent Secretariat of the African Continental Free Trade Area (AfCFTA), the world's largest free trade zone by participating countries, is headquartered in Accra, Ghana.",
        "verifiedSource": "AfCFTA Secretariat Official Portal / African Union",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-ICJ",
        "topic": "International Law",
        "eventDate": "1945–Present",
        "organizationOrEvent": "International Court of Justice (ICJ)",
        "stableFactSummary": "The principal judicial organ of the United Nations is seated in the Peace Palace in The Hague, Netherlands; it is the only one of the six principal UN organs not based in New York City.",
        "verifiedSource": "International Court of Justice Registry (icj-cij.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-ICC",
        "topic": "International Law",
        "eventDate": "2002–Present",
        "organizationOrEvent": "International Criminal Court (ICC)",
        "stableFactSummary": "Established by the Rome Statute in 1998 and entering into force in July 2002, the permanent International Criminal Court investigates genocide, war crimes, and crimes against humanity from its headquarters in The Hague.",
        "verifiedSource": "International Criminal Court Official Portal / UN Treaty Collection",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-CH3",
        "topic": "Space Science & Exploration",
        "eventDate": "August 23, 2023",
        "organizationOrEvent": "Chandrayaan-3 Mission",
        "stableFactSummary": "India's Indian Space Research Organisation (ISRO) successfully landed the Vikram lander near the Moon's south polar region, making India the fourth country to soft-land on the Moon and the first near its south pole.",
        "verifiedSource": "Indian Space Research Organisation (isro.gov.in) / NASA Solar System Exploration",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-JWST",
        "topic": "Space Science & Astronomy",
        "eventDate": "July 2022",
        "organizationOrEvent": "James Webb Space Telescope (JWST)",
        "stableFactSummary": "Launched on December 25, 2021, on an Ariane 5 rocket, the James Webb Space Telescope operates at the Sun-Earth L2 Lagrange point (roughly 1.5 million km from Earth) using a 6.5-meter gold-coated beryllium mirror.",
        "verifiedSource": "NASA / European Space Agency (ESA) / Space Telescope Science Institute",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-OLY-PAR",
        "topic": "Global Sports",
        "eventDate": "July 26 – August 11, 2024",
        "organizationOrEvent": "Paris 2024 Olympic Summer Games",
        "stableFactSummary": "Paris hosted the Games of the XXXIII Olympiad in 2024, becoming only the second city (after London) to host the Summer Olympic Games three times (1900, 1924, 2024).",
        "verifiedSource": "International Olympic Committee (olympics.com)",
        "verifiedDate": "2024-08",
        "reviewDate": "2028-01"
    },
    {
        "factId": "FACT-CUR-WC-2026",
        "topic": "Global Sports",
        "eventDate": "June – July 2026",
        "organizationOrEvent": "2026 FIFA World Cup",
        "stableFactSummary": "The 23rd FIFA World Cup is jointly hosted across 16 cities in Canada, Mexico, and the United States, expanding to a 48-team tournament for the first time in FIFA history.",
        "verifiedSource": "FIFA Official Communications / Host City Consortium",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-PRS-AGR",
        "topic": "Global Climate Treaties",
        "eventDate": "December 12, 2015",
        "organizationOrEvent": "Paris Agreement (COP21)",
        "stableFactSummary": "Legally binding international treaty on climate change adopted by 196 parties at COP21, setting a global target to hold the increase in average temperature to well below 2°C above pre-industrial levels.",
        "verifiedSource": "UN Framework Convention on Climate Change (UNFCCC) / UN Treaty Collection",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-HRV-EZ",
        "topic": "European Integration",
        "eventDate": "January 1, 2023",
        "organizationOrEvent": "European Union / Eurozone",
        "stableFactSummary": "Croatia simultaneously adopted the euro as its official currency (replacing the Croatian kuna) and became the 27th member of the passport-free Schengen Area.",
        "verifiedSource": "European Central Bank / Council of the European Union",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-WHO",
        "topic": "International Organizations",
        "eventDate": "1948–Present",
        "organizationOrEvent": "World Health Organization (WHO)",
        "stableFactSummary": "Specialized agency of the United Nations responsible for international public health, founded on April 7, 1948 (celebrated as World Health Day) and headquartered in Geneva, Switzerland.",
        "verifiedSource": "World Health Organization Official Registry (who.int)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-WTO",
        "topic": "International Organizations",
        "eventDate": "1995–Present",
        "organizationOrEvent": "World Trade Organization (WTO)",
        "stableFactSummary": "Successor to the General Agreement on Tariffs and Trade (GATT) created under the 1994 Marrakesh Agreement, the World Trade Organization regulates global trade from Geneva, Switzerland.",
        "verifiedSource": "World Trade Organization (wto.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-UNESCO",
        "topic": "International Organizations",
        "eventDate": "1945–Present",
        "organizationOrEvent": "UNESCO",
        "stableFactSummary": "The United Nations Educational, Scientific and Cultural Organization promotes peace and security through international cooperation in education, sciences, and culture, with headquarters located in Paris, France.",
        "verifiedSource": "UNESCO Constitution and Secretariat Directory (unesco.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-ECB",
        "topic": "European Financial Institutions",
        "eventDate": "1998–Present",
        "organizationOrEvent": "European Central Bank (ECB)",
        "stableFactSummary": "The central bank responsible for monetary policy across the eurozone member states is headquartered in Frankfurt am Main, Germany.",
        "verifiedSource": "European Central Bank Protocol (ecb.europa.eu)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-IMO",
        "topic": "International Maritime Law",
        "eventDate": "1948–Present",
        "organizationOrEvent": "International Maritime Organization (IMO)",
        "stableFactSummary": "The specialized United Nations agency responsible for regulating the safety, security, and environmental performance of international shipping is based in London, United Kingdom.",
        "verifiedSource": "International Maritime Organization (imo.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-COP28",
        "topic": "Global Climate Summits",
        "eventDate": "November – December 2023",
        "organizationOrEvent": "COP28 Climate Summit (Dubai)",
        "stableFactSummary": "At COP28 in Dubai, nearly 200 nations reached the 'UAE Consensus', calling for a historic transition away from fossil fuels in energy systems and establishing a Loss and Damage Fund.",
        "verifiedSource": "UN Framework Convention on Climate Change (UNFCCC) COP28 Outcome",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-OSCE",
        "topic": "European Security Alliances",
        "eventDate": "1975–Present",
        "organizationOrEvent": "Organization for Security and Co-operation in Europe (OSCE)",
        "stableFactSummary": "The world's largest regional security-oriented intergovernmental organization, encompassing 57 participating states across North America, Europe, and Central Asia, is headquartered in Vienna, Austria.",
        "verifiedSource": "OSCE Secretariat (osce.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-IEA",
        "topic": "Global Energy Institutions",
        "eventDate": "1974–Present",
        "organizationOrEvent": "International Energy Agency (IEA)",
        "stableFactSummary": "Autonomous intergovernmental organization established in 1974 in the wake of the 1973 oil crisis to ensure the security of global energy supplies, based in Paris, France.",
        "verifiedSource": "International Energy Agency (iea.org)",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    },
    {
        "factId": "FACT-CUR-CPTPP",
        "topic": "Multilateral Trade Accords",
        "eventDate": "July 2023",
        "organizationOrEvent": "CPTPP Trade Agreement",
        "stableFactSummary": "In July 2023, the United Kingdom signed the accession protocol to join the Comprehensive and Progressive Agreement for Trans-Pacific Partnership (CPTPP), becoming its 12th member state and first European member.",
        "verifiedSource": "CPTPP Commission Joint Statement / UK Department for Business and Trade",
        "verifiedDate": "2024-06",
        "reviewDate": "2027-01"
    }
]

ts_content = """import { CurrentAffairsFact } from '../../types';

/**
 * Curated Current Affairs & International Institutions Dataset
 * Stores dated records, verification dates, source references, and review dates.
 */
export const VERIFIED_CURRENT_AFFAIRS_FACTS: CurrentAffairsFact[] = """ + json.dumps(current_facts, indent=2) + ";\n"

with open('src/data/facts/currentAffairsFacts.ts', 'w') as f:
    f.write(ts_content)

print(f"Wrote {len(current_facts)} verified current affairs facts to src/data/facts/currentAffairsFacts.ts successfully.")
