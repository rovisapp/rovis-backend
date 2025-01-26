# From the root folder run: python3 services/weather/gribdownloader.py
# Create and activate virtual environment
# python3 -m venv env
# source env/bin/activate

# Install and run
# pip install numpy eccodes-python pygrib psycopg2-binary pandas
#  python3 services/weather/gribdownloader.py

# FOR linux - Create pythonfolder as "root" folder
# mkdir pythonfolder
# cd pythonfolder
# sudo apt install -y python3-pip
# pip install numpy eccodes-python pygrib psycopg2-binary pandas
# sudo apt install -y python3-venv
# python3 -m venv env
# source env/bin/activate
# mkdir services
# mkdir services/weather
# keep .csv file and gribdownloader.py inside pythonfolder/services/weather
# From the root folder run: python3 services/weather/gribdownloader.py



import pandas as pd
import psycopg2
from concurrent.futures import ProcessPoolExecutor
from psycopg2.extras import execute_values
import json
import time


DATABASE_URL = {
   'dbname': 'weather_db',
   'user': 'weather_user',
   'password': 'weather_password', 
   'host': 'localhost',
   'port': '5432'
}

def process_chunk(chunk):
   try:
       conn = psycopg2.connect(**DATABASE_URL)
       cur = conn.cursor()
       
       
       values = [(
           row.longitude, 
           row.latitude,
           row.parameter,
           json.dumps({"0": float(row.value)})
       ) for _, row in chunk.iterrows()]
       
       print(f"Processing chunk with {len(values)} rows")
       
       execute_values(cur, """
   INSERT INTO forecasts AS f (geom, parameter, values) 
   SELECT ST_SetSRID(ST_MakePoint(v.lon, v.lat), 4326), v.param, v.vals::jsonb
   FROM (VALUES %s) AS v(lon, lat, param, vals)
   ON CONFLICT (geom, parameter)
   DO UPDATE SET values = f.values || EXCLUDED.values;
""", values, template="(%s, %s, %s, %s)")
       
    #    cur.execute("SELECT COUNT(*) FROM forecasts")
    #    count = cur.fetchone()[0]
    #    print(f"Total rows in database: {count}")
       
       conn.commit()
       cur.close()
       conn.close()
   except Exception as e:
       print(f"Error: {e}")



def main():
   start_time = time.time()
   chunksize = 100000
   reader = pd.read_csv('services/weather/masked_output.csv', 
                       chunksize=chunksize,
                       names=['time1', 'time2', 'parameter', 
                             'level', 'latitude', 'longitude','value'])
   
   with ProcessPoolExecutor(max_workers=4) as executor:
       executor.map(process_chunk, reader)
   end_time = time.time()
   print(f"Total execution time: {end_time - start_time:.2f} seconds")

if __name__ == '__main__':
   main()