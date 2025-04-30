-- Air Quality Station Locations
CREATE TABLE IF NOT EXISTS air_quality_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    installation_date DATE,
    station_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Air Quality Readings
CREATE TABLE IF NOT EXISTS air_quality_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES air_quality_stations(id),
    reading_timestamp TIMESTAMPTZ NOT NULL,
    pm25 DECIMAL(7, 2),
    pm10 DECIMAL(7, 2),
    co DECIMAL(7, 2),
    no2 DECIMAL(7, 2),
    o3 DECIMAL(7, 2),
    so2 DECIMAL(7, 2),
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    wind_direction VARCHAR(10),
    aqi INTEGER,
    aqi_category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_air_quality_readings_station ON air_quality_readings(station_id);
CREATE INDEX IF NOT EXISTS idx_air_quality_readings_timestamp ON air_quality_readings(reading_timestamp);
CREATE INDEX IF NOT EXISTS idx_air_quality_stations_coords ON air_quality_stations(latitude, longitude);

-- Create a view for latest readings
CREATE OR REPLACE VIEW latest_air_quality_readings AS
SELECT DISTINCT ON (aqr.station_id)
    aqr.*,
    aqs.station_name,
    aqs.location
FROM 
    air_quality_readings aqr
JOIN 
    air_quality_stations aqs ON aqr.station_id = aqs.id
WHERE
    aqs.deleted_at IS NULL
ORDER BY 
    aqr.station_id, aqr.reading_timestamp DESC;