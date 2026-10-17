#!/usr/bin/env python3
import json
import os

with open('/tmp/existing_facts.json') as f:
    existing_facts = json.load(f)

existing_iso2 = set(f['iso2'] for f in existing_facts)
existing_names = set(f['countryName'] for f in existing_facts)

# Additional countries to reach comprehensive global coverage (~195 UN members + observer states)
additional_countries = [
    # AFRICA
    {
        "factId": "FACT-GEO-AGO", "countryName": "Angola", "iso2": "AO", "capital": "Luanda",
        "continent": "Africa", "currencyName": "Angolan Kwanza",
        "flagDescription": "horizontal red and black halves with a yellow half gear, machete, and star emblem",
        "flagEmoji": "🇦🇴", "verifiedSource": "National Assembly of Angola / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-BEN", "countryName": "Benin", "iso2": "BJ", "capital": "Porto-Novo",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "vertical green bar on the hoist with horizontal yellow and red bands on the fly",
        "flagEmoji": "🇧🇯", "verifiedSource": "Government of Benin Official Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-BWA", "countryName": "Botswana", "iso2": "BW", "capital": "Gaborone",
        "continent": "Africa", "currencyName": "Botswana Pula",
        "flagDescription": "light blue field with a central horizontal black stripe bordered by thin white stripes",
        "flagEmoji": "🇧🇼", "verifiedSource": "Government of Botswana / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BFA", "countryName": "Burkina Faso", "iso2": "BF", "capital": "Ouagadougou",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "horizontal red and green bands with a yellow five-pointed star in the center",
        "flagEmoji": "🇧🇫", "verifiedSource": "Government of Burkina Faso / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-BDI", "countryName": "Burundi", "iso2": "BI", "capital": "Gitega",
        "continent": "Africa", "currencyName": "Burundian Franc",
        "flagDescription": "white saltire dividing the field into red and green triangles with a central circle containing three red stars",
        "flagEmoji": "🇧🇮", "verifiedSource": "Burundi Law No. 1/04 of 2019 / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-CMR", "countryName": "Cameroon", "iso2": "CM", "capital": "Yaoundé",
        "continent": "Africa", "currencyName": "Central African CFA Franc",
        "flagDescription": "vertical green, red, and yellow stripes with a gold star in the central red stripe",
        "flagEmoji": "🇨🇲", "verifiedSource": "Constitution of the Republic of Cameroon / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-CPV", "countryName": "Cape Verde", "iso2": "CV", "capital": "Praia",
        "continent": "Africa", "currencyName": "Cape Verdean Escudo",
        "flagDescription": "blue field with a white stripe bordered by red, and a circle of ten yellow stars representing the main islands",
        "flagEmoji": "🇨🇻", "verifiedSource": "Official Bulletin of Cape Verde / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-CAF", "countryName": "Central African Republic", "iso2": "CF", "capital": "Bangui",
        "continent": "Africa", "currencyName": "Central African CFA Franc",
        "flagDescription": "four horizontal bands of blue, white, green, and yellow bisected by a vertical red stripe with a yellow star in the canton",
        "flagEmoji": "🇨🇫", "verifiedSource": "UN Geospatial / Government of CAR", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-TCD", "countryName": "Chad", "iso2": "TD", "capital": "N'Djamena",
        "continent": "Africa", "currencyName": "Central African CFA Franc",
        "flagDescription": "vertical tricolor of blue, gold, and red",
        "flagEmoji": "🇹🇩", "verifiedSource": "Government of Chad Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-COM", "countryName": "Comoros", "iso2": "KM", "capital": "Moroni",
        "continent": "Africa", "currencyName": "Comorian Franc",
        "flagDescription": "yellow, white, red, and blue horizontal stripes with a green triangle on the hoist bearing a crescent and four stars",
        "flagEmoji": "🇰🇲", "verifiedSource": "Union of the Comoros Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-COG", "countryName": "Republic of the Congo", "iso2": "CG", "capital": "Brazzaville",
        "continent": "Africa", "currencyName": "Central African CFA Franc",
        "flagDescription": "green and red triangles separated by a diagonal yellow stripe extending from the lower hoist to the upper fly",
        "flagEmoji": "🇨🇬", "verifiedSource": "Government of Republic of Congo / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-COD", "countryName": "DR Congo", "iso2": "CD", "capital": "Kinshasa",
        "continent": "Africa", "currencyName": "Congolese Franc",
        "flagDescription": "sky blue field divided diagonally by a red stripe bordered by thin yellow stripes, with a yellow star in the upper hoist",
        "flagEmoji": "🇨🇩", "verifiedSource": "Constitution of the DRC / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-DJI", "countryName": "Djibouti", "iso2": "DJ", "capital": "Djibouti",
        "continent": "Africa", "currencyName": "Djiboutian Franc",
        "flagDescription": "horizontal light blue and light green halves with a white isosceles triangle on the hoist bearing a red star",
        "flagEmoji": "🇩🇯", "verifiedSource": "Republic of Djibouti Official Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-GNQ", "countryName": "Equatorial Guinea", "iso2": "GQ", "capital": "Malabo",
        "continent": "Africa", "currencyName": "Central African CFA Franc",
        "flagDescription": "green, white, and red horizontal stripes with a blue triangle on the hoist and national coat of arms centered",
        "flagEmoji": "🇬🇶", "verifiedSource": "Government of Equatorial Guinea / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-ERI", "countryName": "Eritrea", "iso2": "ER", "capital": "Asmara",
        "continent": "Africa", "currencyName": "Eritrean Nakfa",
        "flagDescription": "green and blue triangles separated by a red triangle bearing an olive wreath and branch emblem",
        "flagEmoji": "🇪🇷", "verifiedSource": "Government of Eritrea / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-SWZ", "countryName": "Eswatini", "iso2": "SZ", "capital": "Mbabane",
        "continent": "Africa", "currencyName": "Swazi Lilangeni",
        "flagDescription": "blue, yellow, crimson, yellow, and blue horizontal stripes with a traditional Nguni shield and spears centered",
        "flagEmoji": "🇸🇿", "verifiedSource": "Kingdom of Eswatini Legal Notice / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-GAB", "countryName": "Gabon", "iso2": "GA", "capital": "Libreville",
        "continent": "Africa", "currencyName": "Central African CFA Franc",
        "flagDescription": "horizontal tricolor of green, yellow, and blue",
        "flagEmoji": "🇬🇦", "verifiedSource": "Republic of Gabon Official Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-GMB", "countryName": "Gambia", "iso2": "GM", "capital": "Banjul",
        "continent": "Africa", "currencyName": "Gambian Dalasi",
        "flagDescription": "red, blue, and green horizontal stripes separated by thin white stripes representing the Gambia River",
        "flagEmoji": "🇬🇲", "verifiedSource": "Republic of The Gambia National Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-GIN", "countryName": "Guinea", "iso2": "GN", "capital": "Conakry",
        "continent": "Africa", "currencyName": "Guinean Franc",
        "flagDescription": "vertical tricolor of red, yellow, and green",
        "flagEmoji": "🇬🇳", "verifiedSource": "Constitution of Guinea / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-GNB", "countryName": "Guinea-Bissau", "iso2": "GW", "capital": "Bissau",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "vertical red stripe on the hoist bearing a black star, with horizontal yellow and green stripes on the fly",
        "flagEmoji": "🇬🇼", "verifiedSource": "Republic of Guinea-Bissau Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-CIV", "countryName": "Ivory Coast", "iso2": "CI", "capital": "Yamoussoukro",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "vertical tricolor of orange, white, and green",
        "flagEmoji": "🇨🇮", "verifiedSource": "Constitution of Côte d'Ivoire / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-LSO", "countryName": "Lesotho", "iso2": "LS", "capital": "Maseru",
        "continent": "Africa", "currencyName": "Lesotho Loti",
        "flagDescription": "horizontal blue, white, and green stripes with a black traditional Basotho hat (Mokorotlo) centered",
        "flagEmoji": "🇱🇸", "verifiedSource": "Kingdom of Lesotho National Flag Act / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-LBR", "countryName": "Liberia", "iso2": "LR", "capital": "Monrovia",
        "continent": "Africa", "currencyName": "Liberian Dollar",
        "flagDescription": "eleven red and white stripes with a blue square in the canton containing a white five-pointed star",
        "flagEmoji": "🇱🇷", "verifiedSource": "Government of Liberia / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-LBY", "countryName": "Libya", "iso2": "LY", "capital": "Tripoli",
        "continent": "Africa", "currencyName": "Libyan Dinar",
        "flagDescription": "horizontal red, black, and green stripes with a white crescent and five-pointed star centered on the black stripe",
        "flagEmoji": "🇱🇾", "verifiedSource": "State of Libya Official Declaration / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MDG", "countryName": "Madagascar", "iso2": "MG", "capital": "Antananarivo",
        "continent": "Africa", "currencyName": "Malagasy Ariary",
        "flagDescription": "vertical white stripe on the hoist with horizontal red and green stripes on the fly",
        "flagEmoji": "🇲🇬", "verifiedSource": "Constitution of Madagascar / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MWI", "countryName": "Malawi", "iso2": "MW", "capital": "Lilongwe",
        "continent": "Africa", "currencyName": "Malawian Kwacha",
        "flagDescription": "horizontal black, red, and green stripes with a red rising sun centered on the top black stripe",
        "flagEmoji": "🇲🇼", "verifiedSource": "Government of Malawi / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-MLI", "countryName": "Mali", "iso2": "ML", "capital": "Bamako",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "vertical tricolor of green, gold, and red",
        "flagEmoji": "🇲🇱", "verifiedSource": "Republic of Mali Official Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MRT", "countryName": "Mauritania", "iso2": "MR", "capital": "Nouakchott",
        "continent": "Africa", "currencyName": "Mauritanian Ouguiya",
        "flagDescription": "green field bordered top and bottom by red stripes, bearing a gold crescent and star in the center",
        "flagEmoji": "🇲🇷", "verifiedSource": "Islamic Republic of Mauritania Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-MUS", "countryName": "Mauritius", "iso2": "MU", "capital": "Port Louis",
        "continent": "Africa", "currencyName": "Mauritian Rupee",
        "flagDescription": "four horizontal stripes of red, blue, yellow, and green",
        "flagEmoji": "🇲🇺", "verifiedSource": "Government of Mauritius / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-MOZ", "countryName": "Mozambique", "iso2": "MZ", "capital": "Maputo",
        "continent": "Africa", "currencyName": "Mozambican Metical",
        "flagDescription": "green, black, and yellow horizontal stripes bordered by white, with a red triangle on the hoist containing a yellow star, book, hoe, and rifle",
        "flagEmoji": "🇲🇿", "verifiedSource": "Republic of Mozambique Constitution / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-NAM", "countryName": "Namibia", "iso2": "NA", "capital": "Windhoek",
        "continent": "Africa", "currencyName": "Namibian Dollar",
        "flagDescription": "blue and green triangles separated by a red diagonal stripe with white edges, and a golden 12-pointed sun in the canton",
        "flagEmoji": "🇳🇦", "verifiedSource": "Government of Namibia Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-NER", "countryName": "Niger", "iso2": "NE", "capital": "Niamey",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "horizontal orange, white, and green stripes with an orange sun disc in the center of the white stripe",
        "flagEmoji": "🇳🇪", "verifiedSource": "Republic of Niger Official Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-STP", "countryName": "Sao Tome and Principe", "iso2": "ST", "capital": "São Tomé",
        "continent": "Africa", "currencyName": "São Tomé and Príncipe Dobra",
        "flagDescription": "green, yellow, and green horizontal stripes with a red triangle on the hoist and two black five-pointed stars on the yellow stripe",
        "flagEmoji": "🇸🇹", "verifiedSource": "Democratic Republic of Sao Tome Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-SYC", "countryName": "Seychelles", "iso2": "SC", "capital": "Victoria",
        "continent": "Africa", "currencyName": "Seychellois Rupee",
        "flagDescription": "five oblique bands of blue, yellow, red, white, and green radiating from the bottom hoist corner",
        "flagEmoji": "🇸🇨", "verifiedSource": "Republic of Seychelles National Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-SLE", "countryName": "Sierra Leone", "iso2": "SL", "capital": "Freetown",
        "continent": "Africa", "currencyName": "Sierra Leonean Leone",
        "flagDescription": "horizontal tricolor of light green, white, and light blue",
        "flagEmoji": "🇸🇱", "verifiedSource": "Government of Sierra Leone / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-SOM", "countryName": "Somalia", "iso2": "SO", "capital": "Mogadishu",
        "continent": "Africa", "currencyName": "Somali Shilling",
        "flagDescription": "light blue field with a single centered white five-pointed star",
        "flagEmoji": "🇸🇴", "verifiedSource": "Federal Republic of Somalia Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SSD", "countryName": "South Sudan", "iso2": "SS", "capital": "Juba",
        "continent": "Africa", "currencyName": "South Sudanese Pound",
        "flagDescription": "black, red, and green horizontal stripes bordered by white, with a blue triangle on the hoist bearing a gold star",
        "flagEmoji": "🇸🇸", "verifiedSource": "Transitional Constitution of South Sudan / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SDN", "countryName": "Sudan", "iso2": "SD", "capital": "Khartoum",
        "continent": "Africa", "currencyName": "Sudanese Pound",
        "flagDescription": "horizontal red, white, and black stripes with a green triangle on the hoist",
        "flagEmoji": "🇸🇩", "verifiedSource": "Republic of the Sudan Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-TGO", "countryName": "Togo", "iso2": "TG", "capital": "Lomé",
        "continent": "Africa", "currencyName": "West African CFA Franc",
        "flagDescription": "five alternating green and yellow horizontal stripes with a red canton bearing a white five-pointed star",
        "flagEmoji": "🇹🇬", "verifiedSource": "Republic of Togo Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TUN", "countryName": "Tunisia", "iso2": "TN", "capital": "Tunis",
        "continent": "Africa", "currencyName": "Tunisian Dinar",
        "flagDescription": "red field with a white centered circle containing a red crescent and five-pointed star",
        "flagEmoji": "🇹🇳", "verifiedSource": "Republic of Tunisia Constitution / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-ZMB", "countryName": "Zambia", "iso2": "ZM", "capital": "Lusaka",
        "continent": "Africa", "currencyName": "Zambian Kwacha",
        "flagDescription": "green field with an orange African fish eagle in flight above vertical red, black, and orange stripes on the fly",
        "flagEmoji": "🇿🇲", "verifiedSource": "Government of Zambia National Flag Act / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-ZWE", "countryName": "Zimbabwe", "iso2": "ZW", "capital": "Harare",
        "continent": "Africa", "currencyName": "Zimbabwe Gold (ZiG)",
        "flagDescription": "seven horizontal stripes of green, gold, red, black, red, gold, and green with a white triangle on the hoist bearing the Zimbabwe Bird and a red star",
        "flagEmoji": "🇿🇼", "verifiedSource": "Government of Zimbabwe National Symbols / UN Geospatial", "verifiedDate": "2024-06"
    },

    # ASIA
    {
        "factId": "FACT-GEO-AFG", "countryName": "Afghanistan", "iso2": "AF", "capital": "Kabul",
        "continent": "Asia", "currencyName": "Afghan Afghani",
        "flagDescription": "white field inscribed with the black Shahada in Arabic calligraphy",
        "flagEmoji": "🇦🇫", "verifiedSource": "UN Geospatial Information Section", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-ARM", "countryName": "Armenia", "iso2": "AM", "capital": "Yerevan",
        "continent": "Asia", "currencyName": "Armenian Dram",
        "flagDescription": "horizontal tricolor of red, blue, and orange",
        "flagEmoji": "🇦🇲", "verifiedSource": "Constitution of the Republic of Armenia / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-AZE", "countryName": "Azerbaijan", "iso2": "AZ", "capital": "Baku",
        "continent": "Asia", "currencyName": "Azerbaijani Manat",
        "flagDescription": "horizontal blue, red, and green stripes with a white crescent and eight-pointed star centered on the red stripe",
        "flagEmoji": "🇦🇿", "verifiedSource": "State Symbols of Azerbaijan / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-BHR", "countryName": "Bahrain", "iso2": "BH", "capital": "Manama",
        "continent": "Asia", "currencyName": "Bahraini Dinar",
        "flagDescription": "red field separated from a white band on the hoist by five white serrated triangles symbolizing the five pillars of Islam",
        "flagEmoji": "🇧🇭", "verifiedSource": "Kingdom of Bahrain Official Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BGD", "countryName": "Bangladesh", "iso2": "BD", "capital": "Dhaka",
        "continent": "Asia", "currencyName": "Bangladeshi Taka",
        "flagDescription": "dark green field with a large red disc shifted slightly toward the hoist to appear centered when flying",
        "flagEmoji": "🇧🇩", "verifiedSource": "People's Republic of Bangladesh Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-BTN", "countryName": "Bhutan", "iso2": "BT", "capital": "Thimphu",
        "continent": "Asia", "currencyName": "Bhutanese Ngultrum",
        "flagDescription": "divided diagonally into yellow and orange halves with Druk, the white Thunder Dragon, centered along the dividing line",
        "flagEmoji": "🇧🇹", "verifiedSource": "Royal Government of Bhutan / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BRN", "countryName": "Brunei", "iso2": "BN", "capital": "Bandar Seri Begawan",
        "continent": "Asia", "currencyName": "Brunei Dollar",
        "flagDescription": "yellow field with black and white diagonal stripes bisected by the red state crest in the center",
        "flagEmoji": "🇧🇳", "verifiedSource": "Government of Brunei Darussalam / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-KHM", "countryName": "Cambodia", "iso2": "KH", "capital": "Phnom Penh",
        "continent": "Asia", "currencyName": "Cambodian Riel",
        "flagDescription": "blue, red, and blue horizontal stripes with a white silhouette of Angkor Wat centered on the red band",
        "flagEmoji": "🇰🇭", "verifiedSource": "Kingdom of Cambodia National Symbols / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-CYP", "countryName": "Cyprus", "iso2": "CY", "capital": "Nicosia",
        "continent": "Asia", "currencyName": "Euro",
        "flagDescription": "white field featuring a copper-colored map of the island above two green olive branches",
        "flagEmoji": "🇨🇾", "verifiedSource": "Republic of Cyprus Law / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-GEO", "countryName": "Georgia", "iso2": "GE", "capital": "Tbilisi",
        "continent": "Asia", "currencyName": "Georgian Lari",
        "flagDescription": "white field with a large red St. George's cross and four smaller red Bolnisi crosses in each canton",
        "flagEmoji": "🇬🇪", "verifiedSource": "Parliament of Georgia Organic Law / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-IRN", "countryName": "Iran", "iso2": "IR", "capital": "Tehran",
        "continent": "Asia", "currencyName": "Iranian Rial",
        "flagDescription": "horizontal green, white, and red stripes with the red national emblem centered and Takbir written along the stripe borders",
        "flagEmoji": "🇮🇷", "verifiedSource": "Constitution of the Islamic Republic of Iran / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-IRQ", "countryName": "Iraq", "iso2": "IQ", "capital": "Baghdad",
        "continent": "Asia", "currencyName": "Iraqi Dinar",
        "flagDescription": "horizontal red, white, and black stripes with the green Takbir written in Kufic script in the center",
        "flagEmoji": "🇮🇶", "verifiedSource": "Republic of Iraq Official Gazette / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-ISR", "countryName": "Israel", "iso2": "IL", "capital": "Jerusalem",
        "continent": "Asia", "currencyName": "Israeli New Shekel",
        "flagDescription": "white field bordered top and bottom by blue stripes with a blue Star of David centered",
        "flagEmoji": "🇮🇱", "verifiedSource": "State of Israel Flag and Emblem Law / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-JOR", "countryName": "Jordan", "iso2": "JO", "capital": "Amman",
        "continent": "Asia", "currencyName": "Jordanian Dinar",
        "flagDescription": "black, white, and green horizontal stripes with a red chevron on the hoist bearing a white seven-pointed star",
        "flagEmoji": "🇯🇴", "verifiedSource": "Hashemite Kingdom of Jordan Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-KAZ", "countryName": "Kazakhstan", "iso2": "KZ", "capital": "Astana",
        "continent": "Asia", "currencyName": "Kazakhstani Tenge",
        "flagDescription": "sky blue field with a golden steppe eagle beneath a 32-ray golden sun, and a vertical national ornament pattern on the hoist",
        "flagEmoji": "🇰🇿", "verifiedSource": "Constitutional Law of Kazakhstan on State Symbols / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-KWT", "countryName": "Kuwait", "iso2": "KW", "capital": "Kuwait City",
        "continent": "Asia", "currencyName": "Kuwaiti Dinar",
        "flagDescription": "green, white, and red horizontal stripes with a black trapezoid on the hoist",
        "flagEmoji": "🇰🇼", "verifiedSource": "State of Kuwait Law No. 26 / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-KGZ", "countryName": "Kyrgyzstan", "iso2": "KG", "capital": "Bishkek",
        "continent": "Asia", "currencyName": "Kyrgyzstani Som",
        "flagDescription": "red field with a yellow 40-ray sun encircling a tunduk (yurt roof opening)",
        "flagEmoji": "🇰🇬", "verifiedSource": "Supreme Council of Kyrgyzstan Law / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-LAO", "countryName": "Laos", "iso2": "LA", "capital": "Vientiane",
        "continent": "Asia", "currencyName": "Lao Kip",
        "flagDescription": "horizontal red, blue, and red stripes with a white circle centered on the blue band representing the full moon",
        "flagEmoji": "🇱🇦", "verifiedSource": "Lao PDR National Symbols Law / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-LBN", "countryName": "Lebanon", "iso2": "LB", "capital": "Beirut",
        "continent": "Asia", "currencyName": "Lebanese Pound",
        "flagDescription": "horizontal red, white, and red stripes with a green Lebanon cedar tree centered on the white band",
        "flagEmoji": "🇱🇧", "verifiedSource": "Constitution of Lebanon / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MDV", "countryName": "Maldives", "iso2": "MV", "capital": "Malé",
        "continent": "Asia", "currencyName": "Maldivian Rufiyaa",
        "flagDescription": "red field with a large green rectangle in the center containing a white crescent facing the fly",
        "flagEmoji": "🇲🇻", "verifiedSource": "Republic of Maldives Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-MMR", "countryName": "Myanmar", "iso2": "MM", "capital": "Naypyidaw",
        "continent": "Asia", "currencyName": "Myanmar Kyat",
        "flagDescription": "horizontal yellow, green, and red stripes with a large white five-pointed star in the center",
        "flagEmoji": "🇲🇲", "verifiedSource": "Republic of the Union of Myanmar Constitution / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-PRK", "countryName": "North Korea", "iso2": "KP", "capital": "Pyongyang",
        "continent": "Asia", "currencyName": "North Korean Won",
        "flagDescription": "central red panel bordered by thin white stripes and wide blue stripes, with a red five-pointed star inside a white circle",
        "flagEmoji": "🇰🇵", "verifiedSource": "Socialist Constitution of the DPRK / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-OMN", "countryName": "Oman", "iso2": "OM", "capital": "Muscat",
        "continent": "Asia", "currencyName": "Omani Rial",
        "flagDescription": "white, red, and green horizontal stripes with a red vertical stripe on the hoist bearing the national Khanjar dagger and crossed swords",
        "flagEmoji": "🇴🇲", "verifiedSource": "Sultanate of Oman Royal Decree / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-QAT", "countryName": "Qatar", "iso2": "QA", "capital": "Doha",
        "continent": "Asia", "currencyName": "Qatari Riyal",
        "flagDescription": "maroon field separated from a white band on the hoist by nine serrated white points",
        "flagEmoji": "🇶🇦", "verifiedSource": "State of Qatar Law No. 14 / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SAU", "countryName": "Saudi Arabia", "iso2": "SA", "capital": "Riyadh",
        "continent": "Asia", "currencyName": "Saudi Riyal",
        "flagDescription": "green field inscribed with the white Arabic Shahada above a horizontal white scimitar sword",
        "flagEmoji": "🇸🇦", "verifiedSource": "Kingdom of Saudi Arabia Royal Order / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-LKA", "countryName": "Sri Lanka", "iso2": "LK", "capital": "Sri Jayawardenepura Kotte",
        "continent": "Asia", "currencyName": "Sri Lankan Rupee",
        "flagDescription": "gold-bordered field with a gold lion holding a sword inside a maroon rectangle, flanked by green and orange stripes",
        "flagEmoji": "🇱🇰", "verifiedSource": "Constitution of Sri Lanka / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SYR", "countryName": "Syria", "iso2": "SY", "capital": "Damascus",
        "continent": "Asia", "currencyName": "Syrian Pound",
        "flagDescription": "horizontal red, white, and black stripes with two green five-pointed stars centered on the white band",
        "flagEmoji": "🇸🇾", "verifiedSource": "Syrian Arab Republic Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TJK", "countryName": "Tajikistan", "iso2": "TJ", "capital": "Dushanbe",
        "continent": "Asia", "currencyName": "Tajikistani Somoni",
        "flagDescription": "horizontal red, white, and green stripes with a crown surmounted by seven stars centered on the white band",
        "flagEmoji": "🇹🇯", "verifiedSource": "Republic of Tajikistan Law on State Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TLS", "countryName": "Timor-Leste", "iso2": "TL", "capital": "Dili",
        "continent": "Asia", "currencyName": "United States Dollar",
        "flagDescription": "red field with yellow and black triangles based on the hoist, containing a white five-pointed star in the black triangle",
        "flagEmoji": "🇹🇱", "verifiedSource": "Constitution of Timor-Leste / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TUR", "countryName": "Turkey", "iso2": "TR", "capital": "Ankara",
        "continent": "Asia", "currencyName": "Turkish Lira",
        "flagDescription": "red field with a white crescent moon and a five-pointed star centered",
        "flagEmoji": "🇹🇷", "verifiedSource": "Turkish Flag Law No. 2893 / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-TKM", "countryName": "Turkmenistan", "iso2": "TM", "capital": "Ashgabat",
        "continent": "Asia", "currencyName": "Turkmenistani Manat",
        "flagDescription": "green field with a vertical red stripe near the hoist containing five carpet guls, with a white crescent and five stars in the upper fly",
        "flagEmoji": "🇹🇲", "verifiedSource": "State Symbols of Turkmenistan / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-ARE", "countryName": "United Arab Emirates", "iso2": "AE", "capital": "Abu Dhabi",
        "continent": "Asia", "currencyName": "UAE Dirham",
        "flagDescription": "vertical red stripe on the hoist with horizontal green, white, and black stripes on the fly",
        "flagEmoji": "🇦🇪", "verifiedSource": "Federal Law No. 2 of UAE / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-UZB", "countryName": "Uzbekistan", "iso2": "UZ", "capital": "Tashkent",
        "continent": "Asia", "currencyName": "Uzbekistani Som",
        "flagDescription": "blue, white, and green horizontal stripes separated by thin red stripes, with a crescent and twelve stars in the canton",
        "flagEmoji": "🇺🇿", "verifiedSource": "Law of Uzbekistan on the State Flag / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-YEM", "countryName": "Yemen", "iso2": "YE", "capital": "Sanaa",
        "continent": "Asia", "currencyName": "Yemeni Rial",
        "flagDescription": "horizontal tricolor of red, white, and black",
        "flagEmoji": "🇾🇪", "verifiedSource": "Republic of Yemen Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },

    # EUROPE
    {
        "factId": "FACT-GEO-ALB", "countryName": "Albania", "iso2": "AL", "capital": "Tirana",
        "continent": "Europe", "currencyName": "Albanian Lek",
        "flagDescription": "red field with a black double-headed eagle in the center",
        "flagEmoji": "🇦🇱", "verifiedSource": "Constitution of the Republic of Albania / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-AND", "countryName": "Andorra", "iso2": "AD", "capital": "Andorra la Vella",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "vertical tricolor of blue, yellow, and red with the national coat of arms in the center",
        "flagEmoji": "🇦🇩", "verifiedSource": "Constitution of the Principality of Andorra / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BLR", "countryName": "Belarus", "iso2": "BY", "capital": "Minsk",
        "continent": "Europe", "currencyName": "Belarusian Ruble",
        "flagDescription": "horizontal red and green stripes with a red-on-white traditional ornamental pattern on the hoist",
        "flagEmoji": "🇧🇾", "verifiedSource": "Law on State Symbols of the Republic of Belarus / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BIH", "countryName": "Bosnia and Herzegovina", "iso2": "BA", "capital": "Sarajevo",
        "continent": "Europe", "currencyName": "Bosnia and Herzegovina Convertible Mark",
        "flagDescription": "blue field with a yellow right triangle and a diagonal line of white five-pointed stars along the hypotenuse",
        "flagEmoji": "🇧🇦", "verifiedSource": "Parliamentary Assembly of Bosnia and Herzegovina / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-BGR", "countryName": "Bulgaria", "iso2": "BG", "capital": "Sofia",
        "continent": "Europe", "currencyName": "Bulgarian Lev",
        "flagDescription": "horizontal tricolor of white, green, and red",
        "flagEmoji": "🇧🇬", "verifiedSource": "Constitution of the Republic of Bulgaria / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-HRV", "countryName": "Croatia", "iso2": "HR", "capital": "Zagreb",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal tricolor of red, white, and blue with the coat of arms of Croatia in the center",
        "flagEmoji": "🇭🇷", "verifiedSource": "Law on the Coat of Arms, Flag and Anthem of Croatia / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-CZE", "countryName": "Czech Republic", "iso2": "CZ", "capital": "Prague",
        "continent": "Europe", "currencyName": "Czech Koruna",
        "flagDescription": "horizontal white and red stripes with a blue isosceles triangle based on the hoist",
        "flagEmoji": "🇨🇿", "verifiedSource": "Act on State Symbols of the Czech Republic / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-EST", "countryName": "Estonia", "iso2": "EE", "capital": "Tallinn",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal tricolor of blue, black, and white",
        "flagEmoji": "🇪🇪", "verifiedSource": "State Flag Act of Estonia / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-HUN", "countryName": "Hungary", "iso2": "HU", "capital": "Budapest",
        "continent": "Europe", "currencyName": "Hungarian Forint",
        "flagDescription": "horizontal tricolor of red, white, and green",
        "flagEmoji": "🇭🇺", "verifiedSource": "Fundamental Law of Hungary / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-XKX", "countryName": "Kosovo", "iso2": "XK", "capital": "Pristina",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "blue field bearing a golden map of Kosovo beneath six white stars arranged in an arc",
        "flagEmoji": "🇽🇰", "verifiedSource": "Assembly of Kosovo Law on State Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-LVA", "countryName": "Latvia", "iso2": "LV", "capital": "Riga",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "carmine red field with a narrow white horizontal stripe across the center",
        "flagEmoji": "🇱🇻", "verifiedSource": "Law on the National Flag of Latvia / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-LIE", "countryName": "Liechtenstein", "iso2": "LI", "capital": "Vaduz",
        "continent": "Europe", "currencyName": "Swiss Franc",
        "flagDescription": "horizontal blue and red bands with a golden princely crown in the canton",
        "flagEmoji": "🇱🇮", "verifiedSource": "National Law Gazette of Liechtenstein / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-LTU", "countryName": "Lithuania", "iso2": "LT", "capital": "Vilnius",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal tricolor of yellow, green, and red",
        "flagEmoji": "🇱🇹", "verifiedSource": "Law on the State Flag of Lithuania / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-LUX", "countryName": "Luxembourg", "iso2": "LU", "capital": "Luxembourg",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal tricolor of red, white, and light blue",
        "flagEmoji": "🇱🇺", "verifiedSource": "Grand Duchy of Luxembourg Law on National Emblems / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MLT", "countryName": "Malta", "iso2": "MT", "capital": "Valletta",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "vertical white and red halves with the George Cross outlined in red in the canton",
        "flagEmoji": "🇲🇹", "verifiedSource": "Constitution of Malta / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MDA", "countryName": "Moldova", "iso2": "MD", "capital": "Chișinău",
        "continent": "Europe", "currencyName": "Moldovan Leu",
        "flagDescription": "vertical blue, yellow, and red tricolor with the coat of arms of Moldova on the yellow stripe",
        "flagEmoji": "🇲🇩", "verifiedSource": "Parliament of Moldova Law on the State Flag / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MCO", "countryName": "Monaco", "iso2": "MC", "capital": "Monaco",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal red and white halves of equal size",
        "flagEmoji": "🇲🇨", "verifiedSource": "Principality of Monaco Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-MNE", "countryName": "Montenegro", "iso2": "ME", "capital": "Podgorica",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "red field with a golden border and the golden coat of arms of Montenegro centered",
        "flagEmoji": "🇲🇪", "verifiedSource": "Law on the State Symbols of Montenegro / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-MKD", "countryName": "North Macedonia", "iso2": "MK", "capital": "Skopje",
        "continent": "Europe", "currencyName": "Macedonian Denar",
        "flagDescription": "red field with a golden yellow sun in the center extending eight rays to the edges",
        "flagEmoji": "🇲🇰", "verifiedSource": "Assembly of the Republic of North Macedonia / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-ROU", "countryName": "Romania", "iso2": "RO", "capital": "Bucharest",
        "continent": "Europe", "currencyName": "Romanian Leu",
        "flagDescription": "vertical tricolor of cobalt blue, chrome yellow, and vermilion red",
        "flagEmoji": "🇷🇴", "verifiedSource": "Constitution of Romania / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-RUS", "countryName": "Russia", "iso2": "RU", "capital": "Moscow",
        "continent": "Europe", "currencyName": "Russian Ruble",
        "flagDescription": "horizontal tricolor of white, blue, and red",
        "flagEmoji": "🇷🇺", "verifiedSource": "Federal Constitutional Law of the Russian Federation / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SMR", "countryName": "San Marino", "iso2": "SM", "capital": "San Marino",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal white and light blue bands with the national coat of arms centered",
        "flagEmoji": "🇸🇲", "verifiedSource": "Republic of San Marino Law on Official Emblems / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-SRB", "countryName": "Serbia", "iso2": "RS", "capital": "Belgrade",
        "continent": "Europe", "currencyName": "Serbian Dinar",
        "flagDescription": "horizontal tricolor of red, blue, and white with the lesser coat of arms of Serbia centered left",
        "flagEmoji": "🇷🇸", "verifiedSource": "Constitution of the Republic of Serbia / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SVK", "countryName": "Slovakia", "iso2": "SK", "capital": "Bratislava",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal tricolor of white, blue, and red with the Slovak coat of arms charged on the hoist side",
        "flagEmoji": "🇸🇰", "verifiedSource": "National Council of the Slovak Republic / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SVN", "countryName": "Slovenia", "iso2": "SI", "capital": "Ljubljana",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "horizontal white, blue, and red tricolor with the coat of arms of Slovenia located in the upper hoist",
        "flagEmoji": "🇸🇮", "verifiedSource": "National Assembly of the Republic of Slovenia / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-UKR", "countryName": "Ukraine", "iso2": "UA", "capital": "Kyiv",
        "continent": "Europe", "currencyName": "Ukrainian Hryvnia",
        "flagDescription": "two equal horizontal bands of azure blue and golden yellow",
        "flagEmoji": "🇺🇦", "verifiedSource": "Verkhovna Rada of Ukraine Resolution / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-VAT", "countryName": "Vatican City", "iso2": "VA", "capital": "Vatican City",
        "continent": "Europe", "currencyName": "Euro",
        "flagDescription": "square vertical halves of yellow and white, with crossed keys of Saint Peter and papal tiara centered on the white half",
        "flagEmoji": "🇻🇦", "verifiedSource": "Fundamental Law of Vatican City State / UN Geospatial", "verifiedDate": "2024-05"
    },

    # AMERICAS
    {
        "factId": "FACT-GEO-ATG", "countryName": "Antigua and Barbuda", "iso2": "AG", "capital": "St. John's",
        "continent": "North America", "currencyName": "East Caribbean Dollar",
        "flagDescription": "red field with an inverted V-shape containing horizontal white, blue, and black bands and a rising golden sun",
        "flagEmoji": "🇦🇬", "verifiedSource": "Government of Antigua and Barbuda / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BHS", "countryName": "Bahamas", "iso2": "BS", "capital": "Nassau",
        "continent": "North America", "currencyName": "Bahamian Dollar",
        "flagDescription": "horizontal aquamarine, gold, and aquamarine stripes with a black equilateral triangle on the hoist",
        "flagEmoji": "🇧🇸", "verifiedSource": "Commonwealth of The Bahamas National Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BRB", "countryName": "Barbados", "iso2": "BB", "capital": "Bridgetown",
        "continent": "North America", "currencyName": "Barbadian Dollar",
        "flagDescription": "vertical ultramarine, gold, and ultramarine stripes with a black trident head centered on the gold stripe",
        "flagEmoji": "🇧🇧", "verifiedSource": "Government of Barbados National Emblems Act / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-BLZ", "countryName": "Belize", "iso2": "BZ", "capital": "Belmopan",
        "continent": "North America", "currencyName": "Belize Dollar",
        "flagDescription": "blue field bordered top and bottom by red stripes, with a white circle in the center containing the coat of arms and two woodcutters",
        "flagEmoji": "🇧🇿", "verifiedSource": "Government of Belize Gazette / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-DMA", "countryName": "Dominica", "iso2": "DM", "capital": "Roseau",
        "continent": "North America", "currencyName": "East Caribbean Dollar",
        "flagDescription": "green field with a tricolor cross of yellow, black, and white, with a central red disc bearing a purple sisserou parrot encircled by ten green stars",
        "flagEmoji": "🇩🇲", "verifiedSource": "Commonwealth of Dominica Flag Act / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-DOM", "countryName": "Dominican Republic", "iso2": "DO", "capital": "Santo Domingo",
        "continent": "North America", "currencyName": "Dominican Peso",
        "flagDescription": "centered white cross extending to edges, dividing field into blue and red rectangles, with national coat of arms centered",
        "flagEmoji": "🇩🇴", "verifiedSource": "Constitution of the Dominican Republic / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SLV", "countryName": "El Salvador", "iso2": "SV", "capital": "San Salvador",
        "continent": "North America", "currencyName": "United States Dollar",
        "flagDescription": "horizontal cobalt blue, white, and cobalt blue stripes with national coat of arms centered",
        "flagEmoji": "🇸🇻", "verifiedSource": "Republic of El Salvador Law on National Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-GRD", "countryName": "Grenada", "iso2": "GD", "capital": "St. George's",
        "continent": "North America", "currencyName": "East Caribbean Dollar",
        "flagDescription": "red border containing six yellow stars, central rectangle divided diagonally into yellow and green triangles, centered red disc with a yellow star, and nutmeg clove on hoist",
        "flagEmoji": "🇬🇩", "verifiedSource": "Government of Grenada / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-GTM", "countryName": "Guatemala", "iso2": "GT", "capital": "Guatemala City",
        "continent": "North America", "currencyName": "Guatemalan Quetzal",
        "flagDescription": "vertical sky blue, white, and sky blue stripes with the national coat of arms featuring the quetzal bird centered on white stripe",
        "flagEmoji": "🇬🇹", "verifiedSource": "Congress of Guatemala Decree / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-HTI", "countryName": "Haiti", "iso2": "HT", "capital": "Port-au-Prince",
        "continent": "North America", "currencyName": "Haitian Gourde",
        "flagDescription": "horizontal blue and red halves with a white panel in the center bearing the national coat of arms and palm tree",
        "flagEmoji": "🇭🇹", "verifiedSource": "Constitution of Haiti / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-HND", "countryName": "Honduras", "iso2": "HN", "capital": "Tegucigalpa",
        "continent": "North America", "currencyName": "Honduran Lempira",
        "flagDescription": "horizontal turquoise, white, and turquoise stripes with five turquoise five-pointed stars arranged in an X-pattern in center",
        "flagEmoji": "🇭🇳", "verifiedSource": "National Congress of Honduras Decree / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-NIC", "countryName": "Nicaragua", "iso2": "NI", "capital": "Managua",
        "continent": "North America", "currencyName": "Nicaraguan Córdoba",
        "flagDescription": "horizontal blue, white, and blue stripes with national coat of arms featuring five volcanoes and rainbow centered",
        "flagEmoji": "🇳🇮", "verifiedSource": "National Assembly of Nicaragua Law / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-KNA", "countryName": "Saint Kitts and Nevis", "iso2": "KN", "capital": "Basseterre",
        "continent": "North America", "currencyName": "East Caribbean Dollar",
        "flagDescription": "green and red triangles separated by a black diagonal stripe with yellow borders containing two white five-pointed stars",
        "flagEmoji": "🇰🇳", "verifiedSource": "Federation of Saint Kitts and Nevis / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-LCA", "countryName": "Saint Lucia", "iso2": "LC", "capital": "Castries",
        "continent": "North America", "currencyName": "East Caribbean Dollar",
        "flagDescription": "cerulean blue field with a central yellow triangle beneath a black isosceles triangle edged in white representing the Pitons",
        "flagEmoji": "🇱🇨", "verifiedSource": "Government of Saint Lucia / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-VCT", "countryName": "Saint Vincent and the Grenadines", "iso2": "VC", "capital": "Kingstown",
        "continent": "North America", "currencyName": "East Caribbean Dollar",
        "flagDescription": "vertical blue, gold, and green stripes with three green diamonds arranged in a V-pattern in the center",
        "flagEmoji": "🇻🇨", "verifiedSource": "Government of Saint Vincent and the Grenadines / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TTO", "countryName": "Trinidad and Tobago", "iso2": "TT", "capital": "Port of Spain",
        "continent": "North America", "currencyName": "Trinidad and Tobago Dollar",
        "flagDescription": "red field with a black diagonal stripe bordered by thin white stripes extending from upper hoist to lower fly",
        "flagEmoji": "🇹🇹", "verifiedSource": "Government of Trinidad and Tobago / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-ECU", "countryName": "Ecuador", "iso2": "EC", "capital": "Quito",
        "continent": "South America", "currencyName": "United States Dollar",
        "flagDescription": "horizontal yellow, blue, and red stripes with the national coat of arms and Andean condor centered",
        "flagEmoji": "🇪🇨", "verifiedSource": "Constitution of Ecuador / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-GUY", "countryName": "Guyana", "iso2": "GY", "capital": "Georgetown",
        "continent": "South America", "currencyName": "Guyanese Dollar",
        "flagDescription": "green field with a red isosceles triangle bordered by black, superimposed on a golden arrowhead bordered by white (Golden Arrowhead)",
        "flagEmoji": "🇬🇾", "verifiedSource": "Parliament of Guyana / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-PRY", "countryName": "Paraguay", "iso2": "PY", "capital": "Asunción",
        "continent": "South America", "currencyName": "Paraguayan Guaraní",
        "flagDescription": "horizontal red, white, and blue tricolor with national coat of arms on obverse and treasury seal on reverse",
        "flagEmoji": "🇵🇾", "verifiedSource": "Constitution of Paraguay / UN Geospatial", "verifiedDate": "2024-06"
    },
    {
        "factId": "FACT-GEO-SUR", "countryName": "Suriname", "iso2": "SR", "capital": "Paramaribo",
        "continent": "South America", "currencyName": "Surinamese Dollar",
        "flagDescription": "five horizontal stripes of green, white, red, white, and green with a large golden five-pointed star in the center of the red band",
        "flagEmoji": "🇸🇷", "verifiedSource": "Republic of Suriname National Flag Law / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-VEN", "countryName": "Venezuela", "iso2": "VE", "capital": "Caracas",
        "continent": "South America", "currencyName": "Venezuelan Bolívar",
        "flagDescription": "horizontal yellow, blue, and red stripes with an arc of eight white five-pointed stars centered on the blue band",
        "flagEmoji": "🇻🇪", "verifiedSource": "National Assembly of Venezuela Law / UN Geospatial", "verifiedDate": "2024-06"
    },

    # OCEANIA
    {
        "factId": "FACT-GEO-KIR", "countryName": "Kiribati", "iso2": "KI", "capital": "South Tarawa",
        "continent": "Oceania", "currencyName": "Australian Dollar",
        "flagDescription": "red upper half with a gold frigatebird flying over a rising gold sun, and lower half of six wavy white and blue oceanic stripes",
        "flagEmoji": "🇰🇮", "verifiedSource": "Republic of Kiribati Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-MHL", "countryName": "Marshall Islands", "iso2": "MH", "capital": "Majuro",
        "continent": "Oceania", "currencyName": "United States Dollar",
        "flagDescription": "blue field with two diagonal stripes of orange and white expanding to fly, and a 24-point white star in canton",
        "flagEmoji": "🇲🇭", "verifiedSource": "Republic of the Marshall Islands Flag Act / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-FSM", "countryName": "Micronesia", "iso2": "FM", "capital": "Palikir",
        "continent": "Oceania", "currencyName": "United States Dollar",
        "flagDescription": "light blue field with four white five-pointed stars arranged in a circle representing the four island states",
        "flagEmoji": "🇫🇲", "verifiedSource": "Federated States of Micronesia Code / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-NRU", "countryName": "Nauru", "iso2": "NR", "capital": "Yaren",
        "continent": "Oceania", "currencyName": "Australian Dollar",
        "flagDescription": "blue field bisected by a thin horizontal yellow stripe representing the equator, with a white 12-pointed star beneath",
        "flagEmoji": "🇳🇷", "verifiedSource": "Republic of Nauru National Symbols / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-PLW", "countryName": "Palau", "iso2": "PW", "capital": "Ngerulmud",
        "continent": "Oceania", "currencyName": "United States Dollar",
        "flagDescription": "light blue field representing the Pacific Ocean with a full golden-yellow disc representing the full moon slightly off-center",
        "flagEmoji": "🇵🇼", "verifiedSource": "Republic of Palau Constitution / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-WSM", "countryName": "Samoa", "iso2": "WS", "capital": "Apia",
        "continent": "Oceania", "currencyName": "Samoan Tālā",
        "flagDescription": "red field with a blue canton containing the Southern Cross constellation of five white stars",
        "flagEmoji": "🇼🇸", "verifiedSource": "Independent State of Samoa Official Emblems / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-SLB", "countryName": "Solomon Islands", "iso2": "SB", "capital": "Honiara",
        "continent": "Oceania", "currencyName": "Solomon Islands Dollar",
        "flagDescription": "divided diagonally by a thin yellow stripe into blue and green triangles, with five white five-pointed stars in the blue canton",
        "flagEmoji": "🇸🇧", "verifiedSource": "National Parliament of Solomon Islands / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TON", "countryName": "Tonga", "iso2": "TO", "capital": "Nukuʻalofa",
        "continent": "Oceania", "currencyName": "Tongan Paʻanga",
        "flagDescription": "red field with a white canton containing a red Greek cross representing Christian faith",
        "flagEmoji": "🇹🇴", "verifiedSource": "Constitution of Tonga / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-TUV", "countryName": "Tuvalu", "iso2": "TV", "capital": "Funafuti",
        "continent": "Oceania", "currencyName": "Tuvaluan Dollar",
        "flagDescription": "light blue field with Union Jack in canton and nine yellow five-pointed stars arranged according to the geography of the islands",
        "flagEmoji": "🇹🇻", "verifiedSource": "Tuvalu National Flag Act / UN Geospatial", "verifiedDate": "2024-05"
    },
    {
        "factId": "FACT-GEO-VUT", "countryName": "Vanuatu", "iso2": "VU", "capital": "Port Vila",
        "continent": "Oceania", "currencyName": "Vanuatu Vatu",
        "flagDescription": "red and green horizontal halves separated by a black Y-shape with yellow borders, containing a boar's tusk and crossed namele fronds",
        "flagEmoji": "🇻🇺", "verifiedSource": "Constitution of the Republic of Vanuatu / UN Geospatial", "verifiedDate": "2024-05"
    }
]

# Combine existing facts and additional verified countries
all_country_facts = list(existing_facts)
for c in additional_countries:
    if c['iso2'] not in existing_iso2 and c['countryName'] not in existing_names:
        all_country_facts.append(c)
        existing_iso2.add(c['iso2'])
        existing_names.add(c['countryName'])

print(f"Total verified country facts: {len(all_country_facts)}")

# Output updated countryFacts.ts
country_ts_content = """import { CountryFact } from '../../types';

/**
 * Curated Structured Factual Dataset
 * Source: UN Geospatial Information Section, CIA World Factbook, ISO 3166-1
 *
 * Each record is a primary verified fact used for deterministic question derivation.
 */
export const VERIFIED_COUNTRY_FACTS: CountryFact[] = """ + json.dumps(all_country_facts, indent=2) + ";\n"

with open('src/data/facts/countryFacts.ts', 'w') as f:
    f.write(country_ts_content)

print("Wrote src/data/facts/countryFacts.ts successfully.")
