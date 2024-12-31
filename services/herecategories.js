const stopcategories = new Map();

stopcategories.set('x-meal', []);
stopcategories.set('x-rest', []);
stopcategories.set('x-day', []);


let hereFoodTypes = 
[
    {
      "FoodtypeID": "101-000",
      "FoodType": "American",
      "Description": "Food that represents the unique culture and flavor of the United States. Dishes vary by region but commonly include hot dogs, hamburgers, buffalo wings, hotcakes, macaroni and cheese. Outside of the United States, this food type is generally used for U.S. based chains, such as McDonald's, Hard Rock Cafe and Planet Hollywood."
    },
    {
      "FoodtypeID": "101-001",
      "FoodType": "American-Californian",
      "Description": "An American food type that represents California-style cuisine. This food type special emphasis on the inclusion of locally grown and freshly prepared ingredients. Typical ingredients include fresh meats, fruits and vegetables, most of which are organic. This food type is mainly used for places within the U.S."
    },
    {
      "FoodtypeID": "101-002",
      "FoodType": "American-Southwestern",
      "Description": "An American food type that represents Southwestern-style cuisine. This food type has notable influences from Native Americans, Spanish settlers, neighboring Mexican cuisine and American cowboy recipes. Typical ingredients include chili peppers, frijoles, beef, chicken, pork, tomatoes, onion, garlic and cumin. Popular Southwestern dishes include chili con carne, fajitas, chile relleno and steak."
    },
    {
      "FoodtypeID": "101-003",
      "FoodType": "American-Barbecue/Southern",
      "Description": "An American food type that represents southern cooking or barbecue-style cuisine. This food type generally includes meat cuts that are marinated in barbecue sauce and slow-cooked over a fire or hot coals. Popular dishes include pork, ribs and smoked chicken, which are generally accompanied by barbecue sauce."
    },
    {
      "FoodtypeID": "101-004",
      "FoodType": "American-Creole",
      "Description": "An American food type that represents Creole-style cuisine. This food type generally refers to the local cuisine of Louisiana, which has its roots in French, Spanish, Portuguese, Italian, Native American and African dishes. Typical ingredients include roux (brown sauce used as base), red beans, rice, okra, tomatoes, celery, meats and shellfish. Popular dishes include red beans and rice, blackened salmon, jambalaya and crawfish étouffée."
    },
    {
      "FoodtypeID": "101-020",
      "FoodType": "American-Southern",
      "Description": "The American-Southern Food Type applies to restaurants which identify themselves as featuring Southern cuisine. Southern cuisine covers a variety of food ranging geographically from as far west as Texas, to as far east as the mid-Atlantic coast. Some common examples include Cajun, Creole, Soul Food, Tex-Mex, Tidewater, Lowcountry, Appalachian, and Floribbean."
    },
    {
      "FoodtypeID": "101-039",
      "FoodType": "American-Native American",
      "Description": "An American food type that represents Native American-style cuisine from North America. This food type is popular with indigenous people of the Americas. Typical ingredients include maize, beans, squash, potatoes, peppers and sassafras. Popular dishes include succotash, corn bread, tamales and chipa (cheese bread)."
    },
    {
      "FoodtypeID": "101-040",
      "FoodType": "American-Soul Food",
      "Description": "An American food type that represents Soul-style cuisine. This food type is a popular African-American cuisine style with origins that are traced to Africa and Europe. Typical ingredients include rice, sorghum and okra. Other ingredients include greens (such as collards, kale, cress, mustard and pokeweed), lard, cornmeal and offal. Seasonings such as onions, garlic, thyme and bay leaf are often used to enhance flavor. Popular dishes include pigs feet, oxtail, ham hocks, pig ears, hog jowls, tripe and chitterlings."
    },
    {
      "FoodtypeID": "101-070",
      "FoodType": "American-Cajun",
      "Description": "An American food type representing places that serve Cajun or Creole food. This style of cooking is named after the French-speaking Acadian or \"Cajun\" immigrants who settled in the Acadiana region of Louisiana, USA. Typical ingredients include rice, corn, vegetables (celery, bell peppers, onions, okra), and seafood (crayfish, crab, oysters, shrimp). Popular dishes include boudin sausage, gumbo, jambalaya and crawfish pie."
    },
    {
      "FoodtypeID": "102-000",
      "FoodType": "Mexican",
      "Description": "Food that represents the unique culture and flavor of Mexico. This food type generally includes meat, dairy products, as well as various herbs and spices. Typical ingredients include beef, chicken, pork, cheese (queso), chili peppers, green peppers, broccoli, cauliflower, radishes. Popular dishes include quesadillas, bolillo, arroz verde, burritos, carne asada, enchiladas, gorditas, pollo asado and tortillas."
    },
    {
      "FoodtypeID": "102-005",
      "FoodType": "Mexican-Yucateca",
      "Description": "A Mexican food type representing the unique culture and flavor of the Yucatan region. This food type is based primarily on Mayan food with origins traced to the Caribbean, central Mexico, European (especially French) and Middle Eastern cultures."
    },
    {
      "FoodtypeID": "102-006",
      "FoodType": "Mexican-Oaxaquena",
      "Description": "A Mexican food type representing the unique culture and flavor of the Oaxaca region. This food type is heavily influenced by that of the Mixtec and, to a lesser extent, the Zapotec. Typical ingredients include corn, mole sauce, fresh herbs, quesillo and corn tortillas. Popular Oaxaquena dishes include tejate and mole coloradito."
    },
    {
      "FoodtypeID": "102-007",
      "FoodType": "Mexican-Veracruzana",
      "Description": "A Mexican food type representing places that serve Veracruz-style cuisine. This food type is a mix of indigenous, Spanish and Afro-Cuban cuisines. Typical ingredients include vanilla, corn, seafood, rice, spices, tubers, yucca and peanuts. Popular Veracruzana dishes include , Arroz a la Tumbada, Cuaresmeños Jarochos and Huachinango a la veracruzana."
    },
    {
      "FoodtypeID": "102-008",
      "FoodType": "Mexican-Poblana",
      "Description": "A Mexican food type representing places that serve Poblana-style cuisine. This food type commonly contains poblanos, a mild chili pepper."
    },
    {
      "FoodtypeID": "103-000",
      "FoodType": "Canadian",
      "Description": "Food that represents the unique culture and flavor of Canada. This food type varies widely by region, but generally includes baked foods, gathered foods and wild game. Popular Canadian dishes include ginger beef, Montreal smoked meat, bacon, cheese curds and moose."
    },
    {
      "FoodtypeID": "150-000",
      "FoodType": "Australian",
      "Description": "Food that represents the unique culture and flavor of Australia. This food type is based on traditional British cooking and is influenced by Mediterranean and Asian food. Popular Australian dishes include sandwiches, pasta, risotto, curry dishes, steak, chicken, fresh produce, seafood and barbecues."
    },
    {
      "FoodtypeID": "151-000",
      "FoodType": "Hawaiian/Polynesian",
      "Description": "Food that represents the unique culture and flavor of Polynesia, including the Hawaiian Islands. This food type encompasses Central and Southern Pacific Island cuisines. Typical ingredients include rice, seafood, as well as native fruits and vegetables. Popular Polynesian dishes include Poisson Cru (Tahitian salad made from raw fish), Pipi Soup (surf clam soup), Crab and Kumara Bisque (a thick soup of crab and sweet potato), Maori Boiled Soup (made with vegetables) and Soup of Watercress."
    },
    {
      "FoodtypeID": "152-000",
      "FoodType": "Caribbean",
      "Description": "Food that represents the unique culture and flavor of Caribbean, including Puerto Rico, Dominican Republic and Jamaica. Typical ingredients include lime, garlic, cinnamon, nutmeg, fish and rice. Popular Caribbean dishes include jerk, curried goat and chicken, callaloo and conch fritters."
    },
    {
      "FoodtypeID": "153-000",
      "FoodType": "Cuban",
      "Description": "Food that represents the unique culture and flavor of Cuba. This type of food has its origins from Spanish, African and Caribbean cuisine. Cuban food incorporates an array of spices such as garlic, cumin, oregano and bay or laurel leaves. Typical ingredients include rice, beans, pork, beef, salad and fruit. Popular Cuban dishes include tamales, caldo gallego (Galician stew), sofrito, picadillo, arroz con pollo and yuca con mojo."
    },
    {
      "FoodtypeID": "200-000",
      "FoodType": "Asian",
      "Description": "Food that represents the unique culture and flavor of Asia. This type of food can be categorized as East Asian, with origins in China, Japan and Korean; Southeast Asian, with origins in Cambodia, Laos, Thailand, Vietnam, Brunei, Indonesia, Malaysia, Singapore, and the Philippines; South Asian with origins in India, Burma, Sri Lanka, Bangladesh, and Pakistan."
    },
    {
      "FoodtypeID": "201-000",
      "FoodType": "Chinese",
      "Description": "Food that represents the unique culture and flavor of China. This food type generally consists of rice, noodles, meat, vegetables, tofu, and fish. Chinese restaurants outside China have adapted their menus based on local tastes so dishes vary by country."
    },
    {
      "FoodtypeID": "201-009",
      "FoodType": "Chinese-Szechuan",
      "Description": "Chinese food from the Sichuan Province in southwestern China. This food type is distinguishable with its bold use of peppers and garlic and the Sichuan peppercorn. Szechuan cuisine is further categorized into Chengdu style, Zigong style, vegetarian Buddhist style and Chonqking style. Popular dishes include málà hotpot, Mapo doufu, Kung Pao chicken and twice cooked pork."
    },
    {
      "FoodtypeID": "201-010",
      "FoodType": "Chinese-Cantonese",
      "Description": "Chinese food from the Guangdong Province in southern China. This type of food incorporates a variety of edible meat and follows the philosophy of using fresh ingredients. Most dishes are fresh, well-balanced, non-greasy, and contain a modest amount of spices. Typical ingredients include rice, noodles, meat, vegetables, tofu and fish. Popular dishes include Cha Leung, Yau Zha Gwai and Dace fish balls."
    },
    {
      "FoodtypeID": "201-041",
      "FoodType": "Chinese-Shanghai",
      "Description": "Chinese food from the Shanghai region (also known as Hu cuisine). This food type is a combination of different Zhe styles and is also famous for its dim sum. Typical ingredients include fish, crab and chicken, salted meats, and preserved vegetables, with added sugar. Popular dishes include Xiaolongbao, red-cooked stews, Shanghai hairy crab and shengjian mantou."
    },
    {
      "FoodtypeID": "201-042",
      "FoodType": "Chinese-Beijing",
      "Description": "Chinese food from the Beijing region (also known as Jing or Mandarin). This food type contains main courses that are mostly comprised of other Chinese cuisines. Popular dishes include Peking duck and hot pot."
    },
    {
      "FoodtypeID": "201-043",
      "FoodType": "Chinese-Hunan/Hubei",
      "Description": "Hunan (Xiang) consists of the cuisines of the Xiang River region, Dongting Lake, and western Hunan province in China. Hunan food known for its hot spicy flavor, fresh aroma and deep color. Cooking techniques include stewing, frying, pot-roasting, braising, and smoking. Hubei cuisine combines three styles of Chinese cuisine, including Wuhan (soups and noodles), Huangzhou (oily and salty) and Jingzhou (steamed fish dishes). Hubei food uses dried hot pepper, black pepper, and other spices. Popular dishes include steamed vegetables, soups, rice based snacks, fish balls and meat loaves."
    },
    {
      "FoodtypeID": "201-044",
      "FoodType": "Chinese-Jiangsu/Zhejiang",
      "Description": "Jiangsu cuisine originates from the Jiangsu province. It is an extremely popular cooking style that is considered to be one of the eight culinary traditions of China. uses braising and stewing methods for cooking. Zhejiang cuisine consists of four styles: Hangzhou (Uses bamboo shoots), Shaozing (Specializes in poultry and freshwater fish), Ningbo (Specializes in seafood), Shanghai style (Famous for dim sum)"
    },
    {
      "FoodtypeID": "201-045",
      "FoodType": "Chinese-Shandong",
      "Description": "Shandong or Lu cuisine is comprised of two styles: Jiaodong (Characterized by seafood dishes), Jinan (Characterized by soups)"
    },
    {
      "FoodtypeID": "201-046",
      "FoodType": "Chinese-Northeastern",
      "Description": "This type of cuisine originated from Manchu cuisine and uses preserved foods (pickling is popular) as well as pork and chive dumplings, suan cai hot pot, cumin and caraway lamb, congee, nian doubao, sachima, and cornmeal congee."
    },
    {
      "FoodtypeID": "201-047",
      "FoodType": "Chinese-Inner Mongolian",
      "Description": "Historically, this food is influenced by Mongolian and Chinese cuisines. Dishes include Mongolian hot pot, hand-held mutton, roast leg of lamg and various other mutton or lamb dishes."
    },
    {
      "FoodtypeID": "201-048",
      "FoodType": "Chinese-Yunnan/Guizhou",
      "Description": "Yunnan or Dian cuisine is typically spicy and features mushrooms. Guizhou cuisine is similar to Sichaun and Hunan cuisines and is unique in featuring a mixture of sour and spicy flavors."
    },
    {
      "FoodtypeID": "201-049",
      "FoodType": "Chinese-Taiwanese",
      "Description": "Taiwanese food includes representative dishes from the people of Hoklo, as well as Aboriginal, Hakka, and other local Chinese cuisines. Typical ingredients include pork, seafood, chicken, rice, and soy."
    },
    {
      "FoodtypeID": "201-050",
      "FoodType": "Chinese-Guangxi",
      "Description": "Guangxi cuisine specializes in rice-flour noodles, horse meat, zongzi a pyramid shaped meat dumpling wrapped in bamboo leaves and fried, and the food is slightly spicy."
    },
    {
      "FoodtypeID": "201-051",
      "FoodType": "Chinese-Jiangxi",
      "Description": "Jiangxi cuisine is spicy and uses chili peppers and cold or raw dishes are rarely served. Fish, fermented black beans, tofu, and tea oil (used for cooking) are used."
    },
    {
      "FoodtypeID": "201-052",
      "FoodType": "Chinese-Northwestern",
      "Description": "This cuisine favors beef, mutton, and lamb and is typically Halal due to the large Muslim population in this part of China."
    },
    {
      "FoodtypeID": "201-053",
      "FoodType": "Chinese-Porridge",
      "Description": "A type of rice porridge or gruel popular in many Asian countries. This food type can be eaten plain or with a variety of toppings, such as fried dough stick, pork, preserved eggs and tofu, or corn. Plain congee contains raw rice, water and salt. Names for congee are as varied as the style of its preparation. Popular dishes include Congee Roast Duck, Chicken Congee, Buddha Congee and Lotus Seed Congee."
    },
    {
      "FoodtypeID": "201-054",
      "FoodType": "Chinese-Islamic",
      "Description": "Signature dishes include mutton, kebabs, roasted fish and rice. Most of the food is Halal."
    },
    {
      "FoodtypeID": "201-055",
      "FoodType": "Chinese-Hot Pot",
      "Description": "Chinese Hot Pot is a cooking method which uses a metal pot placed in the center of the table. Dishes include thinly sliced meat, leaf vegetables, mushrooms, wontons, egg dumplings, and seafood. The cooked food is usually paired with dipping sauces."
    },
    {
      "FoodtypeID": "202-000",
      "FoodType": "Indian",
      "Description": "Food that represents the unique culture and flavor of India. Indian food contains aromatic herbs, flavorful spices and a wide variety of vegetables, grains and lentils. Ingredients and cooking methods vary broadly in each part of the country. Indian restaurants outside India generally adapt their menu to suite local tastes."
    },
    {
      "FoodtypeID": "202-011",
      "FoodType": "Indian-Tandoori",
      "Description": "Tandoori is an Indian cooking technique whereby the meat is usually coated or marinated with a paste of assorted herbs and spices, skewered into a stick and cooked in extremely hot and smoky conditions. Typical ingredients include ginger, garlic, cayenne pepper, coriander powder, garam masala, dried fenugreek, lemon, roasted and grinded grams and other assorted spice and herbs. Popular Tandoori dishes include Tandoori Chicken and Chicken tikka."
    },
    {
      "FoodtypeID": "202-012",
      "FoodType": "Indian-Punjabi",
      "Description": "Indian food from the Northern India's Punjab region and Eastern Pakistan. This food type is one of the most widely known cuisines around the world. Typical ingredients include clarified butter (Ghee) and khoya (burnt milk), as well as marinated meat, chicken, fish, paneer, rotis and naan. Popular Punjabi dishes include Tandoori Chicken, Butter Chicken, Chicken Tikka, Sarson Saag with Makki Roti, Dal makhani, and Rajma."
    },
    {
      "FoodtypeID": "202-013",
      "FoodType": "Indian-Rajasthani",
      "Description": "Indian food from the Rajasthan region. This food type is a popular, mostly vegetarian, cuisine that is known for its combination of churma, dal and bati. Typical ingredients include ghee, beans, dried lentils, gram flour, papad and a wide variety of spices. Popular Rajasthani dishes include Churma and Ghevar."
    },
    {
      "FoodtypeID": "202-014",
      "FoodType": "Indian-Mughlai",
      "Description": "Indian food produced in the kitchens of Royals of the Mughal Empire. This food type is strong influenced by Turkish and Persian cuisines where there are both vegetarian and non-vegetarian dishes. There is an wide variation in taste and flavor ranging from extremely spicy food to tremendously light. Popular Mughlai dishes include Aaloo ka raita, Capsicum and carrot raita, Champ Masala, Chicken biryani and Chicken tikka."
    },
    {
      "FoodtypeID": "202-015",
      "FoodType": "Indian-Bengali",
      "Description": "Bengali food encompasses the rich assortment of foods eaten in West Bengal in India and Bangladesh. Typical ingredients include fish, vegetables, dairy products, mustard oil, zeera, kalaunji, saunf, fenugreek, mustard seeds, spices and rice. Popular Bengali dishes include Dom, Roshogolla, Pantua, Jhal-Muŗi and Machh bhaja."
    },
    {
      "FoodtypeID": "202-016",
      "FoodType": "Indian-Goan",
      "Description": "Goan food encompasses cuisine from the state of Goa in Western India. This food type uses a cooking method that involves roasting, grilling, simmering, marinade, pan-frying and braising. Seafood delicacies such as pomfret, tuna, shark, mackerel, lobster, shrimp, prawn and crabs are mixed with spicy and hot sauce. Typical ingredients include coconut milk, rice and local spices. Popular Goan dishes include Bebinca, Goan Fish Curry and Vindaloo."
    },
    {
      "FoodtypeID": "202-017",
      "FoodType": "Indian-Jain",
      "Description": "Jain food is a vegetarian Indian cuisine. This food type prohibits the use of meat, root vegetables, onion and garlic in food preparation. Typical ingredients include vegetables (bell pepper, cucumber, curry leaves, mushrooms and bitter gourds) and spices (cumin, cinnamon, clove, nutmeg, caraway seeds, poppy seeds, fennel seeds and musk). Popular Jain dishes include Jain Croquettes, Bajra Khichdi and Chawli Bhaji."
    },
    {
      "FoodtypeID": "202-018",
      "FoodType": "Indian-Konkani",
      "Description": "Konkani food is representative of the Konkan region (West coast of India). This food type is predominately non-vegetarian with an abundance use of coconut. Typical ingredients include rice, wheat, gram flour, lentils, seafood, chicken, mutton, beef, and vegetables. Other common ingredients include tamarind, kokum berries, raw mango and jack fruit. Common spices include coriander, cumin seeds, red chilli, garlic, ginger, and cardamom. A popular Konkani dish is Upkari."
    },
    {
      "FoodtypeID": "202-019",
      "FoodType": "Indian-Gujarati",
      "Description": "Indian food from Gujarat is a strictly vegetarian food. This food type is different from other Indian food types due to its sweet and salty mixture. Typical ingredients include dal, bhaat, vegetables, shapatis, kachumbar, papad, and curd. Popular Gujarati dishes include Dabeli, Dhokla, Fafda, Gujarati Dal, Handvo, Khakhra, Osaman, Pandoli and Thepla."
    },
    {
      "FoodtypeID": "202-020",
      "FoodType": "Indian-Parsi",
      "Description": "Parsi Indian food is influenced by the Persian cuisine of Iran. This food type traditional cuisine of the Parsis of India and varies from mild to spicy. Both vegetarian and non-vegetarian dishes are common. Typical ingredients include rice, lentils and curry. Popular Parsi dishes include Chicken farchaj, Patra ni machhi, Dhansak and Khichri."
    },
    {
      "FoodtypeID": "202-021",
      "FoodType": "Indian-South Indian",
      "Description": "Indian food from the areas of Chennai, Karnataka, Kerala and Andhra Prades. This food type is known for its spicy foods. Typical ingredients include cardamom, pepper, cinnamon, cloves and nutmeg as seasonings. Popular South Indian dishes include Puran Poli, Bhakri, Vada Pav, Pav Bhaji, Thepla, Dhokla, Ambotik, Balchao and Amti."
    },
    {
      "FoodtypeID": "202-022",
      "FoodType": "Indian-Maharashtrian",
      "Description": "Indian food that comprises cuisine from coastal Konkan area and the interior Vardi area. Typical ingredients include onions, eggplant, fish, coconut, peanut oil, peanuts and cashews, kokum, jagary and taramind. Popular Maharashtrian dishes include Poha, Bharli vangi and Wada pav."
    },
    {
      "FoodtypeID": "202-023",
      "FoodType": "Indian-North Indian",
      "Description": "Indian food that represents the culture and flavor of the Northern Indian states. This food type is influenced by cuisines from the eastern India region. Typical ingredients include chillies, saffron, milk, yoghurt, cottage cheese, ghee (clarified butter) and nuts. Popular Northern Indian dishes include Seekh Kabab, Rajma, Khata, Jalebi And Biryanis."
    },
    {
      "FoodtypeID": "202-024",
      "FoodType": "Indian-Malvani",
      "Description": "Indian food that represents the culture and flavor of the Konkan region in Maharashtra and Goa. This food type gets its name from town of Malvan located on the west coast of Maharashtra and mainly consists of non-vegetarian preparations containing meats and seafood. Typical ingredients include coconut, coriander, peppercorn, cumin, red chilies, kokam, tamarind, mango and seafood. Popular Malvani dishes include Mori Masala, Kombdi Vade, Solkadhi, Bangda, Dhondas, Ghavan and Malvani Malpua."
    },
    {
      "FoodtypeID": "202-025",
      "FoodType": "Indian-Hyderabadi",
      "Description": "Indian food that represents the culture and flavor of Hyderabad, India. This food type is highly influenced by Awadhi and Mughlai cuisines. Typical ingredients include meat rice, spices, coconut, tamarind, peanuts, and sesame seeds. Popular Hyderabadi dishes include Hyderabadi Biryani, Haleem, Mutton Do Pyazah and Nihari."
    },
    {
      "FoodtypeID": "203-000",
      "FoodType": "Japanese",
      "Description": "Food that represents the unique culture and flavor of Japan. This food type generally consists of rice, noodles, meat, vegetables, fish, sushi, teppenyaki. Popular Japanese dishes include raw fish, and grilled, boiled, steamed or deep fried food."
    },
    {
      "FoodtypeID": "203-010",
      "FoodType": "Japanese-Fish/Other Seafood",
      "Description": "A Japanese-style cuisine applicable to fish (including sashimi) and other seafood (such as shellfish). This food type does not include sushi."
    },
    {
      "FoodtypeID": "203-011",
      "FoodType": "Japanese-Unagi/Anago",
      "Description": "A Japanese-style cuisine specifically applicable to freshwater eel (unagi) or saltwater eel (anago). Unagi is typically the most popular variety."
    },
    {
      "FoodtypeID": "203-026",
      "FoodType": "Japanese-Sushi",
      "Description": "A Japanese dish vinegar rice and various types of cooked or raw seafood such as lobster, prawns, eel, fish and crab that is served cold. Typical ingredients include short-grain white rice, vinegar, a variety of vegetables, egg, shitake mushrooms, caviar, avocado, nori (seaweed) and cream cheese. Types of sushi include Nigiri, Gunkan, Temaki, Chirashi, Oshizushi, and Inari."
    },
    {
      "FoodtypeID": "203-027",
      "FoodType": "Japanese-Sushi Train",
      "Description": "A Japanese restaurant which delivers sushi (vinegar flavored rice rolls/balls with fish, vegetables, or egg) to a customer's table by conveyor belt."
    },
    {
      "FoodtypeID": "203-030",
      "FoodType": "Japanese-Hibachi",
      "Description": "A Japanese-style cuisine which cooks food on a shichirin (grate over a charcoal or gas fire). Note: In the USA, hibachi is associated with teppanyaki cuisine (which typically features cooking on a teppan in front of guests). A teppan is a flat iron surface usually heated by propane."
    },
    {
      "FoodtypeID": "203-031",
      "FoodType": "Japanese-Yakitori/Chicken",
      "Description": "A Japanese-style cuisine consisting of a variety of chicken dishes such as yakitori (skewered chicken) and robatayaki (cooking over hot charcoal)."
    },
    {
      "FoodtypeID": "203-032",
      "FoodType": "Japanese-Yakiniku",
      "Description": "A Japanese cuisine applicable to grilled meat. It is commonly referred to as \"Japanese barbecue\" and is one of the most popular national dishes of Japan."
    },
    {
      "FoodtypeID": "203-033",
      "FoodType": "Japanese-Jingisukan",
      "Description": "A Japanese-style dish containing grilled mutton. It has great popularity in Hokkaido and China. The name is derived from the name of Mongol Empire founder, Genghis Khan."
    },
    {
      "FoodtypeID": "203-040",
      "FoodType": "Japanese-Rice Bowl",
      "Description": "A Japanese cuisine applicable to rice dishes typically containing meat, seafood, and/or vegetables. Typical dishes of this type include donburi, beef bowls, and pork bowls."
    },
    {
      "FoodtypeID": "203-045",
      "FoodType": "Japanese-Curry",
      "Description": "A Japanese-style dish which is commonly served over rice, over noodles, or as curry bread. It was derived from the Indian curry (but has a more limited amount of spices and is lighter in flavor)."
    },
    {
      "FoodtypeID": "203-050",
      "FoodType": "Japanese-Tempura/Other Fried Food",
      "Description": "A Japanese-style cuisine applicable to fried foods such as tempura (battered and fried seafood, meat, or vegetables), and kushikatsu."
    },
    {
      "FoodtypeID": "203-051",
      "FoodType": "Japanese-Okonomiyaki",
      "Description": "A variety of Japanese-style dishes consiting of battered foods such as okonomiyaki (Japanese pancake), monjayaki (pan-fried batter), and akashiyaki (fried and battered octopus originating in the Akashi region)."
    },
    {
      "FoodtypeID": "203-052",
      "FoodType": "Japanese-Takoyaki",
      "Description": "A Japanese dish commonly referred to as \"octopus balls\". It originated in Osaka, and was derived from akashiyaki (but has a harder texture with less egg)."
    },
    {
      "FoodtypeID": "203-053",
      "FoodType": "Japanese-Tonkatsu",
      "Description": "A Japanese dish consisting of pork which is breaded and deep fried. It is normally accompanied by tonkatsu sauce, a vegetable salad, and rice."
    },
    {
      "FoodtypeID": "203-060",
      "FoodType": "Japanese-Ramen",
      "Description": "A Japanese noodle soup consisting primarily of ramen noodles, which were adapted from Chinese wheat noodles. Ramen noodles have a regional variation throughout most of Japan."
    },
    {
      "FoodtypeID": "203-061",
      "FoodType": "Japanese-Udon/Other Noodles",
      "Description": "A Japanese-style cuisine consisting primarily of popular noodles such as udon, soba, and yakisoba. This food type does not include ramen."
    },
    {
      "FoodtypeID": "203-065",
      "FoodType": "Japanese-Gyoza",
      "Description": "A Japanese-style dumpling derived from the Chinese-style jiaozi (but with a stronger garlic flavor and thinner wrapping)."
    },
    {
      "FoodtypeID": "203-070",
      "FoodType": "Japanese-Sukiyaki",
      "Description": "A Japanese dish typically prepared in a Japanese hot pot (nabemono). It normally contains meat, vegetables, and other ingredients prepared in an iron pot."
    },
    {
      "FoodtypeID": "203-071",
      "FoodType": "Japanese-Shabushabu",
      "Description": "A Japanese dish similar to sukiyaki (and also prepared in a nabemono), but served with dipping sauces. It contains less sweetness and is more flavorful than sukiyaki, and originated in Osaka."
    },
    {
      "FoodtypeID": "203-072",
      "FoodType": "Japanese-Chanko",
      "Description": "A Japanese nabemono (hot pot) stew known for its use in weight-gain diets by sumo wrestlers due to its high protein content from chicken, beef, tofu, or fish)."
    },
    {
      "FoodtypeID": "203-080",
      "FoodType": "Japanese-Kaiseki",
      "Description": "A traditional Japanese dinner consisting of multi-course fine dining. It typically contains a bowl of miso soup, and three side dishes. However, it has been modified to often include other additional appetizers and dishes."
    },
    {
      "FoodtypeID": "203-081",
      "FoodType": "Japanese-Izakaya",
      "Description": "A casual Japanese-style bar which serves alcoholic beverages and snacks/appetizers."
    },
    {
      "FoodtypeID": "204-000",
      "FoodType": "Southeast Asian",
      "Description": "Food that represents the unique culture and flavor of Southeast Asia. This food type Asian food represents food from Southeast Asian countries for which there is not a more specific food type. Note: See also Chinese, Filipino, Indian, Indonesian/Malaysian, Japanese, Korean , Middle Eastern , Thai, Vietnamese for related food types."
    },
    {
      "FoodtypeID": "205-000",
      "FoodType": "Thai",
      "Description": "Food that represents the unique culture and flavor of Thailand. This food type can be spicy, sour, sweet, salty or bitter, and is characterized by aromatic herbs and spices. Typical ingredients include rice, chili, garlic, lemon, thai basil, turmeric, vegetables (cucumber, cabbage, string beans), nam pla (fish sauce), lime leaves. Thai food generally includes a variety of curries and noodles. Popular Thai dishes include Thai Bean, Thai Noodle, Thai Roll, Thai salad, Thai Curry and Thai Satay."
    },
    {
      "FoodtypeID": "206-000",
      "FoodType": "Vietnamese",
      "Description": "Food that represents the unique culture and flavor of Vietnam. This food type usually contains fish, fish sauces, rice, vegetables and herbs. Typical ingredients include fish sauce, soy sauce, hoisin sauce, vegetables, herbs, spices, pork, beef and prawns. Popular Vietnamese dishes include Banh Bao, Banh Mi, Bun Bo Hue, Tiet Canh, Vietnamese Noodle and Vietnamese Roll."
    },
    {
      "FoodtypeID": "207-000",
      "FoodType": "Korean",
      "Description": "Food that represents the unique culture and flavor of Korea. This food type is known for its banchan; a wide array of accompaniment dishes served with a meal of rice. Typical ingredients include rice, vegetables, meat and tofu, sesame oil, soy sauce, garlic and ginger. Popular Korean dishes include Bulgogi, Gui, Gujeolpan, Kimchi, Kongnamul, Korean Chicken, Korean Noodle, Tteokbokki and Yakgwa."
    },
    {
      "FoodtypeID": "208-000",
      "FoodType": "Pakistani",
      "Description": "Food that represents the unique culture and flavor of Muslim culinary culture that is predominant in Pakistan and along the northern border of India. Pakistani food can be described as a lend of South Asian cooking traditions and is known for its richness and flavor. Typical ingredients include chapati, roti, lentils, vegetables, and meats with the extensive use of spices, herbs, and seasonings. Popular Pakistani dishes include Aloo Bukhara Ki Chutney, barbequed meats, Biryani and Sajji."
    },
    {
      "FoodtypeID": "209-000",
      "FoodType": "Malaysian",
      "Description": "Food that represents the unique culture and flavor of Malaysia. This food type offers a distinct mix of Indian, Chinese, and even Nyonya food. Typical ingredients include noodles, rice, coconut, chicken, beef, pork, duck, mutten, goose, goat, seafood (shrimps, prawns, crab, squid, cockles, snails, octopus). Popular Malaysian dishes include satay (grilled meat), Ikan Bakar, Nasi Dagang, Udang Galah. Note: Indonesian/Malaysian should be used in countries outside of North America and EMEA."
    },
    {
      "FoodtypeID": "210-000",
      "FoodType": "Bruneian",
      "Description": "Food that represents the unique culture and flavor of Brunei. This food type is heavily influenced by the cuisine of neighbouring Malaysia, Singapore and Indonesia, with additional influences from India, China, Thailand, and Japan. Due to the predominance of the Islamic religion, pork and alcohol are avoided. Typical ingredients include fish and rice. A popular Bruneian dish is Ambuyat."
    },
    {
      "FoodtypeID": "211-000",
      "FoodType": "Indonesian",
      "Description": "Food that represents the unique culture and flavor of Indonesia. This food type has a rich culinary heritage because many spices were introduced to the world from its \"spice islands\" (Malaku). Food in this area is heavily influenced by Asian, Middle Eastern and European cuisines. Ingredients vary based on the dish and the culinary influence. Popluar dishes include Bakmi Goreng, Gado-gado, Ketoprak, Nasi Padang, Sayur Asem and Babi Guling. Note: Indonesian/Malaysian should be used in countries outside of North America and EMEA."
    },
    {
      "FoodtypeID": "212-000",
      "FoodType": "Filipino",
      "Description": "Food that represents the unique culture and flavor of the Philippines. This food type has sweet, salty and tangy flavors. Typical ingredients include rice, corn, bread, eggs, meat with onion and garlic seasonings. Poplular Filipino dishes include lechon (roasted pig), longanisa (sausage), torta (omelette), pan de sal (bread rolls), adobo, kalderetang kambing (goat stew), kare kare, sinigang, pancit, lumpia and halo-halo."
    },
    {
      "FoodtypeID": "250-000",
      "FoodType": "Middle Eastern",
      "Description": "Food that represents the unique culture and flavor of the Middle East. Middle Eastern food generally includes food from Middle Eastern countries like Afghanistan, Saudi Arabia, Lebanon, Iran, Iraq, and the United Arab Emirates."
    },
    {
      "FoodtypeID": "251-000",
      "FoodType": "Azerbaijani",
      "Description": "Food that represents the unique culture and flavor of Azerbaijani. This food type combines different cultures and most notably by Iranian, Turkey and central Asia. Traditionally, this food type includes breads, pancakes, thick soups and plov (rice pilaf) both savoury and sweet. Typical ingredients include vegetables and greens, as well as Fresh herbs, including mint, coriander, dill, basil, parsley,tarragon, leek, chive, thyme, marjoram, green onion and watercress. Popular Azerbaijan dishes include Balıq, Dolma, Dushbara, Qutab and Bastirma."
    },
    {
      "FoodtypeID": "252-000",
      "FoodType": "Turkish",
      "Description": "Food that represents the unique culture and flavor of Turkey. This food type Typical ingredients include eggplant, green pepper, onion, bean, tomato, garlic, cucumber, lemon, pistachio, almond, spices (parsley, cumin, pepper, paprika, mint, oregano, thyme). Popular Turkish dishes include Yayla, Ayrian, Patlican, Sis Kebaps, Döner and Lahmacun."
    },
    {
      "FoodtypeID": "253-000",
      "FoodType": "Lebanese",
      "Description": "Food that represents the unique culture and flavor of Lebanon. This food type is considered to be one of the most popular Middle Eastern cuisines. Typical ingredients include whole grains, fruits, vegetables, fresh fish and seafood, poultry, garlic, herbs, olive oil and lemon juice. Popular Lebanese dishes include Kunafi, Ackwai and Baba Ghanouj."
    },
    {
      "FoodtypeID": "254-000",
      "FoodType": "Yemeni",
      "Description": "Food that represents the unique culture and flavor of Yemen. This food type is different from other cuisines in the region and is inspired by the Ottoman Turkish cuisine. Typical ingredients include chicken, lamb, fish, aniseed, fennel seed, ginger and cardamom. Popular dishes include Saltah, Bread Recipes and Yemeni beverages."
    },
    {
      "FoodtypeID": "255-000",
      "FoodType": "Burmese",
      "Description": "Food that represents the unique culture and flavor of Burma (known today as Myanmar). This food type is characterized by its extensive use of fish products like fish sauce and ngapi (fermented seafood). Typical ingredients include Paw hsan hmwe (a fragrant aroma rice), kauk hnyin, fish and poultry. Popular Burmese dishes include Gyin thohk, Khauk swè thoke, Kat kyi hnyat and Kyay oh."
    },
    {
      "FoodtypeID": "256-000",
      "FoodType": "Cambodian",
      "Description": "Food that represents the unique culture and flavor of Cambodia (also known as Khmer). This food type noodles, dessert, drinks, tropical fruits and different kinds of soups. Typical ingredients include rice, prahok (a fermented fish paste), spices (such as black pepper, kampot, wild cardamom), kroeung, fruits, vegetables, noodles, and fish. Popular Cambodian dishes include Amok trey, Kuy teav, Lok Lak, and Num banh chok."
    },
    {
      "FoodtypeID": "257-000",
      "FoodType": "Singaporean",
      "Description": "Food that represents the unique culture and flavor of Singapore. Singaporean food is influenced by the native Malay, Chinese, Indonesian, Peranakan, and Western Traditions. Due to its wide variety of influence one will notice the multiculturalism of local food and the availability of international cuisine and styles. Typical ingredients include soya sauce, coconut milk, five spice, oyster sauce, lemongrass, rice, fermented bean pastes, blacan, bee hoon and kway Teow. Popular Singaporean dishes include Bak Kut Teh, Char Kway Teow, Chili Crab and Hainanese Chicken Rice."
    },
    {
      "FoodtypeID": "258-000",
      "FoodType": "Sri Lankan",
      "Description": "Food that represents the unique culture and flavor of Sri Lanka. This food type is heavily influenced by Southern India and closely resembles Kerala cuisine and commonly includes boiled or steamed rice served with curry. Typical side dishes include pickles, chuttneys, and sambols - made of ground coconut, chili peppers, Maldive fish, and lime juice. Popular Sri Lankan dishes include Kiribath, Mallung, Kottu, and Hoppers."
    },
    {
      "FoodtypeID": "259-000",
      "FoodType": "Tibetan",
      "Description": "Food that represents the unique culture and flavor of Tibet. This food type is known for its influences from China, India and Nepal. Typical ingredients include noodles, goat, yak, mutton, dumplings, Tibetan cheeses (often from yak or goat milk), butter (also from animals adapted to the Tibetan climate) and soups. Popular Tibetan dishes include Sha Phaley, Balep korkun, Tingmo, Thenthuk and Shab Tra."
    },
    {
      "FoodtypeID": "300-000",
      "FoodType": "European",
      "Description": "Food that represents the unique culture and flavor of Europe. European food is a combination of the cuisines of Europe and other Western countries, as well as Russia."
    },
    {
      "FoodtypeID": "301-000",
      "FoodType": "French",
      "Description": "Food that represents the unique culture and flavor of France. This food type food varies per region. French creperies are often included in this food type. Popular French dishes include blanquette de veau, canard au sang, coq au vin, oysters, pot-au-feu, steak au poivre, and soufflé."
    },
    {
      "FoodtypeID": "301-027",
      "FoodType": "French-Alsatian",
      "Description": "French food from the Alsace region of France, which has Germanic culinary traditions. Traditional cuisine is baeckeoffe, flammekueche, chorcrote, and fleischnacka."
    },
    {
      "FoodtypeID": "301-028",
      "FoodType": "French-Auvergnate",
      "Description": "French food from the Auvergne area of France consisting of hearty peasant fare such as cheese, pork, lamb, and beef dishes."
    },
    {
      "FoodtypeID": "301-029",
      "FoodType": "French-Basque",
      "Description": "French food from the Basque area of France with a Spanish influence, consisting of freshwater fish, salt cod, fresh and cured meats, and many vegetables and legumes."
    },
    {
      "FoodtypeID": "301-030",
      "FoodType": "French-Corse",
      "Description": "French food from the region of Corsica consisting of wild boar, seafood and river fish, such as trout, cheeses from goats or sheep milk, and chestnuts."
    },
    {
      "FoodtypeID": "301-031",
      "FoodType": "French-Lyonnaise",
      "Description": "French food from the region of Lyon in France consisting of sausages, duck pate or roast pork. The cuisine is fatty and oriented around meat."
    },
    {
      "FoodtypeID": "301-032",
      "FoodType": "French-Provencale",
      "Description": "French food from the Provence region of France consisting of olives and olive oil, garlic, sardines, rock fish, sea urchins, octopus, lamb, goat, chickpeas, grapes, peaches, apricots, strawberries, cherries, and Cavaillon melons."
    },
    {
      "FoodtypeID": "301-033",
      "FoodType": "French-Sud-ouest",
      "Description": "French food from the Sud-Ouest region of France such as roasted Guinea fowl, quail, eggs, and potatoes."
    },
    {
      "FoodtypeID": "302-000",
      "FoodType": "German",
      "Description": "Food that represents the unique culture and flavor of Germany. This food type varies per region. Popular German dishes include hasenpfeffer, königsberger klopse, sauerbraten, spätzle, schnitzel, kartoffelsalat, rindsroulade."
    },
    {
      "FoodtypeID": "303-000",
      "FoodType": "Greek",
      "Description": "Food that represents the unique culture and flavor of Greece. Typical ingredients include tomato, aubergine, potato, green beans, lamb and feta. Popular Greek dishes include moussaka, souvlaki, gyros, keftedes, yemista."
    },
    {
      "FoodtypeID": "304-000",
      "FoodType": "Italian",
      "Description": "Food that represents the unique culture and flavor of Italy. Typical ingredients include potatoes, rice, capers, maize, corn, sausages, pork and various types of cheeses, salamis, pepper, olives, semolina, artichokes, oranges, aubergines, and courgettes. Popular Italian dishes include Bistecca alla Florentine, Bacall alla Vincentian, Lasagna, Pasta e aioli, Pizza and Raga alla Bolognese."
    },
    {
      "FoodtypeID": "305-000",
      "FoodType": "Irish",
      "Description": "Food that represents the unique culture and flavor of Ireland. Typical ingredients include potatoes, cabbage, meat and seafood. Popular Irish dishes include Irish stew and soda bread."
    },
    {
      "FoodtypeID": "306-000",
      "FoodType": "Austrian",
      "Description": "Food that represents the unique culture and flavor of Austria. This food type is a combination of regional traditions highly influenced by surrounding areas like Hungarian, Czech, Italian, and Bavarian cuisine. A popular Austrian dish is gulasch."
    },
    {
      "FoodtypeID": "307-000",
      "FoodType": "Belgian",
      "Description": "Food that represents the unique culture and flavor of Belgium. Typical ingredients include spices, meats, fresh vegetables and herbs. Popular Belgian dishes include lapin à la geuze/konijn in geuze, stoemp, salade liégeoise/luikse salade, and flemish carbonades. Signature dishes are mussels and French fries."
    },
    {
      "FoodtypeID": "308-000",
      "FoodType": "British Isles",
      "Description": "Food that represents the unique culture and flavor of the British Isles. This food type represents restaurants that serve English, Scottish, Irish, and Welsh food. Popular British Isles foods are roast meats, fish and chips, pies, and sausages."
    },
    {
      "FoodtypeID": "309-000",
      "FoodType": "Dutch",
      "Description": "Food that represents the unique culture and flavor of the Netherlands. Typical ingredients include fish and vegetables. Popular Dutch dishes include hutspot, pannekoeken, stamppot and erwtensoep."
    },
    {
      "FoodtypeID": "310-000",
      "FoodType": "Swiss",
      "Description": "Food that represents the unique culture and flavor of Switzerland. Typical ingredients include cheese ( Emmentaler, Gruyère, Appenzeller) and chocolate. Note: See also Fondue food type. Popular Swiss dishes are cheese fondue, raclette, rösti, and quiche."
    },
    {
      "FoodtypeID": "311-000",
      "FoodType": "Spanish",
      "Description": "Food that represents the unique culture and flavor of Spain. Typical ingredients include pork, potatoes, tomatoes, sofrito, garlic, onions, peppers, beans, cabbage, and mushrooms. This food type is generally associated with tapas bars and churros. Popular Spanish dishes include chorizo, gazpacho, jamón serrano, paella, tortilla de patates and calamari."
    },
    {
      "FoodtypeID": "311-034",
      "FoodType": "Spanish-Tapas",
      "Description": "Tapas represents restaurants that serve a variety of small dishes or appetizers that may be combined to make a full meal. Tapas is popular in Spanish cuisine and others."
    },
    {
      "FoodtypeID": "313-000",
      "FoodType": "Portuguese",
      "Description": "Food that represents the unique culture and flavor of Portugal. Typical ingredients include fish (acalhau, sardines, octopus, crabs, shrimp, lobster), cheese (queijo de castelo branco, queijo da serra da estrela). Popular Portuguese dishes include alcatra, alheiras, carne de porco à alentejana, pregos, bifanas and espetada."
    },
    {
      "FoodtypeID": "314-000",
      "FoodType": "Maltese",
      "Description": "Food that represents the unique culture and flavor of Malta. Popular Maltese dishes are aljotta (fish soup), fenek (rabbit), gbejniet (cheese), lampuka (dolphin), pastizzi and ravjul (ravioli)."
    },
    {
      "FoodtypeID": "315-000",
      "FoodType": "Sicilian",
      "Description": "Food that represents the unique culture and flavor of Sicily. This food type is based on Italian cuisine and has Spanish, Greek, and Arab influences. Appetizers include caponata, a type of potato and cheese pie, pasta is spaghetti prepared with sea urchin and manicotti, main dishes are meat or fish based."
    },
    {
      "FoodtypeID": "350-000",
      "FoodType": "Scandinavian",
      "Description": "Food that represents the unique culture and flavor of Scandinavia. This food type generally applies to restaurants serving food from Scandinavian countries, such as Denmark, Norway, Sweden, and Iceland. Typical ingredients include cereal, pork, seafood, apples, plums, carrots, potatoes, onions, beer, bread, blue cheese, feta. Popular Danish dishes are hakkebøf, fridakeller, jomfruhummer, laks, rogn, bliksemad, flæskesteg. Popular Norwegian dishes include pizza, pasta, meatballs, smoked salmon, gravlaks, rakfish. Popluar Swedish dishes include köttbullar, inlagd sill, gravad lax, kroppkakor, blodpudding, isterband, janssons frestelse, lutfisk. Note: See also Finnish food."
    },
    {
      "FoodtypeID": "351-000",
      "FoodType": "Finnish",
      "Description": "Food that represents the unique culture and flavor of Finland. This food type is based mainly on fish, meat, various vegetables, and mushrooms. Popular Finnish dishes include cabbage rolls, pickled herring, smoked fish, lihapullat, mustamakkara, pepu."
    },
    {
      "FoodtypeID": "352-000",
      "FoodType": "Swedish",
      "Description": "Food that represents the unique culture and flavor of Sweden. Swedish food has traditionally been regions, with difference in dishes from the North and South of Sweden. Northern cuisine includes meat such as reindeer and game dishes, while the South uses a lot of fresh vegetables."
    },
    {
      "FoodtypeID": "353-000",
      "FoodType": "Norwegian",
      "Description": "Food that represents the unique culture and flavor of Norway. This food type is based on food readily available in Norway, traditionally with a focus on game and fish, but is now influenced by western Europe."
    },
    {
      "FoodtypeID": "354-000",
      "FoodType": "Danish",
      "Description": "Food that represents the unique culture and flavor of Denmark. Danish food consists of ground meats and fish dishes, as well as roast pork and poached cod."
    },
    {
      "FoodtypeID": "370-000",
      "FoodType": "East European",
      "Description": "Food that represents the unique culture and flavor of Eastern Europe. This food type represents restaurants that serve food from East European countries like Moldova, Romania, Slovakia. Popular Romanian dishes are mamaliga, carnati, caltabosi, cozonac, pasca, sarmale, snitel, zacuzca. Note: See also Bohemian, Hungarian, Polish, and Russian for related food types."
    },
    {
      "FoodtypeID": "371-000",
      "FoodType": "Hungarian",
      "Description": "Food that represents the unique culture and flavor of Hungary. This food type is often spicy. Typical ingredients include paprika, black pepper, and onions. Thick vegetable dishes, cold fruit soups, and meat dishes are common. Popular Hungarian dishes include halászlé, palacsinta, hurka, chicken paprikash, and galuska."
    },
    {
      "FoodtypeID": "372-000",
      "FoodType": "Mediterranean",
      "Description": "Food that represents the unique culture and flavor of the Mediterranean. This food type is found in countries adjacent to the Mediterranean Sea. Fruit, vegetables, poultry, seafood, grains, beans, and pasta are the general fare, and cooking is usually accomplished using olive oil."
    },
    {
      "FoodtypeID": "373-000",
      "FoodType": "Baltic",
      "Description": "Food that represents the unique culture and flavor of the Baltic region. This food type represents restaurants that serve food from the Baltic region, including Estonia, Latvia, and Lithuania. Food from this area is generally simple and satisfying with few sauces or excessive seasoning. Breads and soups are mainstays."
    },
    {
      "FoodtypeID": "374-000",
      "FoodType": "Belorusian",
      "Description": "Food that represents the unique culture and flavor of Belarus. This food type represents restaurants that serve food from Belorussia. Food from this area typically consists of soups, such as borsch and ukha, stews, sausages, and pies cooked without heavy seasonings."
    },
    {
      "FoodtypeID": "375-000",
      "FoodType": "Ukrainian",
      "Description": "Food that represents the unique culture and flavor of Ukrane. Ukrainian food typically consists of pork, beetroot, vegetables, and potatoes. Popular Ukrainian dishes include Tyrohy, Borshch, Varenyky, Holuptsi, and Oseledets."
    },
    {
      "FoodtypeID": "376-000",
      "FoodType": "Polish",
      "Description": "Food that represents the unique culture and flavor of Poland. This food type generally includes meat of all kinds, various noodles and dumplings. Popular Polish dishes are zupa grzybowa, pierogi, bigos, kotlet schabowy and placki kartoflane."
    },
    {
      "FoodtypeID": "377-000",
      "FoodType": "Russian",
      "Description": "Food that represents the unique culture and flavor of Russia. This food type generally contains soups (such as cold soup, noodle soup, cabbage soup, fish soup), pork, poultry, zharkoye, vegetables (such as carrots and sauerkraut)."
    },
    {
      "FoodtypeID": "378-000",
      "FoodType": "Bohemian",
      "Description": "Food that represents the unique culture and flavor of Bohemia. This food type represents dishes with a Czech name where it is not possible to define a more detailed food type."
    },
    {
      "FoodtypeID": "379-000",
      "FoodType": "Balkan",
      "Description": "Food that represents the unique culture and flavor of the Balkan Peninsula. This food type represents restaurants that serve food from Balkan countries such as Albania, Bosnia, Bulgaria, Montenegro and Macedonia. Note: See also Hungarian for related Food Type."
    },
    {
      "FoodtypeID": "380-000",
      "FoodType": "Caucasian",
      "Description": "Food that represents the unique culture and flavor of Caucasus region. This food type represents restaurants that serve food from the Caucasus Mountains area (Georgia, Armenia and Azerbaijan)."
    },
    {
      "FoodtypeID": "381-000",
      "FoodType": "Romanian",
      "Description": "Food that represents the unique culture and flavor of Romania. Popular Romanian dishes include mamaliga, carnati, caltabosi, cozonac, pasca, sarmale, snitel and zacuzca."
    },
    {
      "FoodtypeID": "382-000",
      "FoodType": "Armenian",
      "Description": "Food that represents the unique culture and flavor of Armenia. This food type represents restaurants that serve food from Armenia or the Armenia diaspora. The preparation of meat, fish, and vegetable dishes require stuffing, frothing, and puréeing. Lamb, eggplant, yogurt, and bread (lavash) are basic features. Cracked wheat (burghul) is preferred over maize and rice. Popular dishes include dzhash, khorovatz (also known as shish kabob) and harissa."
    },
    {
      "FoodtypeID": "400-000",
      "FoodType": "South American",
      "Description": "Food that represents the unique culture and flavor of South American, including countries such as Colombia and Venezuela. Some of the most important South American ingredients are beef, lamb, goat, wheat, corn, milk, beans, soybeans. Note: See also Argentinean, Chilean, Latin American, and Surinamese for related Food Types."
    },
    {
      "FoodtypeID": "401-000",
      "FoodType": "Surinamese",
      "Description": "Food that represents the unique culture and flavor of Surinam. Typical Surinamese dishes are pinda soep met tom-tom (peanut soup), pom (chicken), fiadoe (pastry), alu tarkari (potatoes)."
    },
    {
      "FoodtypeID": "402-000",
      "FoodType": "Venezuelan",
      "Description": "Food that represents the unique culture and flavor of Venezuela. This food type commonly includes fishes and shellfishes. Typical ingredients include fish, beef, wheat flour, corn and fruits. Popular Venezuelan dishes include Pabellon, Criollo, Arepas, Hallacas, Cachapas, Tequefios and Empanadas."
    },
    {
      "FoodtypeID": "403-000",
      "FoodType": "Latin American",
      "Description": "Food that represents the unique culture and flavor of Latin American, including countries such as Costa Rica, Nicaragua, El Salvador, Guatemala, Panama. Note: See also Cajun/Caribbean, South American, and Surinamese for related Food Types."
    },
    {
      "FoodtypeID": "404-000",
      "FoodType": "Argentinean",
      "Description": "Food that represents the unique culture and flavor of Argentina. Cuisine from this region typically has a strong resemblance to Italian, Spanish, and French cuisine, but with an abundance of meat, especially beef and wheat products. Typical Argentinean dishes are barbecued beef, dulce de leche, and empanadas."
    },
    {
      "FoodtypeID": "405-000",
      "FoodType": "Chilean",
      "Description": "Food that represents the unique culture and flavor of Chile. This food type is influenced by European (mainly Germany, Italy, Croatia and France) and the Middle East. Typical ingredients include olives, chirimoya, corn, lucuma, potatoes and quinoas. Popular dishes include Ensalada Chilena, Pastel de Choclo, Tomaticán, Cola de Mono and Torta de Cumpleaños."
    },
    {
      "FoodtypeID": "406-000",
      "FoodType": "Brazilian",
      "Description": "Food that represents the unique culture and flavor of Brazil. This food type varies greatly by region and is influenced by Amerindian and Portuguese food. Brazil is set in a tropical region that is rich in flora, fauna and other natural crops. Typical ingredients include cumin, parsley, white peppercorns, lamb, pork and chicken. Popular dishes include Bolinhos de Arroz, Caipirinha, Camarao na Moranga, Coxinhas and Moqueca de Camarao."
    },
    {
      "FoodtypeID": "406-035",
      "FoodType": "Brazilian-Baiana",
      "Description": "Brazilian food from the region of Bahia using spiced seasoning based on dende oil, coconut milk, ginger, and various kinds of pepper."
    },
    {
      "FoodtypeID": "406-036",
      "FoodType": "Brazilian-Capixaba",
      "Description": "Brazilian food from the region of Espirito Santo includes toria capixaha which is traditionally served in clay pots."
    },
    {
      "FoodtypeID": "406-037",
      "FoodType": "Brazilian-Mineira",
      "Description": "Brazilian food from the region of Minas Gerais which uses lemon juice and cachaca marinade and features urucum, acafrao, cominho sauces."
    },
    {
      "FoodtypeID": "406-038",
      "FoodType": "Brazilian-Bakery",
      "Description": "Brazilian bakery fare such as honey cake, roll cake, pastries, banana sweets, etc."
    },
    {
      "FoodtypeID": "407-000",
      "FoodType": "Peruvian",
      "Description": "Food that represents the unique culture and flavor of Peru. This food type is influenced by Spain, China, Italy, West Africa and Japan. Typical ingredients include corn, potatoes, quinoa, kiwicha and chili peppers. Popular dishes include Humitas, Ensalada de Pallares, rocotos rellenos, Arroz con Pollo and dulce de leche."
    },
    {
      "FoodtypeID": "500-000",
      "FoodType": "African",
      "Description": "Food that represents the unique culture and flavor of Africa. This food type represents any restaurant that serves food from African countries such as South Africa, Ethiopia, Egypt if a more specific food type is not available."
    },
    {
      "FoodtypeID": "501-000",
      "FoodType": "Moroccan",
      "Description": "Food that represents the unique culture and flavor of Morocco. This food type is generally a mix of Arab, Berber, Moorish, Middle Eastern, Mediterranean African, Iberian and Jewish influences. It is characterized by an extensive use of spices on dishes consisting of fruit, vegetables, and meats."
    },
    {
      "FoodtypeID": "502-000",
      "FoodType": "Egyptian",
      "Description": "Food that represents the unique culture and flavor of Egypt. This food type is based on the tradition of Egyptian culture with legumes and vegetables being the main staples. Popular Egyptian dishes include Kushari, Eish Masri, Kharshuf Matbukh and Zlabia."
    },
    {
      "FoodtypeID": "503-000",
      "FoodType": "Ethiopian",
      "Description": "Food that represents the unique culture and flavor of Ethiopia. This food type consists of spicy vegetable and meat dishes, usually in the form of a thick stew served on top of a sourdough flatbread. Typical ingredients include spices such as berber and niter kibbeh. Popular Ethiopian dishes include Alicha and Kay Wat."
    },
    {
      "FoodtypeID": "504-000",
      "FoodType": "Seychellois",
      "Description": "Food that represents the unique culture and flavor of Seychellois. The country's cuisine has been influenced by African, British, French, Indian and Chinese cuisines. The use of spices such as ginger, lemongrass, coriander and tamarind are a significant component. Staple foods include many fish, seafood and shellfish dishes, often accompanied with rice. Fish dishes are cooked in myriad ways, such as steamed, grilled, wrapped in banana leaves, baked, salted and smoked. Curry dishes with rice are also a significant."
    },
    {
      "FoodtypeID": "505-000",
      "FoodType": "South African",
      "Description": "Food that represents the unique culture and flavor of South Africa. This food type represents restaurants that serve food from South Africa. The cuisine, sometimes called 'rainbow cuisine' can be generalized as cookery practiced by indigenous people of Africa, or cookery that emerged from European people of Dutch, German, French, Italian, Greek and British. It possesses many characteristics of Indonesia and Portuguese Mozambique cooking styles. Popular dishes include Biltong, Grilled game, Sosaties, Bobotie and Boerewors."
    },
    {
      "FoodtypeID": "506-000",
      "FoodType": "North African",
      "Description": "Food that represents the unique culture and flavor of North Africa. This food type represents restaurants that serve food from the countries of Algeria, Libya, Morocco, and Tunisia. The most common staple foods are meat, seafood, goat, lamb, beef, dates, almonds, olives, various vegetables and fruit. Most dishes are spiced, especially with cumin, ginger, paprika, cinnamon and saffron. Fresh peppermint, parsley, or coriander are also very common. Popular dishes include Couscous, Pastilla and The Tajine."
    },
    {
      "FoodtypeID": "800-050",
      "FoodType": "Fast Food",
      "Description": "Represents Places that offer food that is prepared and served quickly."
    },
    {
      "FoodtypeID": "800-056",
      "FoodType": "Steak House",
      "Description": "Represents places that specialize in beef steaks."
    },
    {
      "FoodtypeID": "800-057",
      "FoodType": "Pizza",
      "Description": "Represents places that specialize in pizza."
    },
    {
      "FoodtypeID": "800-058",
      "FoodType": "Snacks and Beverages",
      "Description": "Represents places that serve only snacks and beverages."
    },
    {
      "FoodtypeID": "800-059",
      "FoodType": "Hot Dogs",
      "Description": "Represents places that specialize in serving frankfurters."
    },
    {
      "FoodtypeID": "800-060",
      "FoodType": "Sandwich",
      "Description": "Represents places that serve mainly sandwiches."
    },
    {
      "FoodtypeID": "800-061",
      "FoodType": "Breakfast",
      "Description": "Represents places that serve breakfast foods such as pancakes, waffles, eggs, sausages and bacon."
    },
    {
      "FoodtypeID": "800-062",
      "FoodType": "Chicken",
      "Description": "Represents places that specialize in chicken."
    },
    {
      "FoodtypeID": "800-063",
      "FoodType": "Ice Cream",
      "Description": "Represents places that serve ice cream. Places may or may not serve other food items, such as burgers or sandwiches."
    },
    {
      "FoodtypeID": "800-064",
      "FoodType": "International",
      "Description": "Represents places that serve International cuisines, such as Greek, French, Italian and Portuguese, but do not fit into other food types."
    },
    {
      "FoodtypeID": "800-065",
      "FoodType": "Continental",
      "Description": "Continental Food should be applied to restaurants within hotels in Europe when they do not fit in another Food Type."
    },
    {
      "FoodtypeID": "800-066",
      "FoodType": "Fusion",
      "Description": "Represents places that serve cuisine based on a combination of various other types of cuisine. This food type is not specific to anyone region, but rather includes a blend of characteristics from other regional cuisines. Common examples are Fusion cuisine include Tex-Mex, Italian-American and Indian-Chinese."
    },
    {
      "FoodtypeID": "800-067",
      "FoodType": "Burgers",
      "Description": "Burgers should be applied to restaurants serving hamburgers and related foods like french fries, but in a sit-down environment (as opposed to Fast Food)."
    },
    {
      "FoodtypeID": "800-068",
      "FoodType": "Creperie",
      "Description": "Creperie should be applied to restaurants serving crepes which can be either savory or sweet. Creperies in France should usually be given the French Food Type."
    },
    {
      "FoodtypeID": "800-069",
      "FoodType": "Pastries",
      "Description": "Pastries should be applied to restaurants serving baked goods such as pies, tarts, and quiches."
    },
    {
      "FoodtypeID": "800-071",
      "FoodType": "Fondue",
      "Description": "Fondue should be applied to restaurants that specialize in fondue which is a communal dish, often cheese, that is served over a burner at the table."
    },
    {
      "FoodtypeID": "800-072",
      "FoodType": "Brunch",
      "Description": "Brunch should be applied to restaurants that specialize in a combination breakfast-lunch scenario."
    },
    {
      "FoodtypeID": "800-073",
      "FoodType": "Bistro",
      "Description": "Bistro should be applied to eating establishments serving moderately priced simple meals in a modest environment. The service is quicker and less formal than in a restaurant. Typical dishes in a Bistro Restaurant are classic dishes such as steak au poivre, onion soup, coq au vin. Note: This should not be coded in Canada, EMEA, Mexico, Puerto Rico, the U.S., and the U.S. Virgin Islands."
    },
    {
      "FoodtypeID": "800-074",
      "FoodType": "BrewPub",
      "Description": "Brew Pub should be applied to restaurants which are well known because they have a beer brewery."
    },
    {
      "FoodtypeID": "800-075",
      "FoodType": "Seafood",
      "Description": "Seafood should be applied to restaurants that mainly serve seafood and identify themselves as Seafood restaurants."
    },
    {
      "FoodtypeID": "800-076",
      "FoodType": "Vegan",
      "Description": "Vegan Food should be applied to restaurants serving food identified as vegan that excludes all animal products. Note: See also Vegetarian Food."
    },
    {
      "FoodtypeID": "800-077",
      "FoodType": "Vegetarian",
      "Description": "Vegetarian Food should be applied to restaurants serving food identified as vegetarian. Vegetarian dishes do not contain meat. Some of the most common ingredients are cereals, vegetables, fruits, nuts, and spices. Note: See also Vegan Food."
    },
    {
      "FoodtypeID": "800-078",
      "FoodType": "Grill",
      "Description": "The Grill Food Type should be applied to restaurants which identify themselves as a Grill restaurant, e.g., Gauchos. Grilling is cooking of food over direct high heat on a metal grid. Note: Even though Autogrill contains the word 'grill', this does not qualify for the Grill Food Type. Note: See also Barbecue, Steak House for related Food Types."
    },
    {
      "FoodtypeID": "800-079",
      "FoodType": "Jewish/Kosher",
      "Description": "Jewish/Kosher Food should be applied to restaurants serving food that is traditionally Jewish or kosher, food which confirms to Jewish dietary laws. Typical Jewish dishes are matzo, carciofi alla giudia, chremsel, falafel, gondi, kasha, white fish. Some ingredients are forbidden in kosher cuisine such as pork, shrimp, octopus, and lobster."
    },
    {
      "FoodtypeID": "800-080",
      "FoodType": "Soup",
      "Description": "Restaurants specializing in soups."
    },
    {
      "FoodtypeID": "800-081",
      "FoodType": "Lunch",
      "Description": "Restaurants specializing in serving lunch."
    },
    {
      "FoodtypeID": "800-082",
      "FoodType": "Dinner",
      "Description": "Restaurants specializing in serving dinner."
    },
    {
      "FoodtypeID": "800-083",
      "FoodType": "Natural/Healthy",
      "Description": "Restaurants specializing in natural and healthy food."
    },
    {
      "FoodtypeID": "800-084",
      "FoodType": "Organic",
      "Description": "Restaurants specializing in organic food."
    },
    {
      "FoodtypeID": "800-085",
      "FoodType": "Noodles",
      "Description": "Restaurants specializing in noodles."
    },
    {
      "FoodtypeID": "800-086",
      "FoodType": "Halal",
      "Description": "Halal should be applied to restaurants serving food that is traditionally halal, food which conforms to Islamic dietary laws. It typically refers to meat preparation, but is also applicable to any ingredient (such as gelatin, which is derived from animal parts)."
    },
    {
      "FoodtypeID": "800-087",
      "FoodType": "Kebab",
      "Description": "Kebab should be applied to restaurants which serve a variety of grilled meat dishes with Middle Eastern origin. It may include variants such as doner kebab and shish kebab."
    },
    {
      "FoodtypeID": "600-000",
      "FoodType": "Oceanic",
      "Description": "Food that represents the unique culture and flavor of Oceanic region. This food type represents restaurants that serve food from the countries of Australia, New Zealand, and Tasmania, and other islands throughout Oceania."
    }
  ]

