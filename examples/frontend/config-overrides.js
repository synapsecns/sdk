const path = require('path');

module.exports = function override(config) {
    config.resolve = {
        ...config.resolve,
        alias: {
            ...config.alias,
            "@utils":        path.resolve(__dirname, 'src/utils'),
            "@hooks":        path.resolve(__dirname, 'src/hooks'),
            "@components":   path.resolve(__dirname, 'src/components'),
            "@pages":        path.resolve(__dirname, 'src/pages'),
        },
    };

    return config;
};