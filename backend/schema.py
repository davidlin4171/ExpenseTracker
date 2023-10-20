import graphene
from graphene import Date
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from backend import mongo
from mongo import collection

class ExpenseCategory(graphene.Enum):
    ALL = 'All Categories'
    FOOD = 'Food and Dining'
    TRANSPORTATION = 'Transportation'
    HOUSING = 'Housing'
    ENTERTAINMENT = 'Entertainment'
    HEALTH = 'Healthcare and Fitness'
    MISC = 'Miscellaneous'

class Expense(graphene.ObjectType):
    id = graphene.ID()
    description = graphene.String()
    amount = graphene.Float()
    date = graphene.Date()
    category = graphene.Field(ExpenseCategory)

class Budget(graphene.ObjectType):
    id = graphene.ID()
    budget_total = graphene.Float()
    budget_remaining = graphene.Float()
    budget_exceeded = graphene.Boolean()
    category = graphene.Field(ExpenseCategory)

class User(graphene.ObjectType):
    id = graphene.ID()
    username = graphene.String()
    password = graphene.String()
    email = graphene.String()
    expenses = graphene.List(Expense)
    budget = graphene.List(Budget)


# Query
class Query(graphene.ObjectType):
    user = graphene.Field(User, user_id=graphene.ID(required=True)) 
    user_expenses = graphene.List(Expense, user_id=graphene.ID(required=True), expense_amount=graphene.Float(default_value=0), 
                                  greater=graphene.Boolean(default_value=True), period=graphene.String(default_value=None),
                                 expense_category=graphene.Field(ExpenseCategory, default_value='ALL'))
    # Do we want it so that user can select all budgets that are above below a certain budget total/remaning amount?
    # seems like a bit much
    user_budget = graphene.List(Budget, user_id=graphene.ID(required=True), budget_category=graphene.Field(ExpenseCategory, default_value='ALL'),
                                    budget_left=graphene.Int(deault_value = 0), greater=graphene.Boolean(default_value=True))
    user_budget_exceeded = graphene.List(Budget, user_id=graphene.ID(required=True))

    def resolve_user(self, info, user_id):
        # use user_id to authenticate user for now, can change to tokens later if necessary
        
        # gets all user info from the database
        user_data = collection.find_one({"id": user_id})

        return user_data
    

    def resolve_user_expenses(self, info, user_id, expense_amount, greater, period, expense_category):
        # use user_id to authenticate user for now, can change to tokens later if necessary
        
        # finds current user
        user_query = {"id": user_id}

        # query for filtering by expense
        expense_query = {}

        # whether or not to filter all expenses greater than expense_amount
        if greater:
            expense_query["expenses.amount"] = {"$gt": expense_amount}
        
        # filter based on time period. period in format "YYYY-MM-DD - YYYY-MM-DD" 
        if period:
            start_date = datetime.strptime(period[0:10], "%Y-%m-%d")
            end_date = datetime.strptime(period[13:], "%Y-%m-%d")
            expense_query["expense.date"] = {"$gte": start_date, "$lte": end_date}
        
        # filter by expense category
        if expense_category != 'ALL':
            expense_query["expeneses.category"] = expense_category

        pipeline = [
            {"$match": user_query},
            {"$unwind": "$expenses"},
            {"$match": expense_query},
            {"$group": {"_id": "$id", "expenses": {"$push": "$expenses"}}}
        ]

        result = list(collection.aggregate(pipeline=pipeline))

        return result
    
    def resolve_user_budget(self, info, user_id, budget_category, budget_left, greater):
        # use user_id to authenticate user for now, can change to tokens later if necessary

        # find user
        user_query = {"id": user_id}

        # query for filtering budget
        budget_query = {}
        
        # find all budgets which either greater than or less than budget_left
        if greater:
            budget_query["budget.budget_remaining"] = {"$gt": budget_left}
        else:
            budget_query["budget.budget_remaining"] = {"$lt": budget_left}
        
        # filter by budget category
        if budget_category != 'ALL':
            budget_query['budget.category'] = budget_category

        pipeline = [
            {"$match": user_query},
            {"$unwind": "$budget"},
            {"$match": budget_query},
            {"$group": {"_id": "$id", "budget": {"$push": "$budget"}}}
        ]
        result = list(collection.aggregate(pipeline=pipeline))

        return result

    def resolve_user_budget_exceeded(self, info, user_id):
        # use user_id to authenticate user for now, can change to tokens later if necessary
        
        # filter all budgets for user that have been exceeded
        pipeline = [
            {"$match": {"id": user_id}},
            {"$unwind": "$budget"},
            {"$match": {"budget.budget_exceeded": True}},
            {"$group": {"_id": "$id", "budget": {"$push": "$budget"}}}
        ]
        result = list(collection.aggregate(pipeline=pipeline))

        return result
    
