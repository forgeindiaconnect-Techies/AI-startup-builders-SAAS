import { API_URL } from '../config/api';

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
          marketingCaptions: ['Skip the tourist traps. 🗺️✈️', 'Meet your new local best friend.']
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
          financialProjection: 'First year target of $240,000 gross merchandise value (GMV) with 30% month-over-month guide acquisition growth.',
          fundingAsk: '$100,000 for guide onboarding operations, marketing launch, and regional scaling.'
        },
        pitchDeck: [
          { slide: 1, title: 'Tourists', content: 'Authentic Local Tourism Marketplace' },
          { slide: 2, title: 'The Problem', content: 'Commercial tour packages are generic, overcrowded, and isolate travelers from authentic culture.' },
          { slide: 3, title: 'The Solution', content: 'A peer-to-peer marketplace matching travelers with vetted local experts for custom experiences.' },
          { slide: 4, title: 'Market Size', content: '$800B+ global experiential and adventure travel market.' },
          { slide: 5, title: 'Product Overview', content: 'Custom itinerary builder, interactive mapping, safety tracking, video profiles.' },
          { slide: 6, title: 'Business Model', content: '15% booking commission on all transactions.' },
          { slide: 7, title: 'Competitor Landscape', content: 'More localized and flexible than Airbnb Experiences, more affordable than traditional agencies.' },
          { slide: 8, title: 'Go-To-Market', content: 'Travel vlogger partnerships, localized SEO guides, digital ads.' },
          { slide: 9, title: 'Our Team', content: 'Ex-Booking.com product managers and local travel organizers.' },
          { slide: 10, title: 'The Ask', content: '$100k for engineering, host acquisition, and pilot marketing.' }
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
          refinedIdea: 'Bakery is a modern retail and café concept offering premium freshly baked breads, custom cakes, healthy tea-time snacks, sweets, and gourmet potato chips.',
          problemStatement: 'Local consumers lack access to premium, hygienic, and fresh baked goods that combine traditional bakery comfort with modern healthy snack alternatives.',
          solution: 'A hybrid neighborhood bakery & café focusing on clean, premium ingredients, fresh daily baking, and a curated assortment of snacks and sweets.',
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
          marketingCaptions: ['Warm bread cures everything. 🍞❤️', 'Custom cakes made just for you.']
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
          financialProjection: 'First year sales target of $150,000 with steady monthly margins of 25% from recurring customers.',
          fundingAsk: '$50,000 for commercial baking equipment, shop renovation, and initial raw ingredients.'
        },
        pitchDeck: [
          { slide: 1, title: 'Bakery', content: 'Fresh Neighborhood Bakery & Curated Snacks' },
          { slide: 2, title: 'The Problem', content: 'Mass-manufactured baked goods lack taste, contain preservatives, and local shops lack hygiene.' },
          { slide: 3, title: 'The Solution', content: 'A transparent, hygienic live bakery offering fresh artisan items alongside high-quality sweets and chips.' },
          { slide: 4, title: 'Market Size', content: '$8B rising domestic bakery and snack food market.' },
          { slide: 5, title: 'Product Line', content: 'Breads, celebration cakes, traditional sweets, packaged premium chips, healthy cookies.' },
          { slide: 6, title: 'Business Model', content: 'DTC Retail, custom event orders, subscription packages.' },
          { slide: 7, title: 'Traction', content: 'Pre-launch social media interest, partnerships with 3 local event planners.' },
          { slide: 8, title: 'Go-To-Market', content: 'Neighborhood tastings, active local SEO, geo-targeted social media.' },
          { slide: 9, title: 'Our Team', content: 'Experienced baker with 10 years of hotel pastry experience.' },
          { slide: 10, title: 'The Ask', content: '$50k for machinery, interior setup, and initial marketing.' }
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
          marketingCaptions: ['Savor the flavor. 🍽️✨', 'Reserve your table today.']
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
          financialProjection: 'First year target sales of $320,000 with a projected net profit margin of 18% in Year 1.',
          fundingAsk: '$120,000 for space lease deposit, interior buildout, commercial kitchen prep systems, and launch marketing.'
        },
        pitchDeck: [
          { slide: 1, title: 'RESTURANT', content: 'Modern Dine-in Experience & Fine Flavors' },
          { slide: 2, title: 'The Problem', content: 'Lack of premium, high-hygiene multi-cuisine dining options with family-friendly ambiance.' },
          { slide: 3, title: 'The Solution', content: 'A beautifully designed dine-in space with curated chef specialties and interactive digital order flows.' },
          { slide: 4, title: 'Market Size', content: '$30B+ rapidly growing urban dining and restaurant industry.' },
          { slide: 5, title: 'Our Menu', content: 'Appetizers, chef specials, artisanal beverages, curated desserts.' },
          { slide: 6, title: 'Business Model', content: 'Dine-in revenue (75%) + online deliveries & catering (25%).' },
          { slide: 7, title: 'Competitor Analysis', content: 'We win on ingredient sourcing transparency, premium dining service, and unique menu items.' },
          { slide: 8, title: 'Go-To-Market', content: 'Blogger reviews, grand launch night, corporate discount tie-ups.' },
          { slide: 9, title: 'Our Team', content: 'Led by an executive chef with 15 years of fine dining kitchen management.' },
          { slide: 10, title: 'The Ask', content: '$120k for space setup, equipment lease, and 3 months runway.' }
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
          marketingCaptions: ['Sip, relax, repeat. ☕🕒', 'Your workspace refreshment partner.']
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
          financialProjection: 'First year sales target of $95,000 per kiosk, with cash flow positive state by Month 3.',
          fundingAsk: '$35,000 for kiosk construction, espresso machines, and launch marketing.'
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
          { slide: 10, title: 'The Ask', content: '$35k for the prototype kiosk construction and equipment.' }
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

export const getStartups = async () => {
  try {
    const res = await fetch(`${API_URL}/startups`);
    const data = await res.json();
    if (data.success) {
      return data.data;
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
  try {
    const res = await fetch(`${API_URL}/startups/${startupId}`);
    const data = await res.json();
    if (data.success) return data.data;
  } catch (e) {
    console.error('Error fetching startup by id', e);
  }
  return null;
};

export const createStartupDraft = async (startupName: string, startupIdea: string) => {
  try {
    const res = await fetch(`${API_URL}/startups/create-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startupName, startupIdea })
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
  try {
    const res = await fetch(`${API_URL}/startups/${startupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    const data = await res.json();
    if (data.success) return data.data;
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
      message: 'Tourists: I want to start the tourists platform. — submitted by Renu (Founder)',
      type: 'ai_builder',
      isRead: false,
      actionUrl: '/dashboard/admin/startups',
      createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    },
    {
      id: `notif_seed_2`,
      userId: 'admin',
      title: 'New Startup Idea Submitted',
      message: 'Bakery: i want to start bakery shop, in the bakery shop add snacks, sweet, chips etc.. — submitted by Renu (Founder)',
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

export const getNotifications = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_notifications');
    const parsed = data ? JSON.parse(data) : [];
    if (parsed.length === 0) {
      return seedDemoNotifications();
    }
    return parsed;
  } catch (e) {
    return [];
  }
};

export const addNotification = (notification: any) => {
  const current = getNotifications();
  const updated = [notification, ...current];
  localStorage.setItem('ai_startup_builder_notifications', JSON.stringify(updated));
  return updated;
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

export const generateStartupOutput = (startup: any) => {
  const isPhysical = /tea|coffee|snacks|restaurant|salon|hotel|shop|cafe|retail|bakery/i.test(startup.startupIdea || startup.startupName);
  
  let ideaAnalysis, branding, businessPlan, pitchDeck, marketResearch, aiReport;

  if (isPhysical) {
    ideaAnalysis = {
      refinedIdea: `${startup.startupName || 'Your Business'} is a premium, beautifully designed local establishment focusing on high-quality offerings and exceptional, memorable customer experiences.`,
      problemStatement: "Customers in the area lack premium, aesthetically pleasing, and consistently high-quality options for daily consumption and socializing.",
      solution: "A highly aesthetic, premium local venue offering carefully curated products, excellent service, and a welcoming ambiance.",
      targetCustomers: ["Local Professionals", "Students & Remote Workers", "Premium Shoppers", "Families"],
      uniqueValueProposition: "Combining high-end, instagrammable aesthetics with premium quality products in an accessible, community-centric location.",
      businessModel: "Direct-to-Consumer Retail / Walk-in Sales & Delivery",
      revenueModel: ["Walk-in Sales", "Takeaway & Delivery", "Combo Offers & Memberships", "Office Bulk Orders/Catering"],
      coreFeatures: ["Premium Ambiance & Seating", "Curated Menu/Products", "Loyalty Program", "Fast, Friendly Service", "Branded Packaging"],
      marketOpportunity: "High local footfall and rapidly growing demand for premium, experiential retail and dining.",
      nextSteps: ["Secure Prime Location", "Finalize Interior Design & Branding", "Vendor Agreements & Sourcing", "Hire Initial Team"]
    };

    branding = {
      brandNameSuggestions: [startup.startupName || "Brew & Bloom", "The Local Leaf", "Aura", "Prime Reserve"],
      taglineSuggestions: ["Your Daily Escape.", "Premium Quality, Local Charm.", "Taste the Difference.", "Crafted for You."],
      logoConceptIdeas: "Minimalist wordmark with a subtle, elegant icon (like a leaf or abstract cup). Use clean, ample whitespace.",
      logoPrompt: `Create a professional, premium modern logo for a startup named "${startup.startupName || 'Breaktime'}".

${startup.startupName || 'This business'} is a local premium tea, coffee, and snacks brand with a sophisticated, welcoming aesthetic.

Logo Requirements:
- Clean vector-style logo
- Modern startup branding
- Simple memorable icon
- Strong readable typography
- White or transparent background
- No mockup, no 3D wall sign, no watermark
- Suitable for packaging, pitch deck, website, and mobile app

Generate:
1. Icon + text logo (coffee cup, tea leaf, or break/pause icon)
2. Text-only logo (elegant serif + sans-serif)
3. App icon style (bold initial or abstract symbol)

Style: Minimal, elegant, premium, vector-based. Colors: Coffee brown (#4B2E1E), Cream (#F5E6C8), Gold (#D4AF37), Black.`,
      logoStyle: "Minimal Elegant Premium",
      brandColorPalette: ["#4B2E1E (Coffee Brown)", "#F5E6C8 (Warm Cream)", "#D4AF37 (Gold)", "#111111 (Jet Black)"],
      fontStyleSuggestions: "Primary: 'Playfair Display' (Elegant Serif) | Secondary: 'Inter' (Clean Sans-Serif)",
      brandPersonality: "Welcoming, Premium, Aesthetic, Community-Focused, Sophisticated.",
      packagingStyleSuggestions: "Eco-friendly, matte-finish cups/bags with minimalist logo placement and a bold pop of the brand's accent color.",
      socialMediaIdeas: "High-quality, warm-toned photography of products; behind-the-scenes preparation videos; user-generated aesthetic interior shots.",
      websiteHero: `"Experience ${startup.startupName || 'Us'}. Your new favorite local spot for premium quality and comfort."`,
      marketingCaptions: ["Sip, relax, repeat. ☕", "Your new daily ritual is here.", "Elevating your local experience."]
    };
    
    businessPlan = {
      executiveSummary: `${startup.startupName || 'The business'} will redefine the local retail experience by offering premium products in a highly aesthetic, welcoming environment.`,
      problemAndSolution: "Problem: Uninspiring local options. Solution: A premium, design-forward establishment.",
      productDetails: "High-quality, locally sourced products, instagrammable interiors, and exceptional service.",
      targetCustomers: "Urban professionals, students, and local residents seeking quality.",
      businessModel: "Retail sales, takeaway, and potential B2B bulk catering orders.",
      revenueModel: "Walk-in revenue, loyalty subscriptions, and delivery app sales.",
      pricingStrategy: "Premium pricing (+15-20% above local average) justified by quality, branding, and experience.",
      goToMarketStrategy: "Local influencer marketing, grand opening event, targeted local social media ads, and flyers.",
      operationsPlan: "Open 7 days a week, 7 AM - 9 PM. Two shifts. Daily local sourcing for perishables.",
      teamRequirement: ["Store Manager", "Head Barista/Chef", "Marketing Lead (Part-time)", "Operations Staff (3-4x)"],
      financialProjection: "Year 1 Revenue: $250k, Break-even by Month 8, 25% Net Margin by Year 2.",
      fundingAsk: "$150,000 for lease deposit, interior setup, equipment, and initial inventory."
    };

    pitchDeck = [
      { slide: 1, title: "Cover Slide", content: `${startup.startupName || 'Business'} - Premium Local Experience` },
      { slide: 2, title: "Problem", content: "Lack of premium aesthetic venues in the local area." },
      { slide: 3, title: "Solution", content: "A high-end, beautifully designed space offering top-tier products." },
      { slide: 4, title: "Market Size", content: "Local addressable market of 50,000+ daily commuters/residents." },
      { slide: 5, title: "Product/Service Demo", content: "[Interior Mockups, Menu Highlights, & Branding]" },
      { slide: 6, title: "Business Model", content: "Walk-in, Takeaway, Delivery, & Bulk Orders." },
      { slide: 7, title: "Traction/Validation", content: "Pre-launch hype, 500+ waitlist/social followers." },
      { slide: 8, title: "Go-To-Market", content: "Local SEO, Influencer Partnerships, Grand Opening Event." },
      { slide: 9, title: "Team", content: "Experienced retail and hospitality operators." },
      { slide: 10, title: "Funding Ask", content: "$150k for Buildout, Licensing, and Launch." }
    ];

    marketResearch = {
      tam: "₹50M (Regional Market)",
      sam: "₹5M (City/District Market)",
      som: "₹500k (Local Neighborhood Target)",
      customerSegments: ["Daily Commuters", "Weekend Socializers", "Remote Workers", "Health-conscious locals"],
      competitorAnalysis: "Local Mom-and-Pop Shops (outdated), Generic Chains (impersonal). We win on quality and aesthetics.",
      marketTrends: ["Experiential Retail", "Premiumization", "Aesthetic Environments", "Local Sourcing"],
      opportunities: ["B2B Catering", "Branded Merchandise Sales", "Future Franchising"],
      risks: ["High Initial Rent/CapEx", "Staff Turnover", "Local Supply Chain Issues"],
      pricingSuggestions: "Premium pricing (+20% above market average) justified by quality and experience.",
      locationSuggestions: "High-footfall urban corners, near transit hubs or university campuses, large storefront windows."
    };

    aiReport = {
      investmentReadinessScore: 82,
      businessStrengths: ["Clear tangible product", "Strong local demand", "Aesthetic focus aligns with current trends"],
      weaknesses: ["High upfront capital required for buildout", "Geographically constrained initially"],
      riskFactors: ["High initial CapEx for interior", "Location dependency", "Staffing & training challenges"],
      improvementSuggestions: ["Secure a letter of intent for a prime location", "Develop a strong local marketing pre-launch campaign"],
      scalabilityScore: 65,
      fundingReadiness: "Good for local angel investors or small business loans.",
      mentorReviewSummary: "Solid physical business concept. Focus heavily on location scouting, lease negotiations, and creating a strong brand identity."
    };
  } else {
    ideaAnalysis = {
      refinedIdea: `${startup.startupName || 'Your SaaS'} is an innovative tech solution designed to streamline workflows, automate tasks, and drive 10x efficiency in its target sector.`,
      problemStatement: "Current software solutions are outdated, fragmented, manual, and fail to leverage modern AI capabilities.",
      solution: "A unified, intuitive AI-powered platform that automates tedious tasks and provides actionable, data-driven insights.",
      targetCustomers: ["SMBs", "Enterprise Teams", "Freelancers", "Agencies"],
      uniqueValueProposition: "10x faster execution and 50% cost reduction through seamless AI integration and intuitive UI/UX.",
      businessModel: "B2B SaaS (Software as a Service)",
      revenueModel: ["Freemium Tier (PLG)", "Pro Subscription ($49/mo)", "Enterprise Custom Plans ($999+/mo)"],
      coreFeatures: ["AI Automation Engine", "Real-time Analytics Dashboard", "Team Collaboration Tools", "API Integrations (Zapier, Slack)"],
      marketOpportunity: "Rapidly digitizing sector with high willingness to pay for efficiency and automation tools.",
      nextSteps: ["Design UI/UX Mockups", "Build MVP Engine", "Launch Beta", "Acquire First 100 Paid Users"]
    };

    branding = {
      brandNameSuggestions: [startup.startupName || "SyncAI", "FlowState", "Nexus", "AutomateHQ"],
      taglineSuggestions: ["Work Smarter, Not Harder.", "The AI operating system for your team.", "Automate your growth.", "Efficiency, redefined."],
      logoConceptIdeas: "Modern, geometric tech icon (like a connected node or forward arrow). Bold, lowercase tech font.",
      logoPrompt: `Create a professional, modern logo for a tech startup named "${startup.startupName || 'SyncAI'}".

${startup.startupName || 'This startup'} is an AI/SaaS platform that automates workflows and provides data-driven insights.

Logo Requirements:
- Clean vector-style logo
- Modern startup branding
- Simple memorable icon
- Strong readable typography
- White or transparent background
- No mockup, no watermark
- Suitable for website, mobile app, and pitch deck

Generate:
1. Abstract geometric tech icon + text logo
2. Text-only logo (bold, modern sans-serif)
3. App icon style (letter mark or abstract symbol)

Style: Minimal, futuristic, clean. Colors: Indigo (#4F46E5), Dark Slate (#111827), Light Gray (#F3F4F6), Success Green (#10B981).`,
      logoStyle: "Modern Minimal Tech",
      brandColorPalette: ["#4F46E5 (Vibrant Indigo)", "#111827 (Dark Slate)", "#F3F4F6 (Light Gray)", "#10B981 (Success Green)"],
      fontStyleSuggestions: "Primary: 'Inter' (Clean Sans-Serif) | Secondary: 'Roboto Mono' (Tech/Code Vibe)",
      brandPersonality: "Innovative, Trustworthy, Fast, Modern, Cutting-edge.",
      packagingStyleSuggestions: "Clean, dark-mode SaaS UI, heavy use of glassmorphism, subtle purple/blue gradients.",
      socialMediaIdeas: "Feature highlight videos, customer success stories, thought leadership threads on X/LinkedIn.",
      websiteHero: `"Automate your workflow in seconds. Join 10,000+ teams doing their best work with ${startup.startupName || '[Name]'}."`,
      marketingCaptions: ["Stop doing manual work. Let AI handle it. 🚀", "Scale your team without hiring.", "The future of work is here."]
    };
    
    businessPlan = {
      executiveSummary: `${startup.startupName || 'This SaaS'} aims to dominate the software niche by introducing advanced AI workflows to traditional, manual processes.`,
      problemAndSolution: "Problem: Inefficient workflows and scattered data. Solution: Automated, centralized SaaS platform.",
      productDetails: "Cloud-based dashboard, AI co-pilot assistants, robust API, and role-based access control.",
      targetCustomers: "Tech-forward SMBs and mid-market enterprises looking to cut operational costs.",
      businessModel: "Tiered SaaS recurring subscriptions with usage-based overages.",
      revenueModel: "Monthly/Annual recurring revenue (MRR/ARR).",
      pricingStrategy: "Value-based pricing. Free tier for individuals, $49/mo for teams, $499/mo for enterprise.",
      goToMarketStrategy: "Product-Led Growth (PLG), Content marketing/SEO, Product Hunt launch, and direct outbound sales.",
      operationsPlan: "Agile software development, 24/7 cloud hosting, automated customer support.",
      teamRequirement: ["Technical Co-founder (CTO)", "Growth Marketer", "Product Designer", "Full-Stack Engineer"],
      financialProjection: "Year 1 ARR: $100k. Year 2 ARR: $1M. Gross margin: 85%.",
      fundingAsk: "$500,000 for engineering hires, server costs, and go-to-market execution."
    };

    pitchDeck = [
      { slide: 1, title: "Cover Slide", content: `${startup.startupName || 'SaaS'} - The Future of Automated Workflows` },
      { slide: 2, title: "Problem", content: "Teams waste 40% of their week on manual, fragmented tasks." },
      { slide: 3, title: "Solution", content: "An all-in-one AI platform that connects tools and automates work." },
      { slide: 4, title: "Market Size", content: "$10B+ TAM in enterprise workflow automation." },
      { slide: 5, title: "Product Demo", content: "[Dashboard Screenshot & AI Flow Demo]" },
      { slide: 6, title: "Business Model", content: "SaaS: $49/mo Pro, $499/mo Enterprise." },
      { slide: 7, title: "Traction/Validation", content: "1,000+ waitlist, 5 beta enterprise pilots secured." },
      { slide: 8, title: "Go-To-Market", content: "PLG, SEO, and Outbound Sales Motion." },
      { slide: 9, title: "Team", content: "Ex-FAANG engineers and SaaS operators." },
      { slide: 10, title: "Funding Ask", content: "$500k Pre-Seed round for 18mo runway." }
    ];

    marketResearch = {
      tam: "₹10B (Global SaaS Market for Niche)",
      sam: "₹1B (Target Geography & Segment)",
      som: "₹10M (Attainable Year 1-3)",
      customerSegments: ["Operations Teams", "Marketing Agencies", "IT Departments", "Founders"],
      competitorAnalysis: "Legacy Incumbents (too complex/expensive), Horizontal Tools like Notion (too generic).",
      marketTrends: ["AI Integration", "No-code/Low-code tools", "Remote Work Enablement"],
      opportunities: ["Vertical-specific workflows", "Data monetization", "Marketplace app ecosystem"],
      risks: ["High customer acquisition costs (CAC)", "Data privacy regulations (GDPR/SOC2)", "Rapid AI obsolescence"],
      pricingSuggestions: "Value-based pricing. Start with a $49/mo base tier to reduce friction.",
      locationSuggestions: "N/A - Global remote-first digital product."
    };

    aiReport = {
      investmentReadinessScore: 88,
      businessStrengths: ["Highly scalable model", "Strong AI tailwinds", "High gross margins (80%+)"],
      weaknesses: ["High dependency on third-party AI APIs", "No initial brand recognition"],
      riskFactors: ["Fierce competition from well-funded incumbents", "Tech execution risk", "GTM dependency"],
      improvementSuggestions: ["Solidify the exact ICP (Ideal Customer Profile)", "Build a clickable prototype immediately for user testing"],
      scalabilityScore: 95,
      fundingReadiness: "Ready for Pre-Seed VC pitching.",
      mentorReviewSummary: "Excellent SaaS concept. Focus on building a rapid MVP, getting early user feedback, and securing design partners."
    };
  }

  return { ideaAnalysis, branding, businessPlan, pitchDeck, marketResearch, aiReport };
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

export const getDocuments = () => {
  try {
    const data = localStorage.getItem('ai_startup_builder_documents');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const migrateDocumentApplyLinks = () => {
  const docs = getDocuments();
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

export const saveDocument = (document: any) => {
  const current = getDocuments();
  const updated = [document, ...current];
  localStorage.setItem('ai_startup_builder_documents', JSON.stringify(updated));
  return updated;
};

export const getDocumentById = (id: string) => {
  const docs = getDocuments();
  return docs.find((d: any) => d.id === id) || null;
};

export const updateDocument = (id: string, updatedData: any) => {
  let docs = getDocuments();
  let updatedDoc = null;
  docs = docs.map((d: any) => {
    if (d.id === id) {
      updatedDoc = { ...d, ...updatedData };
      return updatedDoc;
    }
    return d;
  });
  if (updatedDoc) {
    localStorage.setItem('ai_startup_builder_documents', JSON.stringify(docs));
  }
  return updatedDoc;
};

export const deleteDocument = (id: string) => {
  const docs = getDocuments();
  const filtered = docs.filter((d: any) => d.id !== id);
  localStorage.setItem('ai_startup_builder_documents', JSON.stringify(filtered));
  return filtered;
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

// ────────────────────────────────────────────────────────────
// Logo Helpers
// ────────────────────────────────────────────────────────────

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
