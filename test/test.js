const { AirQualityMonitor } = require("../index.js"); // update with actual path
const q = require("daskeyboard-applet");
const fetch = require("node-fetch");

jest.mock("node-fetch");
jest.mock("daskeyboard-applet", () => {
  return {
    DesktopApp: class {},
    Point: jest.fn().mockImplementation((color, effect) => ({ color, effect })),
    Signal: jest.fn().mockImplementation(({ name, message, points }) => ({
      name,
      message,
      points,
    })),
    logger: { info: jest.fn(), error: jest.fn() },
  };
});

describe("AirQualityMonitor", () => {
  let monitor;

  beforeEach(() => {
    monitor = new AirQualityMonitor();
    monitor.config = {
      latitude: 40.7128,
      longitude: -74.006,
      aqi: "us_aqi",
    };
  });

  it("fetches and parses quality metrics correctly", async () => {
    const mockResponse = {
      current: {
        us_aqi: 42,
        uv_index: 3,
        pm2_5: 12,
      },
    };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await monitor.getQualityMetrics();

    expect(result).toEqual({
      aqi: 42,
      uv_index: 3,
      pm2_5: 12,
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("latitude=40.7128")
    );
  });

  it("generates correct color for AQI value", async () => {
    const point = await monitor.generatePoint("aqi", 120);
    expect(point.color).toBe("#FF6600");
    expect(point.effect).toBe("SET_COLOR");
  });

  it("generates correct color for UV index", async () => {
    const point = await monitor.generatePoint("uv_index", 8);
    expect(point.color).toBe("#FF0000");
  });

  it("generates correct color for PM2.5 with US AQI", async () => {
    const point = await monitor.generatePoint("pm2_5", 7);
    expect(point.color).toBe("#00FF00");
  });

  it("generates correct color for PM2.5 with non-US AQI", async () => {
    monitor.config.aqi = "european_aqi";
    const point = await monitor.generatePoint("pm2_5", 7);
    expect(point.color).toBe("#FFDD00");
  });

  it("produces a signal with expected message and points", async () => {
    const mockData = {
      current: {
        us_aqi: 85,
        uv_index: 6,
        pm2_5: 20,
      },
    };
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    const signal = await monitor.run();

    expect(signal.name).toBe("Air Quality Monitor");
    expect(signal.message).toContain("AQI: 85");
    expect(signal.points[0]).toHaveLength(3);
    expect(signal.points[0][0].color).toBe("#FFDD00");
  });
});
