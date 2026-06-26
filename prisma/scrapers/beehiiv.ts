import { ScrapedNewsletter } from "./types";

// Beehiiv's discover page is no longer publicly accessible.
// Instead, provide a curated list of well-known newsletters to fill
// category gaps not covered by Substack's API categories.
const CURATED_NEWSLETTERS: ScrapedNewsletter[] = [
  // AUTOMOTIVE
  { name: "Autoweek Daily", description: "Daily automotive news covering cars, racing, and the car culture community.", websiteUrl: "https://www.autoweek.com/newsletters", source: "beehiiv", sourceCategory: "automotive" },
  { name: "InsideEVs", description: "Electric vehicle news, reviews, and analysis for the EV-curious and EV-obsessed.", websiteUrl: "https://insideevs.com", source: "beehiiv", sourceCategory: "automotive" },
  { name: "The Drive Daily", description: "Cars, trucks, and automotive culture — reviews, news, and features.", websiteUrl: "https://www.thedrive.com", source: "beehiiv", sourceCategory: "automotive" },
  { name: "Jalopnik Daily", description: "Cars, culture, and everything in between from the world of automotive journalism.", websiteUrl: "https://jalopnik.com", source: "beehiiv", sourceCategory: "automotive" },
  { name: "Car and Driver Daily", description: "Expert car reviews, comparison tests, and automotive news.", websiteUrl: "https://www.caranddriver.com", source: "beehiiv", sourceCategory: "automotive" },
  { name: "Motor Trend Daily", description: "The latest in cars, trucks, SUVs and automotive trends.", websiteUrl: "https://www.motortrend.com", source: "beehiiv", sourceCategory: "automotive" },
  { name: "Electrek Daily", description: "Electric vehicles, autonomous cars, and clean energy news.", websiteUrl: "https://electrek.co", source: "beehiiv", sourceCategory: "automotive" },
  { name: "Top Gear Newsletter", description: "The world's greatest car magazine — news, reviews, and features.", websiteUrl: "https://www.topgear.com", source: "beehiiv", sourceCategory: "automotive" },

  // DESIGN
  { name: "Sidebar", description: "The five best design links, every day.", websiteUrl: "https://sidebar.io", source: "beehiiv", sourceCategory: "design" },
  { name: "UX Collective", description: "Curated stories on user experience, visual, and product design.", websiteUrl: "https://uxdesign.cc", source: "beehiiv", sourceCategory: "design" },
  { name: "Smashing Magazine", description: "Front-end development and web design articles, tutorials and resources.", websiteUrl: "https://www.smashingmagazine.com", source: "beehiiv", sourceCategory: "design" },
  { name: "Dense Discovery", description: "A weekly newsletter helping you be productive, feel inspired, and think critically.", websiteUrl: "https://www.densediscovery.com", source: "beehiiv", sourceCategory: "design" },
  { name: "Hey Designer", description: "Design news, tools, and resources curated for designers and front-end developers.", websiteUrl: "https://heydesigner.com", source: "beehiiv", sourceCategory: "design" },
  { name: "Designr Daily", description: "Daily design inspiration from across the web — UI, UX, branding, and more.", websiteUrl: "https://designrdaily.com", source: "beehiiv", sourceCategory: "design" },
  { name: "Fonts In Use", description: "An independent archive of typography indexed by typeface, format, and industry.", websiteUrl: "https://fontsinuse.com", source: "beehiiv", sourceCategory: "design" },
  { name: "Prototypr", description: "Design tools, articles, and resources for product designers and makers.", websiteUrl: "https://prototypr.io", source: "beehiiv", sourceCategory: "design" },

  // GAMING
  { name: "IGN Daily Fix", description: "The biggest gaming and entertainment news delivered daily.", websiteUrl: "https://www.ign.com", source: "beehiiv", sourceCategory: "gaming" },
  { name: "Kotaku Newsletter", description: "Gaming news, reviews, and culture from one of the web's top gaming sites.", websiteUrl: "https://kotaku.com", source: "beehiiv", sourceCategory: "gaming" },
  { name: "PC Gamer Newsletter", description: "PC gaming news, hardware reviews, and features from the authority on PC games.", websiteUrl: "https://www.pcgamer.com", source: "beehiiv", sourceCategory: "gaming" },
  { name: "GameSpot Newsletter", description: "Video game news, reviews, walkthroughs, and more.", websiteUrl: "https://www.gamespot.com", source: "beehiiv", sourceCategory: "gaming" },
  { name: "Rock Paper Shotgun", description: "PC gaming news, previews, reviews and more from the leading PC gaming site.", websiteUrl: "https://www.rockpapershotgun.com", source: "beehiiv", sourceCategory: "gaming" },
  { name: "Polygon Newsletter", description: "Gaming, entertainment, and internet culture — news, reviews, and features.", websiteUrl: "https://www.polygon.com", source: "beehiiv", sourceCategory: "gaming" },
  { name: "The Verge Gaming", description: "Gaming news and culture from The Verge's dedicated games coverage.", websiteUrl: "https://www.theverge.com/games", source: "beehiiv", sourceCategory: "gaming" },
  { name: "Nintendo Life", description: "Nintendo news, reviews, features, and more — the ultimate Nintendo fan site.", websiteUrl: "https://www.nintendolife.com", source: "beehiiv", sourceCategory: "gaming" },

  // TRAVEL
  { name: "Thrifty Traveler", description: "Flight deals and travel tips to help you travel more for less.", websiteUrl: "https://thriftytraveler.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "The Points Guy", description: "Maximize your travel with credit card points, airline miles, and travel rewards.", websiteUrl: "https://thepointsguy.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "Nomadic Matt", description: "Budget travel tips and destination guides for the independent traveler.", websiteUrl: "https://www.nomadicmatt.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "Condé Nast Traveler Daily", description: "Travel news, destination guides, and inspiration from the authority on travel.", websiteUrl: "https://www.cntraveler.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "Travel + Leisure Daily", description: "Hotels, flights, and vacation ideas — travel inspiration and practical tips.", websiteUrl: "https://www.travelandleisure.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "Lonely Planet Newsletter", description: "Travel inspiration and practical advice for independent travelers worldwide.", websiteUrl: "https://www.lonelyplanet.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "AFAR Newsletter", description: "Experiential travel — where to go, what to do, and how to travel more meaningfully.", websiteUrl: "https://www.afar.com", source: "beehiiv", sourceCategory: "travel" },
  { name: "Atlas Obscura", description: "The definitive guide to the world's hidden wonders — curious places, food, and history.", websiteUrl: "https://www.atlasobscura.com", source: "beehiiv", sourceCategory: "travel" },

  // EDUCATION
  { name: "Edutopia Newsletter", description: "Evidence-based learning strategies and classroom resources for educators.", websiteUrl: "https://www.edutopia.org", source: "beehiiv", sourceCategory: "education" },
  { name: "Chronicle of Higher Education", description: "News, opinion, and advice about higher education for faculty and administrators.", websiteUrl: "https://www.chronicle.com", source: "beehiiv", sourceCategory: "education" },
  { name: "Inside Higher Ed", description: "Higher education news, opinion, career advice, and events for academia.", websiteUrl: "https://www.insidehighered.com", source: "beehiiv", sourceCategory: "education" },
  { name: "The Hechinger Report", description: "In-depth education journalism covering innovation and inequality in education.", websiteUrl: "https://hechingerreport.org", source: "beehiiv", sourceCategory: "education" },
  { name: "EdSurge Newsletter", description: "Education technology news and the future of learning.", websiteUrl: "https://www.edsurge.com", source: "beehiiv", sourceCategory: "education" },
  { name: "Coursera Newsletter", description: "Learn new skills with online courses from top universities and companies.", websiteUrl: "https://www.coursera.org", source: "beehiiv", sourceCategory: "education" },

  // LIFESTYLE
  { name: "Cup of Jo", description: "A daily lifestyle blog about relationships, style, travel, and motherhood.", websiteUrl: "https://cupofjo.com", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "The Skimm Daily", description: "Breaking down the biggest stories and trends for the busy professional.", websiteUrl: "https://www.theskimm.com", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "Refinery29 Daily", description: "Fashion, beauty, entertainment, and wellness for the modern woman.", websiteUrl: "https://www.refinery29.com", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "Real Simple", description: "Practical solutions for everyday life — home, food, wellness, and style.", websiteUrl: "https://www.realsimple.com", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "Apartment Therapy Daily", description: "Home decor, design ideas, and organization tips for real people.", websiteUrl: "https://www.apartmenttherapy.com", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "Goop Newsletter", description: "Wellness, beauty, fashion, and food from Gwyneth Paltrow's lifestyle brand.", websiteUrl: "https://goop.com", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "The Strategist", description: "What to buy from shopping experts — recommendations and reviews of real products.", websiteUrl: "https://nymag.com/strategist", source: "beehiiv", sourceCategory: "lifestyle" },
  { name: "Wirecutter Deals", description: "The best deals on products recommended and tested by Wirecutter.", websiteUrl: "https://www.nytimes.com/wirecutter", source: "beehiiv", sourceCategory: "lifestyle" },

  // ENTERTAINMENT
  { name: "Vulture Newsletter", description: "Entertainment news, reviews, and commentary on TV, movies, music, and more.", websiteUrl: "https://www.vulture.com", source: "beehiiv", sourceCategory: "entertainment" },
  { name: "The Hollywood Reporter Daily", description: "Entertainment industry news — movies, TV, music, and the business behind it.", websiteUrl: "https://www.hollywoodreporter.com", source: "beehiiv", sourceCategory: "entertainment" },
  { name: "Variety Daily", description: "Entertainment news, film reviews, and show business analysis.", websiteUrl: "https://variety.com", source: "beehiiv", sourceCategory: "entertainment" },
  { name: "Deadline Daily", description: "Breaking entertainment news — film, TV, streaming, and talent deals.", websiteUrl: "https://deadline.com", source: "beehiiv", sourceCategory: "entertainment" },
  { name: "IndieWire Daily", description: "Independent film, TV, and documentary news, reviews, and criticism.", websiteUrl: "https://www.indiewire.com", source: "beehiiv", sourceCategory: "entertainment" },
  { name: "Consequence Newsletter", description: "Music, film, and TV news, reviews, and original content.", websiteUrl: "https://consequence.net", source: "beehiiv", sourceCategory: "entertainment" },

  // TECHNOLOGY (supplemental)
  { name: "TLDR Newsletter", description: "Byte-sized news for busy techies — the most interesting stories in tech, science, and coding.", websiteUrl: "https://tldr.tech", source: "beehiiv", sourceCategory: "technology" },
  { name: "The Neuron", description: "AI news and trends explained simply — stay ahead of the AI revolution.", websiteUrl: "https://www.theneurondaily.com", source: "beehiiv", sourceCategory: "technology" },
  { name: "Superhuman AI", description: "Learn AI in 5 minutes a day with practical guides and the latest news.", websiteUrl: "https://www.superhuman.ai", source: "beehiiv", sourceCategory: "technology" },
  { name: "Milk Road", description: "Crypto and web3 news made easy — daily updates in 5 minutes.", websiteUrl: "https://www.milkroad.com", source: "beehiiv", sourceCategory: "technology" },

  // BUSINESS (supplemental)
  { name: "Morning Brew", description: "The daily email that makes reading the news actually enjoyable — business, finance, and tech.", websiteUrl: "https://www.morningbrew.com", source: "beehiiv", sourceCategory: "business" },
  { name: "The Hustle", description: "Business and tech news delivered with a dose of wit and insight.", websiteUrl: "https://thehustle.co", source: "beehiiv", sourceCategory: "business" },
  { name: "Exec Sum", description: "Wall Street and finance career newsletter for ambitious professionals.", websiteUrl: "https://www.execsum.co", source: "beehiiv", sourceCategory: "business" },
  { name: "Chartr", description: "Data-driven stories about business, tech, and entertainment in chart form.", websiteUrl: "https://www.chartr.co", source: "beehiiv", sourceCategory: "business" },

  // FINANCE (supplemental)
  { name: "The Daily Upside", description: "Business and finance news with an analytical edge for the intellectually curious.", websiteUrl: "https://www.thedailyupside.com", source: "beehiiv", sourceCategory: "finance" },
  { name: "Finimize", description: "Financial news and investing insights simplified in 3-minute daily reads.", websiteUrl: "https://finimize.com", source: "beehiiv", sourceCategory: "finance" },
  { name: "The Motley Fool Daily", description: "Stock market insights, investing tips, and financial news.", websiteUrl: "https://www.fool.com", source: "beehiiv", sourceCategory: "finance" },
];

export async function scrapeBeehiiv(): Promise<ScrapedNewsletter[]> {
  console.log(
    `[curated] Providing ${CURATED_NEWSLETTERS.length} curated newsletters for underserved categories`
  );
  return CURATED_NEWSLETTERS;
}
