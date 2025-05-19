CREATE TABLE IF NOT EXISTS belching_record_history (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES belching_records(id) ON DELETE CASCADE,
    type VARCHAR(64),
    date DATE,
    details TEXT,
    or_no VARCHAR(64),
    status VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS belching_violations (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES belching_records(id) ON DELETE CASCADE,
    operator_offense VARCHAR(128),
    date_of_apprehension DATE,
    place VARCHAR(128),
    driver_name VARCHAR(128),
    driver_offense VARCHAR(128),
    paid BOOLEAN
); 