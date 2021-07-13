module.exports = {
    apps : [{
      name: "app",
      script: "./index.js",
      env: {
        NODE_ENV: "dev",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  };