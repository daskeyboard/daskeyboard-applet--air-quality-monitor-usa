const q = require("daskeyboard-applet");
const fetch = require("node-fetch");
const logger = q.logger;

class AirQualityMonitor extends q.DesktopApp {
  COLORS = {
    GREEN: "#00FF00",
    YELLOW: "#FFDD00",
    ORANGE: "#FF6600",
    RED: "#FF0000",
    PURPLE: "#FF00C8",
    MAROON: "#550000",
  };

  constructor() {
    super();
    this.pollingInterval = 60 * 15 * 1000; // runs every 15 minutes

    logger.info("Air Quality Monitor ready to launch!");
  }

  async applyConfig() {
    if (!this.config.postalCode) {
      throw new Error("Postal code is required.");
    }
    const location = await this.getUserCoordinates();

    this.userLat = location.latitude;
    this.userLon = location.longitude;
    logger.info(
      `User coordinates set to: ${location.latitude}, ${location.longitude}`
    );
    return true;
  }

  async getQualityMetrics(latitude, longitude) {
    try {
      const response = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=uv_index,us_aqi,pm2_5`
      );
      const data = await response.json();

      return {
        aqi: data.current.us_aqi,
        uv_index: data.current.uv_index,
        pm2_5: data.current.pm2_5,
      };
    } catch (error) {
      throw new Error(`Failed to get air quality metrics: ${error.message}`);
    }
  }

  async getUserCoordinates() {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${this.config.postalCode}&count=1&countryCode=US`;
    const response = await fetch(geoUrl);

    if (!response.ok) {
      throw new Error(`Geocoding API failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`Postal code not found: "${this.config.postalCode}".`);
    }

    return data.results[0];
  }

  async generatePoint(metricName, value) {
    let color;
    let name;
    let effect = "SET_COLOR";

    switch (metricName) {
      case "aqi":
        name = "AQI";
        if (value <= 50) color = this.COLORS.GREEN; // green
        else if (value <= 100) color = this.COLORS.YELLOW; // yellow
        else if (value <= 150) color = this.COLORS.ORANGE; // orange
        else if (value <= 200) color = this.COLORS.RED; // red
        else if (value <= 300) color = this.COLORS.PURPLE; // purple
        else color = this.COLORS.MAROON; // maroon
        break;

      case "uv_index":
        name = "UV Index";
        if (value <= 2) color = this.COLORS.GREEN; // green
        else if (value <= 5) color = this.COLORS.YELLOW; // yellow
        else if (value <= 7) color = this.COLORS.ORANGE; // orange
        else if (value <= 10) color = this.COLORS.RED; // red
        else color = this.COLORS.PURPLE; // purple
        break;

      case "pm2_5":
        name = "PM 2.5";
        if (value <= 9) color = this.COLORS.GREEN; // green
        else if (value <= 35) color = this.COLORS.YELLOW; // yellow
        else if (value <= 55) color = this.COLORS.ORANGE; // orange
        else if (value <= 125) color = this.COLORS.RED; // red
        else if (value <= 225) color = this.COLORS.PURPLE; // purple
        else color = this.COLORS.MAROON; // maroon
        break;
    }
    return new q.Point(color, effect);
  }

  async run() {
    try {
      const metrics = await this.getQualityMetrics(this.userLat, this.userLon);
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
