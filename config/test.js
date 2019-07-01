module.exports = {
    url: 'http://localhost:8080/',
    ip: '127.0.0.1',
    port: 8080,
    db: 'mongodb://localhost:27017/urungi_test',
    tests: {
        datasources: [
            {
                name: 'MySQL',
                type: 'MySQL',
                status: 1,
                connection: {
                    host: 'localhost',
                    userName: 'urungi',
                    password: 'urungi',
                    database: 'urungi_tests',
                },
            },
            {
                name: 'PostgreSQL',
                type: 'POSTGRE',
                status: 1,
                connection: {
                    host: 'localhost',
                    userName: 'postgres',
                    database: 'urungi_tests',
                },
            },
            {
                name: 'MS SQL Server',
                type: 'MSSQL',
                status: 0, // Disable test for MS SQL Server by default
                connection: {
                    host: 'localhost',
                    userName: 'SA',
                    password: 'Micros0ft',
                    database: 'urungi_tests',
                },
            },
        ],
    },
};
