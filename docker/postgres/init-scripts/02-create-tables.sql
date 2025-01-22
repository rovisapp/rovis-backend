-- Check if table exists
CREATE TABLE IF NOT EXISTS forecasts (
    geom GEOMETRY(Point, 4326),
    parameter VARCHAR(10),
    values JSONB,
    CONSTRAINT pk_forecasts PRIMARY KEY (geom, parameter)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_forecasts_geom ON forecasts USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_forecasts_param ON forecasts(parameter);
CREATE INDEX IF NOT EXISTS idx_forecasts_jsonb ON forecasts USING GIN(values);
CREATE UNIQUE INDEX IF NOT EXISTS forecasts_geom_parameter_idx ON forecasts(geom, parameter);


-- Drop constraint if it exists and recreate
ALTER TABLE forecasts DROP CONSTRAINT IF EXISTS check_parameter;
ALTER TABLE forecasts ADD CONSTRAINT check_parameter 
CHECK (parameter IN (
    'TMP', 'DPT', 'PRATE', 'APCP', 'VIS', 'SNOD', 'WEASD',
    'RH', 'PWAT', 'CAPE', 'CIN', 'REFC'
));

-- Create or replace the function
CREATE OR REPLACE FUNCTION insert_forecast(
    lon FLOAT,
    lat FLOAT,
    param VARCHAR,
    forecast_values JSONB
) RETURNS VOID AS '
    BEGIN
        INSERT INTO forecasts (geom, parameter, values)
        VALUES (
            ST_SetSRID(ST_MakePoint(lon, lat), 4326),
            param,
            forecast_values
        )
        ON CONFLICT (geom, parameter) 
        DO UPDATE SET values = EXCLUDED.values;
    END;
' LANGUAGE plpgsql;