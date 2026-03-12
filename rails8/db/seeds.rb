# frozen_string_literal: true

puts "Seeding accounting data..."

# Chart of Accounts (Japanese Blue Return compliant)
accounts = [
  # Assets (1000-1999)
  { code: "1000", name: "Cash", account_type: :asset },
  { code: "1100", name: "Bank Account", account_type: :asset },
  { code: "1200", name: "Accounts Receivable", account_type: :asset },
  { code: "1300", name: "Inventory", account_type: :asset },
  { code: "1400", name: "Prepaid Expenses", account_type: :asset },
  { code: "1500", name: "Fixed Assets", account_type: :asset },

  # Liabilities (2000-2999)
  { code: "2000", name: "Accounts Payable", account_type: :liability },
  { code: "2100", name: "Accrued Expenses", account_type: :liability },
  { code: "2200", name: "Short-term Loans", account_type: :liability },
  { code: "2300", name: "Long-term Loans", account_type: :liability },

  # Equity (3000-3999)
  { code: "3000", name: "Owner Capital", account_type: :equity },
  { code: "3100", name: "Retained Earnings", account_type: :equity },
  { code: "3200", name: "Capital Reserve", account_type: :equity },

  # Revenue (4000-4999)
  { code: "4000", name: "Sales Revenue", account_type: :revenue },
  { code: "4100", name: "Service Revenue", account_type: :revenue },
  { code: "4200", name: "Interest Income", account_type: :revenue },

  # Expenses (5000-5999)
  { code: "5000", name: "Cost of Goods Sold", account_type: :expense },
  { code: "5100", name: "Salaries & Wages", account_type: :expense },
  { code: "5200", name: "Rent Expense", account_type: :expense },
  { code: "5300", name: "Utilities", account_type: :expense },
  { code: "5400", name: "Depreciation", account_type: :expense },
  { code: "5500", name: "Office Supplies", account_type: :expense },
  { code: "5600", name: "Travel & Entertainment", account_type: :expense },
  { code: "5700", name: "Insurance", account_type: :expense },
  { code: "5800", name: "Professional Fees", account_type: :expense },
  { code: "5900", name: "Miscellaneous Expenses", account_type: :expense }
]

Account.upsert_all(accounts.map { |a| a.merge(created_at: Time.current, updated_at: Time.current) })

puts "Created #{accounts.count} accounts"

# Sample Parties
parties = [
  { name: "Acme Corporation", party_type: "client", email: "billing@acme.com" },
  { name: "TechStart Inc", party_type: "client", email: "accounts@techstart.io" },
  { name: "Global Supplies Ltd", party_type: "vendor", email: "sales@globalsupplies.com" },
  { name: "Office Essentials Co", party_type: "vendor", email: "orders@officeessentials.com" },
  { name: "Smith & Associates", party_type: "client", email: "finance@smithassociates.com" }
]

Party.upsert_all(parties.map { |p| p.merge(created_at: Time.current, updated_at: Time.current) })

puts "Created #{parties.count} parties"

puts "Seeding complete!"