let hereMealCategories = [
  {
    "CategoryId": "100",
    "CategoryType": "Eat and Drink",
    "Description": "Eat and Drink"
  },
  {
    "CategoryId": "100-1000-0000",
    "CategoryType": "Restaurant",
    "Description": "An establishment that prepares and serves refreshments and prepared meals. This is a base-level category that should be used for all places that do not fit other categories defined for Restaurant (100-1000-xxxx)."
  },
  {
    "CategoryId": "100-1000-0001",
    "CategoryType": "Casual Dining",
    "Description": "A restaurant serving moderately-priced food in a casual atmosphere that usually includes table service."
  },
  {
    "CategoryId": "100-1000-0002",
    "CategoryType": "Fine Dining",
    "Description": "A full-service restaurant that serves full-course meals in a formal setting. These places usually have high quality décor, highly-trained chefs, wait staff and visually appealing food. Prices are typically higher than other types of restaurants."
  },
  {
    "CategoryId": "100-1000-0003",
    "CategoryType": "Take Out and Delivery Only",
    "Description": "A restaurant that offers take-out service, delivery service, or both."
  },
  {
    "CategoryId": "100-1000-0004",
    "CategoryType": "Food Market-Stall",
    "Description": "A restaurant that serves specialty foods at a food court, marketplace or outdoor setting including hawker centers (common in Southeast Asia)."
  },
  {
    "CategoryId": "100-1000-0005",
    "CategoryType": "Taqueria",
    "Description": "A street vendor stand or small restaurant that serves traditional Mexican food, such as tacos or burritos."
  },
  {
    "CategoryId": "100-1000-0006",
    "CategoryType": "Deli",
    "Description": "A restaurant that sells ready-to-serve delicatessens including cold cut meats, cheeses and salads. This type of restaurant can be found as a stand-alone establishment or within a grocery store."
  },
  {
    "CategoryId": "100-1000-0007",
    "CategoryType": "Cafeteria",
    "Description": "A restaurant that provides food service with little or no wait staff. This type of establishment is common in schools, large office buildings, hospitals and other public establishments."
  },
  {
    "CategoryId": "100-1000-0008",
    "CategoryType": "Bistro",
    "Description": "A restaurant that serves moderately priced meals in a European-styled casual setting."
  },
  {
    "CategoryId": "100-1000-0009",
    "CategoryType": "Fast Food",
    "Description": "A restaurant offering food that is prepared and served quickly."
  },
  {
    "CategoryId": "100-1000-0050",
    "CategoryType": "Family Restaurant",
    "Description": "A family-friendly restaurant chain location which provides casual food. The menu includes a wide variety of Japanese, Western, and Chinese dishes. Note: This category is a Japan-only category."
  },
  {
    "CategoryId": "100-1100-0000",
    "CategoryType": "Coffee-Tea",
    "Description": "An establishment that sells drinks, such as coffee and tea, as well as refreshments. This is a base-level category that should be used for all places that do not fit other categories defined for Coffee-Tea (100-1100-xxxx)."
  },
  {
    "CategoryId": "100-1100-0010",
    "CategoryType": "Coffee Shop",
    "Description": "An establishment that primarily sells coffee, but may also serve light foods, such as pastries or other snacks."
  },
  {
    "CategoryId": "100-1100-0331",
    "CategoryType": "Tea House",
    "Description": "An establishment that sells tea and other related products."
  }
];

