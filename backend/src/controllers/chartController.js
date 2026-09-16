const { getChartData } = require("../services/chart");

async function chart(req, res) {
  try {
    const tf = req.query.tf || "1D";

const data = await getChartData(tf);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Chart API error",
    });
  }
}

module.exports = {
  chart,
};