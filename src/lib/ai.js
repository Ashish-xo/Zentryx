// AI engine — local knowledge router + API caller
// Ported faithfully from the original inline script

import travelDB from '../data/travelDB';
import destinations from '../data/destinations';
import { fetchWeatherForCity } from './weather';

const AI_HOURLY_LIMIT = 20;

// --- Quota (per-browser, hourly) ---
export function aiQuotaState() {
  try {
    return JSON.parse(localStorage.getItem('zentryx_ai_quota') || '{"w":0,"c":0,"d":""}');
  } catch { return { w: 0, c: 0, d: "" }; }
}

export function aiQuotaRemaining() {
  const now = Date.now();
  const s = aiQuotaState();
  const today = new Date().toDateString();
  if (now - s.w > 3600000 || s.d !== today) {
    s.w = now; s.c = 0; s.d = today;
    localStorage.setItem('zentryx_ai_quota', JSON.stringify(s));
  }
  return AI_HOURLY_LIMIT - (s.c || 0);
}

export function aiQuotaConsume() {
  const s = aiQuotaState();
  s.c = (s.c || 0) + 1;
  localStorage.setItem('zentryx_ai_quota', JSON.stringify(s));
}

// --- Route finding ---
export function findRoute(text) {
  const q = text.toLowerCase();
  const routes = travelDB.routes;
  for (const key of Object.keys(routes)) {
    const [cityA, cityB] = key.split('_');
    if (q.includes(cityA) && q.includes(cityB)) return routes[key];
  }
  // Try reverse
  for (const key of Object.keys(routes)) {
    const [cityA, cityB] = key.split('_');
    if (q.includes(cityB) && q.includes(cityA)) return routes[key];
  }
  return null;
}

// --- BYOK: each visitor brings their own AI key ---
export function getAiSettings() {
  try { return JSON.parse(localStorage.getItem('zentryx_ai') || 'null'); } catch { return null; }
}

export function saveAiSettings(settings) {
  localStorage.setItem('zentryx_ai', JSON.stringify(settings));
}

export function clearAiSettings() {
  localStorage.removeItem('zentryx_ai');
}

