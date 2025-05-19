CREATE TABLE IF NOT EXISTS order_of_payments (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(32) NOT NULL,
  plate_no VARCHAR(16) NOT NULL,
  operator VARCHAR(128) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date_issued DATE NOT NULL,
  status VARCHAR(32) NOT NULL,
  testing_officer VARCHAR(128),
  test_results VARCHAR(32),
  date_of_testing DATE,
  apprehension_fee NUMERIC(12,2),
  voluntary_fee NUMERIC(12,2),
  impound_fee NUMERIC(12,2),
  driver_amount NUMERIC(12,2),
  operator_amount NUMERIC(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
); 