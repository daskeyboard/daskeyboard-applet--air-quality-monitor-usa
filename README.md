# Air Quality Monitor - USA

This applet's source code can be found [here](https://github.com/daskeyboard/daskeyboard-applet--air-quality-monitor-usa).

Track your local environmental health in real time using this applet for the Das Keyboard Q series.
It displays live **AQI**, **UV Index**, and **PM2.5** readings across three dedicated keys on your keyboard — giving you instant visual feedback at a glance.

![Air Quality Monitor on a Das Keyboard Q](assets/image.png "Air Quality Monitor")

---

## 🌤️ Features

- 🟢 **Green** when air quality and UV exposure are good
- 🟡 **Yellow** for moderate caution
- 🟠 **Orange** when conditions are unhealthy for sensitive groups
- 🔴 **Red** when conditions are poor
- 🟣 **Purple** for a very high UV index or severe pollution
- 🟤 **Maroon** for extremely severe pollution
- 💡 Displays **three live metrics** on **three separate keys** (from left to right):
  - **AQI** - General air pollution level; higher values mean poorer overall air quality.
  - **UV Index** - Measures ultraviolet radiation from the sun; high levels increase the risk of skin damage.
  - **PM2.5** - Fine particulate matter that can penetrate deep into the lungs and affect respiratory and cardiovascular health.
- 📡 Uses accurate real-time data from [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)

---

## ⚙️ Setup Instructions

1. **Install the applet** via the Das Keyboard Q software
2. **Assign it to any 3 adjacent keys** on your Q device
3. **Enter your US 5-digit postal code**
4. **Watch the key light up** based on the air quality around you!

---

## 🇺🇸 Entering Your Location (USA Only)

To track local environmental data, just enter your **5-digit US postal code**.

You can find your postal code by:

- Checking your mailing address
- Searching online: “postal code for [Your City, State]”
- Using your phone’s weather app or GPS

---

## Changelog

[CHANGELOG.md](CHANGELOG.md)

---

## Installation

Requires a Das Keyboard Q series: https://www.daskeyboard.com

Installation, configuration and uninstallation of applets is done within
the Q Desktop application: <https://www.daskeyboard.com/q>

---

## Running tests

    yarn test

---

## Contributions

Pull requests welcome.
