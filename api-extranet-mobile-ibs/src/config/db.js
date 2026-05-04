const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        
        pool.query = async (queryString, params = []) => {
            const request = pool.request();
            let processedQuery = queryString;
            
            const sortedParams = [...params].map((val, idx) => ({ val, idx: idx + 1 }))
                                           .sort((a, b) => b.idx - a.idx);

            sortedParams.forEach(({ val, idx }) => {
                const paramName = `p${idx}`;
                const regex = new RegExp(`\\$${idx}\\b`, 'g');
                processedQuery = processedQuery.replace(regex, `@${paramName}`);
                request.input(paramName, val);
            });
            
            try {
                const result = await request.query(processedQuery);
                return {
                    recordset: result.recordset,
                    rows: result.recordset,
                    recordsets: result.recordsets,
                    rowsAffected: result.rowsAffected,
                    output: result.output
                };
            } catch (err) {
                console.error('❌ Database Query Error:', {
                    query: processedQuery,
                    params: params,
                    error: err.message
                });
                throw err;
            }
        };
        
        return pool;
    })
    .catch(err => {
        console.error('❌ Database Connection Failed! Bad Config: ', err);
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};

