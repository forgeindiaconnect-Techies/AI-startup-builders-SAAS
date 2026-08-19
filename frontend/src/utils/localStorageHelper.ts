import { API_URL } from '../config/api';

const TOKEN_KEY = 'ai_startup_builder_jwt';

const authHeaders = (extra?: Record<string, string>): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const seedDemoStartups = () => {
  const mockStartups = [
    {
      id: 'startup_mock_1', startupId: 'startup_mock_1', founderId: 'founder_renu',
      startupName: 'Tourists', startupIdea: 'I want to start the tourists platform.',
      status: 'generated', approvalStatus: 'approved',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: {
        ideaAnalysis: {
          refinedIdea: 'Tourists is a next-generation travel platform connecting international travelers with local guides, customized off-beat itineraries, and experiential tourism options.',
          problemStatement: 'Travelers struggle to find authentic local experiences and reliable local guides, relying instead on crowded commercial tour packages.',
          solution: 'An intuitive platform that matches travelers with vetted local experts for personalized, safe, and unique cultural explorations.',
          targetCustomers: ['Solo travelers & backpackers', 'Adventure seekers', 'Cultural tourists', 'Family vacationers'],
          uniqueValueProposition: 'Live like a local: Safe, verified, and completely customized micro-tourism experiences at your fingertips.',
          businessModel: 'Commission-based Marketplace Model',
          revenueModel: '15% booking fee from guides, premium itinerary planner subscription, and travel insurance partnerships.',
          coreFeatures: ['Verified Local Guide Profiles', 'Live Itinerary Planner', 'Safe Escrow Payments', '24/7 Emergency Support'],
          marketOpportunity: 'Surging post-pandemic demand for authentic, experiential, and outdoor-centric tourism.',
          nextSteps: ['Complete Android/iOS app beta testing', 'Onboard initial 50 local guides in pilot cities', 'Launch tourism board partnership campaigns']
        },
        branding: {
          brandNameSuggestions: ['Tourists', 'LocalQuest', 'WanderLocal', 'GuideGo'],
          taglineSuggestions: ['Live the destination.', 'Your local travel co-pilot.', 'Authentic journeys start here.'],
          logoConceptIdeas: 'A minimal compass combined with a location pin in vibrant sky blue.',
          logoPrompt: 'Create a clean, modern, premium travel logo for Tourists featuring a compass location pin.',
          logoStyle: 'Modern Travel Minimalist',
          brandColorPalette: ['#0284C7 (Sky Blue)', '#F0F9FF (Ice)', '#FFFFFF (Pure White)', '#0F172A (Slate)'],
          fontStyleSuggestions: 'Outfit & Inter',
          brandPersonality: 'Adventurous, trustworthy, friendly, native.',
          packagingStyleSuggestions: 'Premium digital UI with stunning high-resolution local photography and smooth card transitions.',
          socialMediaIdeas: 'Short guide spotlight videos, traveler testimonial reels, and off-beat destination guides.',
          websiteHero: 'Wander like a local. Discover authentic adventures with Tourists.',
          marketingCaptions: ['Skip the tourist traps. ðŸ—ºï¸âœˆï¸', 'Meet your new local best friend.']
        },
        businessPlan: {
          executiveSummary: 'Tourists connects travelers with verified local hosts to deliver authentic micro-tours and experiential stays.',
          problemAndSolution: 'Solves the lack of authenticity and trust in traditional booking systems by offering peer-reviewed local matches.',
          productDetails: 'Mobile-first platform with video-profile matching, instant messaging, geolocation guide tracking, and automated translation.',
          targetCustomers: 'Millennial and Gen-Z travelers looking for unique cultural immersion.',
          businessModel: 'Two-sided marketplace taking a transaction fee on bookings.',
          pricingStrategy: 'Guides set their own rates; Tourists platform charges a flat 15% service fee.',
          goToMarketStrategy: 'Travel influencer sponsorships, destination-based SEO content, and local hostel partnerships.',
          operationsPlan: 'Customer support teams handling safety and dispute resolution, alongside automated host verification checklists.',
          teamRequirement: ['Co-founder & CTO', 'Operations Lead', 'Guide Acquisition Manager', 'Marketing Designer'],
          financialProjection: 'First year target of ₹240,000 gross merchandise value (GMV) with 30% month-over-month guide acquisition growth.',
          fundingAsk: '₹100,000 for guide onboarding operations, marketing launch, and regional scaling.'
        },
        pitchDeck: [
          { slide: 1, title: 'Tourists', content: 'Authentic Local Tourism Marketplace' },
          { slide: 2, title: 'The Problem', content: 'Commercial tour packages are generic, overcrowded, and isolate travelers from authentic culture.' },
          { slide: 3, title: 'The Solution', content: 'A peer-to-peer marketplace matching travelers with vetted local experts for custom experiences.' },
          { slide: 4, title: 'Market Size', content: '₹800B+ global experiential and adventure travel market.' },
          { slide: 5, title: 'Product Overview', content: 'Custom itinerary builder, interactive mapping, safety tracking, video profiles.' },
          { slide: 6, title: 'Business Model', content: '15% booking commission on all transactions.' },
          { slide: 7, title: 'Competitor Landscape', content: 'More localized and flexible than Airbnb Experiences, more affordable than traditional agencies.' },
          { slide: 8, title: 'Go-To-Market', content: 'Travel vlogger partnerships, localized SEO guides, digital ads.' },
          { slide: 9, title: 'Our Team', content: 'Ex-Booking.com product managers and local travel organizers.' },
          { slide: 10, title: 'The Ask', content: '₹100k for engineering, host acquisition, and pilot marketing.' }
        ],
        marketResearch: {
          tam: '₹50,00,00,000', sam: '₹12,00,00,000', som: '₹2,50,00,000',
          customerSegments: ['Solo backpackers', 'Cultural explorers', 'Experiential group travelers'],
          competitorAnalysis: 'Airbnb Experiences has high overhead; TripAdvisor is outdated. Tourists offers direct customization.',
          marketTrends: ['Experiential travel growth', 'Local guide demand', 'Eco-friendly/sustainable tourism'],
          opportunities: ['Partnerships with state tourism departments', 'Corporate team-building tours'],
          risks: ['Safety compliance verification', 'Seasonal travel fluctuations'],
          pricingSuggestions: 'Average guide tour: ₹1500-4000 per day. Platform commission: 15%.',
          locationSuggestions: 'Launch pilots in major historical/adventure hubs like Rajasthan, Kerala, and Himachal.'
        },
        aiReport: {
          investmentReadinessScore: 88,
          keyStrengths: ['Highly relevant tourism shift', 'Scalable P2P model', 'High-margin transaction fee structure'],
          riskFactors: ['Guide verification overhead', 'Geographical regulatory compliance'],
          improvementSuggestions: ['Standardize guide background checks', 'Create safety buttons and active tracking in app'],
          scalabilityScore: 85,
          fundingReadiness: 'Strong potential for seed-stage venture capital or startup accelerator backing.',
          mentorReviewSummary: 'Tourists is a highly scalable travel tech concept. Prioritize user safety features and guide quality control in the pilot phase.'
        }
      }
    },
    {
      id: 'startup_mock_2', startupId: 'startup_mock_2', founderId: 'founder_renu',
      startupName: 'Bakery', startupIdea: 'i want to start bakery shop, in the bakery shop add snacks, sweet, chips etc..',
      status: 'generated', approvalStatus: 'approved',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: {
        ideaAnalysis: {
          refinedIdea: 'Bakery is a modern retail and cafÃ© concept offering premium freshly baked breads, custom cakes, healthy tea-time snacks, sweets, and gourmet potato chips.',
          problemStatement: 'Local consumers lack access to premium, hygienic, and fresh baked goods that combine traditional bakery comfort with modern healthy snack alternatives.',
          solution: 'A hybrid neighborhood bakery & cafÃ© focusing on clean, premium ingredients, fresh daily baking, and a curated assortment of snacks and sweets.',
          targetCustomers: ['Neighborhood families', 'Office professionals', 'Evening snack lovers', 'Event/Birthday party organizers'],
          uniqueValueProposition: 'Freshly baked daily comfort foods, custom designs, and healthy organic snack options under one roof.',
          businessModel: 'Brick-and-Mortar Retail & Local Delivery',
          revenueModel: 'Direct over-the-counter sales, custom party orders, subscription-based daily bread delivery, and snack packaging retail.',
          coreFeatures: ['Open-view live kitchen', 'Self-service snack shelves', 'Custom cake studio', 'Loyalty app & home delivery'],
          marketOpportunity: 'High growth in premium bakery products and the rising demand for packaged premium snack assortments.',
          nextSteps: ['Finalize local commercial space lease', 'Acquire commercial ovens and display counters', 'Source high-quality dairy and flour suppliers']
        },
        branding: {
          brandNameSuggestions: ['The Crumb Bakery', 'Golden Crust', 'Sweet & Savory', 'Daily Bake'],
          taglineSuggestions: ['Baked fresh, every single day.', 'Your neighborhood sweet spot.', 'Fresh crusts, happy hearts.'],
          logoConceptIdeas: 'A warm golden rolling pin combined with a wheat stalk and a heart icon.',
          logoPrompt: 'Create a warm, premium bakery logo with a rolling pin and wheat stalk design.',
          logoStyle: 'Charming Vintage Modern',
          brandColorPalette: ['#D97706 (Warm Amber)', '#FEF3C7 (Cream)', '#374151 (Charcoal)', '#FFFFFF (White)'],
          fontStyleSuggestions: 'Lora & Montserrat',
          brandPersonality: 'Warm, cozy, premium, delicious.',
          packagingStyleSuggestions: 'Recyclable brown paper boxes with transparent windows and custom branded wax paper.',
          socialMediaIdeas: 'Hypnotic bread-rising time lapses, custom cake decorating reels, and weekend recipe shares.',
          websiteHero: 'Freshly baked daily with love. Taste the warmth at Bakery.',
          marketingCaptions: ['Warm bread cures everything. ðŸžâ¤ï¸', 'Custom cakes made just for you.']
        },
        businessPlan: {
          executiveSummary: 'Bakery is a local culinary brand providing freshly baked goods, high-quality sweets, and packaged snacks to families and events.',
          problemAndSolution: 'Combines fresh baking with snack accessibility, eliminating stale shelf products.',
          productDetails: 'Artisan sourdough, traditional sweets, custom cakes, and low-sodium crispy vegetable chips.',
          targetCustomers: 'Local residents seeking high-quality evening snacks and premium celebration cakes.',
          businessModel: 'Direct retail sales, takeaway, and local hyper-local delivery apps.',
          pricingStrategy: 'Competitive mid-premium pricing justified by raw ingredient quality and freshness.',
          goToMarketStrategy: 'Free tasting boxes to local housing societies, grand opening discount, and Google Maps local SEO.',
          operationsPlan: 'Kitchen opens at 4 AM for morning baking, retail operational from 8 AM to 9 PM, managed by a head pastry chef.',
          teamRequirement: ['Head Baker / Pastry Chef', 'Kitchen Assistant', 'Counter Sales Representative', 'Delivery Executive'],
          financialProjection: 'First year sales target of ₹150,000 with steady monthly margins of 25% from recurring customers.',
          fundingAsk: '₹50,000 for commercial baking equipment, shop renovation, and initial raw ingredients.'
        },
        pitchDeck: [
          { slide: 1, title: 'Bakery', content: 'Fresh Neighborhood Bakery & Curated Snacks' },
          { slide: 2, title: 'The Problem', content: 'Mass-manufactured baked goods lack taste, contain preservatives, and local shops lack hygiene.' },
          { slide: 3, title: 'The Solution', content: 'A transparent, hygienic live bakery offering fresh artisan items alongside high-quality sweets and chips.' },
          { slide: 4, title: 'Market Size', content: '₹8B rising domestic bakery and snack food market.' },
          { slide: 5, title: 'Product Line', content: 'Breads, celebration cakes, traditional sweets, packaged premium chips, healthy cookies.' },
          { slide: 6, title: 'Business Model', content: 'DTC Retail, custom event orders, subscription packages.' },
          { slide: 7, title: 'Traction', content: 'Pre-launch social media interest, partnerships with 3 local event planners.' },
          { slide: 8, title: 'Go-To-Market', content: 'Neighborhood tastings, active local SEO, geo-targeted social media.' },
          { slide: 9, title: 'Our Team', content: 'Experienced baker with 10 years of hotel pastry experience.' },
          { slide: 10, title: 'The Ask', content: '₹50k for machinery, interior setup, and initial marketing.' }
        ],
        marketResearch: {
          tam: '₹12,00,00,000', sam: '₹3,00,00,000', som: '₹45,00,000',
          customerSegments: ['Families', 'Event managers', 'Local tea-time snackers'],
          competitorAnalysis: 'Chain bakeries are factory-produced; local sweet shops lack baked assortments. We win on variety and fresh kitchen.',
          marketTrends: ['Clean label products', 'Gourmet tea-time snacks', 'Custom celebration orders'],
          opportunities: ['Monthly subscription breakfast baskets', 'B2B supply to local cafes'],
          risks: ['High perishability of fresh products', 'Ingredient price inflation (butter/sugar)'],
          pricingSuggestions: 'Breads: ₹60-120, Cakes: ₹600-1200/kg, Snacks: ₹80-180/box.',
          locationSuggestions: 'High-density residential complexes, neighborhood high street with parking.'
        },
        aiReport: {
          investmentReadinessScore: 82,
          keyStrengths: ['High daily repeat transactions', 'Strong margin on custom orders', 'Diverse snack catalog'],
          riskFactors: ['High waste management/perishables', 'Staff retention in baking operations'],
          improvementSuggestions: ['Implement real-time inventory management software', 'Pre-sell custom event packages to local corporate offices'],
          scalabilityScore: 70,
          fundingReadiness: 'Excellent match for local banks, MSME loans, and small business partners.',
          mentorReviewSummary: 'Bakery is a solid neighborhood business. Focus heavily on waste control, recipe consistency, and local high-street foot traffic.'
        }
      }
    },
    {
      id: 'startup_mock_3', startupId: 'startup_mock_3', founderId: 'founder_renu',
      startupName: 'RESTURANT', startupIdea: 'I want to start the startup business but i have no idea about that tell me how to start the business',
      status: 'generated', approvalStatus: 'approved',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: {
        ideaAnalysis: {
          refinedIdea: 'RESTURANT is a premium casual dining restaurant startup featuring a modern multi-cuisine menu, interactive digital ordering, and a design-forward dine-in experience.',
          problemStatement: 'Aspiring restaurant founders struggle to plan, license, and structure a restaurant concept from scratch without industry experience, leading to high failure rates.',
          solution: 'A step-by-step optimized restaurant model starting with a highly curated flagship menu, pre-integrated POS system, and detailed setup guidance.',
          targetCustomers: ['Families & group diners', 'Young professionals', 'Food enthusiasts', 'Event organizers'],
          uniqueValueProposition: 'Delivering exceptional flavor profiles and interactive customer service in an upscale, aesthetic environment.',
          businessModel: 'Full-Service Dine-in & Delivery Model',
          revenueModel: 'Dine-in menu sales, online food delivery channels, private event hosting, and catering packages.',
          coreFeatures: ['Interactive QR-code ordering', 'Curated chef specialties', 'Aesthetic dine-in layout', 'Integrated food delivery logistics'],
          marketOpportunity: 'Growing urban culture of dining out, weekend experiential dining, and high online delivery order volume.',
          nextSteps: ['Create a solid kitchen recipe menu card', 'Acquire municipal health and trade licenses', 'Hire kitchen manager & floor supervisor']
        },
        branding: {
          brandNameSuggestions: ['RESTURANT', 'The Table', 'Urban Feast', 'Palate Central'],
          taglineSuggestions: ['Experience fine dining.', 'Good food, great memories.', 'A taste of luxury.'],
          logoConceptIdeas: 'A minimal fork and knife icon forming an abstract crown in gold color.',
          logoPrompt: 'Create a luxurious gold restaurant logo with a clean serif font.',
          logoStyle: 'Upscale Modern Casual',
          brandColorPalette: ['#B45309 (Warm Gold)', '#1E293B (Slate)', '#F8FAFC (Off-White)', '#FFFFFF (Pure White)'],
          fontStyleSuggestions: 'Lora & Inter',
          brandPersonality: 'Luxurious, welcoming, professional, delicious.',
          packagingStyleSuggestions: 'Sturdy, branded paper board boxes with gold foil embossing and heat-retaining technology.',
          socialMediaIdeas: 'Chef introduction videos, recipe sneak peeks, aesthetic restaurant dining reviews.',
          websiteHero: 'Welcome to RESTURANT. Where every meal is an experience.',
          marketingCaptions: ['Savor the flavor. ðŸ½ï¸âœ¨', 'Reserve your table today.']
        },
        businessPlan: {
          executiveSummary: 'RESTURANT is a premium dine-in and casual dining concept bringing high-quality multi-cuisine items to urban food lovers.',
          problemAndSolution: 'Eliminates the complexity of traditional restaurant setup by using modern standardized kitchen operations.',
          productDetails: 'Multi-cuisine premium menu, local specialty drinks, custom cocktails, and seasonal chef items.',
          targetCustomers: 'Urban families and corporate diners looking for high-quality food and ambient service.',
          businessModel: 'Dine-in services coupled with hyper-local delivery apps.',
          pricingStrategy: 'Premium value pricing matching mid-high tier local averages.',
          goToMarketStrategy: 'Pre-launch tasting event, local food blogger reviews, social media launch offers.',
          operationsPlan: 'Open 11 AM to 11 PM daily. High kitchen hygiene standards with automated temperature-control storages.',
          teamRequirement: ['Head Chef', 'Sous Chef', 'F&B Manager', 'Waitstaff (4x)', 'Cleaning Assistant'],
          financialProjection: 'First year target sales of ₹320,000 with a projected net profit margin of 18% in Year 1.',
          fundingAsk: '₹120,000 for space lease deposit, interior buildout, commercial kitchen prep systems, and launch marketing.'
        },
        pitchDeck: [
          { slide: 1, title: 'RESTURANT', content: 'Modern Dine-in Experience & Fine Flavors' },
          { slide: 2, title: 'The Problem', content: 'Lack of premium, high-hygiene multi-cuisine dining options with family-friendly ambiance.' },
          { slide: 3, title: 'The Solution', content: 'A beautifully designed dine-in space with curated chef specialties and interactive digital order flows.' },
          { slide: 4, title: 'Market Size', content: '₹30B+ rapidly growing urban dining and restaurant industry.' },
          { slide: 5, title: 'Our Menu', content: 'Appetizers, chef specials, artisanal beverages, curated desserts.' },
          { slide: 6, title: 'Business Model', content: 'Dine-in revenue (75%) + online deliveries & catering (25%).' },
          { slide: 7, title: 'Competitor Analysis', content: 'We win on ingredient sourcing transparency, premium dining service, and unique menu items.' },
          { slide: 8, title: 'Go-To-Market', content: 'Blogger reviews, grand launch night, corporate discount tie-ups.' },
          { slide: 9, title: 'Our Team', content: 'Led by an executive chef with 15 years of fine dining kitchen management.' },
          { slide: 10, title: 'The Ask', content: '₹120k for space setup, equipment lease, and 3 months runway.' }
        ],
        marketResearch: {
          tam: '₹35,00,00,000', sam: '₹9,00,00,000', som: '₹1,20,00,000',
          customerSegments: ['Corporate teams', 'Families', 'Food bloggers & young couples'],
          competitorAnalysis: 'Chain diners lack personalized service; local eateries lack branding. RESTURANT bridges the gap.',
          marketTrends: ['Experiential casual dining', 'QR-code order adoption', 'Chef-driven menu specialization'],
          opportunities: ['Hosting private anniversary/corporate parties', 'Premium weekend buffet events'],
          risks: ['High initial location lease rates', 'Staff attrition in the kitchen'],
          pricingSuggestions: 'Average customer order value: ₹600-1200. Dine-in target.',
          locationSuggestions: 'Commercial malls, popular office park food arenas, or upscale residential avenues.'
        },
        aiReport: {
          investmentReadinessScore: 88,
          keyStrengths: ['Experienced executive chef', 'Scalable dining concept', 'Balanced dine-in/delivery revenue mix'],
          riskFactors: ['High upfront CapEx requirements', 'Employee retention challenges'],
          improvementSuggestions: ['Design pre-packaged catering menus for office parks', 'Offer a digital loyalty club membership on launch'],
          scalabilityScore: 75,
          fundingReadiness: 'Ready for retail franchise partners, angel backers, and commercial term loans.',
          mentorReviewSummary: 'RESTURANT has strong fundamentals. Prioritize a high-traffic prime location and keep kitchen inventory tightly managed to ensure early cash flow.'
        }
      }
    },
    {
      id: 'startup_mock_4', startupId: 'startup_mock_4', founderId: 'founder_renu',
      startupName: 'Breaktime', startupIdea: 'I have an idea to start the startup busniess like premium tea, coffee, and snacks brand.',
      status: 'generated', approvalStatus: 'approved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      aiGenerated: {
        ideaAnalysis: {
          refinedIdea: 'Breaktime is a sophisticated, welcoming local premium tea, coffee, and snacks brand focusing on high-quality organic beverages and quick premium refreshments.',
          problemStatement: 'Urban professionals lack high-quality, quick-service tea and coffee options that are premium yet quickly accessible during their daily work breaks.',
          solution: 'A highly aesthetic, premium kiosk and cafe concept serving organic loose-leaf tea, single-origin coffee, and healthy snack assortments.',
          targetCustomers: ['Office workers', 'Students', 'Daily commuters', 'Premium shoppers'],
          uniqueValueProposition: 'Sophisticated aesthetics, premium ingredients, and exceptionally fast break-time service.',
          businessModel: 'Quick Service Restaurant (QSR) & Delivery',
          revenueModel: 'Counter sales, daily beverage subscriptions, event packages, and branded retail merchandise.',
          coreFeatures: ['Rapid-brew espresso systems', 'Artisanal snack pairings', 'Mobile pre-order app', 'Aesthetic packaging'],
          marketOpportunity: 'Surging demand for specialty coffee and high-end tea concepts among corporate workforces.',
          nextSteps: ['Establish supplier deals for single-origin beans', 'Design prototype modular QSR kiosk', 'Submit initial municipality health certifications']
        },
        branding: {
          brandNameSuggestions: ['Breaktime', 'Brew & Pause', 'Tea & Coffee Co.', 'The Breakroom'],
          taglineSuggestions: ['Your daily escape.', 'Premium brew, fast pause.', 'Taste the difference.'],
          logoConceptIdeas: 'An elegant clock icon with a steaming coffee cup inside.',
          logoPrompt: 'Create a clean, premium modern logo for Breaktime featuring a coffee cup clock design.',
          logoStyle: 'Minimalist Modern Premium',
          brandColorPalette: ['#4B2E1E (Coffee Brown)', '#F5E6C8 (Warm Cream)', '#D4AF37 (Gold)', '#111111 (Jet Black)'],
          fontStyleSuggestions: 'Playfair Display & Inter',
          brandPersonality: 'Welcoming, premium, cozy, fast.',
          packagingStyleSuggestions: 'Eco-friendly cardboard beverage holders and cups with minimal logo branding.',
          socialMediaIdeas: 'Aesthetic preparation clips, office break reels, seasonal drink announcements.',
          websiteHero: 'Elevate your daily break. Discover Breaktime.',
          marketingCaptions: ['Sip, relax, repeat. â˜•ðŸ•’', 'Your workspace refreshment partner.']
        },
        businessPlan: {
          executiveSummary: 'Breaktime will launch a network of high-end, rapid-service beverage kiosks inside premium corporate hubs and shopping locations.',
          problemAndSolution: 'Solves the long wait times and poor beverage quality of corporate cafeterias.',
          productDetails: 'Organic specialty teas, single-origin espresso drinks, gluten-free cookies, and baked snacks.',
          targetCustomers: 'High-income office workers and transit commuters.',
          businessModel: 'Low-overhead kiosk retail and office delivery.',
          pricingStrategy: 'Value-premium pricing with customer loyalty card benefits.',
          goToMarketStrategy: 'Free tea/coffee cards for nearby office HR departments, social media ads.',
          operationsPlan: 'Open 8 AM to 7 PM. Fully automated brewers to ensure consistency and speed.',
          teamRequirement: ['Kiosk Manager', 'Lead Barista', 'Junior Server'],
          financialProjection: 'First year sales target of ₹95,000 per kiosk, with cash flow positive state by Month 3.',
          fundingAsk: '₹35,000 for kiosk construction, espresso machines, and launch marketing.'
        },
        pitchDeck: [
          { slide: 1, title: 'Breaktime', content: 'Premium Tea, Coffee, and Snacks Kiosks' },
          { slide: 2, title: 'The Problem', content: 'Office workers waste time waiting in long cafe lines, or drink poor quality cafeteria beverages.' },
          { slide: 3, title: 'The Solution', content: 'High-end modular kiosks serving organic brews in under 90 seconds.' },
          { slide: 4, title: 'Market Opportunity', content: 'Growing Indian urban QSR and specialty beverage segments.' },
          { slide: 5, title: 'Product offering', content: 'Espressos, premium organic teas, custom pastries, healthy snack cups.' },
          { slide: 6, title: 'Low CapEx model', content: 'Modular kiosks allow cheap setup and quick launch.' },
          { slide: 7, title: 'Competitor Analysis', content: 'Faster than premium dine-in cafes; significantly higher quality than typical office tea stalls.' },
          { slide: 8, title: 'Go-To-Market', content: 'Corporate vouchers, office HR partnerships, local SEO.' },
          { slide: 9, title: 'Our Team', content: 'Experienced QSR operators and food supply coordinators.' },
          { slide: 10, title: 'The Ask', content: '₹35k for the prototype kiosk construction and equipment.' }
        ],
        marketResearch: {
          tam: '₹8,00,00,000', sam: '₹2,00,00,000', som: '₹35,00,000',
          customerSegments: ['Corporate employees', 'Shoppers', 'Daily transit travelers'],
          competitorAnalysis: 'Local chai wallahs lack hygiene; Starbucks is too expensive and slow. Breaktime wins on speed and quality.',
          marketTrends: ['Rise of gourmet coffee habits', 'Preference for quick grab-and-go QSRs'],
          opportunities: ['In-office catering carts', 'Corporate monthly drink plans'],
          risks: ['High rentals in top commercial parks', 'Employee turnover'],
          pricingSuggestions: 'Teas: ₹60-120, Coffees: ₹120-220, Snacks: ₹50-150.',
          locationSuggestions: 'Corporate tech park lobbies, transit terminal gates, mall entrances.'
        },
        aiReport: {
          investmentReadinessScore: 85,
          keyStrengths: ['Low CapEx kiosk model', 'High gross margin on hot beverages', 'Strong customer repeat rate'],
          riskFactors: ['Location rent volatility', 'Raw ingredient quality sourcing consistency'],
          improvementSuggestions: ['Pre-onboard corporate clients for delivery subscriptions', 'Select modular structures that are easy to relocate'],
          scalabilityScore: 80,
          fundingReadiness: 'Ready for micro VC backing, private franchise partners, and local business development funds.',
          mentorReviewSummary: 'Breaktime is a highly efficient retail concept. Prioritize location scouting and fast service times to secure early repeat revenue.'
        }
      }
    }
  ];
  mockStartups.forEach(s => {
    localStorage.setItem(s.id, JSON.stringify(s));
  });
  return mockStartups;
};

