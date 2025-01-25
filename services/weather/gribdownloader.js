/** 
 * Uses Nooa's gribs
 * https://www.nco.ncep.noaa.gov/pmb/products/gfs/
 * https://nomads.ncep.noaa.gov/gribfilter.php?ds=gfs_0p25
 * https://ftp.cpc.ncep.noaa.gov/wd51we/wgrib2/tricks.wgrib2
 * https://origin.cpc.ncep.noaa.gov/products/wesley/wgrib2/all_commands.html
 * 
 * NOOA url : 
 * https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?dir=%2Fgfs.20250111%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f001&var_APCP=on&var_CAPE=on&var_CFRZR=on&var_CICEP=on&var_CIN=on&var_CPOFP=on&var_CRAIN=on&var_CSNOW=on&var_GUST=on&var_LCDC=on&var_PRATE=on&var_PWAT=on&var_REFC=on&var_RH=on&var_SNOD=on&var_SOILW=on&var_TCDC=on&var_TMP=on&var_TSOIL=on&var_UGRD=on&var_VGRD=on&var_VIS=on&var_WEASD=on&lev_0-0.1_m_below_ground=on&lev_2_m_above_ground=on&lev_10_m_above_ground=on&lev_surface=on&lev_entire_atmosphere=on&lev_entire_atmosphere_(considered_as_a_single_layer)=on&lev_low_cloud_layer=on
 * 
 * NOOA url (with lat,lon subreqion) : 
 * https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?dir=%2Fgfs.20250111%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f001&var_APCP=on&var_CAPE=on&var_CFRZR=on&var_CICEP=on&var_CIN=on&var_CPOFP=on&var_CRAIN=on&var_CSNOW=on&var_GUST=on&var_LCDC=on&var_PRATE=on&var_PWAT=on&var_REFC=on&var_RH=on&var_SNOD=on&var_SOILW=on&var_TCDC=on&var_TMP=on&var_TSOIL=on&var_UGRD=on&var_VGRD=on&var_VIS=on&var_WEASD=on&lev_0-0.1_m_below_ground=on&lev_2_m_above_ground=on&lev_10_m_above_ground=on&lev_surface=on&lev_entire_atmosphere=on&lev_entire_atmosphere_(considered_as_a_single_layer)=on&lev_low_cloud_layer=on&subregion=&toplat=90&leftlon=0&rightlon=360&bottomlat=-90
 * 
*/

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment');
const { spawn } = require('child_process');
const readline = require('readline');
//const { Pool } = require('pg');
const pool = require('../../db/config');
const BATCH_SIZE = process.env.WEATHER_BATCH_SIZE; // Process 10k records at a time
const CHUNK_SIZE = process.env.WEATHER_CHUNK_SIZE; // Process per chunk
let NUM_OF_PARAMS;

// Each boundary is defined by min/max lat/lon
const EXCLUSION_BOUNDARIES = [
    {
        name: 'R',
        minLat: 45.91239,
        maxLat: 81.28689,
        minLon: 32.919638889,
        maxLon: 180
    },
    {
        name: 'C1',
        minLat: 35,
        maxLat: 45,
        minLon: 70,
        maxLon: 125
    },
    {
        name: 'C2',
        minLat: 30,
        maxLat: 35,
        minLon: 80,
        maxLon: 125
    },
    {
        name: 'C3',
        minLat: 23.43722,
        maxLat: 30,
        minLon: 97,
        maxLon: 123
    }
    // Add more exclusion zones as needed
];

