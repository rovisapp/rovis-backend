const { parentPort, workerData } = require('worker_threads');
const pool = require('../../db/config');
const { parameters, forecastHour } = workerData;

// async function processBatch(batch) {
//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         const values = batch.map(parts => {
//             const lat = parseFloat(parts[4]);
//             const lon = parseFloat(parts[5]);
//             const parameter = parts[2].replace(/"/g, '');
//             const value = parseFloat(parts[6].trim());
//             const jsonbValues = {};
//             jsonbValues[forecastHour] = value;

//             return `(ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), 
//                     '${parameter}', 
//                     '${JSON.stringify(jsonbValues)}'::jsonb)`;
//         }).join(',');

//         // const query = `
//         //     INSERT INTO forecasts (geom, parameter, values)
//         //     VALUES ${values}
//         //     ON CONFLICT (geom, parameter) 
//         //     DO UPDATE SET 
//         //         values = forecasts.values || EXCLUDED.values;
//         // `;
        
//         const query = `
//     INSERT INTO forecasts (geom, parameter, values)
//     VALUES ${values}
//     ON CONFLICT (geom, parameter) 
//     DO UPDATE SET 
//         values = jsonb_set(
//             COALESCE(forecasts.values, '{}'::jsonb),
//             '{${forecastHour}}',
//             EXCLUDED.values->'${forecastHour}',
//             true
//         );
// `;

//     // const query = `
//     // INSERT INTO forecasts (geom, parameter, values)
//     // VALUES ${values}
//     // ON CONFLICT (geom, parameter) 
//     // DO UPDATE SET 
//     //     values = (
//     //         SELECT jsonb_object_agg(key, value)
//     //         FROM (
//     //             SELECT key, value
//     //             FROM jsonb_each(COALESCE(forecasts.values, '{}'::jsonb))
//     //             UNION ALL
//     //             SELECT key, value
//     //             FROM jsonb_each(EXCLUDED.values)
//     //         ) combined
//     //     );
//     // `;

//         // console.log(query)
//         await client.query(query);
//         await client.query('COMMIT');
//     } catch (error) {
//         console.error(error)
//         await client.query('ROLLBACK');
//         throw error;
//     } finally {
//         client.release();
//     }
// }


async function processBatch(batch) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('SET LOCAL synchronous_commit = off;');

        // Create the column name for this forecast hour
        const hourColumn = `hour_${forecastHour.toString().padStart(3, '0')}`;

        const values = batch.map(parts => {
            const lat = parseFloat(parts[4]);
            const lon = parseFloat(parts[5]);
            const parameter = parts[2].replace(/"/g, '');
            const value = parseFloat(parts[6].trim());

            return `(ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), 
                    '${parameter}', 
                    ${value})`;
        }).join(',');

        const query = `
            INSERT INTO forecasts (
                geom, 
                parameter,
                ${hourColumn}
            )
            VALUES ${values}
            ON CONFLICT (geom, parameter) 
            DO UPDATE SET 
                ${hourColumn} = EXCLUDED.${hourColumn};
        `;

        await client.query(query);
        await client.query('COMMIT');
    } catch (error) {
        console.error(error);
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