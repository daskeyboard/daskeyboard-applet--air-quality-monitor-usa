const q = require("daskeyboard-applet");
const fetch = require("node-fetch");
const logger = q.logger;

class AirQualityMonitor extends q.DesktopApp {
  constructor() {
    super();
    this.pollingInterval = 60 * 15 * 1000; // runs every 15 minutes

    logger.info("Air Quality Monitor ready to launch!");
  }

  async getQualityMetrics() {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${this.config.latitude}&longitude=${this.config.longitude}&current=uv_index,${this.config.aqi},pm2_5`
      );
      const data = await response.json();

      return {
        aqi: data.current[this.config.aqi],
        uv_index: data.current.uv_index,
        pm2_5: data.current.pm2_5,
      };
    } catch (error) {
      throw new Error(`Failed to get air quality metrics: ${error.message}`);
    }
  }

  async generatePoint(metricName, value) {
    let color;
    let name;
    let effect = "SET_COLOR";

    switch (metricName) {
      case "aqi":
        name = "AQI";
        if (value <= 50) color = "#00FF00"; // green
        else if (value <= 100) color = "#FFDD00"; // yellow
        else if (value <= 150) color = "#FF6600"; // orange
        else if (value <= 200) color = "#FF0000"; // red
        else if (value <= 300) color = "#FF00C8"; // purple
        else color = "#550000"; // maroon
        break;

      case "uv_index":
        name = "UV Index";
        if (value <= 2) color = "#00FF00"; // green
        else if (value <= 5) color = "#FFDD00"; // yellow
        else if (value <= 7) color = "#FF6600"; // orange
        else if (value <= 10) color = "#FF0000"; // red
        else color = "#FF00C8"; // purple
        break;

      case "pm2_5":
        name = "PM 2.5";
        if (this.config.aqi === "us_aqi") {
          if (value <= 9) color = "#00FF00"; // green
          else if (value <= 35) color = "#FFDD00"; // yellow
          else if (value <= 55) color = "#FF6600"; // orange
          else if (value <= 125) color = "#FF0000"; // red
          else if (value <= 225) color = "#FF00C8"; // purple
          else color = "#550000"; // maroon
          break;
        } else {
          if (value <= 5) color = "#00FF00"; //green
          else if (value <= 15) color = "#FFDD00"; // yellow
          else if (value <= 50) color = "#FF6600"; //orange
          else if (value <= 90) color = "#FF0000"; // red
          else if (value <= 140) color = "#FF00C8"; // purple
          else color = "#550000"; // maroon
          break;
        }
    }
    return new q.Point(color, effect);
  }

  async run() {
    try {
      const metrics = await this.getQualityMetrics();
      const points = [
        [
          await this.generatePoint("aqi", metrics.aqi),
          await this.generatePoint("uv_index", metrics.uv_index),
          await this.generatePoint("pm2_5", metrics.pm2_5),
        ],
      ];

      return new q.Signal({
        name: "Air Quality Monitor",
        message: `AQI: ${metrics.aqi}, UV: ${metrics.uv_index}, PM2.5: ${metrics.pm2_5}`,
        points: points,
      });
    } catch (error) {
      throw new Error(`Applet failed to work: ${error}`);
    }
  }
}

module.exports = { AirQualityMonitor: AirQualityMonitor };
const applet = new AirQualityMonitor();