'''
For authentication or whatever, idk whether we are using tokens or if we just use like a user_id that we create
upon login and then pass that in for every subsequent mutation/query
'''

# Mutations 
class Register(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        email = graphene.String(required=True)
        password = graphene.String(required=True)
    
    user = graphene.Field(User)

    def mutate(self, info, username, email, password):
        # check if the username and email are not already in the database
        if collection.find_one({"$or": [{"username": username}, {"email": email}]}):
            raise Exception("A username or email is already in use")
        
        # insert the new user info into database
        data = {
            "id": 1231231231223,
            "username": username,
            "email": email,
            "password": password,
            "expenses": [],
            "budget": []
        }
        result = collection.insert_one(data)

        new_user = User(
            id = None, # add id after database implementation
            username = username,
            email = email,
            password = password,
            expenses = [],
            budget = []
        )
        return Register(user=new_user)
    
class Login(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    
    user = graphene.Field(User)

    def mutate(self, info, username, password):
        # check that username is valid entry in the database and the corresponding password is correct
        result = collection.find_one({"$or": [{"username": username}, {"password": password}]})
        if not result:
            raise Exception("Username or password is wrong")
        
        # get user_id that will be subqsequntly passwed in later mutations and queries for user
        user_id = result.get('id')
        user = ...

        return Login(user_id=user_id, user=user)

class AddExpense(graphene.Mutation):
    class Arguments:
        user_id = graphene.ID()
        description = graphene.String(required=True)
        amount = graphene.Float(required=True)
        date = Date(required=True)
        category = graphene.Field(ExpenseCategory, required=True)
    
    user = graphene.Field(User)

    def mutate(self, info, user_id, description, amount, date, category):
        # maybe change to tokens later

        # check if valid expense
        if amount < 0 or category not in ExpenseCategory:
            raise Exception("Expense invalid")
        
        new_expense = Expense(
            id=None, # change later
            description=description,
            amount=amount,
            date=date, 
            category=category
        )

        # add new expense to database
        expense = {
            "id": None,
            "description": description,
            "amount": amount,
            "date": date,
            "category": category
        }
        collection.update_one(
            {"id": user_id},
            {"$push": {"expenses": new_expense}}
        )
        return AddExpense()

class AddBudget(graphene.Mutation):
    class Arguments():
        user_id = graphene.ID()
        budget_total = graphene.Float(required=True)
        budget_remaining = graphene.Float(required=True)
        category = graphene.Field(ExpenseCategory)
    
    user = graphene.Field(User)

    def mutate(self, info, user_id, budget_total, budget_remaning, budget_exceeded, category):
        # maybe change to tokens later

        #check if valid budget
        if budget_remaning < 0 or category not in ExpenseCategory:
            raise Exception("Budget invalid")

        new_budget = Budget(
            id = None, # change later
            budget_total=budget_total,
            budget_remaning=budget_remaning,
            budget_exceeded=False,
            category=category
        )

        # add budget to the database
         # add new expense to database
        budget = {
            "id": None,
            "budget_total": budget_total,
            "budget_remaning": budget_remaning,
            "budget_exceeded": False,
            "category": category
        }
        collection.update_one(
            {"id": user_id},
            {"$push": {"expenses": budget}}
        )
        return AddBudget()
    
class Mutation(graphene.ObjectType):
    register = Register.Field()
    login = Login.Field()
    add_expense = AddExpense.Field()
    add_budget = AddBudget.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)