// --- Local knowledge router (zero-token answers) ---
export function getLocalAnswer(question) {
  const q = question.toLowerCase();

  // GREETINGS
  if (/^\s*@?ai\s*[!.]?\s*$|^(hello|hi|hey|hii|sup|yo|hola|namaste)\b[!.?\s]*$/i.test(q))
    return `Hello! I'm Zentryx AI. Tag @ai before your message to ask me anything — travel, science, math, coding, history, or any topic. Powered by OpenCode AI.`;

  // WEATHER
  if (q.includes('weather') || q.includes('wheather') || q.includes('forecast') || q.includes('temperature') || /\brain\b/i.test(q) || q.includes('humidity') || q.includes('climate'))
    return fetchWeatherForCity(q);

  // DIRECTIONS
  if (q.includes('direction') || q.includes('navigate') || q.includes('compass') || q.includes('north star') || q.includes('polaris') || q.includes('which way is') || q.includes('find my way') || q.includes('bearing'))
    return `Basic Direction Finding:\n1. Sun: Rises in the East, sets in the West. At noon, your shadow points North (Northern Hemisphere).\n2. Night sky: Find the Big Dipper constellation, then follow its two pointer stars to Polaris (North Star) which always points True North.\n3. Watch method: Point the hour hand at the sun. South is halfway between the hour hand and 12 o'clock.\n4. Moss: Tends to grow on the shaded (North) side of trees.\n5. Stick & shadow: Push a stick vertically into the ground, mark the shadow tip, wait 15 min, mark again. The line from first to second mark points East.`;

  // SURVIVAL: FIRE
  if (/(start|make|build|light).{0,15}fire|fire.{0,15}(start|make|build|tinder|survival|drill|bow|without)/i.test(q))
    return `Survival — Starting a Fire:\n1. Gather dry tinder: dead grass, dry leaves, bark shavings, cotton fluff.\n2. Collect kindling: pencil-thin dry twigs and small sticks.\n3. Build a teepee shape with kindling over the tinder.\n4. Ignite: Use a lighter, match, ferro rod, or friction (bow drill method).\n5. Gently blow at the base of the tinder to feed the ember oxygen.\n6. Add larger sticks gradually as the fire grows.\nKey rule: Dead, dry wood burns. Green or wet wood only smokes.`;

  // SURVIVAL: WATER
  if (/(purif|boil|filter).{0,15}water|water.{0,15}(purif|boil|filter|stream)|dehydrat|water.{0,10}survival/i.test(q))
    return `Water Purification in the Wild:\n1. Boiling: Bring to a rolling boil for 1 full minute (3 minutes above 2,000m altitude). Most effective method.\n2. Chemical: Iodine or chlorine dioxide tablets — wait 30 minutes after adding.\n3. Solar (SODIS): Fill a clear plastic bottle, leave in direct sunlight for 6+ hours.\n4. Improvised filter: Layer grass, sand, and charcoal in a container — removes particles but does NOT kill pathogens (always boil after).\n5. Signs of safe water: fast-moving streams are safer than stagnant pools. Never drink water that smells foul or looks oily.`;

  // SURVIVAL: SHELTER
  if (q.includes('shelter') || q.includes('tent') || (q.includes('build') && q.includes('camp')) || q.includes('survive night') || q.includes('stay warm'))
    return `Emergency Shelter Building:\n1. First priority: get off the cold ground. Insulation below you is more important than above.\n2. Lean-to: Rest a long branch at 45° against a tree, lay smaller branches across it, cover with leaves and bark.\n3. Debris hut: Build a ribbed frame over a long "ridgepole", pile 1 meter of dry leaves over it for insulation.\n4. Face the shelter door away from prevailing wind.\n5. Size matters: A shelter just big enough to lie down in retains body heat far better than a large one.\n6. Dry leaves, pine needles, and grass on the floor add insulation from the cold ground.`;

  // SURVIVAL: FIRST AID
  if (q.includes('first aid') || q.includes('bleed') || q.includes('wound') || q.includes('injury') || q.includes('burn') || q.includes('snake bite') || q.includes('fracture') || q.includes('broken bone'))
    return `Basic Wilderness First Aid:\nBleeding: Apply firm direct pressure with a clean cloth. Do not remove — add more cloth on top. Elevate the limb above heart level.\nBurns: Cool with running clean water for 10+ minutes. Never use ice, butter, or toothpaste. Cover loosely with a clean cloth.\nFracture/Broken bone: Immobilize it. Use sticks and cloth as a splint. Do not try to straighten the bone.\nSnake bite: Keep calm (fast breathing spreads venom faster). Immobilize the bitten limb below heart level. Get to medical help ASAP. Never suck out venom, cut the wound, or apply a tourniquet.\nHeat stroke: Move to shade immediately, cool with water/wet cloth on neck/armpits. Fan vigorously.`;

  // SURVIVAL: FOOD / FORAGING
  if ((q.includes('food') && q.includes('wild')) || q.includes('forag') || q.includes('edible plant') || q.includes('eat in the wild'))
    return `Wild Food Foraging Basics:\n1. Universal Edibility Test: Rub plant on wrist, wait 15 min for reaction. Then touch to lips, wait. Then a small piece on tongue. Swallow only if no burning/tingling after each step.\n2. Safe bets: Pine inner bark (edible), Cattail roots and shoots (highly nutritious), Dandelion (entire plant edible), Blackberries/raspberries (if you recognize them).\n3. AVOID: Mushrooms unless expert-identified. White or yellow berries (90% are poisonous). Anything that smells like almonds (cyanide). Shiny leaves (often toxic).\n4. Insects: Grasshoppers, ants, and grubs are high-protein survival food worldwide. Remove wings and legs, cook before eating.`;

  // SURVIVAL: SIGNALING
  if (q.includes('sos') || q.includes('rescue') || q.includes('signal for help') || q.includes('help find me') || (q.includes('lost') && (q.includes('wild') || q.includes('forest') || q.includes('jungle') || q.includes('mountains'))))
    return `Signaling for Rescue (SOS):\n1. International distress signal: 3 of anything — 3 whistle blasts, 3 fires in a triangle, 3 gunshots.\n2. Signal mirror: Flash sunlight toward aircraft or distant points. Can be seen 80+ km away on a clear day.\n3. Ground-to-air signals: Stamp large symbols in snow or arrange rocks/logs. X = need medical help. V = need help. Arrow = travelling this direction.\n4. Fire/smoke: Green leafy wood creates white smoke visible in forests. Rubber or plastic creates dark smoke visible in open terrain.\n5. Stay put: Rescuers search from your last known position. Moving makes you harder to find.`;

  // GENERAL SCIENCE
  if (q.includes('speed of light')) return `Speed of light in a vacuum: 299,792,458 m/s (approximately 3 × 10^8 m/s or 300,000 km/s). Nothing with mass can travel this fast.`;
  if (q.includes('speed of sound')) return `Speed of sound in dry air at 20°C: approximately 343 m/s (1,235 km/h). It varies with temperature and medium — sound travels faster in water (~1,480 m/s) and even faster in steel (~5,000 m/s).`;
  if (q.includes('gravity')) return `Gravity: Earth's gravitational acceleration is 9.8 m/s². Gravity is the attractive force between any two masses. The Moon's gravity is about 1/6th of Earth's (1.62 m/s²). Black holes have gravity so strong that not even light can escape.`;
  if (q.includes('dna') || q.includes('chromosome') || q.includes('gene'))
    return `DNA (Deoxyribonucleic Acid) is the molecule that carries genetic instructions in all living organisms. It has a double helix structure made of 4 base pairs: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C). Humans have 46 chromosomes (23 pairs) containing approximately 20,000-25,000 genes. DNA is found in the nucleus of every cell.`;

  // GEOGRAPHY
  if (q.includes('capital of') || q.includes('capital city')) {
    const capitals = { india: 'New Delhi', usa: 'Washington D.C.', uk: 'London', france: 'Paris', japan: 'Tokyo', china: 'Beijing', australia: 'Canberra', canada: 'Ottawa', russia: 'Moscow', germany: 'Berlin', brazil: 'Brasilia', italy: 'Rome', spain: 'Madrid' };
    for (const [country, capital] of Object.entries(capitals)) {
      if (q.includes(country)) return `The capital of ${country.charAt(0).toUpperCase() + country.slice(1)} is ${capital}.`;
    }
  }
  if (q.includes('largest country') || q.includes('biggest country'))
    return `The largest countries by area:\n1. Russia — 17.1 million km²\n2. Canada — 10.0 million km²\n3. USA — 9.8 million km²\n4. China — 9.6 million km²\n5. Brazil — 8.5 million km²`;
  if (q.includes('tallest mountain') || q.includes('highest mountain') || q.includes('mount everest'))
    return `Mount Everest (Sagarmatha / Chomolungma) is the tallest mountain on Earth at 8,848.86 meters (29,031.7 feet). Located in the Himalayas on the border of Nepal and Tibet. First summited on May 29, 1953 by Sir Edmund Hillary and Tenzing Norgay.`;
  if (q.includes('longest river') || q.includes('nile') || q.includes('amazon river'))
    return `The Nile River in Africa is traditionally considered the world's longest river at approximately 6,650 km (4,130 miles). However, the Amazon River in South America (6,400 km) is broader and carries the most water volume.`;
  if (q.includes('population of') || q.includes('most populated')) {
    if (q.includes('india')) return `India's population is approximately 1.44 billion people (2024), making it the world's most populous country.`;
    if (q.includes('china')) return `China's population is approximately 1.41 billion people (2024). India has now surpassed China as the world's most populous country.`;
    if (q.includes('world')) return `The world population is approximately 8.1 billion people (2024). Most populous: 1. India (~1.44B), 2. China (~1.41B), 3. USA (~335M), 4. Indonesia (~278M), 5. Pakistan (~230M).`;
  }

  // HISTORY
  if (q.includes('world war') || q.includes('ww1') || q.includes('ww2') || q.includes('world war 2') || q.includes('world war 1')) {
    if (q.includes('1') || q.includes('one') || q.includes('ww1') || q.includes('first'))
      return `World War 1 (1914-1918): Triggered by the assassination of Archduke Franz Ferdinand. Allied Powers (France, UK, Russia, USA) defeated Central Powers (Germany, Austria-Hungary, Ottoman Empire). ~20 million deaths, collapse of four empires.`;
    return `World War 2 (1939-1945): Started when Nazi Germany invaded Poland. Allied Powers (USA, UK, Soviet Union, France) defeated Axis Powers (Germany, Italy, Japan). ~70-85 million deaths, UN founded, Cold War began.`;
  }
  if (q.includes('independence') && q.includes('india'))
    return `India gained independence from British rule on August 15, 1947. Led by Mahatma Gandhi, Jawaharlal Nehru, Subhas Chandra Bose, and many others. Partition simultaneously created Pakistan.`;

  // MATH
  if (q.includes('pythagor'))
    return `Pythagorean Theorem: In a right-angled triangle, a² + b² = c², where c is the hypotenuse. Example: If a=3 and b=4, then c = √(9+16) = √25 = 5. Named after Greek mathematician Pythagoras (570-495 BC).`;
  if (/\bpi\b/i.test(q) && (q.includes('math') || q.includes('value')))
    return `Pi (π) is the ratio of a circle's circumference to its diameter. Approximately 3.14159265358979... It is an irrational number. Circumference = 2πr, Area = πr².`;

  // TRAVEL ROUTES
  const route = findRoute(q);
  if (route) {
    let response = `Travel route from your query:\nDistance: ${route.distance}\n`;
    if (route.train !== 'N/A') response += `Train: ${route.train} — Cost approx. ${route.trainCost}\n`;
    if (route.bus !== 'N/A') response += `Bus: ${route.bus} — Cost approx. ${route.busCost}\n`;
    response += `Flight: ${route.flight} — Cost approx. ${route.flightCost}\n`;
    if (q.includes('budget') || q.includes('expense') || q.includes('cost') || q.includes('stay')) {
      response += `\nDaily expenses in India:\nBudget: Hotel ${travelDB.dailyCosts.india_budget.hotel}, Food ${travelDB.dailyCosts.india_budget.food}\nModerate: Hotel ${travelDB.dailyCosts.india_moderate.hotel}, Food ${travelDB.dailyCosts.india_moderate.food}\n`;
    }
    const tip = travelDB.tips[Math.floor(Math.random() * travelDB.tips.length)];
    response += `\nTip: ${tip}`;
    return response;
  }

  // GENERAL TRAVEL
  if (q.includes('budget') || q.includes('cheap') || q.includes('expense'))
    return `Budget travel in India: Hotels 500-1000 INR/night, Food 300-500 INR/day, Local transport 200-400 INR/day using buses and autos.`;
  if (q.includes('hotel') || q.includes('stay') || q.includes('accommodation'))
    return `India hotel price ranges: Budget (500-1500 INR), Mid-range (2000-5000 INR), Luxury (8000+ INR). Book via MakeMyTrip, OYO, or Goibibo.`;
  if (q.includes('train') || q.includes('rail') || q.includes('irctc'))
    return `Indian Railways: Book on irctc.co.in up to 120 days ahead. Tatkal opens at 10 AM (AC) / 11 AM (Sleeper). Fare for 500km: 350-2000 INR.`;
  if (q.includes('flight') || /\bfly\b/i.test(q) || q.includes('airplane'))
    return `Domestic flights in India: 3000-8000 INR for most routes. Book 1-2 months ahead on IndiGo, SpiceJet, or Air India.`;
  if (q.includes('food') || q.includes('restaurant') || /\beat\b/i.test(q))
    return `Food in India: Street food 30-100 INR, Local restaurant 100-300 INR, Fine dining 1000+ INR. A thali is the best value at 80-200 INR.`;

  return null; // No local match — needs the LLM
}

