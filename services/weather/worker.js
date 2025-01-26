const { parentPort, workerData } = require('worker_threads');
const pool = require('../../db/config');
const { parameters, forecastHour } = workerData;

async function processBatch(batch) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const values = batch.map(parts => {
            const lat = parseFloat(parts[4]);
            const lon = parseFloat(parts[5]);
            const parameter = parts[2].replace(/"/g, '');
            const value = parseFloat(parts[6].trim());
            const jsonbValues = {};
            jsonbValues[forecastHour] = value;

            return `(ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), 
                    '${parameter}', 
                    '${JSON.stringify(jsonbValues)}'::jsonb)`;
        }).join(',');

        const query = `
            INSERT INTO forecasts (geom, parameter, values)
            VALUES ${values}
            ON CONFLICT (geom, parameter) 
            DO UPDATE SET 
                values = forecasts.values || EXCLUDED.values;
        `;

        await client.query(query);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

parentPort.on('message', async (batch) => {
    try {
        await processBatch(batch);
        parentPort.postMessage({ success: true });
    } catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
});