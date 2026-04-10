# History of Programming Languages and Browsers
HistoryEvent.destroy_all

events = [
  { year: 1957, title: "Fortran", category: "language", side: "left", description: "First high-level programming language." },
  { year: 1959, title: "COBOL", category: "language", side: "right", description: "Common Business Oriented Language." },
  { year: 1972, title: "C Language", category: "language", side: "left", description: "Developed by Dennis Ritchie at Bell Labs." },
  { year: 1991, title: "Python", category: "language", side: "right", description: "Created by Guido van Rossum." },
  { year: 1993, title: "Mosaic", category: "browser", side: "left", description: "The browser that popularized the World Wide Web." },
  { year: 1995, title: "Java & JavaScript", category: "language", side: "right", description: "The birth of dynamic web content." },
  { year: 1995, title: "PHP", category: "language", side: "left", description: "Personal Home Page tools, later PHP: Hypertext Preprocessor." },
  { year: 1995, title: "Ruby", category: "language", side: "right", description: "Created by Yukihiro 'Matz' Matsumoto." },
  { year: 2004, title: "Ruby on Rails", category: "language", side: "left", description: "Released by David Heinemeier Hansson (DHH)." },
  { year: 2006, title: "Golden Age of Rails", category: "web_trend", side: "right", description: "Twitter, GitHub, and Shopify are built on Rails." },
  { year: 2008, title: "Google Chrome", category: "browser", side: "left", description: "Google releases its open-source browser." },
  { year: 2012, title: "Modern Web Apps", category: "web_trend", side: "right", description: "Rise of SPA frameworks and Rails maturity." }
]

events.each do |event_data|
  HistoryEvent.create!(event_data)
end

puts "Created #{HistoryEvent.count} events."