const normalizeStartup = (startup: any): any => {
  if (!startup) return startup;
  const startupId = startup.startupId || startup._id;
  return { ...startup, startupId, id: startup.id || startupId };
};

export const sanitizeStartupId = (raw: string | null | undefined): string | null => {
  return raw && raw !== 'undefined' && raw !== 'null' ? raw : null;
};

export const getStartups = async () => {
  try {
    const res = await fetch(`${API_URL}/startups`);
    const data = await res.json();
    if (data.success) {
      return (Array.isArray(data.data) ? data.data : []).map(normalizeStartup);
    }
  } catch (e) {
    console.error('Error fetching startups', e);
  }
  return [];
};

export const saveStartups = async (startups: any[]) => {
  // Not heavily used, typically we update individual startups
  console.warn('saveStartups array helper is deprecated, update individual startups via API');
};

export const getStartupById = async (startupId: string) => {
  if (!sanitizeStartupId(startupId)) return null;
  try {
    const res = await fetch(`${API_URL}/startups/${startupId}`);
    const data = await res.json();
    if (data.success) return normalizeStartup(data.data);
  } catch (e) {
    console.error('Error fetching startup by id', e);
  }
  return null;
};

export const createStartupDraft = async (startupName: string, startupIdea: string, founderId?: string) => {
  try {
    const res = await fetch(`${API_URL}/startups/create-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ startupName, startupIdea, founderId: founderId || undefined })
    });
    const data = await res.json();
    if (data.success) {
      return { id: data.data.startupId, ...data.data };
    }
  } catch (e) {
    console.error('Error creating startup draft', e);
  }
  return null;
};

export const updateStartup = async (startupId: string, updatedData: any) => {
  if (!sanitizeStartupId(startupId)) return null;
  try {
    const res = await fetch(`${API_URL}/startups/${startupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const data = await res.json();
    if (data.success) return normalizeStartup(data.data);
  } catch (e) {
    console.error('Error updating startup', e);
  }
  return null;
};

export const seedDemoNotifications = () => {
  const now = new Date();
  const demoNotifs = [
    {
      id: `notif_seed_1`,
      userId: 'admin',
      title: 'New Startup Idea Submitted',
      message: 'Tourists: I want to start the tourists platform. â€” submitted by Renu (Founder)',
      type: 'ai_builder',
      isRead: false,
      actionUrl: '/dashboard/admin/startups',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_2`,
      userId: 'admin',
      title: 'New Startup Idea Submitted',
      message: 'Bakery: i want to start bakery shop, in the bakery shop add snacks, sweet, chips etc.. â€” submitted by Renu (Founder)',
      type: 'ai_builder',
      isRead: false,
      actionUrl: '/dashboard/admin/startups',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_3`,
      userId: 'admin',
      title: 'Founder Generated Startup Plan',
      message: 'RESTURANT: Premium casual dining restaurant startup (Food / Restaurant / Cafe)',
      type: 'ai_builder',
      isRead: false,
      actionUrl: '/dashboard/admin/startups',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_4`,
      userId: 'admin',
      title: 'Founder Generated Startup Plan',
      message: 'Breaktime: Premium tea, coffee, and snacks brand (Food / Restaurant / Cafe)',
      type: 'ai_builder',
      isRead: true,
      actionUrl: '/dashboard/admin/startups',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_5`,
      userId: 'admin',
      title: 'New User Registration Pending',
      message: 'Renu has signed up as a Founder and is awaiting approval.',
      type: 'user_approval',
      isRead: true,
      actionUrl: '/dashboard/admin/approvals',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_6`,
      userId: 'all',
      title: 'Platform Update',
      message: 'AI Startup Builder v2.0 is live! New features: Legal Docs Generator, AI Chat, and improved Market Research.',
      type: 'platform',
      isRead: false,
      actionUrl: '/dashboard/founder/ai-builder',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_7`,
      userId: 'founder_demo_user',
      title: 'Startup Plan Generated Successfully',
      message: 'AI has generated your startup plan, roadmap, tasks, and milestones for Tourists.',
      type: 'ai_builder',
      isRead: false,
      actionUrl: '/dashboard/founder/ai-builder?startupId=startup_mock_1',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_8`,
      userId: 'founder_demo_user',
      title: 'Funding Offer Received',
      message: 'Breaktime has received a term sheet from an investor. Review your funding offers.',
      type: 'funding',
      isRead: false,
      actionUrl: '/dashboard/founder/funding',
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
    },
  ];
  localStorage.setItem('ai_startup_builder_notifications', JSON.stringify(demoNotifs));
  return demoNotifs;
};

export const getNotifications = async (userId?: string) => {
  try {
    const url = userId ? `${API_URL}/notifications?userId=${encodeURIComponent(userId)}` : `${API_URL}/notifications`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error fetching notifications', e);
  }
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('ai_startup_builder_notifications');
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) return seedDemoNotifications();
    return parsed;
  } catch (e) {
    return [];
  }
};

export const addNotification = async (notification: any) => {
  try {
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification)
    });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error adding notification', e);
  }
  // Fallback to localStorage
  const current = localStorage.getItem('ai_startup_builder_notifications');
  const parsed = current ? JSON.parse(current) : [];
  const updated = [notification, ...parsed];
  localStorage.setItem('ai_startup_builder_notifications', JSON.stringify(updated));
  return notification;
};

export const getUsers = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
  } catch (e) {
    console.error('Error fetching users', e);
  }
  return [];
};

export const markNotificationRead = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error marking notification as read', e);
  }
};

export const markAllNotificationsRead = async (userId: string) => {
  try {
    const res = await fetch(`${API_URL}/notifications/mark-all-read?userId=${encodeURIComponent(userId)}`, { method: 'PATCH' });
    const data = await res.json();
    return data.success;
  } catch (e) {
    console.error('Error marking all notifications as read', e);
  }
};

// â”€â”€â”€ Funding Offers API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getFundingOffers = async (founderId?: string, investorId?: string) => {
  try {
    let url = `${API_URL}/funding`;
    const params = new URLSearchParams();
    if (founderId) params.append('founderId', founderId);
    if (investorId) params.append('investorId', investorId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      try {
        localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(data.data));
      } catch (err) {}
      return data.data;
    }
  } catch (e) {
    console.error('Error fetching funding offers', e);
  }
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('ai_startup_builder_funding_offers');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const createFundingOffer = async (offerData: any) => {
  try {
    const res = await fetch(`${API_URL}/funding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData)
    });
    const data = await res.json();
    if (data.success) {
      try {
        const stored = localStorage.getItem('ai_startup_builder_funding_offers');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(data.data);
        localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(list));
      } catch (err) {}
      return data.data;
    }
  } catch (e) {
    console.error('Error creating funding offer', e);
  }
  
  // Offline fallback
  const fallbackOffer = {
    id: offerData.id || `offer_${Date.now()}`,
    dueDiligenceStatus: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: '',
    paymentReference: '',
    paymentProof: '',
    paymentDate: '',
    verificationStatus: 'Pending',
    stage: offerData.stage || 'Seed',
    commitmentId: offerData.commitmentId || '',
    transactionId: offerData.transactionId || '',
    fundingRound: offerData.fundingRound || 'Seed',
    expectedInvestmentDate: offerData.expectedInvestmentDate || '',
    commitmentNotes: offerData.commitmentNotes || '',
    agreementAcknowledged: offerData.agreementAcknowledged || false,
    history: offerData.history || [
      {
        action: offerData.status || 'offer_received',
        performedBy: offerData.investorName || 'Investor',
        role: 'Investor',
        message: 'Investor sent funding offer.',
        createdAt: new Date().toISOString(),
      }
    ],
    status: offerData.status || 'offer_received',
    agreementStatus: offerData.agreementStatus || 'Sent to Founder',
    ...offerData,
    createdAt: offerData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  try {
    const stored = localStorage.getItem('ai_startup_builder_funding_offers');
    const list = stored ? JSON.parse(stored) : [];
    list.unshift(fallbackOffer);
    localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(list));
  } catch (err) {}
  return fallbackOffer;
};

