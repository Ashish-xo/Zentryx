export default {
            routes: {
                "amritsar_udaipur": { distance: "980 km", train: "18-22 hours (via Delhi/Jaipur)", trainCost: "800-2500 INR", bus: "16-20 hours", busCost: "900-1800 INR", flight: "3-4 hours (1 stop)", flightCost: "4000-8000 INR" },
                "amritsar_shimla": { distance: "260 km", train: "8-10 hours (via Kalka)", trainCost: "350-1200 INR", bus: "6-8 hours", busCost: "400-800 INR", flight: "N/A (nearest Chandigarh)", flightCost: "3000-5000 INR" },
                "amritsar_delhi": { distance: "450 km", train: "6-8 hours", trainCost: "400-1800 INR", bus: "7-9 hours", busCost: "500-1200 INR", flight: "1.5 hours", flightCost: "3000-6000 INR" },
                "delhi_mumbai": { distance: "1400 km", train: "16-22 hours", trainCost: "600-3500 INR", bus: "22-26 hours", busCost: "1000-2500 INR", flight: "2 hours", flightCost: "3500-8000 INR" },
                "delhi_goa": { distance: "1900 km", train: "26-34 hours", trainCost: "800-3000 INR", bus: "28-32 hours", busCost: "1200-2500 INR", flight: "2.5 hours", flightCost: "4000-9000 INR" },
                "delhi_jaipur": { distance: "280 km", train: "4-5 hours", trainCost: "300-1200 INR", bus: "5-6 hours", busCost: "400-900 INR", flight: "1 hour", flightCost: "2500-5000 INR" },
                "mumbai_goa": { distance: "590 km", train: "8-12 hours", trainCost: "500-2000 INR", bus: "10-14 hours", busCost: "600-1500 INR", flight: "1.5 hours", flightCost: "2500-6000 INR" },
                "delhi_manali": { distance: "540 km", train: "14 hours (to Chandigarh+bus)", trainCost: "500-1500 INR", bus: "12-14 hours", busCost: "700-1500 INR", flight: "N/A (via Kullu)", flightCost: "4000-7000 INR" },
                "bangalore_chennai": { distance: "350 km", train: "5-6 hours", trainCost: "300-1200 INR", bus: "6-7 hours", busCost: "400-1000 INR", flight: "1 hour", flightCost: "2500-5000 INR" },
                "kolkata_darjeeling": { distance: "600 km", train: "10-12 hours (to NJP)", trainCost: "500-1800 INR", bus: "14-16 hours", busCost: "600-1200 INR", flight: "1 hour (to Bagdogra)", flightCost: "3500-7000 INR" },
                "amritsar_tokyo": { distance: "6200 km", train: "N/A", trainCost: "N/A", bus: "N/A", busCost: "N/A", flight: "10-14 hours (1-2 stops)", flightCost: "35000-85000 INR / 60000-150000 JPY" },
                "delhi_bangkok": { distance: "2900 km", train: "N/A", trainCost: "N/A", bus: "N/A", busCost: "N/A", flight: "4 hours", flightCost: "8000-25000 INR / 3500-11000 THB" },
                "delhi_dubai": { distance: "2200 km", train: "N/A", trainCost: "N/A", bus: "N/A", busCost: "N/A", flight: "3.5 hours", flightCost: "10000-30000 INR / 450-1300 AED" },
                "mumbai_singapore": { distance: "3900 km", train: "N/A", trainCost: "N/A", bus: "N/A", busCost: "N/A", flight: "5.5 hours", flightCost: "12000-35000 INR / 220-650 SGD" },
            },
            dailyCosts: {
                "india_budget": { hotel: "500-1000 INR", food: "300-500 INR", local: "200-400 INR" },
                "india_moderate": { hotel: "2000-4000 INR", food: "800-1500 INR", local: "500-1000 INR" },
                "india_luxury": { hotel: "8000-15000 INR", food: "2000-4000 INR", local: "1500-3000 INR" },
                "japan_budget": { hotel: "3000-5000 JPY / 1700-2800 INR", food: "1500-3000 JPY / 850-1700 INR", local: "1000-2000 JPY / 570-1130 INR" },
                "japan_moderate": { hotel: "8000-15000 JPY", food: "3000-6000 JPY", local: "2000-4000 JPY" },
                "thailand_budget": { hotel: "500-1000 THB / 1200-2400 INR", food: "300-600 THB / 720-1440 INR", local: "200-500 THB / 480-1200 INR" },
                "dubai_budget": { hotel: "200-400 AED / 4500-9000 INR", food: "80-150 AED / 1800-3400 INR", local: "50-100 AED / 1100-2300 INR" },
            },
            hotels: {
                "amritsar": [
                    { name: "Taj Swarna", phone: "+91 8746317213", email: "reservations@tajswarna.com", website: "https://www.tajswarna.com", address: "Near amritsar city centre, amritsar, India", price: "8,500 INR", priceVal: 8500, rating: 4.8, status: "3 rooms left", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" },
                    { name: "Radisson Blu", phone: "+91 6478163327", email: "reservations@radissonblu.com", website: "https://www.radissonblu.com", address: "Near amritsar city centre, amritsar, India", price: "5,200 INR", priceVal: 5200, rating: 4.5, status: "Available", img: "https://images.unsplash.com/photo-1551882547-ff43c69e5cf2?w=400" },
                    { name: "Hyatt Regency", phone: "+91 6107420369", email: "reservations@hyattregency.com", website: "https://www.hyattregency.com", address: "Near amritsar city centre, amritsar, India", price: "6,800 INR", priceVal: 6800, rating: 4.6, status: "Available", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
                    { name: "Hotel Ritz", phone: "+91 9184935163", email: "reservations@hotelritz.com", website: "https://www.hotelritz.com", address: "Near amritsar city centre, amritsar, India", price: "3,500 INR", priceVal: 3500, rating: 4.1, status: "5 rooms left", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400" },
                    { name: "Golden Tulip", phone: "+91 7181241943", email: "reservations@goldentulip.com", website: "https://www.goldentulip.com", address: "Near amritsar city centre, amritsar, India", price: "4,200 INR", priceVal: 4200, rating: 4.3, status: "Available", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400" }
                ],
                "udaipur": [
                    { name: "The Leela Palace", phone: "+91 7051802512", email: "reservations@theleelapalace.com", website: "https://www.theleelapalace.com", address: "Near udaipur city centre, udaipur, India", price: "25,000 INR", priceVal: 25000, rating: 4.9, status: "1 room left!", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400" },
                    { name: "Lake Pichola Hotel", phone: "+91 6958682846", email: "reservations@lakepicholahotel.com", website: "https://www.lakepicholahotel.com", address: "Near udaipur city centre, udaipur, India", price: "4,500 INR", priceVal: 4500, rating: 4.2, status: "Available", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
                    { name: "Trident Udaipur", phone: "+91 6599310825", email: "reservations@tridentudaipur.com", website: "https://www.tridentudaipur.com", address: "Near udaipur city centre, udaipur, India", price: "12,000 INR", priceVal: 12000, rating: 4.7, status: "Available", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" },
                    { name: "Jagmandir Island Palace", phone: "+91 9163119785", email: "reservations@jagmandirislandpalace.com", website: "https://www.jagmandirislandpalace.com", address: "Near udaipur city centre, udaipur, India", price: "35,000 INR", priceVal: 35000, rating: 4.9, status: "Available", img: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=400" },
                    { name: "Chunda Palace", phone: "+91 6440213415", email: "reservations@chundapalace.com", website: "https://www.chundapalace.com", address: "Near udaipur city centre, udaipur, India", price: "9,500 INR", priceVal: 9500, rating: 4.5, status: "Available", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400" }
                ],
                "delhi": [
                    { name: "The Lodhi", phone: "+91 8906402157", email: "reservations@thelodhi.com", website: "https://www.thelodhi.com", address: "Near delhi city centre, delhi, India", price: "18,000 INR", priceVal: 18000, rating: 4.7, status: "Available", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400" },
                    { name: "Bloomrooms @ Janpath", phone: "+91 9181143731", email: "reservations@bloomroomsjanpath.com", website: "https://www.bloomroomsjanpath.com", address: "Near delhi city centre, delhi, India", price: "3,800 INR", priceVal: 3800, rating: 4.4, status: "Fully booked", img: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=400" },
                    { name: "The Lalit New Delhi", phone: "+91 9831882064", email: "reservations@thelalitnewdelhi.com", website: "https://www.thelalitnewdelhi.com", address: "Near delhi city centre, delhi, India", price: "9,000 INR", priceVal: 9000, rating: 4.5, status: "5 rooms left", img: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=400" },
                    { name: "Le Meridien", phone: "+91 8342331444", email: "reservations@lemeridien.com", website: "https://www.lemeridien.com", address: "Near delhi city centre, delhi, India", price: "11,500 INR", priceVal: 11500, rating: 4.6, status: "Available", img: "https://images.unsplash.com/photo-1551882547-ff43c69e5cf2?w=400" },
                    { name: "Andaz Delhi", phone: "+91 6373399426", email: "reservations@andazdelhi.com", website: "https://www.andazdelhi.com", address: "Near delhi city centre, delhi, India", price: "14,000 INR", priceVal: 14000, rating: 4.7, status: "Available", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" }
                ],
                "mumbai": [
                    { name: "Taj Mahal Palace", phone: "+91 8536146025", email: "reservations@tajmahalpalace.com", website: "https://www.tajmahalpalace.com", address: "Near mumbai city centre, mumbai, India", price: "22,000 INR", priceVal: 22000, rating: 4.9, status: "Available", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400" },
                    { name: "Sahara Star", phone: "+91 7812140441", email: "reservations@saharastar.com", website: "https://www.saharastar.com", address: "Near mumbai city centre, mumbai, India", price: "7,500 INR", priceVal: 7500, rating: 4.3, status: "5 rooms left", img: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?w=400" },
                    { name: "The Oberoi", phone: "+91 6136505587", email: "reservations@theoberoi.com", website: "https://www.theoberoi.com", address: "Near mumbai city centre, mumbai, India", price: "20,000 INR", priceVal: 20000, rating: 4.8, status: "Available", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400" },
                    { name: "JW Marriott Juhu", phone: "+91 6127978094", email: "reservations@jwmarriottjuhu.com", website: "https://www.jwmarriottjuhu.com", address: "Near mumbai city centre, mumbai, India", price: "16,000 INR", priceVal: 16000, rating: 4.7, status: "4 rooms left", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400" },
                    { name: "ITC Maratha", phone: "+91 6402418010", email: "reservations@itcmaratha.com", website: "https://www.itcmaratha.com", address: "Near mumbai city centre, mumbai, India", price: "13,000 INR", priceVal: 13000, rating: 4.6, status: "Available", img: "https://images.unsplash.com/photo-1551882547-ff43c69e5cf2?w=400" }
                ],
                "goa": [
                    { name: "W Goa", phone: "+91 6939042955", email: "reservations@wgoa.com", website: "https://www.wgoa.com", address: "Near goa city centre, goa, India", price: "15,000 INR", priceVal: 15000, rating: 4.8, status: "Available", img: "https://images.unsplash.com/photo-1512918766671-56001217329d?w=400" },
                    { name: "Beleza By The Beach", phone: "+91 6999270936", email: "reservations@belezabythebeach.com", website: "https://www.belezabythebeach.com", address: "Near goa city centre, goa, India", price: "6,500 INR", priceVal: 6500, rating: 4.4, status: "Available", img: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400" },
                    { name: "The Leela Goa", phone: "+91 8170484433", email: "reservations@theleelagoa.com", website: "https://www.theleelagoa.com", address: "Near goa city centre, goa, India", price: "18,500 INR", priceVal: 18500, rating: 4.7, status: "Available", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400" },
                    { name: "Planet Hollywood", phone: "+91 8585650756", email: "reservations@planethollywood.com", website: "https://www.planethollywood.com", address: "Near goa city centre, goa, India", price: "9,000 INR", priceVal: 9000, rating: 4.3, status: "6 rooms left", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" },
                    { name: "Novotel Goa Resort", phone: "+91 6113971123", email: "reservations@novotelgoaresort.com", website: "https://www.novotelgoaresort.com", address: "Near goa city centre, goa, India", price: "7,800 INR", priceVal: 7800, rating: 4.2, status: "Available", img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400" }
                ]
            },
            tips: [
                "Book train tickets on IRCTC 2-3 months in advance for the best prices.",
                "Tatkal tickets open at 10 AM for AC and 11 AM for Sleeper class.",
                "Use RailYatri or ixigo apps for live train status tracking.",
                "Budget hotels can be found on OYO, Goibibo, or MakeMyTrip.",
                "Always carry some cash in smaller towns — UPI may not work everywhere.",
                "For international travel, book flights on Tuesdays for the best deals.",
                "Use Google Maps offline mode — download maps before your trip.",
            ]
        };