// --- Offline fallback ---
export function getOfflineResponse(question) {
  const a = getLocalAnswer(question);
  if (a !== null) return a;
  return `I couldn't reach the AI server right now — this might be a temporary network issue. Please try again in a moment. In the meantime, I can answer questions about: travel routes, survival skills, directions, geography, science, history, and math.`;
}

// --- Weather lookup (within local router) — uses imported fetchWeatherForCity from ./weather
// (The local trash function was removed — the real weather.js version handles GPS fallback)

// --- Server-side API call ---
let chatHistory = [];

export async function queryAI(prompt, skipLocal = false) {
  // Layer 3: local knowledge router first
  if (!skipLocal) {
    const local = getLocalAnswer(prompt);
    if (local !== null) return local;
  }

  // Layer 2: per-browser quota
  if (aiQuotaRemaining() <= 0)
    return `You've reached this browser's AI limit for the hour (${AI_HOURLY_LIMIT} questions). The offline knowledge base still answers routes, weather, and general questions — or try again in a bit.`;
  aiQuotaConsume();

  let useDirectFallback = false;
  let res;

  // BYOK: check if the visitor has configured their own API key
  const aiCfg = getAiSettings() || {};
  if (!aiCfg.apiKey) {
    return `Add your own free AI key to unlock the full assistant: open Settings (⚙️) → AI Connection → Setup Guide. Until then, the offline knowledge base answers routes, weather, and general questions.`;
  }

  const payload = {
    message: prompt,
    history: chatHistory.slice(-6),
    max_tokens: 512,
    apiKey: aiCfg.apiKey,
    provider: aiCfg.provider || 'openai',
    baseUrl: aiCfg.baseUrl || 'https://api.b.ai/v1'
  };
  if (aiCfg.model) payload.model = aiCfg.model;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });
    clearTimeout(timeoutId);
    if (!res.ok && res.status !== 429) useDirectFallback = true;
  } catch {
    useDirectFallback = true;
  }

  if (useDirectFallback) {
    return getOfflineResponse(prompt);
  }

  try {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 401) {
        return `Your API key was rejected by the provider. Open Settings (⚙️) → AI Connection, check your key and base URL, then Save. (Tip: keys usually start with "sk-".)`;
      }
      if (res.status === 429) {
        if (errData && errData.error && String(errData.error).includes('budget'))
          return getOfflineResponse(prompt);
        return 'You are sending too many requests. Please wait a moment and try again.';
      }
      const msg = errData?.error || '';
      if (typeof msg === 'string' && msg.length > 4 && msg.length < 200) {
        return `AI provider error: ${msg}`;
      }
      return getOfflineResponse(prompt);
    }
    const data = await res.json();
    const text = data.response;
    if (text && text.length > 3) {
      chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
      chatHistory.push({ role: 'model', parts: [{ text }] });
      if (chatHistory.length > 40) chatHistory = chatHistory.slice(-40);
      return text;
    }
    return getOfflineResponse(prompt);
  } catch {
    return getOfflineResponse(prompt);
  }
}

