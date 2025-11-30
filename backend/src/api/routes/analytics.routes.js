const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/overview', async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const succeededCount = await Transaction.countDocuments({ status: 'succeeded' });
    const failedCount = await Transaction.countDocuments({ status: 'failed' });
    const successRate = totalTransactions > 0 ? ((succeededCount / totalTransactions) * 100).toFixed(2) : '0';

    const revenueResult = await Transaction.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const avgRiskResult = await Transaction.aggregate([
      { $group: { _id: null, avg: { $avg: '$riskScore' } } },
    ]);
    const averageRiskScore = avgRiskResult[0]?.avg || 0;

    res.json({
      totalTransactions,
      succeededCount,
      failedCount,
      successRate: parseFloat(successRate),
      totalRevenue,
      averageRiskScore: parseFloat(averageRiskScore.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/transactions-over-time', async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, '$amount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/card-types', async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $group: {
          _id: '$cardType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
