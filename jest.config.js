module.exports = {
    collectCoverageFrom: [
        'public/**/*.js',
        'server/**/*.js',
    ],
    projects: [
        {
            displayName: 'client',
            setupFilesAfterEnv: [
                '<rootDir>/index-specrunner.js',
            ],
            testMatch: [
                '<rootDir>/test/client/**/*.spec.js',
            ],
        },
        {
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/server/**/*.spec.js',
            ],
            globalSetup: '<rootDir>/test/server/setup.js',
        },
    ],
};
