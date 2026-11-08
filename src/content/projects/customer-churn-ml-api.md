---
title: 'Customer Churn ML API'
blurb: 'End-to-end churn-prediction pipeline — feature engineering, SMOTE balancing, threshold tuning — served through a FastAPI endpoint with a production-ready inference flow.'
metrics:
  - label: 'Deployment'
    value: 'FastAPI inference endpoint'
  - label: 'Imbalance'
    value: 'SMOTE + threshold tuning'
stack:
  - Python
  - scikit-learn
  - XGBoost
  - FastAPI
repoUrl: 'https://github.com/Gaurav-shinde2207/customer-churn-ml-api'
---

A complete ML engineering exercise: from raw customer data to a deployed scoring API.
Model optimization covers threshold tuning (rather than defaulting to 0.5) and balanced
training with SMOTE, and the trained artifact sits behind a FastAPI endpoint that
consumes feature vectors and returns predictions.
