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
const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment');
const { spawn } = require('child_process');
const pool = require('../../db/config');
const readline = require('readline');
const BATCH_SIZE = process.env.WEATHER_BATCH_SIZE;
const NUM_WORKERS = 4;
const PGOPS_MAXRETRIES = 3;
let NUM_OF_PARAMS;


// Main GribDownloader class
class CSVGribDownloader {
    constructor() {
        this.downloadDir = path.join(__dirname, 'temp');
        this.baseUrl = 'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl';
        this.isDownloading = false;
        this.startTime = Date.now();
        this.filesProcessed = 0;
        this.totalFilesToProcess = 0;
        this.totalRowsInFileProcessed = 0;
        this.pool = pool;
        this.activeProcesses = new Set();
        this.shouldExit = false;

        this.parameters = {
            vars: ['TMP', 'DPT', 'PRATE', 'APCP', 'VIS', 'SNOD', 'WEASD',
                'RH', 'PWAT', 'CAPE', 'CIN', 'REFC', 'LAND'],
            levels: ['0-0.1_m_below_ground', '2_m_above_ground', '10_m_above_ground',
                'surface', 'entire_atmosphere', 'entire_atmosphere_(considered_as_a_single_layer)',
                'low_cloud_layer'],
            varsandlevels_nonLand: new Map(Object.entries({
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

        this.setupProcessHandlers();
        this.ensureDownloadDir();
    }

    setupProcessHandlers() {
        const handlers = ['SIGINT', 'SIGTERM', 'exit'];
        handlers.forEach(signal => {
            process.on(signal, async () => {
                console.log(`\nReceived ${signal}. Starting cleanup...`);
                this.shouldExit = true;
                await this.cleanup();
                process.exit(0);
            });
        });
    }

    async makeLandFileCSV(file) {
        const baseFile = path.basename(file, '.grib2');
        await this.makeLandMask(file, baseFile);
        await this.makeCombinedLandMask(baseFile);
        await this.applyLandMask(baseFile);
        await this.removeDupeAPCP(baseFile);
        await this.removeDupePRATE(baseFile);

        await this.filterParameterandMakeCSV(baseFile);
        // Uncomment the below version instead, if you want to run this downloader for 51.75,-176.75 as test
        // filterParameterForTestPointandMakeCSV(baseFile)
        await this.deleteTempFiles(baseFile);
    }

    async makeLandMask(file, baseFile) {
        return this.runWgrib2Command([
            file,
            '-match', 'LAND',
            '-grib',  path.join(this.downloadDir, `${baseFile}.landmask.grb2`)
        ]);
    }

    async makeCombinedLandMask(baseFile) {
        const files = [
            path.join(this.downloadDir, `${baseFile}.landmask.grb2`),
            path.join(this.downloadDir, `${baseFile}.grib2`)
        ];
        await fs.promises.writeFile(
            path.join(this.downloadDir, `${baseFile}.combined.grb2`),
            Buffer.concat(await Promise.all(
                files.map(f => fs.promises.readFile(f))
            ))
        );
    }

    async applyLandMask(baseFile) {
        return this.runWgrib2Command([
            path.join(this.downloadDir, `${baseFile}.combined.grb2`),
            '-if', '^1:',
            '-rpn', '1:==:sto_1',
            '-fi',
            '-not_if', '^1:',
            '-rpn', 'rcl_1:mask',
            '-set_grib_type', 'same',
            '-set_scaling', 'same', 'same',
            '-grib_out', path.join(this.downloadDir, `${baseFile}.land.grb2`)
        ]);
    }

    async filterParameterandMakeCSV(baseFile) {
        const matchPattern = Array.from(this.parameters.varsandlevels_nonLand.entries())
            .map(([param, level]) => `${param}:${level}`)
            .join('|');
    
        return this.runWgrib2Command([
            path.join(this.downloadDir, `${baseFile}.land.APCP.PRATE.deduped.grb2`),
            '-not', 'LAND',
            '-match', `(${matchPattern})`,
            '-csv', path.join(this.downloadDir, `${baseFile}.land.csv`)
        ]);
    }


    /* This method is a quick way to execute this downloader for a given point.
    Useful when debugging.
     Command to run print the values for only 51.75,-176.75 is to add -undefine out-box -176.75:-176.75 51.75:51.75
     wgrib2 gfs.t18z.pgrb2.0p25.f003.grib2 -undefine out-box -176.75:-176.75 51.75:51.75 -csv temp.csv > /dev/null && cat temp.csv && rm temp.csv
    **/

    // async filterParameterForTestPointandMakeCSV(baseFile) {
    //     const matchPattern = Array.from(this.parameters.varsandlevels_nonLand.entries())
    //         .map(([param, level]) => `${param}:${level}`)
    //         .join('|');
    
    //     return this.runWgrib2Command([
    //         path.join(this.downloadDir, `${baseFile}.land.APCP.PRATE.deduped.grb2`),
    //         '-not', 'LAND',
    //         '-match', `(${matchPattern})`,
    //         '-undefine', 'out-box',
    //         '-176.75:-176.75', '51.75:51.75',
    //         '-csv', path.join(this.downloadDir, `${baseFile}.land.csv`)
    //     ]);
    // }

    async removeDupeAPCP(baseFile) {
        /*
        This removes the duplicate APCP records as :

        wgrib2 gfs.t18z.pgrb2.0p25.f003.grib2                                      

1:0:d=2025011818:REFC:entire atmosphere:3 hour fcst:
2:837288:d=2025011818:VIS:surface:3 hour fcst:
3:1600695:d=2025011818:TMP:surface:3 hour fcst:
4:2171704:d=2025011818:WEASD:surface:3 hour fcst:
5:2689950:d=2025011818:SNOD:surface:3 hour fcst:
6:3241393:d=2025011818:TMP:2 m above ground:3 hour fcst:
7:4119108:d=2025011818:DPT:2 m above ground:3 hour fcst:
8:4656604:d=2025011818:RH:2 m above ground:3 hour fcst:
9:5443305:d=2025011818:PRATE:surface:3 hour fcst:
10:6005105:d=2025011818:PRATE:surface:0-3 hour ave fcst:
11:6588221:d=2025011818:APCP:surface:0-3 hour acc fcst: <--- Removes these values
12:6876588:d=2025011818:APCP:surface:0-3 hour acc fcst:
13:7164955:d=2025011818:CAPE:surface:3 hour fcst:
14:7669108:d=2025011818:CIN:surface:3 hour fcst:
15:7965849:d=2025011818:PWAT:entire atmosphere (considered as a single layer):3 hour fcst:
16:9141216:d=2025011818:RH:entire atmosphere (considered as a single layer):3 hour fcst:
17:9732579:d=2025011818:LAND:surface:3 hour fcst:
        */
        return this.runWgrib2Command([
            path.join(this.downloadDir, `${baseFile}.land.grb2`),
            '-if', 'APCP',
            '-if_reg', '0',
            '-grib', path.join(this.downloadDir, `${baseFile}.land.APCP.deduped.grb2`),
            '-else',
            '-rpn', 'sto_0',
            '-endif',
            '-else',
            '-grib', path.join(this.downloadDir, `${baseFile}.land.APCP.deduped.grb2`),
            '-endif'
        ]);
    }


    async removeDupePRATE(baseFile) {
        /*
        This removes the duplicate PRATE records as :

        wgrib2 gfs.t18z.pgrb2.0p25.f003.grib2                                      

1:0:d=2025011818:REFC:entire atmosphere:3 hour fcst:
2:837288:d=2025011818:VIS:surface:3 hour fcst:
3:1600695:d=2025011818:TMP:surface:3 hour fcst:
4:2171704:d=2025011818:WEASD:surface:3 hour fcst:
5:2689950:d=2025011818:SNOD:surface:3 hour fcst:
6:3241393:d=2025011818:TMP:2 m above ground:3 hour fcst:
7:4119108:d=2025011818:DPT:2 m above ground:3 hour fcst:
8:4656604:d=2025011818:RH:2 m above ground:3 hour fcst:
9:5443305:d=2025011818:PRATE:surface:3 hour fcst: <--- Removes these values
10:6005105:d=2025011818:PRATE:surface:0-3 hour ave fcst:
11:6588221:d=2025011818:APCP:surface:0-3 hour acc fcst: 
12:6876588:d=2025011818:APCP:surface:0-3 hour acc fcst:
13:7164955:d=2025011818:CAPE:surface:3 hour fcst:
14:7669108:d=2025011818:CIN:surface:3 hour fcst:
15:7965849:d=2025011818:PWAT:entire atmosphere (considered as a single layer):3 hour fcst:
16:9141216:d=2025011818:RH:entire atmosphere (considered as a single layer):3 hour fcst:
17:9732579:d=2025011818:LAND:surface:3 hour fcst:
        */
        return this.runWgrib2Command([
            path.join(this.downloadDir, `${baseFile}.land.APCP.deduped.grb2`),
            '-if', 'PRATE',
            '-if_reg', '0',
            '-grib', path.join(this.downloadDir, `${baseFile}.land.APCP.PRATE.deduped.grb2`),
            '-else',
            '-rpn', 'sto_0',
            '-endif',
            '-else',
            '-grib', path.join(this.downloadDir, `${baseFile}.land.APCP.PRATE.deduped.grb2`),
            '-endif'
        ]);
    }



    async deleteTempFiles(baseFile) {
        const extensions = [
            '.grib2',
            '.landmask.grb2',
            '.combined.grb2',
            '.land.grb2',
            '.land.APCP.deduped.grb2',
            '.land.APCP.PRATE.deduped.grb2'
        ];
        await Promise.all(
            extensions.map(ext => 
                fs.promises.unlink(path.join(this.downloadDir, `${baseFile}${ext}`)).catch(() => {})
            )
        );
    }

    async runWgrib2Command(args) {
        return new Promise((resolve, reject) => {
            console.log('Running wgrib2 with args:', args);
            const wgrib = spawn('/opt/local/bin/wgrib2', args);
            this.activeProcesses.add(wgrib);

            wgrib.on('close', code => {
                this.activeProcesses.delete(wgrib);
                code === 0 ? resolve() : reject(new Error(`wgrib2 exit code: ${code}`));
            });

            wgrib.on('error', err => {
                this.activeProcesses.delete(wgrib);
                reject(err);
            });
        });
    }

    async processNonLandData(file) {
        const forecastHourMatch = file.match(/f(\d{3})/);
        if (!forecastHourMatch) throw new Error('Invalid forecast hour in filename');
        const forecastHour = parseInt(forecastHourMatch[1]);
    
        const baseFile = path.basename(file, '.grib2');
        const csvFile = path.join(this.downloadDir, `${baseFile}.land.csv`);
        const fileStream = fs.createReadStream(csvFile);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    
        let pendingBatches = [];
        // const workers = Array(NUM_WORKERS).fill().map(() => 
        //     new Worker(__filename, { 
        //         workerData: { 
        //             parameters: this.parameters.varsandlevels_nonLand,
        //             forecastHour 
        //         }
        //     })
        // );

        const workers = Array(NUM_WORKERS).fill().map(() => 
            new Worker(path.join(__dirname, 'worker.js'), { 
                workerData: { 
                    parameters: this.parameters.varsandlevels_nonLand,
                    forecastHour 
                }
            })
        );
    
        let currentWorker = 0;
        let batch = [];
        let batchPromises = new Map();
        
        try {
            for await (const line of rl) {
                const parts = line.split(',');
                if (parts.length < 7) continue;
    
                const parameter = parts[2].replace(/"/g, '');
                const parameterLevel = parts[3].replace(/"/g, '');
    
                if (!this.parameters.varsandlevels_nonLand.has(parameter) || 
                    this.parameters.varsandlevels_nonLand.get(parameter) !== parameterLevel) {
                    continue;
                }
    
                batch.push(parts);
    
                if (batch.length >= BATCH_SIZE) {
                    const worker = workers[currentWorker];
                    if (batchPromises.has(worker)) {
                        await batchPromises.get(worker);
                    }
                    
                    const batchPromise = new Promise((resolve) => {
                        worker.once('message', (msg) => {
                            batchPromises.delete(worker);
                            resolve(msg);
                        });
                    });
                    
                    batchPromises.set(worker, batchPromise);
                    pendingBatches.push(batchPromise);
                    worker.postMessage(batch);
                    
                    currentWorker = (currentWorker + 1) % NUM_WORKERS;
                    this.totalRowsInFileProcessed += batch.length;
                    batch = [];
    
                    // const elapsedTime = (Date.now() - this.startTime) / 1000;
                    // showProgressBar(this.totalRowsInFileProcessed, 
                    //     `[${elapsedTime.toFixed(1)}s - ${this.totalRowsInFileProcessed}]`);
                }
            }
    
            if (batch.length > 0) {
                const worker = workers[currentWorker];
                if (batchPromises.has(worker)) {
                    await batchPromises.get(worker);
                }
                
                const batchPromise = new Promise((resolve) => {
                    worker.once('message', (msg) => {
                        batchPromises.delete(worker);
                        resolve(msg);
                    });
                });
                
                batchPromises.set(worker, batchPromise);
                pendingBatches.push(batchPromise);
                worker.postMessage(batch);
                this.totalRowsInFileProcessed += batch.length;
            }
    
            await Promise.all(pendingBatches);
            const elapsedTime = (Date.now() - this.startTime) / 1000;
                    showProgressBar(this.totalRowsInFileProcessed, 
                        `[${elapsedTime.toFixed(1)}s - ${this.totalRowsInFileProcessed}]`);
            console.log(`\nCompleted processing ${file}`);
        } finally {
            await Promise.all(workers.map(worker => worker.terminate()));
            await fs.promises.unlink(csvFile).catch(() => {});
            fileStream.destroy();
            
        }
    }
    

    async processGribFile(filename) {
        const filePath = path.join(this.downloadDir, filename);
        this.totalRowsInFileProcessed = 0;
        
        try {
            await this.makeLandFileCSV(filePath);
            await this.processNonLandData(filePath);
            // fs.unlinkSync(filePath);
            // console.log(`Deleted processed file: ${filename}`);
        } catch (error) {
            console.error(`Error processing file ${filename}:`, error);
            throw error;
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
        if (this.pool) {
            try {
                console.log('Closing database pool...');
                await this.pool.end();
                console.log('Database pool closed');
            } catch (dbError) {
                console.error('Error closing database pool:', dbError);
            }
        }
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
        try{
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

    async withRetry(operation, maxRetries = PGOPS_MAXRETRIES) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation.bind(this)();
            } catch (error) {
                if (error.message.includes('timeout') && i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
                    continue;
                }
                throw error;
            }
        }
    }


    async  indexDropOrCreate(DROP=0, CREATE=0) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            
            if (DROP==1){
                await client.query('DROP INDEX IF EXISTS forecasts_geom_parameter_idx;');
            }
            if(CREATE==1){
                await client.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS forecasts_geom_parameter_idx ON forecasts(geom, parameter);
                `);
            }
            
            
            await client.query('COMMIT');
        } catch (error) {
            console.error('Error creating final index:', error);
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async dropIndex(){
        await this.indexDropOrCreate(1,0)
    }

    async createIndex(){
        await this.indexDropOrCreate(0,1)
    }

    // Modify vacuum operation
    async  performVacuum() {
        const client = await this.pool.connect();
        try {
            await client.query('SET statement_timeout = 300000'); // 5 min timeout
            await client.query('VACUUM ANALYZE forecasts;');
        } finally {
            client.release();
        }
    }

    async initBatch() {
        try {
            await delay(60000)
            console.log('Init Batch')
            // Ensure the pool is valid
            if (!this.pool) {
                throw new Error('Database pool not initialized');
            }
    
            
            
            try {
                console.log('Deleting previous /services/weather/tmp files')
                await this.deleteAllfiles();
                console.log('Will truncate TABLE forecasts')
                // Use a more robust query with error handling
            const client = await this.pool.connect();
                await client.query('TRUNCATE TABLE forecasts;');
                console.log('Truncated forecasts table');
                await this.withRetry(() => this.dropIndex());
                console.log('Dropped Index on forecasts table');
            } catch (queryError) {
                console.error('Error truncating or dropping index on forecasts table:', queryError);
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
        generateFileNumbers() {
            return Array.from({ length: process.env.WEATHER_NUMOFFORECASTS }, (_, i) => i * 3)
                .map(num => `f${num.toString().padStart(3, '0')}`);
        }

        async deleteAllfiles(){
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
                            console.log(`Performing vaccum ${filename}`);
                            await this.withRetry(() => this.performVacuum());
                            console.log(`Completed processing ${filename}`);
                            
                        } else {
                            console.log(`Skipping ${filename} - not available`);
                        }
                    } catch (error) {
                        console.error(`\nError processing ${filename}:`, error);
                        if (this.shouldExit) {
                            break;
                        }
                        // 
                        continue; // continue with next file even if current fails
                        // break; // no- break if any file fails
                    }
                    
                }

                // recreate index
                console.log('Recreating index');
                await this.withRetry(() => this.createIndex());
    
                return true;
            } catch (error) {
                console.error('Download batch failed:', error);
                throw error;
            } finally {
                this.isDownloading = false;
                
                
                try {
                    // Cleanup any remaining files in download directory
                    const files = fs.readdirSync(this.downloadDir);
                    for (const file of files) {
                         fs.unlinkSync(path.join(this.downloadDir, file));
                    }
                    console.log('downloadBatch completed.')
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

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function showProgressBar(completed, message) {
        const barLength = 40;
        const bar = '='.repeat(barLength);
        process.stdout.write(`\r${bar} ${message}`);
    }
    
    // async function run() {
    //     await new Promise(resolve => setTimeout(resolve, 10000));
    //     const downloader = new CSVGribDownloader();
    //     console.log(process.env.WEATHER_RUN)
    //     if (process.env.WEATHER_RUN === 'NOW') {
    //         await downloader.downloadBatch();
    //     } else if (process.env.WEATHER_RUN === 'DAILY') {
    //         downloader.scheduleDaily();
    //     }
    // }
    
    // run();
    if (require.main === module) {
        const downloader = new CSVGribDownloader();
         
        if (process.env.WEATHER_RUN === 'NOW') {
            downloader.downloadBatch().catch(console.error);
        } else if (process.env.WEATHER_RUN === 'DAILY') {
            downloader.scheduleDaily();
        }
    }
    module.exports = CSVGribDownloader;