// Helper function to check if a point falls within any exclusion boundary
function isPointInExclusionZone(lat, lon) {
    return EXCLUSION_BOUNDARIES.some(boundary => {
        return lat >= boundary.minLat && 
               lat <= boundary.maxLat && 
               lon >= boundary.minLon && 
               lon <= boundary.maxLon;
    });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function showProgressBar(completed, total, message) {
    const progress = Math.min(completed / total, 1); // Ensure it doesn't go over 100%
    const barLength = 40; // Length of the progress bar
    const filledLength = Math.round(progress * barLength);
    const emptyLength = barLength - filledLength;

    const bar = `${'='.repeat(filledLength)}${' '.repeat(emptyLength)}`;

    // Calculate percentage
    const percentage = Math.round(progress * 100);

    // Print the progress bar and percentage, overwriting the same line
    // process.stdout.write(`\r${bar} ${percentage}% ${message}`);
}

class GribDownloader {
    constructor() {
        this.downloadDir = path.join(__dirname, 'temp');
        this.baseUrl = 'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl';
        this.isDownloading = false;
        
        // metrics for processing speed.
        this.startTime = Date.now();  
        this.filesProcessed =0;
        this.totalFilesToProcess =0;
        this.totalRowsInFileProcessed=0;
        this.totalRowsInFile=0;

        this.landPoints = new Set();
        //this.pool = new Pool(dbConfig);
        this.pool = pool;
        this.activeProcesses = new Set();
        this.shouldExit = false;
        // Handle app termination
        // Handle app termination with async cleanup
        process.on('SIGINT', async () => {
            console.log('\nReceived SIGINT. Starting cleanup...');
            this.shouldExit = true;
            await this.cleanup();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\nReceived SIGTERM. Starting cleanup...');
            this.shouldExit = true;
            await this.cleanup();
            process.exit(0);
        });
        process.on('exit',  async() =>{
            console.log('\nReceived exit. Starting cleanup...');
            this.shouldExit = true;
            await this.cleanup();
            process.exit(0);
        });

        
        // this.parameters = {
        //     vars: [
        //         'TMP', 'DPT', 'PRATE', 'APCP', 'VIS', 'SNOD', 'WEASD',
        //         'RH', 'PWAT', 'CAPE', 'CIN', 'REFC', 'LAND'
        //     ],
        //     levels: [
        //         '0-0.1_m_below_ground', 
        //         '2_m_above_ground', 
        //         '10_m_above_ground',
        //         'surface', 
        //         'entire_atmosphere', 
        //         'entire_atmosphere_(considered_as_a_single_layer)',
        //         'low_cloud_layer'
        //     ]
        // };

        this.parameters = {
            vars: [
                'TMP', 'DPT', 'PRATE', 'APCP', 'VIS', 'SNOD', 'WEASD',
                'RH', 'PWAT', 'CAPE', 'CIN', 'REFC', 'LAND'
            ],
            levels: [
                '0-0.1_m_below_ground', 
                '2_m_above_ground', 
                '10_m_above_ground',
                'surface', 
                'entire_atmosphere', 
                'entire_atmosphere_(considered_as_a_single_layer)',
                'low_cloud_layer'
            ],
            varsandlevels_nonLand :new Map(Object.entries({
                'TMP': '2 m above ground',
                'DPT': '2 m above ground',
                'PRATE': 'surface',
                'APCP': 'surface',
                'VIS': 'surface',
                'SNOD': 'surface',
                'WEASD': 'surface',
                'RH': '2 m above ground',
                'PWAT': 'entire atmosphere',
                'CAPE': 'surface',
                'CIN': 'surface',
                'REFC': 'entire atmosphere'
              }))
        };
        NUM_OF_PARAMS = this.parameters.varsandlevels_nonLand.size;

        try {
            this.ensureDownloadDir();
            console.log(`Using downloads directory: ${this.downloadDir}`);
        } catch (err) {
            console.error('Failed to create download directory:', err);
        }
    }

    async cleanDatabasePool(){
        // Clean up database pool
        if (this.pool) {
            try {
                console.log('Closing database pool...');
                await this.pool.end();
                console.log('Database pool successfully closed');
            } catch (dbError) {
                console.error('Error while closing database pool:', dbError);
                // Continue cleanup even if pool closing fails
            }
        }
    }

    async cleanup() {
        console.log('Cleaning up active processes...');
        const killPromises = [];

        for (const proc of this.activeProcesses) {
            if (!proc.killed) {
                killPromises.push(
                    new Promise((resolve) => {
                        proc.on('exit', () => {
                            console.log('Process exited:', proc.pid);
                            resolve();
                        });
                        
                        proc.kill('SIGTERM');
                        console.log('Sent SIGTERM to process:', proc.pid);
                        
                        // Force kill after 5 seconds if process hasn't exited
                        setTimeout(() => {
                            if (!proc.killed) {
                                proc.kill('SIGKILL');
                                console.log('Force killed process:', proc.pid);
                                resolve();
                            }
                        }, 5000);
                    })
                );
            }
        }

        if (killPromises.length > 0) {
            console.log(`Waiting for ${killPromises.length} processes to exit...`);
            await Promise.all(killPromises);
        }

        this.activeProcesses.clear();
        this.cleanDatabasePool();
        console.log('Cleanup complete');
    }


    ensureDownloadDir() {
        if (!fs.existsSync(this.downloadDir)) {
            try {
                fs.mkdirSync(this.downloadDir, { recursive: true });
                console.log(`Created download directory: ${this.downloadDir}`);
            } catch (err) {
                throw new Error(`Failed to create download directory: ${err.message}`);
            }
        }
    }

    getLatestAvailableRunTime() {
        try {
            const now = moment.utc();
            const currentHour = now.hour();
            
            const availableRuns = [0, 6, 12, 18];
            let latestRun = availableRuns[0];
            
            for (const run of availableRuns) {
                if (currentHour >= (run + 4) || (currentHour < 4 && run === 18)) {
                    latestRun = run;
                }
            }

            if (currentHour < 4 && latestRun === 18) {
                return {
                    date: now.subtract(1, 'days').format('YYYYMMDD'),
                    hour: '18'
                };
            }

            return {
                date: now.format('YYYYMMDD'),
                hour: latestRun.toString().padStart(2, '0')
            };
        } catch (err) {
            throw new Error(`Failed to get latest run time: ${err.message}`);
        }
    }

    generateUrl(runInfo, fileNum) {
        if (!runInfo?.date || !runInfo?.hour || !fileNum) {
            throw new Error('Missing required parameters for URL generation');
        }

        try {
            const urlParams = new URLSearchParams();
            urlParams.append('dir', `/gfs.${runInfo.date}/${runInfo.hour}/atmos`);
            urlParams.append('file', `gfs.t${runInfo.hour}z.pgrb2.0p25.${fileNum}`);

            this.parameters.vars.forEach(variable => {
                urlParams.append(`var_${variable}`, 'on');
            });

            this.parameters.levels.forEach(level => {
                urlParams.append(`lev_${level}`, 'on');
            });

            return `${this.baseUrl}?${urlParams.toString()}`;
        } catch (err) {
            throw new Error(`Failed to generate URL: ${err.message}`);
        }
    }

    async checkUrlAvailability(url) {
        if (!url) return false;
        
        try {
            const response = await axios.head(url);
            return response.status === 200;
        } catch (err) {
            console.log(`URL not available: ${url}`);
            return false;
        }
    }

    async downloadFile(url, filename) {
        if (!url || !filename) {
            throw new Error('URL and filename required for download');
        }

        const filePath = path.join(this.downloadDir, filename);
        const writer = fs.createWriteStream(filePath);
        
        try {
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        } catch (err) {
            console.error(`Error downloading ${filename}:`, err);
            throw err;
        }
    }

    async processWgribOutputLineEmitter(file, args) {
        if (!file || !Array.isArray(args)) {
            throw new Error('Invalid parameters for wgrib2 process');
        }

        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        const { EventEmitter } = require('events');
        const lineEmitter = new EventEmitter();
    
        const fullArgs = [file, ...args.map(String)];
        console.log('Running wgrib2 with args:', fullArgs);
        const wgrib = spawn('/opt/local/bin/wgrib2', fullArgs);
        this.activeProcesses.add(wgrib);
    
        const rl = readline.createInterface({
            input: wgrib.stdout,
            crlfDelay: Infinity
        });
        lineEmitter.pause = () => rl.pause();
        lineEmitter.resume = () => rl.resume();
        rl.on('line', (line) => {
            lineEmitter.emit('line', line);
        });
    
        wgrib.on('error', (err) => {
            this.activeProcesses.delete(wgrib);
            rl.close();
            lineEmitter.emit('error', err);
        });
    
        wgrib.on('close', (code) => {
            this.activeProcesses.delete(wgrib);
            rl.close();
            if (code === 0) {
                lineEmitter.emit('end');
            } else {
                lineEmitter.emit('error', new Error(`wgrib2 process exited with code ${code}`));
            }
        });
    
        return lineEmitter;
    }

    async processWgribOutput(file, args) {
        if (!file || !Array.isArray(args)) {
            throw new Error('Invalid parameters for wgrib2 process');
        }

        if (!fs.existsSync(file)) {
            throw new Error(`File not found: ${file}`);
        }

        return new Promise((resolve, reject) => {
            try {
                const fullArgs = [file, ...args.map(String)];
                console.log('Running wgrib2 with args:', fullArgs);
                
                const wgrib = spawn('/opt/local/bin/wgrib2', fullArgs);
                // Track this process
                this.activeProcesses.add(wgrib);
                const output = [];

                const rl = readline.createInterface({
                    input: wgrib.stdout,
                    crlfDelay: Infinity
                });

                rl.on('line', (line) => {
                    output.push(line);
                });

                wgrib.on('error', (err) => {
                    console.error('wgrib2 process error:', err);
                    this.activeProcesses.delete(wgrib);
                    rl.close();
                    reject(err);
                });

                wgrib.stderr.on('data', (data) => {
                    console.error(`wgrib2 stderr: ${data.toString()}`);
                });

                wgrib.on('close', (code) => {
                    this.activeProcesses.delete(wgrib);
                    rl.close();
                    if (code !== 0) {
                        const error = new Error(`wgrib2 process exited with code ${code}`);
                        console.error(error);
                        reject(error);
                    } else {
                        resolve(output);
                    }
                });

            } catch (error) {
                console.error('Error spawning wgrib2 process:', error);
                reject(error);
            }
        });
    }

    async processLandPoints(file) {
        try {
            const args = ['-match', ':LAND:', '-csv', '-'];
            const lineEmitter = await this.processWgribOutputLineEmitter(file, args);
    
            return new Promise((resolve, reject) => {
                lineEmitter.on('line', (line) => {
                    const parts = line.split(',');
                    if (parts.length >= 7 && parts[6].trim() === '1') {
                        const lat = parseFloat(parts[4]).toFixed(2);
                        const lon = parseFloat(parts[5]).toFixed(2);
                        if (!isPointInExclusionZone(parseFloat(lat), parseFloat(lon))) {
                            this.landPoints.add(`${lat},${lon}`);
                        }
                    }
                });
    
                lineEmitter.on('end', () => {
                    this.totalRowsInFile = this.landPoints.size * NUM_OF_PARAMS;
                    resolve();
                });
    
                lineEmitter.on('error', reject);
            });
        } catch (error) {
            throw error;
        }
    }


    // async processLandPoints(file) {
    //     try {
    //         const args = ['-match', ':LAND:', '-csv', '-'];
    //         const lines = await this.processWgribOutput(file, args);
            
    //         for (const line of lines) {
    //             const parts = line.split(',');
    //             if (parts.length >= 7 && parts[6].trim() === '1') {
    //                 const lat = parseFloat(parts[4]).toFixed(2);
    //                 const lon = parseFloat(parts[5]).toFixed(2);
    //                 // Skip points in exclusion zones
    //                 if (isPointInExclusionZone(parseFloat(lat), parseFloat(lon))) {
    //                     continue;
    //                 }
    //                 this.landPoints.add(`${lat},${lon}`);
    //             }
    //         }
    //         this.totalRowsInFile = this.landPoints.size*NUM_OF_PARAMS;
    //     } catch (error) {
    //         console.error('Error processing land points:', error);
    //         throw error;
    //     }
    // }

    async initBatch() {
        try {
            console.log('Init Batch')
            // Ensure the pool is valid
            if (!this.pool) {
                throw new Error('Database pool not initialized');
            }
    
            
            
            try {
                console.log('Will truncate TABLE forecasts')
                // Use a more robust query with error handling
            const client = await this.pool.connect();
                await client.query('TRUNCATE TABLE forecasts;');
                console.log('Truncated forecasts table');
            } catch (queryError) {
                console.error('Error truncating forecasts table:', queryError);
                throw queryError;
            } finally {
                // Always release the client back to the pool
                // client.release();
            }
        } catch (error) {
            console.error('Database initialization failed:', error);
            
            // More detailed logging
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                code: error.code,
                stack: error.stack
            });
    
            // Rethrow or handle as needed
            throw error;
        }
    }

    async processNonLandData(file) {
        const forecastHourMatch = file.match(/f(\d{3})/);
        if (!forecastHourMatch) throw new Error('Could not extract forecast hour');
     
        const forecastHour = parseInt(forecastHourMatch[1]);
        const matchPattern = Array.from(this.parameters.varsandlevels_nonLand.entries())
            .map(([param, level]) => `${param}:${level}`)
            .join('|');
     
        const args = ['-not', 'LAND', '-match', `(${matchPattern})`, '-csv', '-'];
        const lineEmitter = await this.processWgribOutputLineEmitter(file, args);
     
        let currentBatch = [];
        let processing = false;
        let batchPromise = Promise.resolve();
     
        return new Promise((resolve, reject) => {
            lineEmitter.on('line', async (line) => {
                if (processing) {
                    lineEmitter.pause();
                    return;
                }
                processing = true;
     
                try {
                    const parts = line.split(',');
                    if (parts.length < 7) return;
     
                    const lat = parseFloat(parts[4]).toFixed(2);
                    const lon = parseFloat(parts[5]).toFixed(2);
                    const coordKey = `${lat},${lon}`;
     
                    if (!this.landPoints.has(coordKey)) return;
     
                    const parameter = parts[2].replace(/"/g, '');
                    const parameterlevel = parts[3].replace(/"/g, '');
                    
                    if (!this.parameters.varsandlevels_nonLand.has(parameter) || 
                        this.parameters.varsandlevels_nonLand.get(parameter) !== parameterlevel) return;
                    
                    const value = parseFloat(parts[6].trim());
                    if (isNaN(value)) return;
     
                    currentBatch.push({
                        geom: coordKey,
                        parameter,
                        value,
                        forecastHour
                    });
     
                    // console.log(currentBatch[currentBatch.length-1]);
                    
                    if (currentBatch.length >= BATCH_SIZE) {
                        //console.log('calling bulkSaveToDatabase');
                        const batchToSave = [...currentBatch];
                        batchPromise = batchPromise.then(() => this.bulkSaveToDatabase(batchToSave));
                        currentBatch = [];
                    }
                } finally {
                    processing = false;
                    lineEmitter.resume();
                }
            });
     
            lineEmitter.on('end', () => {
                if (currentBatch.length > 0) {
                    batchPromise = batchPromise
                    .then(() => this.bulkSaveToDatabase(currentBatch))
                    .then(resolve)
                    .catch(reject);
                } else {
                    batchPromise.then(resolve).catch(reject);
                }
            });
     
            lineEmitter.on('error', reject);
        });
     }


    // async processNonLandData(file) {
        
    //     const forecastHourMatch = file.match(/f(\d{3})/);
    //     if (!forecastHourMatch) {
    //         throw new Error('Could not extract forecast hour from filename');
    //     }
    
    //     try {
    //         const forecastHour = parseInt(forecastHourMatch[1]);
    //         // Create match pattern from varsandlevels_nonLand
    //     const matchPattern = Array.from(this.parameters.varsandlevels_nonLand.entries())
    //     .map(([param, level]) => `${param}:${level}`)
    //     .join('|');

    //         // const args = ['-not', 'LAND', '-csv', '-'];
    //         // filter only params that are needed  
    //         // wgrib2 gfs.t18z.pgrb2.0p25.f003.grib2 -not LAND -match "(PRATE:surface|TMP:2 m above ground)" -csv -
    //         const args = ['-not', 'LAND', '-match', `(${matchPattern})`, '-csv', '-']; 

    //         const lines = await this.processWgribOutput(file, args);
    
    //         // Process lines in chunks
    //         let currentBatch = [];
              
            
    //         for (const line of lines) {
    //             const parts = line.split(',');
    //             if (parts.length >= 7) {
    //                 const lat = parseFloat(parts[4]).toFixed(2);
    //                 const lon = parseFloat(parts[5]).toFixed(2);
    //                 const coordKey = `${lat},${lon}`;
    
    //                 if (this.landPoints.has(coordKey)) {
    //                     const parameter = parts[2].replace(/"/g, '');
    //                     const parameterlevel= parts[3].replace(/"/g, '');
    //                     if (!(this.parameters.varsandlevels_nonLand.has(parameter)&& 
    //                     this.parameters.varsandlevels_nonLand.get(parameter) == parameterlevel
    //                     ))
    //                     {
    //                         continue;
    //                     } 
    //                     const value = parseFloat(parts[6].trim());
    
    //                     if (!isNaN(value)) {
    //                         currentBatch.push({
    //                             geom: coordKey,
    //                             parameter,
    //                             value,
    //                             forecastHour
    //                         });
    
    //                         // When batch size is reached, process it
    //                         if (currentBatch.length >= BATCH_SIZE) {
    //                             await this.bulkSaveToDatabase(currentBatch);
                                
    //                             currentBatch = []; // Clear the batch
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    
    //         // Process any remaining records
    //         if (currentBatch.length > 0) {
    //             await this.bulkSaveToDatabase(currentBatch);
    //         }
    
    //     } catch (error) {
    //         console.error('Error processing non-land data:', error);
    //         throw error;
    //     }
    // }


    async bulkSaveToDatabase(bulkData) {
        // Group data by parameter for more efficient updates
        const groupedData = bulkData.reduce((groups, item) => {
            const key = `${item.parameter}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    
        // Begin transaction
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
    
            for (const [parameter, items] of Object.entries(groupedData)) {
                // Process each parameter in smaller chunks
                
                for (let i = 0; i < items.length; i += CHUNK_SIZE) {
                    const chunk = items.slice(i, i + CHUNK_SIZE);
                    
                    // Prepare values for bulk insert
                    const values = chunk.map(item => {
                        const [lon, lat] = item.geom.split(',').map(Number);
                        const jsonbValues = {};
                        jsonbValues[item.forecastHour] = item.value;
                        
                        return `(ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), 
                                '${parameter}', 
                                '${JSON.stringify(jsonbValues)}'::jsonb)`;
                    }).join(',');
    
                    // Perform bulk upsert for this chunk
                    const query = `
                        INSERT INTO forecasts (geom, parameter, values)
                        VALUES ${values}
                        ON CONFLICT (geom, parameter) 
                        DO UPDATE SET 
                            values = forecasts.values || EXCLUDED.values;
                    `;
    
                    await client.query(query);
                    this.totalRowsInFileProcessed += chunk.length;
                    const elapsedTime = (Date.now() - this.startTime) / 1000;
                    showProgressBar(this.totalRowsInFileProcessed, this.totalRowsInFile,`[${elapsedTime.toFixed(1)}s - ${this.totalRowsInFileProcessed}/${this.totalRowsInFile} records - ${this.filesProcessed+1}/${this.totalFilesToProcess} files]` );
                    // Delay after each chunk (e.g., 50ms) Adding a delay after each batch or even between each database insert can significantly reduce CPU spikes, especially if the server is doing a lot of database operations
                    await delay(1);
                }
            }
    
            await client.query('COMMIT');
            
            // const percentage = Math.round((this.totalRowsInFileProcessed / this.totalRowsInFile) * 100);
            // console.log(`${elapsedTime.toFixed(1)}s : ${percentage}% of ${this.filesProcessed+1}/${this.totalFilesToProcess} files processing`);
            await delay(1000);
                    
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Bulk insert failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async processGribFile(filename) {
        const filePath = path.join(this.downloadDir, filename);
        this.totalRowsInFileProcessed = 0;
        
        
        try {
            await this.processLandPoints(filePath);
            await this.processNonLandData(filePath);
            
             fs.unlinkSync(filePath);
             console.log(`Deleted processed file: ${filename}`);
        } catch (error) {
            console.error(`Error processing file ${filename}:`, error);
            throw error;
        }
    }

    generateFileNumbers() {
        return Array.from({ length: process.env.WEATHER_NUMOFFORECASTS }, (_, i) => i * 3)
            .map(num => `f${num.toString().padStart(3, '0')}`);
    }

    async downloadBatch() {
        if (this.isDownloading) {
            console.log('Download already in progress, skipping...');
            return false;
        }

        this.isDownloading = true;

        try {
            const runInfo = this.getLatestAvailableRunTime();
            console.log(`Starting download for run: ${runInfo.date} ${runInfo.hour}Z`);

            await this.initBatch();

            const fileNumbers = this.generateFileNumbers();
            this.totalFilesToProcess = fileNumbers.length;
            this.startTime = Date.now();
            for (const fileNum of fileNumbers) {
                // Check if we should exit
                if (this.shouldExit) {
                    console.log('Exiting download batch due to termination signal');
                    break;
                }

                const url = this.generateUrl(runInfo, fileNum);
                const filename = `gfs.t${runInfo.hour}z.pgrb2.0p25.${fileNum}.grib2`;

                try {
                    console.log(`Checking availability of ${filename}...`);
                    if (await this.checkUrlAvailability(url)) {
                        console.log(`Downloading ${filename}...`);
                        await this.downloadFile(url, filename);
                        console.log(`Processing ${filename}...`);
                        await this.processGribFile(filename);
                        this.filesProcessed++;
                        console.log(`Completed processing ${filename}`);
                    } else {
                        console.log(`Skipping ${filename} - not available`);
                    }
                } catch (error) {
                    console.error(`\nError processing ${filename}:`, error);
                    if (this.shouldExit) {
                        break;
                    }
                    // Continue with next file even if current fails
                    // continue;
                    break; // no- break if any file fails
                }
            }

            return true;
        } catch (error) {
            console.error('Download batch failed:', error);
            throw error;
        } finally {
            this.isDownloading = false;
            this.landPoints.clear();
            
            try {
                // Cleanup any remaining files in download directory
                const files = fs.readdirSync(this.downloadDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(this.downloadDir, file));
                }
            } catch (error) {
                console.error('Error cleaning up download directory:', error);
            }
        }
    }

    scheduleDaily() {
        // Flag to track if a download is currently in progress
    // Capture the current instance
    const self = this;
    // Flag to track if a download is currently in progress
    self._isDownloadRunning = false;

        const rules = [
            { hour: 4, minute: 15 },  // For 00Z run
            // { hour: 10, minute: 15 }, // For 06Z run
            // { hour: 16, minute: 15 }, // For 12Z run
            // { hour: 22, minute: 15 }  // For 18Z run
        ];

        rules.forEach(rule => {
            schedule.scheduleJob({ hour: rule.hour, minute: rule.minute, tz: 'UTC' }, async () => {
                if (self._isDownloadRunning) {return;}
                console.log(`Starting scheduled download at ${rule.hour}:${rule.minute} UTC`);
                try {
                    // Set flag to indicate download is starting
                    self._isDownloadRunning = true;
                    await this.downloadBatch();
                } catch (error) {
                    console.error('Scheduled download failed:', error);
                }finally {
                    // Reset flag when download completes or fails
                    self._isDownloadRunning = false;
                }
            });
        });

        console.log('Scheduled daily downloads for GFS run times');
    }
}

async function run(){
    await delay(10000);
    const downloader = new GribDownloader();
    if (process.env.WEATHER_RUN=='NOW'){
        await downloader.downloadBatch()
    } else if(process.env.WEATHER_RUN=='DAILY'){
        downloader.scheduleDaily();
    }
}

run();
module.exports = GribDownloader;