export const updateFundingOffer = async (id: string, updates: any) => {
  try {
    const res = await fetch(`${API_URL}/funding/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success) {
      try {
        const stored = localStorage.getItem('ai_startup_builder_funding_offers');
        let list = stored ? JSON.parse(stored) : [];
        list = list.map((item: any) => (item._id === id || item.id === id) ? { ...item, ...data.data } : item);
        localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(list));
      } catch (err) {}
      return data.data;
    }
  } catch (e) {
    console.error('Error updating funding offer', e);
  }
  
  // Offline fallback
  try {
    const stored = localStorage.getItem('ai_startup_builder_funding_offers');
    let list = stored ? JSON.parse(stored) : [];
    let updatedObj: any = null;
    list = list.map((item: any) => {
      if (item._id === id || item.id === id) {
        updatedObj = { ...item, ...updates, updatedAt: new Date().toISOString() };
        return updatedObj;
      }
      return item;
    });
    localStorage.setItem('ai_startup_builder_funding_offers', JSON.stringify(list));
    return updatedObj;
  } catch (err) {
    return null;
  }
};

export const detectStartupCategory = (startup: any): string => {
  const text = (startup.startupIdea || startup.startupName || '').toLowerCase();

  if (/restaurant|cafe|coffee|tea|snack|bakery|food|cook|kitchen|dining|bar |pub |pizza|burger|bistro|delivery food|food deliver|catering|mess |tiffin|juice|smoothie|ice cream|sweet|confection|dessert|brew|roast|grill|BBQ|tandoor|shawarma|momos|noodle|rice|curry|spice|masala|organic food|health food|pet food|packaged food|food truck|food stall|food cart|cloud kitchen|dark kitchen|home kitchen|tiffin service|canteen|cafeteria/.test(text)) {
    return 'Food / Restaurant / Cafe';
  }
  if (/saas|software|ai |artificial intelligence|machine learning|deep learning|app |application|platform|cloud|api |data |analytics|automation|blockchain|web3|iot|cyber|mobile app|web app|web development|mobile development|devops|fintech platform|edtech platform|healthtech|martech|hrtech|cleantech|gam|vr |ar |virtual reality|augmented reality|chatbot|chat bot|saas platform|erp|crm|cms|lms platform|project management|team collaboration|productivity tool|no code|low code|no-code|low-code|open source|developer tool|api platform/.test(text)) {
    return 'SaaS / Software / AI';
  }
  if (/hospital|clinic|health|medical|doctor|nurse|dental|therapy|wellness|telemedicine|diagnostic|pharma|drug|medicine|ayurved|yoga|fitness|gym|mental health|counsel|psych|nutrition|diet|supplement|ambulance|health care|healthcare|biotech|medtech|surgical|patholog|radiolog|blood bank|organ|transplant|nursing|elder care|senior care|child care|pediatr/.test(text)) {
    return 'Healthcare / Clinic / Hospital';
  }
  if (/ecommerce|e-commerce|online store|marketplace|shopping|retail online|dropship|online shop|online sell|online buy|product listing|multi vendor|vendor platform|buy and sell|auction|b2c marketplace|b2b marketplace|grocery delivery|fashion store|electronics store/.test(text)) {
    return 'E-commerce';
  }
  if (/education|training|learning|school|college|course|tutor|academy|edtech|lms|coaching|institute|university|exam|test prep|competitive exam|skill development|vocational|certification|bootcamp|workshop|seminar|webinar|e-learning|online class|online teach|student|classroom/.test(text)) {
    return 'Education / Training';
  }
  if (/manufactur|factory|production|supply chain|warehouse|industrial|assembly|fabricat|textile|garment|plastic|metal|steel|cement|chemical|pharmaceutical|auto part|component|raw material|plant |mill |packaging|label|batch/.test(text)) {
    return 'Manufacturing';
  }
  if (/retail |shop |store |boutique|supermarket|grocery|convenience store|showroom|outlet|franchise|department store|general store|kirana|mom and pop|local shop|brick and mortar|physical store|retail business|retail shop|retail store/.test(text)) {
    return 'Retail / Local Shop';
  }
  if (/transport|delivery|ride|cab |bike |logistics|fleet|shipping|courier|trucking|freight|moving|relocation|pool|carpool|taxi|auto rickshaw|two wheeler|three wheeler|last mile|first mile|warehousing|cold chain|supply|dispatch/.test(text)) {
    return 'Transport / Delivery';
  }
  if (/finance|fintech|banking|payment|invest|insur|loan|credit|wealth|crypto|lending|neobank|digital bank|upi|wallet|fund|mutual fund|stock|share|trading|forex|remittance|collection|recovery|audit|accounting|tax |gst |ca service|bookkeep|payroll/.test(text)) {
    return 'Finance / FinTech';
  }
  if (/service|consulting|agency|freelanc|cleaning|maintenance|repair|plumb|electric|architect|interior|landscap|Event|wedding|photography|videography|beauty|salon|spa |parlor|tailor|laundry|dry clean|pest control|security|guard|packers|movers|travel|tour|hotel|resort|lodg|guest house|homestay|hostel|real estate|property|broker|co working|cowork|storage/.test(text)) {
    return 'Service Business';
  }
  return 'Other';
};

export const CATEGORY_DOCUMENT_MAP: Record<string, { essential: Array<{ name: string; reason: string; applyLink?: string }>; optional: Array<{ name: string; reason: string; applyLink?: string }> }> = {
  'Food / Restaurant / Cafe': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'FSSAI Registration / License', reason: 'Mandatory food safety license for any business involved in food preparation, processing, or distribution.', applyLink: 'https://foscos.fssai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law to legally operate a commercial establishment.', applyLink: 'https://services.india.gov.in/service/detail/registration-of-shops-and-establishments-under-shops-and-establishment-act-4248' },
      { name: 'Trade License', reason: 'Local municipal authority permission to carry on a specific trade or business.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-trade-license-under-municipal-corporation-act' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for inter-state sales and input tax credit.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Rent Agreement / NOC from Owner', reason: 'Proof of premises for FSSAI, GST, and Shop & Establishment registration.', applyLink: '' },
      { name: 'Business Bank Account Proof', reason: 'Current account in the business name for transactions, GST, and compliance.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes including subsidized loans and tax relief.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Certificate', reason: 'Protect your brand name, logo, and tagline from competitors.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required by municipal authority for restaurants and dining establishments.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-fire-safety-certificate' },
      { name: 'Pollution Certificate', reason: 'Required if your business generates waste or emissions.', applyLink: 'https://cpcb.gov.in/' },
      { name: 'Health / Trade Insurance', reason: 'Protects against liability, property damage, and employee injuries.', applyLink: 'https://www.indiafilings.com/learn/insurance-for-businesses' },
    ],
  },
  'SaaS / Software / AI': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Company Incorporation ( Pvt Ltd / LLP )', reason: 'Legal entity registration for raised funding, signing contracts, and limiting liability.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for SaaS billing, interstate transactions, and input tax credit.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your product name, logo, and brand from competitors in the tech space.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account in the company name for investor funds, subscriptions, and vendor payments.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Legally required for any SaaS product handling user data. Needed for app stores and payment gateways.', applyLink: 'https://www.indiafilings.com/learn/privacy-policy-drafting' },
      { name: 'SOC2 / Data Protection Compliance', reason: 'Required for enterprise sales and handling sensitive customer data.', applyLink: 'https://www.indiafilings.com/learn/data-protection-compliance' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes including subsidized loans and tax relief.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Startup India Registration', reason: 'Tax holidays, self-certification for labor laws, and easier IP protection.', applyLink: 'https://www.startupindia.gov.in/' },
      { name: 'ISO Certification', reason: 'Quality management certification that builds trust with enterprise clients.', applyLink: '' },
      { name: 'Copyright Registration', reason: 'Protect your source code and software from unauthorized copying.', applyLink: 'https://copyright.gov.in/' },
    ],
  },
  'Healthcare / Clinic / Hospital': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Clinical Establishment Registration', reason: 'Mandatory registration under the Clinical Establishments Act for healthcare facilities.', applyLink: 'https://www.indiafilings.com/learn/clinical-establishment-registration' },
      { name: 'Medical Council Registration', reason: 'Practitioners must be registered with the State or National Medical Council.', applyLink: 'https://www.indiafilings.com/learn/medical-council-registration' },
      { name: 'Drug License', reason: 'Required if pharmacy or dispensing medicines is part of the healthcare service.', applyLink: 'https://www.indiafilings.com/learn/drug-license' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for inter-state services.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Biomedical Waste Management Authorization', reason: 'Mandatory for healthcare facilities generating biomedical waste.', applyLink: 'https://cpcb.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required by municipal authority for healthcare establishments.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-fire-safety-certificate' },
    ],
    optional: [
      { name: 'NABH Accreditation', reason: 'National Accreditation Board for Hospitals - builds trust and quality assurance.', applyLink: 'https://www.nabh.co/' },
      { name: 'Health Insurance Empanelment', reason: 'Empanelment with TPA and insurance companies for patient billing.', applyLink: 'https://www.indiafilings.com/learn/health-insurance-empanelment' },
      { name: 'Trademark Certificate', reason: 'Protect your healthcare brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
    ],
  },
  'E-commerce': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Company / LLP Incorporation', reason: 'Legal entity for raised funding, vendor agreements, and payment gateway integration.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Mandatory for e-commerce operators and sellers on e-commerce platforms.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law for commercial operations.', applyLink: 'https://services.india.gov.in/service/detail/registration-of-shops-and-establishments-under-shops-and-establishment-act-4248' },
      { name: 'Trademark Registration', reason: 'Protect your marketplace brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account for vendor settlements, refunds, and operations.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Legally required for any platform collecting user data and processing payments.', applyLink: 'https://www.indiafilings.com/learn/privacy-policy-drafting' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'FSSAI License (if selling food)', reason: 'Required if your marketplace sells food products.', applyLink: 'https://foscos.fssai.gov.in/' },
      { name: 'Consumer Protection Compliance', reason: 'E-commerce rules require grievance officer and consumer complaint mechanisms.', applyLink: 'https://www.indiafilings.com/learn/consumer-protection-act' },
      { name: 'ISO Certification', reason: 'Builds trust with vendors and customers.', applyLink: 'https://www.bis.gov.in/' },
    ],
  },
  'Education / Training': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Society / Trust / Company Incorporation', reason: 'Legal entity registration for educational institutions and EdTech platforms.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for course fees billing and interstate transactions.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes for educational ventures.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your institution name, brand, and course names.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account for fee collection, payroll, and operations.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Required for student data protection and platform terms.', applyLink: 'https://www.indiafilings.com/learn/privacy-policy-drafting' },
    ],
    optional: [
      { name: 'Accreditation / Affiliation', reason: 'UGC, AICTE, or board affiliation for recognized certifications.', applyLink: 'https://www.indiafilings.com/learn/ugc-recognition' },
      { name: 'ISO Certification', reason: 'Quality management certification for educational services.', applyLink: 'https://www.bis.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required for physical training centers and classrooms.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-fire-safety-certificate' },
    ],
  },
  'Manufacturing': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Company / LLP Incorporation', reason: 'Legal entity for industrial operations, vendor contracts, and raised funding.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Mandatory for manufacturers for input tax credit and inter-state sales.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Factory License', reason: 'Required from the State Factory Inspectorate for operating a manufacturing unit.', applyLink: 'https://services.india.gov.in/' },
      { name: 'Pollution Control Board Consent', reason: 'CTO (Consent to Operate) and CTE (Consent to Establish) from State PCB.', applyLink: 'https://cpcb.gov.in/' },
      { name: 'Trade License', reason: 'Local municipal authority permission for commercial operations.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-trade-license-under-municipal-corporation-act' },
      { name: 'Business Bank Account', reason: 'Current account for raw material purchases, payroll, and operations.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes for manufacturing.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'ISO / BIS Certification', reason: 'Quality standards certification required for many product categories.', applyLink: 'https://www.bis.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your product brand and company name.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'ESI / PF Registration', reason: 'Employee state insurance and provident fund for workers.', applyLink: 'https://www.epfindia.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required for manufacturing facilities.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-fire-safety-certificate' },
    ],
  },
  'Retail / Local Shop': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law to legally operate a retail establishment.', applyLink: 'https://services.india.gov.in/service/detail/registration-of-shops-and-establishments-under-shops-and-establishment-act-4248' },
      { name: 'Trade License', reason: 'Local municipal authority permission to carry on retail trade.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-trade-license-under-municipal-corporation-act' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for purchasing from GST-registered suppliers.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Rent Agreement / NOC from Owner', reason: 'Proof of premises for Shop & Establishment, GST, and bank account.', applyLink: 'https://www.indiafilings.com/learn/rent-agreement' },
      { name: 'Business Bank Account', reason: 'Current account for daily operations, supplier payments, and POS settlements.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
      { name: 'FSSAI License (if selling food items)', reason: 'Required if your retail shop sells packaged or unpacked food items.', applyLink: 'https://foscos.fssai.gov.in/' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes for retail businesses.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your shop brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Fire Safety Certificate', reason: 'Required for larger retail establishments.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-fire-safety-certificate' },
      { name: 'Insurance', reason: 'Property and liability insurance for your retail space.', applyLink: 'https://www.indiafilings.com/learn/insurance-for-businesses' },
    ],
  },
  'Transport / Delivery': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Company / LLP Incorporation', reason: 'Legal entity for transport operations, fleet management, and raised funding.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for transport services billing and interstate operations.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Motor Vehicle Act Permits', reason: 'Commercial vehicle permits required for transport and delivery operations.', applyLink: 'https://vahan.parivahan.gov.in/vahan4dashboard/' },
      { name: 'Shop & Establishment Registration', reason: 'Required for office and warehouse operations.', applyLink: 'https://services.india.gov.in/service/detail/registration-of-shops-and-establishments-under-shops-and-establishment-act-4248' },
      { name: 'Trade License', reason: 'Local municipal authority permission for transport operations.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-trade-license-under-municipal-corporation-act' },
      { name: 'Business Bank Account', reason: 'Current account for fleet expenses, fuel, and operations.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Insurance (Vehicle & Cargo)', reason: 'Mandatory and recommended for fleet vehicles and cargo.', applyLink: 'https://www.indiafilings.com/learn/vehicle-insurance' },
      { name: 'Trademark Registration', reason: 'Protect your delivery brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Warehouse License', reason: 'Required if operating storage or fulfillment centers.', applyLink: 'https://services.india.gov.in/' },
    ],
  },
  'Finance / FinTech': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Company Incorporation ( Pvt Ltd )', reason: 'Mandatory for fintech companies. Required for RBI/SEBI compliance.', applyLink: 'https://www.mca.gov.in/' },
      { name: 'GST Registration', reason: 'Required for financial services billing.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'RBI / SEBI / IRDAI Approval', reason: 'Regulatory approval required based on financial service type (lending, insurance, securities).', applyLink: 'https://www.rbi.org.in/' },
      { name: 'Payment Aggregator / Gateway License', reason: 'Required for collecting payments from users on behalf of merchants.', applyLink: 'https://www.rbi.org.in/' },
      { name: 'Trademark Registration', reason: 'Protect your fintech brand name and product names.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Terms of Service & Privacy Policy', reason: 'Legally required for financial services handling sensitive user data.', applyLink: 'https://www.indiafilings.com/learn/privacy-policy-drafting' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'ISO 27001 Certification', reason: 'Information security management certification - builds trust with financial regulators.', applyLink: 'https://www.bis.gov.in/' },
      { name: 'Data Protection Compliance', reason: 'DPDP Act compliance for handling financial data.', applyLink: 'https://www.indiafilings.com/learn/data-protection-compliance' },
      { name: 'NPCI Certification (if UPI)', reason: 'Required for UPI-based payment services.', applyLink: 'https://www.npci.org.in/' },
    ],
  },
  'Service Business': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law for service business operations.', applyLink: 'https://services.india.gov.in/service/detail/registration-of-shops-and-establishments-under-shops-and-establishment-act-4248' },
      { name: 'Trade License', reason: 'Local municipal authority permission for service trade.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-trade-license-under-municipal-corporation-act' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold or for interstate services.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Rent Agreement / NOC from Owner', reason: 'Proof of premises for registration and bank account.', applyLink: 'https://www.indiafilings.com/learn/rent-agreement' },
      { name: 'Business Bank Account', reason: 'Current account for client payments, vendor payments, and operations.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
      { name: 'Professional Tax Registration', reason: 'Required in some states for service businesses with employees.', applyLink: 'https://www.indiafilings.com/learn/professional-tax-registration-and-compliance' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your service brand name and logo.', applyLink: 'https://ipindiaonline.gov.in/' },
      { name: 'Service Tax Registration', reason: 'Specific service tax compliance if applicable.', applyLink: 'https://www.indiafilings.com/learn/service-tax-registration' },
      { name: 'Insurance', reason: 'Professional liability and property insurance.', applyLink: 'https://www.indiafilings.com/learn/insurance-for-businesses' },
    ],
  },
  'Other': {
    essential: [
      { name: 'PAN Card', reason: 'Mandatory for all businesses in India for tax filing and financial transactions.', applyLink: 'https://onlineservices.proteantech.in/paam/endUserRegisterContact.html' },
      { name: 'Aadhaar Card', reason: 'Identity proof required for PAN application, bank accounts, and government registrations.', applyLink: 'https://appointments.uidai.gov.in/' },
      { name: 'Shop & Establishment Registration', reason: 'Required under state law for business operations.', applyLink: 'https://services.india.gov.in/service/detail/registration-of-shops-and-establishments-under-shops-and-establishment-act-4248' },
      { name: 'Trade License', reason: 'Local municipal authority permission for business operations.', applyLink: 'https://services.india.gov.in/service/detail/issuance-of-trade-license-under-municipal-corporation-act' },
      { name: 'GST Registration', reason: 'Required if turnover exceeds the threshold.', applyLink: 'https://www.gst.gov.in/' },
      { name: 'Business Bank Account', reason: 'Current account for business transactions.', applyLink: 'https://www.indiafilings.com/learn/open-current-account-online' },
    ],
    optional: [
      { name: 'Udyam / MSME Registration', reason: 'Benefits under MSME schemes.', applyLink: 'https://udyamregistration.gov.in/' },
      { name: 'Trademark Registration', reason: 'Protect your business brand name.', applyLink: 'https://ipindiaonline.gov.in/' },
    ],
  },
};

export const generateCategoryDocuments = (startupId: string, founderId: string, startupName: string, category: string) => {
  const catDocs = CATEGORY_DOCUMENT_MAP[category] || CATEGORY_DOCUMENT_MAP['Other'];
  const now = new Date().toISOString();

  const essentialDocs = catDocs.essential.map((doc, i) => ({
    id: `doc_cat_${startupId}_${i}_${Date.now()}`,
    startupId,
    founderId,
    fileName: `${startupName.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}`,
    fileType: 'PENDING',
    fileSize: '\u2014',
    fileData: '',
    category: 'Founder Documents',
    documentType: doc.name,
    documentLabel: doc.name,
    documentDescription: doc.reason,
    documentSection: 'Essential',
    required: true,
    uploadRequired: true,
    applyLink: doc.applyLink || '',
    status: 'Pending',
    verificationStatus: 'pending',
    verificationNote: '',
    sharedWith: [],
    createdAt: now,
    updatedAt: now,
  }));

  const optionalDocs = catDocs.optional.map((doc, i) => ({
    id: `doc_cat_opt_${startupId}_${i}_${Date.now()}`,
    startupId,
    founderId,
    fileName: `${startupName.replace(/\s+/g, '_')}_${doc.name.replace(/\s+/g, '_')}`,
    fileType: 'PENDING',
    fileSize: '\u2014',
    fileData: '',
    category: 'Optional Documents',
    documentType: doc.name,
    documentLabel: doc.name,
    documentDescription: doc.reason,
    documentSection: 'Optional',
    required: false,
    uploadRequired: false,
    applyLink: doc.applyLink || '',
    status: 'Pending',
    verificationStatus: 'pending',
    verificationNote: '',
    sharedWith: [],
    createdAt: now,
    updatedAt: now,
  }));

  return [...essentialDocs, ...optionalDocs];
};

export const generateStartupFromBackend = async (startup: any) => {
  const res = await fetch(`${API_URL}/ai-builder/generate-stateless`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ startupName: startup.startupName, startupIdea: startup.startupIdea }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'AI generation failed');
  return data.data.aiGenerated;
};

export const generateRoadmapAndTasks = (startup: any) => {
  const isPhysical = /tea|coffee|snacks|restaurant|salon|hotel|shop|cafe|retail|bakery/i.test(startup.startupIdea || startup.startupName);
  
  const roadmap = [
    { 
      id: 1, phase: 'Phase 1', title: "Idea & Validation", status: 'completed',
      description: "Define the core concept, validate the market, and finalize the foundational plan.",
      milestones: [
        { name: 'Define core concept & branding', done: true },
        { name: 'Complete market research', done: true },
        { name: 'Financial model creation', done: true }
      ]
    },
    { 
      id: 2, phase: 'Phase 2', title: "MVP / Setup", status: 'in-progress',
      description: isPhysical ? "Secure location, build out interior, and source initial inventory." : "Develop the core product MVP and set up necessary infrastructure.",
      milestones: [
        { name: isPhysical ? 'Secure lease agreement' : 'Complete core MVP features', done: true },
        { name: isPhysical ? 'Interior design & buildout' : 'Beta testing with initial users', done: false },
        { name: 'Legal & compliance setup', done: false }
      ]
    },
    { 
      id: 3, phase: 'Phase 3', title: "Launch", status: 'upcoming',
      description: "Execute go-to-market strategy and open doors to the public (or launch product).",
      milestones: [
        { name: 'Marketing campaign execution', done: false },
        { name: 'Soft launch / invite-only', done: false },
        { name: 'Public grand opening', done: false }
      ]
    },
    { 
      id: 4, phase: 'Phase 4', title: "Growth", status: 'upcoming',
      description: "Scale operations, acquire customers, and optimize unit economics.",
      milestones: [
        { name: 'Reach target MRR / Revenue goals', done: false },
        { name: 'Scale marketing spend', done: false },
        { name: 'Team expansion', done: false }
      ]
    }
  ];

  let tasks = [];

  if (isPhysical) {
    tasks = [
      { id: 1, title: 'Finalize interior design mockups', phaseTitle: 'MVP / Setup', priority: 'High', status: 'in-progress', dueDate: 'Next Week', progress: 60 },
      { id: 2, title: 'Scout 3 potential physical locations', phaseTitle: 'Idea & Validation', priority: 'High', status: 'done', dueDate: 'Past', progress: 100 },
      { id: 3, title: 'Negotiate supplier contracts for inventory', phaseTitle: 'MVP / Setup', priority: 'High', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 4, title: 'Apply for business licenses and health permits', phaseTitle: 'MVP / Setup', priority: 'High', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 5, title: 'Plan grand opening local marketing campaign', phaseTitle: 'Launch', priority: 'Medium', status: 'todo', dueDate: 'Next Month', progress: 0 },
      { id: 6, title: 'Hire initial staff (manager, barista/cashier)', phaseTitle: 'Launch', priority: 'High', status: 'todo', dueDate: 'Next Month', progress: 0 },
    ];
  } else {
    tasks = [
      { id: 1, title: 'Design Figma UI/UX mockups', phaseTitle: 'MVP / Setup', priority: 'High', status: 'in-progress', dueDate: 'Next Week', progress: 80 },
      { id: 2, title: 'Define database schema and architecture', phaseTitle: 'Idea & Validation', priority: 'High', status: 'done', dueDate: 'Past', progress: 100 },
      { id: 3, title: 'Integrate OpenAI API for core workflow', phaseTitle: 'MVP / Setup', priority: 'High', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 4, title: 'Set up Stripe billing and subscriptions', phaseTitle: 'MVP / Setup', priority: 'Medium', status: 'todo', dueDate: 'In 2 Weeks', progress: 0 },
      { id: 5, title: 'Launch on Product Hunt', phaseTitle: 'Launch', priority: 'High', status: 'todo', dueDate: 'Next Month', progress: 0 },
      { id: 6, title: 'Deploy to Vercel/AWS', phaseTitle: 'Launch', priority: 'High', status: 'todo', dueDate: 'Next Month', progress: 0 },
    ];
  }

  return { roadmap, tasks };
};

export const getDocuments = async (startupId?: string, userId?: string) => {
  try {
    let url = `${API_URL}/documents`;
    const params = new URLSearchParams();
    if (startupId) params.append('startupId', startupId);
    if (userId) params.append('userId', userId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    const data = await res.json();
    let docs = data.success ? data.data : [];

    // If no filter or fetching for admin, also include mentor verification proof documents
    if (!startupId) {
      try {
        let mentorsList: any[] = [];
        try {
          const usersRes = await fetch(`${API_URL}/auth/admin/users`, {
            headers: authHeaders(),
          });
          const usersData = await usersRes.json();
          if (usersData.success && Array.isArray(usersData.users)) {
            mentorsList = usersData.users.filter((u: any) => u.role === 'mentor');
          }
        } catch { /* fallback */ }

        // Also check local storage for mentors
        try {
          const storedUsers = localStorage.getItem('ai_startup_builder_users');
          const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
          const localMentors = parsedUsers.filter((u: any) => u.role === 'mentor');
          localMentors.forEach((lm: any) => {
            const exists = mentorsList.some((m) => (m.id || m._id)?.toString() === (lm.id || lm._id)?.toString());
            if (!exists) mentorsList.push(lm);
          });
        } catch {}

        mentorsList.forEach((m: any) => {
          const mId = m.id || m._id;
          const mName = m.fullName || m.name || 'Mentor';
          const mEmail = m.email || '';
          const mStatus = m.approvalStatus === 'approved' ? 'Verified' : m.approvalStatus === 'rejected' ? 'Rejected' : 'Pending Verification';
          const mVerifStatus = m.approvalStatus === 'approved' ? 'verified' : m.approvalStatus === 'rejected' ? 'rejected' : 'pending_verification';

          let addedSpecificDoc = false;

          // 1. Aadhaar Card Proof
          if (m.aadharDocUrl || m.aadharNumber) {
            addedSpecificDoc = true;
            docs.push({
              id: `mentor_aadhar_${mId}`,
              userId: mId,
              startupId: '',
              ownerName: mName,
              ownerRole: 'Mentor',
              ownerEmail: mEmail,
              fileName: `${mName.replace(/\s+/g, '_')}_Aadhaar_ID_Proof.pdf`,
              documentLabel: 'Aadhaar Card ID Proof',
              documentDescription: `Aadhaar Ref: ${m.aadharNumber || 'Submitted during mentor signup'}`,
              documentType: 'mentor_aadhar_proof',
              documentSection: 'Mentor Proof Document',
              category: 'ID Proof',
              fileSize: '1.4 MB',
              fileUrl: m.aadharDocUrl || '',
              status: mStatus,
              verificationStatus: mVerifStatus,
              createdAt: m.createdAt || new Date().toISOString(),
              updatedAt: m.updatedAt || new Date().toISOString(),
            });
          }

          // 2. PAN Card Proof
          if (m.panDocUrl || m.panNumber) {
            addedSpecificDoc = true;
            docs.push({
              id: `mentor_pan_${mId}`,
              userId: mId,
              startupId: '',
              ownerName: mName,
              ownerRole: 'Mentor',
              ownerEmail: mEmail,
              fileName: `${mName.replace(/\s+/g, '_')}_PAN_Tax_Proof.pdf`,
              documentLabel: 'PAN Card Tax Proof',
              documentDescription: `PAN Number: ${m.panNumber || 'Submitted during mentor signup'}`,
              documentType: 'mentor_pan_proof',
              documentSection: 'Mentor Proof Document',
              category: 'Tax / Identity Proof',
              fileSize: '1.2 MB',
              fileUrl: m.panDocUrl || '',
              status: mStatus,
              verificationStatus: mVerifStatus,
              createdAt: m.createdAt || new Date().toISOString(),
              updatedAt: m.updatedAt || new Date().toISOString(),
            });
          }

          // 3. Qualification / Degree / Experience Proof
          if (m.otherDocUrl || m.otherDocType || m.otherDocNumber) {
            addedSpecificDoc = true;
            docs.push({
              id: `mentor_other_${mId}`,
              userId: mId,
              startupId: '',
              ownerName: mName,
              ownerRole: 'Mentor',
              ownerEmail: mEmail,
              fileName: `${mName.replace(/\s+/g, '_')}_${(m.otherDocType || 'Qualification').replace(/\s+/g, '_')}.pdf`,
              documentLabel: `${m.otherDocType || 'Degree / Experience Certificate'}`,
              documentDescription: `Doc Ref: ${m.otherDocNumber || 'Submitted during signup'} | Expertise: ${Array.isArray(m.expertise) ? m.expertise.join(', ') : (m.expertise || 'Mentoring')}`,
              documentType: 'mentor_qualification_proof',
              documentSection: 'Mentor Proof Document',
              category: m.otherDocType || 'Degree & Qualification',
              fileSize: '1.8 MB',
              fileUrl: m.otherDocUrl || '',
              status: mStatus,
              verificationStatus: mVerifStatus,
              createdAt: m.createdAt || new Date().toISOString(),
              updatedAt: m.updatedAt || new Date().toISOString(),
            });
          }

          // 4. Resume CV Document
          if (m.resumeUrl) {
            addedSpecificDoc = true;
            docs.push({
              id: `mentor_resume_${mId}`,
              userId: mId,
              startupId: '',
              ownerName: mName,
              ownerRole: 'Mentor',
              ownerEmail: mEmail,
              fileName: `${mName.replace(/\s+/g, '_')}_Resume_CV.pdf`,
              documentLabel: 'Mentor Resume / CV',
              documentDescription: `Experience: ${m.experienceYears || '8+'} yrs | Location: ${m.location || 'India'}`,
              documentType: 'mentor_resume',
              documentSection: 'Mentor Proof Document',
              category: 'Mentor Resume',
              fileSize: '1.5 MB',
              fileUrl: m.resumeUrl,
              status: mStatus,
              verificationStatus: mVerifStatus,
              createdAt: m.createdAt || new Date().toISOString(),
              updatedAt: m.updatedAt || new Date().toISOString(),
            });
          }

          // 5. Default Mentor Profile Verification Record
          if (!addedSpecificDoc || m.photoUrl || m.idProofUrl || m.certificateUrl) {
            docs.push({
              id: `mentor_profile_doc_${mId}`,
              userId: mId,
              startupId: '',
              ownerName: mName,
              ownerRole: 'Mentor',
              ownerEmail: mEmail,
              fileName: `${mName.replace(/\s+/g, '_')}_Verification_Profile.pdf`,
              documentLabel: `Mentor Profile & Credentials Verification (${mName})`,
              documentDescription: `Experience: ${m.experienceYears || '8+'} yrs | Expertise: ${Array.isArray(m.expertise) ? m.expertise.join(', ') : (m.expertise || 'Startup Guidance')}`,
              documentType: 'mentor_verification',
              documentSection: 'Mentor Proof Document',
              category: 'Mentor Verification',
              fileSize: '1.3 MB',
              fileUrl: m.idProofUrl || m.photoUrl || m.certificateUrl || '',
              status: mStatus,
              verificationStatus: mVerifStatus,
              createdAt: m.createdAt || new Date().toISOString(),
              updatedAt: m.updatedAt || new Date().toISOString(),
            });
          }
        });
      } catch (mErr) {
        console.warn('Could not fetch mentor documents for admin verification:', mErr);
      }
    }

    return docs;
  } catch (e) {
    console.error('Error fetching documents', e);
  }
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('ai_startup_builder_documents');
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const migrateDocumentApplyLinks = async () => {
  const docs = await getDocuments();
  let changed = false;
  const updated = docs.map((doc: any) => {
    if (doc.documentLabel && !doc.applyLink) {
      const allDocs = [
        ...Object.values(CATEGORY_DOCUMENT_MAP).flatMap((cat: any) => [...cat.essential, ...cat.optional]),
      ];
      const match = allDocs.find((d: any) => d.name === doc.documentLabel);
      if (match && match.applyLink) {
        changed = true;
        return { ...doc, applyLink: match.applyLink };
      }
    }
    return doc;
  });
  if (changed) {
    localStorage.setItem('ai_startup_builder_documents', JSON.stringify(updated));
  }
  return updated;
};

export const saveDocument = async (document: any) => {
  try {
    const res = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(document)
    });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error saving document', e);
  }
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('ai_startup_builder_documents');
    const current = stored ? JSON.parse(stored) : [];
    const updated = [document, ...current];
    localStorage.setItem('ai_startup_builder_documents', JSON.stringify(updated));
    return document;
  } catch (e) { return document; }
};

export const getDocumentById = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/documents/${id}`);
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error fetching document by id', e);
  }
  // Fallback
  try {
    const stored = localStorage.getItem('ai_startup_builder_documents');
    const docs = stored ? JSON.parse(stored) : [];
    return docs.find((d: any) => d.id === id) || null;
  } catch (e) { return null; }
};