export async function queryBudgetAI(prompt) {
  const route = findRoute(prompt);
  if (route) {
    const dc = travelDB.dailyCosts;
    return JSON.stringify({
      cheapest: { travel_cost: route.busCost || route.trainCost, hotel_rating: '1-2 star / Hostel', hotel_cost: dc.india_budget.hotel + '/night', tickets: route.trainCost, food: dc.india_budget.food + '/day', total: 'Approx 2000-4000 INR/day' },
      moderate: { travel_cost: route.trainCost, hotel_rating: '3 star', hotel_cost: dc.india_moderate.hotel + '/night', tickets: route.trainCost, food: dc.india_moderate.food + '/day', total: 'Approx 4000-8000 INR/day' },
      expensive: { travel_cost: route.flightCost, hotel_rating: '4-5 star', hotel_cost: dc.india_luxury.hotel + '/night', tickets: route.flightCost, food: dc.india_luxury.food + '/day', total: 'Approx 12000-25000 INR/day' }
    });
  }
  if (aiQuotaRemaining() <= 0) return null;
  aiQuotaConsume();

  const aiCfg = getAiSettings() || {};
  if (!aiCfg.apiKey) return null;

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        system: 'You are a travel budget calculator. Return ONLY raw JSON with no markdown, no backticks, no explanation. The JSON must have exactly 3 keys: cheapest, moderate, expensive. Each key must be an object with: travel_cost, hotel_rating, hotel_cost, tickets, food, total.',
        max_tokens: 2048,
        apiKey: aiCfg.apiKey,
        provider: aiCfg.provider || 'openai',
        baseUrl: aiCfg.baseUrl || 'https://api.b.ai/v1',
        ...(aiCfg.model ? { model: aiCfg.model } : {})
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response || null;
  } catch { return null; }
}