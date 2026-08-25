export default {
            users: [
                { id: 1, name: "Marcus_T001", lat: 31.1048, lon: 77.1734, status: "Eating at Cafe Sol, Shimla", trust: 5.0, vibe: "Verified Traveler" },
                { id: 2, name: "Sara_Geo", lat: 31.1120, lon: 77.1680, status: "Hotel Ridge — 2 Rooms Left!", trust: 4.9, vibe: "Local Insider" },
                { id: 3, name: "Arjun_X", lat: 31.1030, lon: 77.1850, status: "Trekking Jakhu Temple — Clear Path", trust: 4.2, vibe: "Explorer" }
            ],
            hotspots: [
                { id: 101, name: "Cafe Sol", lat: 31.1044, lon: 77.1740, availability: "Medium Crowd", type: "cafe", posts: ["Best coffee in town!", "Live music at 8 PM."] },
                { id: 102, name: "The Ridge Hotel", lat: 31.1055, lon: 77.1710, availability: "2 Rooms Left", type: "hotel", posts: ["Valley view is peak right now.", "Update: Fully booked for Friday."] },
                { id: 103, name: "Mall Road Square", lat: 31.1040, lon: 77.1730, availability: "Peak Hours", type: "event", posts: ["Handicraft fair starting!"] }
            ],
            alerts: [
                { id: 201, lat: 31.1150, lon: 77.1600, type: "weather", msg: "Light Rain starting soon in North Shimla", severity: "Medium" },
                { id: 202, lat: 31.1045, lon: 77.1735, type: "traffic", msg: "Mall Road Traffic Alert: VIP Movement", severity: "High" }
            ],
            threads: [
                { id: 1, user: "Marcus_T001", rank: "Verified Traveler", trust: "4.8★", msg: "Anyone headed to Kasol this weekend? Looking for a shared cab from Chandigarh. Split costs 50/50.", time: "2h ago" },
                { id: 2, user: "Sara_Geo", rank: "Local Insider", trust: "5.0★", msg: "WARNING: Heavy fog on Shimla Bypass. Visibility is less than 5 meters. Take Kalka-Shimla highway instead.", time: "45m ago" },
                { id: 3, user: "Traveler_99", rank: "Newbie", trust: "3.2★", msg: "Found a hidden cafe near Mall Road with free Wi-Fi and 500mbps speed! It's called 'CyberBrew'.", time: "10m ago" }
            ],
            ranking: [
                { user: "Sara_Geo", assists: 142, xp: 980 },
                { user: "Marcus_T001", assists: 89, xp: 620 },
                { user: "Arjun_Explorer", assists: 45, xp: 310 }
            ],
            stories: [
                { id: 1, loc: "Shimla Mall", user: "Marcus_T001", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y8F--B6E6H2G88M_Z8Aqc98Yy7Dsd9L-x4H" },
                { id: 2, loc: "Jakhu Temple", user: "Arjun_X", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy-A6T-Z-y" }
            ]
        };
