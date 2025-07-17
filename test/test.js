const { AirQualityMonitor } = require("../index.js");
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
      postalCode: "90001",
      aqi: "us_aqi",
    };
  });

  it("fetches and parses quality metrics correctly", async () => {
    const mockGeo = {
      results: [{ latitude: 40.7128, longitude: -74.006 }],
    };

    const mockMetrics = {
      current: {
        us_aqi: 42,
        uv_index: 3,
        pm2_5: 12,
      },
    };

    // mock geocoding
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeo,
    });

    // mock air quality API
    fetch.mockResolvedValueOnce({
      json: async () => mockMetrics,
    });

    const location = await monitor.getUserCoordinates();
    const result = await monitor.getQualityMetrics(
      location.latitude,
      location.longitude
    );

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

  it("produces a signal with expected message and points", async () => {
    const mockGeo = {
      results: [{ latitude: 40.7128, longitude: -74.006 }],
    };
    const mockMetrics = {
      current: {
        us_aqi: 85,
        uv_index: 6,
        pm2_5: 20,
      },
    };

    // mock geocoding API
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeo,
    });

    // mock air quality API
    fetch.mockResolvedValueOnce({
      json: async () => mockMetrics,
    });

    // simulate config initialization
    await monitor.applyConfig();

    const signal = await monitor.run();

    expect(signal.name).toBe("Air Quality Monitor");
    expect(signal.message).toContain("AQI: 85");
    expect(signal.points[0]).toHaveLength(3);
    expect(signal.points[0][0].color).toBe("#FFDD00");
  });
});
