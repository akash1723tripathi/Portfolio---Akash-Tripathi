# FinSight AI

> Multi-modal Stock Prediction & Financial Intelligence Platform

---

## Overview

FinSight AI is Akash's final-year B.Tech capstone project and accompanying research work. The platform combines financial time-series forecasting, sentiment analysis, technical indicators, and ensemble learning to generate intelligent Buy, Sell, and Hold recommendations.

Rather than predicting stock prices from historical data alone, the project attempts to model market behavior using both numerical and textual financial signals.

---

# Research Objective

Traditional forecasting models struggle because markets are influenced by more than price history.

FinSight AI combines three different sources of information:

- Historical market data
- Financial news sentiment
- Technical indicators

These signals are fused through an ensemble model to improve prediction quality.

---

# Core Features

- Live stock price visualization
- Technical indicator dashboard
- Financial news aggregation
- FinBERT sentiment analysis
- Buy / Sell / Hold recommendation
- Confidence scoring
- Model evaluation dashboard
- Backtesting visualization

Supported demonstration tickers include:

- AAPL
- GOOGL
- TSLA

---

# System Architecture

Yahoo Finance API

↓

Market Data Processing

↓

Technical Indicators (RSI, MACD, Bollinger)

↓

Financial News

↓

FinBERT Sentiment

↓

Ensemble Prediction Engine

↓

Buy / Sell / Hold Signal

The platform merges structured numerical features with unstructured textual sentiment before inference.

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

## AI & Data

- FinBERT
- Hugging Face
- Yahoo Finance
- NewsAPI

## Deployment

- Vercel

---

# Machine Learning Pipeline

## Step 1 — Market Data

Historical OHLCV data is collected using Yahoo Finance.

Extracted features include:

- Closing price
- Volume
- Daily movement
- Historical trends

---

## Step 2 — Technical Indicators

The preprocessing layer calculates indicators such as:

- RSI
- MACD
- Bollinger Bands

These help capture momentum and volatility.

---

## Step 3 — Sentiment Analysis

Financial headlines are processed through **ProsusAI FinBERT**, producing probabilities for:

- Positive
- Neutral
- Negative

Instead of generic sentiment models, FinBERT is specialized for financial language.

---

## Step 4 — Ensemble Prediction

The prediction engine combines multiple models using weighted voting.

Components include:

- Temporal LSTM
- Standard LSTM
- XGBoost
- FinBERT sentiment weighting

This hybrid architecture performed better than individual models during evaluation.

---

# Research Results

According to the capstone evaluation:

| Model | RMSE | R² |
|---|---:|---:|
| Standard LSTM | 3.452 | 0.824 |
| XGBoost | 3.105 | 0.851 |
| LSTM + VADER | 2.850 | 0.887 |
| **FinSight Ensemble** | **2.341** | **0.942** |

The hybrid system achieved the strongest overall predictive performance among the evaluated models.

---

# Backtesting

Historical simulation reported:

- Total Return: **315.6%**
- Sharpe Ratio: **2.45**
- Maximum Drawdown: **−12.4%**

These results are presented as research evaluation metrics rather than investment guarantees.

---

# Engineering Challenges

## Challenge 1

Market prices alone ignored public sentiment.

**Solution**

Integrate FinBERT to convert financial news into numerical sentiment features.

---

## Challenge 2

Different models performed well under different market conditions.

**Solution**

Use an ensemble approach instead of relying on a single architecture.

---

## Challenge 3

Present complex financial information to non-technical users.

**Solution**

Interactive dashboards, confidence scores, and visual technical indicators.

---

# What Akash Learned

FinSight AI introduced Akash to the research side of AI beyond product development.

Major learning areas included:

- Time-series forecasting
- Financial NLP
- Ensemble learning
- Model evaluation
- Backtesting methodology
- Research paper writing

Although his long-term career leans toward AI engineering, this project gave him a strong foundation in applied machine learning research.

---

# Research Contribution

This project was completed as Akash's B.Tech capstone under faculty supervision and accompanied by a formal research paper documenting the methodology, evaluation metrics, and experimental results.

The work represents both an academic research contribution and a deployable demonstration platform.

---

# FAQ

### Is FinSight AI an investment platform?

No. It is an educational and research-oriented financial intelligence system demonstrating hybrid prediction techniques.

### Why FinBERT instead of a generic sentiment model?

Financial language contains domain-specific vocabulary that general sentiment models often misinterpret. FinBERT is trained specifically on financial text.

### Why use an ensemble?

Different models capture different patterns. Combining temporal learning, tree-based learning, and sentiment signals produced stronger evaluation metrics than any individual model.

### What was Akash's biggest takeaway?

The project taught him that AI products require both good models and good engineering. Data pipelines, evaluation, visualization, and user experience matter just as much as prediction accuracy.