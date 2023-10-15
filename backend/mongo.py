
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://darshangupta:cs222team6@cs222cluster.ufmxixr.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
    
    
data = {
  "users": [
    {
      "id": "1",
      "username": "Alice",
      "password": "password123",  # Note: Storing passwords in plaintext is not recommended. This is just for demonstration purposes.
      "email": "alice@email.com",
      "expenses": [
        {
          "id": "e1",
          "description": "Lunch at Cafe",
          "amount": 15.75,
          "date": "2023-10-15",
          "category": "Food and Dining"
        },
        {
          "id": "e2",
          "description": "Train ticket",
          "amount": 5.50,
          "date": "2023-10-14",
          "category": "Transportation"
        }
      ],
      "budget": [
        {
          "id": "b1",
          "budget_total": 500.00,
          "budget_remaining": 479.75,
          "budget_exceeded": False,
          "category": "All Categories"
        }
      ]
    },
    {
      "id": "2",
      "username": "Bob",
      "password": "bobsecurepass",
      "email": "bob@email.com",
      "expenses": [
        {
          "id": "e3",
          "description": "Concert Ticket",
          "amount": 50.00,
          "date": "2023-10-10",
          "category": "Entertainment"
        },
        {
          "id": "e4",
          "description": "Monthly rent",
          "amount": 800.00,
          "date": "2023-10-01",
          "category": "Housing"
        }
      ],
      "budget": [
        {
          "id": "b2",
          "budget_total": 1000.00,
          "budget_remaining": 150.00,
          "budget_exceeded": False,
          "category": "All Categories"
        }
      ]
    }
  ]
}


# Get the 'CS222' collection from the database
db = client.get_database('Data')  # Replace 'your_database_name' with the name of your database
collection = db.CS222

# Insert the JSON data into the collection
result = collection.insert_one(data)

# Print the inserted ID
print(f"Inserted data with ID: {result.inserted_id}")