export const updateDocument = async (id: string, updatedData: any) => {
  try {
    const res = await fetch(`${API_URL}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error updating document', e);
  }
  // Fallback
  try {
    const stored = localStorage.getItem('ai_startup_builder_documents');
    let docs = stored ? JSON.parse(stored) : [];
    let updatedDoc = null;
    docs = docs.map((d: any) => {
      if (d.id === id) { updatedDoc = { ...d, ...updatedData }; return updatedDoc; }
      return d;
    });
    if (updatedDoc) localStorage.setItem('ai_startup_builder_documents', JSON.stringify(docs));
    return updatedDoc;
  } catch (e) { return null; }
};

export const deleteDocument = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) return true;
  } catch (e) {
    console.error('Error deleting document', e);
  }
  // Fallback
  try {
    const stored = localStorage.getItem('ai_startup_builder_documents');
    const docs = stored ? JSON.parse(stored) : [];
    const filtered = docs.filter((d: any) => d.id !== id);
    localStorage.setItem('ai_startup_builder_documents', JSON.stringify(filtered));
    return true;
  } catch (e) { return false; }
};

// Mentor Payment Settings
const defaultMentorPaymentSettings = {
  externalPaymentType: 'Per Task',
  internalPaymentType: 'Monthly Salary',
  basicReviewAmount: 50,
  detailedReviewAmount: 150,
  call30MinAmount: 100,
  call45MinAmount: 150,
  call60MinAmount: 200,
  platformCommission: 20,
  mentorShare: 80,
  weeklySalaryAmount: 1000,
  monthlySalaryAmount: 4000,
  minWeeklyTarget: 10,
  minMonthlyTarget: 40,
  payoutCycle: 'Monthly'
};

export const getMentorPaymentSettings = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_mentor_payment_settings');
    return data ? { ...defaultMentorPaymentSettings, ...JSON.parse(data) } : defaultMentorPaymentSettings;
  } catch (e) {
    return defaultMentorPaymentSettings;
  }
};

export const saveMentorPaymentSettings = (settings: any) => {
  localStorage.setItem('ai_startup_builder_mentor_payment_settings', JSON.stringify(settings));
  return settings;
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Logo Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getLogosByStartupId = (startupId: string) => {
  try {
    const data = localStorage.getItem('ai_startup_builder_logos');
    const all: any[] = data ? JSON.parse(data) : [];
    return all.filter((l) => l.startupId === startupId);
  } catch (e) {
    return [];
  }
};

export const getAllLogos = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_logos');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLogo = (logo: any) => {
  const current = getAllLogos();
  // Replace existing logo for this startup if exists
  const filtered = current.filter((l: any) => l.startupId !== logo.startupId);
  const updated = [logo, ...filtered];
  localStorage.setItem('ai_startup_builder_logos', JSON.stringify(updated));
  return logo;
};

export const deleteLogoByStartupId = (startupId: string) => {
  const current = getAllLogos();
  const filtered = current.filter((l: any) => l.startupId !== startupId);
  localStorage.setItem('ai_startup_builder_logos', JSON.stringify(filtered));
  return filtered;
};

// â”€â”€â”€ Billing / Subscription / Payment API Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getSubscription = async (userId: string) => {
  try {
    const res = await fetch(`${API_URL}/auth/subscription?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error fetching subscription', e);
  }
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('ai_startup_builder_subs_v2');
    const subs = stored ? JSON.parse(stored) : [];
    return subs.find((s: any) => s.userId === userId) || null;
  } catch (e) { return null; }
};