let hereRestCategories = [
  {
    "CategoryId": "400-4300",
    "CategoryType": "Rest - Area",
    "Description": "Rest - Area"
  },
  {
    "CategoryId": "550",
    "CategoryType": "Leisure and Outdoor",
    "Description": "Leisure and Outdoor"
  },
  {
    "CategoryId": "800-8500",
    "CategoryType": "Parking",
    "Description": "Parking"
  },
  {
    "CategoryId": "800-8300",
    "CategoryType": "Library",
    "Description": "Library"
  },
  {
    "CategoryId": "700-7600",
    "CategoryType": "Fueling Station",
    "Description": "Fueling Station"
  },
  {
    "CategoryId": "600-6000",
    "CategoryType": "Convenience Store",
    "Description": "Convenience Store"
  },
  {
    "CategoryId": "600-6100",
    "CategoryType": "Mall-Shopping Complex",
    "Description": "Mall-Shopping Complex"
  },
  {
    "CategoryId": "600-6200",
    "CategoryType": "Department Store",
    "Description": "Department Store"
  },
  {
    "CategoryId": "600-6300-0066",
    "CategoryType": "Grocery",
    "Description": "Grocery"
  },
  {
    "CategoryId": "600-6400",
    "CategoryType": "Drugstore or Pharmacy",
    "Description": "Drugstore or Pharmacy"
  },
  {
    "CategoryId": "600-6600",
    "CategoryType": "Hardware, House and Garden",
    "Description": "Hardware, House and Garden"
  },
  {
    "CategoryId": "600-6900-0247",
    "CategoryType": "Market",
    "Description": "Market"
  },
  {
    "CategoryId": "700-7460",
    "CategoryType": "Tourist Information",
    "Description": "Tourist Information"
  },
  {
    "CategoryId": "700-7850",
    "CategoryType": "Car Repair-Service",
    "Description": "Car Repair-Service"
  },
  {
    "CategoryId": "700-7900",
    "CategoryType": "Truck-Semi Dealer-Services",
    "Description": "Truck-Semi Dealer-Services"
  },
  {
    "CategoryId": "900-9200",
    "CategoryType": "Outdoor Area-Complex",
    "Description": "Outdoor Area-Complex"
  }
];

