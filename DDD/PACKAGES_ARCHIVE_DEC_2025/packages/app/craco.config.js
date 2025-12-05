const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@globul-cars/core': path.resolve(__dirname, '../core/src'),
            '@globul-cars/ui': path.resolve(__dirname, '../ui/src'),
            '@globul-cars/auth': path.resolve(__dirname, '../auth/src'),
            '@globul-cars/cars': path.resolve(__dirname, '../cars/src'),
            '@globul-cars/profile': path.resolve(__dirname, '../profile/src'),
            '@globul-cars/messaging': path.resolve(__dirname, '../messaging/src'),
            '@globul-cars/social': path.resolve(__dirname, '../social/src'),
            '@globul-cars/admin': path.resolve(__dirname, '../admin/src'),
            '@globul-cars/payments': path.resolve(__dirname, '../payments/src'),
            '@globul-cars/iot': path.resolve(__dirname, '../iot/src'),
            '@globul-cars/services': path.resolve(__dirname, '../services/src'),
        },
    },
};