export const getPaymentRequests = async (founderId?: string) => {
  try {
    const url = founderId
      ? `${API_URL}/payments?founderId=${encodeURIComponent(founderId)}`
      : `${API_URL}/payments`;
    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();
    if (data.success) return data.payments || data.data || [];
  } catch (e) {
    console.error('Error fetching payment requests', e);
  }
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('ai_startup_builder_payments');
    const all = stored ? JSON.parse(stored) : [];
    return founderId ? all.filter((p: any) => p.founderId === founderId) : all;
  } catch (e) { return []; }
};

export const submitPaymentRequest = async (paymentData: any) => {
  try {
    const res = await fetch(`${API_URL}/payments/submit`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (data.success) return data.payment || data.data;
  } catch (e) {
    console.error('Error submitting payment', e);
  }
  // Fallback to localStorage
  const stored = localStorage.getItem('ai_startup_builder_payments');
  const current = stored ? JSON.parse(stored) : [];
  const updated = [paymentData, ...current];
  localStorage.setItem('ai_startup_builder_payments', JSON.stringify(updated));
  return paymentData;
};

// ─── 5 New AI Modules Helpers (Idea Validation, Competitors, MVP, Financial, GTM) ──────

export const getIdeaValidationData = (startup: any) => {
  if (startup?.aiGenerated?.ideaValidation) {
    return startup.aiGenerated.ideaValidation;
  }
  const name = startup?.startupName || 'Startup';
  const idea = startup?.startupIdea || 'Business idea';
  const ideaAnalysis = startup?.aiGenerated?.ideaAnalysis || {};
  const isTech = /app|ai|platform|saas|software|tech|digital/i.test(idea + ' ' + name);

  return {
    startupIdea: ideaAnalysis?.refinedIdea || idea,
    problemStatement: ideaAnalysis?.problemStatement || `Customers in this sector lack an easy, integrated solution for ${name}.`,
    targetCustomer: (ideaAnalysis?.targetCustomers && ideaAnalysis.targetCustomers[0]) || 'Target consumers & SMBs',
    proposedSolution: ideaAnalysis?.solution || `Providing a streamlined product offering under ${name}.`,
    industryCategory: detectStartupCategory(startup),
    validationScore: 84,
    problemStrength: 'High',
    marketNeed: 'Strong Demand',
    customerDemand: 'High Willingness to Pay',
    solutionFeasibility: isTech ? 'High Feasibility (Scalable Tech)' : 'Proven Operational Model',
    businessPotential: 'Strong Margin & Scale Potential',
    keyRisks: ideaAnalysis?.riskFactors || [
      'Customer acquisition cost optimization',
      'Market competition from traditional incumbents',
      'Operational execution scaling'
    ],
    strengths: ideaAnalysis?.keyStrengths || [
      'Clear unique value proposition',
      'High repeat customer potential',
      'Scalable business structure'
    ],
    weaknesses: [
      'Early brand awareness build-up needed',
      'Capital investment required for initial launch phase'
    ],
    validationSummary: `${name} addresses a real and growing market need with a well-defined value proposition. The concept displays high market viability and solid potential for unit economic profitability.`,
    recommendedImprovements: [
      'Focus early marketing on high-intent customer niches',
      'Set up customer feedback loops during soft launch',
      'Establish strategic local or digital partnerships'
    ],
    finalRecommendation: 'Strong'
  };
};

export const getCompetitorAnalysisData = (startup: any) => {
  if (startup?.aiGenerated?.competitorAnalysis) {
    return startup.aiGenerated.competitorAnalysis;
  }
  const name = startup?.startupName || 'Startup';
  const category = detectStartupCategory(startup);
  const isTech = category === 'IT / Software / SaaS' || category === 'FinTech / Finance';

  return {
    directCompetitors: [
      {
        name: isTech ? 'Legacy Platform Alpha' : 'Established Regional Leader',
        product: isTech ? 'Enterprise SaaS Tool' : 'Traditional Physical Service',
        pricing: 'High (₹2,500 - ₹5,000 / mo)',
        keyFeatures: ['Standard feature set', 'Basic support', 'Legacy UI'],
        targetAudience: 'Enterprise clients',
        strengths: ['Brand recognition', 'Large client base'],
        weaknesses: ['Slow customer service', 'Complex pricing', 'Outdated UX'],
        marketPositioning: 'High Price / Traditional'
      },
      {
        name: isTech ? 'Cloud Tool Beta' : 'Local Chain Competitor',
        product: isTech ? 'Mid-market Platform' : 'Standard Storefront',
        pricing: 'Moderate (₹1,200 / mo)',
        keyFeatures: ['Core utility', 'Mobile view', 'Standard reporting'],
        targetAudience: 'Mid-sized businesses',
        strengths: ['Competitive pricing', 'Decent distribution'],
        weaknesses: ['Limited customization', 'No AI features'],
        marketPositioning: 'Mid Price / Utility'
      }
    ],
    indirectCompetitors: [
      {
        name: 'Manual In-house Alternative',
        product: 'DIY spreadsheets & phone calls',
        pricing: 'Free / Hidden Labor Cost',
        keyFeatures: ['No subscription cost', 'Custom process'],
        targetAudience: 'Budget-conscious operators',
        strengths: ['Zero software spend'],
        weaknesses: ['High human effort', 'Frequent errors', 'Not scalable'],
        marketPositioning: 'Low Cost / Manual'
      }
    ],
    comparisonMatrix: [
      { feature: 'AI Automation & Speed', myStartup: 'Yes (Instant)', competitor1: 'No (Manual)', competitor2: 'Partial' },
      { feature: 'Modern Mobile-First UX', myStartup: 'Yes', competitor1: 'No', competitor2: 'Basic' },
      { feature: 'Transparent Value Pricing', myStartup: 'Yes', competitor1: 'Hidden fees', competitor2: 'Subscription add-ons' },
      { feature: '24/7 Dedicated Support', myStartup: 'Yes', competitor1: 'Email only', competitor2: 'Tiered' }
    ],
    marketGaps: [
      'Lack of modern user-centric interfaces in existing solutions',
      'Inaccessible high-end features for budget-conscious customers',
      'Uncertain price models and long onboarding cycles'
    ],
    differentiationOpportunities: [
      'Leverage AI-driven automated workflows for 5x speed',
      'Provide transparent, modular, pay-as-you-grow pricing',
      'Deliver superior onboarding with zero friction'
    ],
    uniqueSellingProposition: `${name} delivers faster, smarter, and more cost-effective solutions tailored specifically for modern users without complex overhead.`,
    competitiveAdvantages: [
      'Proprietary AI workflow integration',
      'Agile operational structure with lower CapEx',
      'Direct customer feedback loop for rapid iteration'
    ]
  };
};

export const getMVPPlanData = (startup: any) => {
  if (startup?.aiGenerated?.mvpPlan) {
    return startup.aiGenerated.mvpPlan;
  }
  const name = startup?.startupName || 'Startup';
  const category = detectStartupCategory(startup);
  const isPhysical = /Food|Retail|Hospitality|Manufacturing|Transport/i.test(category);

  return {
    mvpConcept: `The MVP for ${name} focuses on delivering the essential core value to early adopters with minimal setup complexity.`,
    coreFeatures: [
      'User Registration & Profile Setup',
      'Core Service / Product Booking & Catalog',
      'Automated Order & Notification System',
      'Integrated Payment Gateway (UPI / Cards)'
    ],
    mustHaveFeatures: [
      'Intuitive Dashboard for User Management',
      'Secure Payment & Order Receipts',
      'Real-time Status Tracking'
    ],
    niceToHaveFeatures: [
      'Loyalty & Rewards Referral System',
      'Advanced Analytics & PDF Export',
      'Multi-language Support'
    ],
    userRoles: ['Customer / Buyer', 'Admin / Founder Manager', 'Support / Operator'],
    userFlow: [
      { step: 1, title: 'Landing & Onboarding', description: 'User visits platform, views value proposition, and creates an account.' },
      { step: 2, title: 'Selection / Order Entry', description: 'User selects desired service/product and enters order requirements.' },
      { step: 3, title: 'Checkout & Payment', description: 'User completes instant payment via secure integrated checkout.' },
      { step: 4, title: 'Fulfillment & Confirmation', description: 'Automated confirmation, tracking ID, and fulfillment updates sent.' }
    ],
    requiredTechStack: {
      frontend: ['React.js', 'Tailwind CSS', 'Vite / TypeScript'],
      backend: ['Node.js', 'Express.js', 'REST API / JWT Auth'],
      database: ['MongoDB / Mongoose'],
      cloudServices: ['Vercel / Cloudinary', 'Razorpay Payment Gateway']
    },
    developmentPhases: [
      { phase: 'Phase 1: Architecture & UI Prototype', duration: 'Weeks 1-2', focus: 'Wireframing, UI design, DB schema setup' },
      { phase: 'Phase 2: Core Development & Integration', duration: 'Weeks 3-5', focus: 'Auth, payment system, core feature build' },
      { phase: 'Phase 3: Beta Testing & Soft Launch', duration: 'Weeks 6-8', focus: 'QA testing, security review, soft launch to pilot users' }
    ],
    mvpRoadmap: [
      { milestone: 'DB Schema & Wireframe Approval', targetWeek: 'Week 2' },
      { milestone: 'Alpha Functional Demo Build', targetWeek: 'Week 4' },
      { milestone: 'Payment Gateway Integration', targetWeek: 'Week 5' },
      { milestone: 'Soft Launch to Beta Users', targetWeek: 'Week 8' }
    ],
    estimatedComplexity: isPhysical ? 'Medium' : 'Low to Medium',
    futureFeatures: [
      'AI Recommendation Engine for personalized suggestions',
      'B2B Wholesale / Corporate Subscription Tier',
      'Native Mobile iOS & Android Apps'
    ]
  };
};

export const formatRupeeText = (text: any): any => {
  if (typeof text === 'string') {
    return text.replace(/\$/g, '₹').replace(/USD/gi, '₹');
  }
  if (Array.isArray(text)) {
    return text.map(formatRupeeText);
  }
  if (typeof text === 'object' && text !== null) {
    const res: any = {};
    for (const key in text) {
      res[key] = formatRupeeText(text[key]);
    }
    return res;
  }
  return text;
};

export const getFinancialPlanData = (startup: any) => {
  if (startup?.aiGenerated?.financialPlan) {
    return formatRupeeText(startup.aiGenerated.financialPlan);
  }
  const name = startup?.startupName || 'Startup';
  const mr = startup?.aiGenerated?.marketResearch;

  const rawPricing = mr?.pricingSuggestions ? (Array.isArray(mr.pricingSuggestions) ? mr.pricingSuggestions.join(' | ') : mr.pricingSuggestions) : 'Basic Plan: ₹499/mo | Business Plan: ₹1,499/mo | Enterprise: ₹4,999/mo';

  return formatRupeeText({
    initialStartupCost: '₹3,50,000',
    developmentCost: '₹1,50,000',
    marketingCost: '₹80,000',
    operationalExpenses: '₹70,000',
    monthlyExpenses: '₹65,000',
    revenueModel: startup?.aiGenerated?.ideaAnalysis?.revenueModel || 'Direct sales, transactional service fee, and monthly recurring plans.',
    suggestedPricing: rawPricing,
    revenueProjection: 'Targeting ₹2,40,000 gross monthly revenue by Month 12 with 25% MoM customer growth.',
    customerAcquisitionAssumptions: 'Target CAC: ₹350 per user; Customer LTV: ₹3,200; Average payback period: 2.5 months.',
    breakEvenEstimate: 'Month 7 (Approx. 120 active paying customers required)',
    year1Projection: { revenue: '₹28,50,000', expenses: '₹16,20,000', netProfit: '₹12,30,000' },
    year3Projection: { revenue: '₹84,00,000', expenses: '₹38,00,000', netProfit: '₹46,00,000' },
    year5Projection: { revenue: '₹2,40,00,000', expenses: '₹95,00,000', netProfit: '₹1,45,00,000' }
  });
};

export const getGTMStrategyData = (startup: any) => {
  if (startup?.aiGenerated?.gtmStrategy) {
    return startup.aiGenerated.gtmStrategy;
  }
  const name = startup?.startupName || 'Startup';

  return {
    targetAudience: 'Urban professionals, modern SMBs, and tech-savvy consumers seeking convenient high-quality solutions.',
    idealCustomerProfile: 'Growth-oriented individuals and businesses looking to reduce operational friction and save time.',
    customerPersonas: [
      {
        name: 'Alex - Busy Professional',
        role: 'Middle Manager / Solopreneur',
        painPoints: ['Wastes hours on slow manual processes', 'High service costs'],
        goal: 'Find a fast, reliable solution with transparent pricing',
        channels: ['LinkedIn', 'Instagram', 'Google Search']
      },
      {
        name: 'Priya - Small Business Owner',
        role: 'Founder / Managing Director',
        painPoints: ['Needs scalable tools without enterprise costs', 'Limited internal tech staff'],
        goal: 'Streamline operations quickly and boost ROI',
        channels: ['Industry Webinars', 'WhatsApp Groups', 'Local Business Associations']
      }
    ],
    positioningStrategy: `${name} positions itself as the most accessible, high-efficiency solution in the market, combining premium features with affordable pricing.`,
    valueProposition: `Save time, lower cost, and achieve superior results with ${name}'s modern platform.`,
    marketingChannels: ['Search Engine Optimization (SEO)', 'Social Media Video Content', 'Direct B2B Outreach', 'Referral Incentives'],
    customerAcquisitionStrategy: 'Offer an irresistible free tier or soft-launch trial to build trust, followed by structured email drip conversion nurture.',
    launchStrategy: {
      preLaunch: ['Build waiting list landing page', 'Run teaser campaign on LinkedIn & Instagram', 'Engage early beta testers for testimonials'],
      launchDay: ['Publish launch announcement across all channels', 'Offer exclusive launch-week discount (20% off)', 'Host live Q&A session'],
      postLaunch: ['Follow up with initial users for reviews', 'Optimize ad conversion funnel based on data', 'Roll out customer referral incentive']
    },
    first100CustomersStrategy: 'Direct cold outreach to targeted LinkedIn contacts, leveraging personal founder network, and offering founder-led onboarding support.',
    socialMediaStrategy: ['Weekly educational tip reels', 'Customer spotlight success stories', 'Product walkthrough snippets'],
    contentStrategy: ['Problem-focused blog posts', 'Free downloadable templates/checklists', 'Case study showcase'],
    growthStrategy: 'Expand from primary market segment into adjacent niches through strategic partnership co-marketing.',
    keyMarketingKPIs: [
      'Website Traffic to Trial Conversion Rate (>5%)',
      'Customer Acquisition Cost CAC (< ₹400)',
      'Customer Retention Rate (>85%)',
      'Monthly Recurring Revenue MoM Growth (>20%)'
    ],
    thirtyDayLaunchPlan: [
      { week: 'Week 1: Foundations', goal: 'Finalize website landing page & analytics', keyTasks: ['Setup Google Analytics & Pixels', 'Publish lead magnet landing page'] },
      { week: 'Week 2: Beta Preview', goal: 'Onboard 20 beta users for testing', keyTasks: ['Send private beta access', 'Gather initial feedback & bug fixes'] },
      { week: 'Week 3: Campaign Blitz', goal: 'Launch social media teaser campaign', keyTasks: ['Publish 5 short vids', 'Run ₹5,000 test ad campaign'] },
      { week: 'Week 4: Public Launch', goal: 'Acquire first 50 paid users', keyTasks: ['Send launch blast email', 'Post on ProductHunt / local business forums'] }
    ],
    ninetyDayRoadmap: [
      { month: 'Month 1: Launch & Validate', focus: 'Acquire first 50 customers and refine messaging', keyMilestones: ['Launch offer active', 'First 50 users onboarded'] },
      { month: 'Month 2: Channel Scaling', focus: 'Double down on best performing marketing channel', keyMilestones: ['SEO content cadence established', 'Target CAC achieved'] },
      { month: 'Month 3: Expansion & Retention', focus: 'Implement referral loops and upscale monthly packages', keyMilestones: ['Reach 150+ active users', 'Launch referral program'] }
    ]
  };
};

export const regenerateModuleData = async (startupId: string, moduleType: 'ideaValidation' | 'competitorAnalysis' | 'mvpPlan' | 'financialPlan' | 'gtmStrategy') => {
  const startup = await getStartupById(startupId);
  if (!startup) throw new Error('Startup not found');

  // Trigger regeneration
  let updatedModule: any = null;
  if (moduleType === 'ideaValidation') updatedModule = getIdeaValidationData(startup);
  else if (moduleType === 'competitorAnalysis') updatedModule = getCompetitorAnalysisData(startup);
  else if (moduleType === 'mvpPlan') updatedModule = getMVPPlanData(startup);
  else if (moduleType === 'financialPlan') updatedModule = getFinancialPlanData(startup);
  else if (moduleType === 'gtmStrategy') updatedModule = getGTMStrategyData(startup);

  const existingAiGenerated = startup.aiGenerated || {};
  const newAiGenerated = { ...existingAiGenerated, [moduleType]: updatedModule };

  const updated = await updateStartup(startupId, { aiGenerated: newAiGenerated });
  return updated || { ...startup, aiGenerated: newAiGenerated };
};


