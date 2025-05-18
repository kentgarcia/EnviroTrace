CREATE TABLE order_of_payments (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(32) NOT NULL,
  plate_no VARCHAR(16) NOT NULL,
  operator VARCHAR(128) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date_issued DATE NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
); 