let hereDayCategories = [
  {
    "CategoryId": "550",
    "CategoryType": "Accomodation",
    "Description": "Accomodation"
  },
  
      {
        "CategoryId": "500-5000-0000",
        "CategoryType": "Hotel or Motel",
        "Description": "A business that provides lodging or temporary living quarters. This is a base-level category that should be used for all places that do not fit other categories defined for Hotel-Motel (500-5000-xxxx)."
      },
      {
        "CategoryId": "500-5000-0053",
        "CategoryType": "Hotel",
        "Description": "An establishment that provides short-term or extended stay lodging. Places in this category may also provide other services and amenities, such as meals, entertainment, dry cleaning and various other personal services."
      },
      {
        "CategoryId": "500-5000-0054",
        "CategoryType": "Motel",
        "Description": "An establishment that provides lodging to the public. These places usually have rooms that are accessible from a parking area."
      },
      {
        "CategoryId": "500-5100-0000",
        "CategoryType": "Lodging",
        "Description": "A business that provides lodging to the public generally without room service. This is a base-level category that should be used for all places that do not fit other categories defined for Lodging (500-5100-xxxx)."
      },
      {
        "CategoryId": "500-5100-0055",
        "CategoryType": "Hostel",
        "Description": "An establishment that provides an inexpensive lodging place for travelers. Lodging arrangements are usually in dormitory settings where a guest can rent a bed or bunk bed. Guests often share amenities with other guests."
      },
      {
        "CategoryId": "500-5100-0056",
        "CategoryType": "Campground",
        "Description": "An establishment that provides a designated area for short-term camping. These places generally serve tent, trailer or recreation vehicle (RV) camping."
      },
      {
        "CategoryId": "500-5100-0057",
        "CategoryType": "Guest House",
        "Description": "An establishment that provides lodging in an adjacent building next to the main structure. Guest houses are generally a small house or cottage."
      },
      {
        "CategoryId": "500-5100-0058",
        "CategoryType": "Bed and Breakfast",
        "Description": "An establishment that provides lodging and breakfast at an inclusive price. Bed and Breakfasts are typically private homes that contain a limited number of bedrooms."
      },
      {
        "CategoryId": "500-5100-0059",
        "CategoryType": "Holiday Park",
        "Description": "An establishment that provides rental cottages or rooms. Resorts generally provide various recreational facilities, such as bowling, restaurants, swimming or mini golf."
      },
      {
        "CategoryId": "500-5100-0060",
        "CategoryType": "Short-Time Motel",
        "Description": "An establishment that provides lodging designed for romantic encounters, or short rests, but usually not requiring an overnight stay."
      },
      {
        "CategoryId": "500-5100-0061",
        "CategoryType": "Ryokan",
        "Description": "An establishment that provides lodging with a traditional Japanese-style setting. Ryokans commonly contain matted flooring, sliding doors, shared rooms/baths, and serve traditional Japanese food."
      },
      {
        "CategoryId": "550-5510-0000",
        "CategoryType": "Outdoor-Recreation",
        "Description": "Public land preserved and maintained for recreational use. This is a base-level category that should be used for all places that do not fit other categories defined for Park-Recreation (550-5510-xxxx)."
      },
      {
        "CategoryId": "550-5510-0202",
        "CategoryType": "Park-Recreation Area",
        "Description": "A protected area preserved and maintained for public enjoyment including fairgrounds."
      },
      {
        "CategoryId": "550-5510-0203",
        "CategoryType": "Sports Field",
        "Description": "A sporting activity area that is accessible to the public."
      },
      {
        "CategoryId": "550-5510-0204",
        "CategoryType": "Garden",
        "Description": "A designated area containing plants, flowers, trees or other vegetation. This includes private and public gardens. Common examples include conservatories and botanical gardens."
      },
      {
        "CategoryId": "550-5510-0205",
        "CategoryType": "Beach",
        "Description": "A coastal area preserved and maintained for public enjoyment that is adjacent to lakes, oceans, rivers and connecting bay/harbors."
      },
      {
        "CategoryId": "550-5510-0206",
        "CategoryType": "Recreation Center",
        "Description": "A designated area that is open to the public for the purposes of social, educational, or cultural activities, in addition to amateur individual and team sports."
      },
      {
        "CategoryId": "550-5510-0227",
        "CategoryType": "Ski Lift",
        "Description": "A designated area at a ski resort that provides access to the top of the mountain."
      },
      {
        "CategoryId": "550-5510-0242",
        "CategoryType": "Scenic Point",
        "Description": "A designated area providing access to scenic viewpoints. Scenic points generally are located along scenic roadways and have regional significance."
      },
      {
        "CategoryId": "550-5510-0358",
        "CategoryType": "Off Road Trailhead",
        "Description": "A designated point where an off-road vehicle trail begins. The off-road trailhead may contain restrooms, maps, signposts and informational centers."
      },
      {
        "CategoryId": "550-5510-0359",
        "CategoryType": "Trailhead",
        "Description": "A designated point where a trail begins. The trailhead may contain restrooms, maps, signposts and informational centers."
      },
      {
        "CategoryId": "550-5510-0374",
        "CategoryType": "Off-Road Vehicle Area",
        "Description": "A designated area or trail for driving off-road vehicles (4WD, ATVs, etc)."
      },
      {
        "CategoryId": "550-5510-0378",
        "CategoryType": "Campsite",
        "Description": "A designated area where people can camp using tents or camper vans for overnight stays in the outdoors."
      },
      {
        "CategoryId": "550-5510-0379",
        "CategoryType": "Outdoor Service",
        "Description": "An establishment or designated area that provides amenities specific to outdoor activities."
      },
      {
        "CategoryId": "550-5510-0380",
        "CategoryType": "Ranger Station",
        "Description": "A Ranger Station is a building within a park or other outdoor recreation area which is usually public and affiliated with the park where it is located."
      },
      {
        "CategoryId": "550-5510-0387",
        "CategoryType": "Bicycle Service",
        "Description": "An outdoor location that offers bicycle repairs and maintenance as a self-service."
      },
      {
        "CategoryId": "550-5520-0000",
        "CategoryType": "Leisure",
        "Description": "An establishment that provides rides or other entertainment. This is a base-level category that should be used for all places that do not fit other categories defined forAmusement or Holiday Park (550-5520-xxxx)."
      },
      {
        "CategoryId": "550-5520-0207",
        "CategoryType": "Amusement Park",
        "Description": "An establishment that provides a park containing rides or other entertainment. Certain amusement parks may be theme-based. For example, Disney World, Sea World or Six Flags."
      },
      {
        "CategoryId": "550-5520-0208",
        "CategoryType": "Zoo",
        "Description": "An establishment where animals are exhibited in cages or large enclosures for the public."
      },
      {
        "CategoryId": "550-5520-0209",
        "CategoryType": "Wild Animal Park",
        "Description": "An establishment where wild animals are exhibited in an open environment for the public."
      },
      {
        "CategoryId": "550-5520-0210",
        "CategoryType": "Wildlife Refuge",
        "Description": "An establishment where animals are exhibited in their natural environment for the public."
      },
      {
        "CategoryId": "550-5520-0211",
        "CategoryType": "Aquarium",
        "Description": "An establishment where fish and other aquatic life are exhibited."
      },
      {
        "CategoryId": "550-5520-0212",
        "CategoryType": "Ski Resort",
        "Description": "An establishment that offers downhill skiing, snowboarding and other winter sports. Ski resorts generally include multiple ski lifts, lodging facilities and other related amenities. Ski resorts are often nationally or regionally recognized."
      },
      {
        "CategoryId": "550-5520-0228",
        "CategoryType": "Animal Park",
        "Description": "An establishment where various species of animals are exhibited for the public. Examples of animal parks include zoos, aquariums, wild animal parks or wildlife refuges."
      },
      {
        "CategoryId": "550-5520-0357",
        "CategoryType": "Water Park",
        "Description": "An establishment that provides access to recreational water areas. Water parks generally include water slides, splash pads, spray grounds (water playgrounds), lazy rivers or other related amenities."
      }
    
  
];

// update to add title and alias attributes
[hereRestCategories, hereDayCategories, hereMealCategories] = [hereRestCategories, hereDayCategories, hereMealCategories].map(categoryArray => 
  categoryArray.map(category => ({
    ...category,
    title: category.CategoryType,
    alias: category.CategoryId
  }))
);

hereFoodTypes = hereFoodTypes.map(foodType =>({
  ...foodType,
  title: foodType.FoodType,
  alias: foodType.FoodtypeID,
}));




  module.exports = {
    hereFoodTypes,
    hereMealCategories,
    hereRestCategories,
    hereDayCategories,
    
  };