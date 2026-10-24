

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from sklearn.linear_model import LinearRegression
import numpy as np

app = Flask(__name__)
CORS(app)

client = MongoClient(
    "mongodb://localhost:27017/",
    serverSelectionTimeoutMS=3000
)

db = client["smart_sales_db"]
sales_collection = db["sales"]


@app.route("/")
def home():
    return jsonify({
        "project": "Smart Sales Analytics & Prediction",
        "status": "Backend is running"
    })


@app.route("/api/health")
def health():
    try:
        client.admin.command("ping")
        return jsonify({
            "status": "healthy",
            "mongodb": "connected"
        })
    except PyMongoError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500


@app.route("/api/sales")
def get_sales():
    try:
        sales = list(sales_collection.find({}, {"_id": 0}))
        return jsonify({
            "count": len(sales),
            "sales": sales
        })
    except PyMongoError as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/analytics")
def get_analytics():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_revenue": {
                        "$sum": {
                            "$multiply": ["$price", "$quantity"]
                        }
                    },
                    "total_units": {"$sum": "$quantity"},
                    "total_products": {"$sum": 1}
                }
            }
        ]

        result = list(sales_collection.aggregate(pipeline))

        if not result:
            return jsonify({
                "total_revenue": 0,
                "total_units": 0,
                "total_products": 0
            })

        summary = result[0]
        summary.pop("_id", None)
        return jsonify(summary)

    except PyMongoError as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/category-sales")
def category_sales():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "total_revenue": {
                        "$sum": {
                            "$multiply": ["$price", "$quantity"]
                        }
                    },
                    "total_units": {"$sum": "$quantity"},
                    "total_products": {"$sum": 1}
                }
            },
            {"$sort": {"total_revenue": -1}}
        ]

        result = list(sales_collection.aggregate(pipeline))

        for item in result:
            item["category"] = item.pop("_id", "Unknown")

        return jsonify({"category_sales": result})

    except PyMongoError as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/top-products")
def top_products():
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$product",
                    "total_revenue": {
                        "$sum": {
                            "$multiply": ["$price", "$quantity"]
                        }
                    },
                    "total_units": {"$sum": "$quantity"}
                }
            },
            {"$sort": {"total_revenue": -1}},
            {"$limit": 5}
        ]

        result = list(sales_collection.aggregate(pipeline))

        for item in result:
            item["product"] = item.pop("_id", "Unknown")

        return jsonify({"top_products": result})

    except PyMongoError as error:
        return jsonify({"error": str(error)}), 500


@app.route("/api/daily-sales")
def daily_sales():
    try:
        pipeline = [
            {
                "$match": {
                    "date": {"$exists": True, "$type": "date"}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$date"
                        }
                    },
                    "total_revenue": {
                        "$sum": {
                            "$multiply": ["$price", "$quantity"]
                        }
                    },
                    "total_units": {
                        "$sum": "$quantity"
                    },
                    "total_records": {
                        "$sum": 1
                    }
                }
            },
            {"$sort": {"_id": 1}}
        ]

        result = list(sales_collection.aggregate(pipeline))

        daily_data = []

        for item in result:
            daily_data.append({
                "date": item["_id"],
                "total_revenue": item["total_revenue"],
                "total_units": item["total_units"],
                "total_records": item["total_records"]
            })

        return jsonify({"daily_sales": daily_data})

    except PyMongoError as error:
        return jsonify({"error": str(error)}), 500

@app.route("/api/forecast")
def sales_forecast():
    # Demo data: sample monthly sales revenue
    historical_sales = [
        180000, 195000, 210000,
        205000, 225000, 240000
    ]

    # Month numbers: 1 to 6
    months = np.array(
        [1, 2, 3, 4, 5, 6]
    ).reshape(-1, 1)

    revenue = np.array(historical_sales)

    # Train a simple Linear Regression model
    model = LinearRegression()
    model.fit(months, revenue)

    # Predict the next 3 months
    future_months = np.array(
        [7, 8, 9]
    ).reshape(-1, 1)

    predictions = model.predict(future_months)

    return jsonify({
        "forecast_type": "DEMO - NOT REAL SALES HISTORY",
        "historical": [
            {
                "month": f"Month {i + 1}",
                "revenue": value
            }
            for i, value in enumerate(historical_sales)
        ],
        "predictions": [
            {
                "month": f"Month {i + 7}",
                "revenue": round(max(0, float(value)), 2)
            }
            for i, value in enumerate(predictions)
        ]
    })
if __name__ == "__main__":
    app.run(debug=True, port=5000)

