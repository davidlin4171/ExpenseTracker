import graphene
from graphene import Date
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from backend import mongo
from .mongo import collection
import uuid

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
    user = graphene.Field(
        User, 
        userId=graphene.ID(required=True)) 
    
    userExpenses = graphene.List(
        Expense, 
        userId=graphene.ID(required=True), 
        expenseAmount=graphene.Float(default_value=0), 
        greater=graphene.Boolean(default_value=True), 
        period=graphene.String(default_value=""),
        expenseCategory=graphene.Argument(ExpenseCategory, default_value='ALL'))
    
    userBudget = graphene.List(
        Budget, 
        userId=graphene.ID(required=True), 
        budgetCategory=graphene.Argument(ExpenseCategory, default_value='ALL'),
        budgetLeft=graphene.Int(default_value = 0), 
        greater=graphene.Boolean(default_value=True))
    
    userBudgetExceeded = graphene.List(
        Budget, 
        userId=graphene.ID(required=True))

    def resolve_user(self, info, userId):
        # use userId to authenticate user for now, can change to tokens later if necessary
        
        # gets all user info from the database
        user_data = collection.find_one({"id": userId})
        for i in list(collection.find({})):
            print(i, '\n')
        #print(collection.find({}))
        return user_data
    

    def resolve_userExpenses(self, info, userId, expenseAmount, greater, period, expenseCategory):
        # use userId to authenticate user for now, can change to tokens later if necessary
        
        # finds current user
        user_query = {"id": userId}

        # query for filtering by expense
        expense_query = {}

        # whether or not to filter all expenses greater than expenseAmount
        if greater:
            expense_query["expenses.amount"] = {"$gt": expenseAmount}
        else:
            expense_query["expenses.amount"] = {"$lte": expenseAmount}

        # filter based on time period. period in format "YYYY-MM-DD - YYYY-MM-DD" 
        if period != "":
            start_date = datetime.strptime(period[0:10], "%Y-%m-%d")
            end_date = datetime.strptime(period[13:], "%Y-%m-%d")
            expense_query["expenses.date"] = {"$gte": start_date, "$lte": end_date}
        
        # filter by expense category
        if expenseCategory != 'ALL':
            expense_query["expenses.category"] = expenseCategory
        pipeline = [
            {"$match": user_query},
            {"$unwind": "$expenses"},
            {"$match": expense_query},
            {"$group": {"_id": "$id", "expenses": {"$push": "$expenses"}}}
        ]
        result = list(collection.aggregate(pipeline=pipeline))
        
        if not result:
            return result
        return result[0]['expenses']
    
    def resolve_userBudget(self, info, userId, budgetCategory, budgetLeft, greater):
        # use userId to authenticate user for now, can change to tokens later if necessary

        # find user
        user_query = {"id": userId}

        # query for filtering budget
        budget_query = {}
        
        # find all budgets which either greater than or less than budgetLeft
        if greater:
            budget_query["budget.budget_remaining"] = {"$gt": budgetLeft}
        else:
            budget_query["budget.budget_remaining"] = {"$lt": budgetLeft}
        
        # filter by budget category
        if budgetCategory != 'ALL':
            budget_query['budget.category'] = budgetCategory

        pipeline = [
            {"$match": user_query},
            {"$unwind": "$budget"},
            {"$match": budget_query},
            {"$group": {"_id": "$id", "budget": {"$push": "$budget"}}}
        ]
        result = list(collection.aggregate(pipeline=pipeline))
        
        if not result:
            return result
        return result[0]["budget"]

    def resolve_userBudgetExceeded(self, info, userId):
        # use userId to authenticate user for now, can change to tokens later if necessary
        
        # filter all budgets for user that have been exceeded
        pipeline = [
            {"$match": {"id": userId}},
            {"$unwind": "$budget"},
            {"$match": {"budget.budget_exceeded": True}},
            {"$group": {"_id": "$id", "budget": {"$push": "$budget"}}}
        ]
        result = list(collection.aggregate(pipeline=pipeline))
        
        if not result:
            return result
        return result[0]["budget"]
'''
For authentication or whatever, idk whether we are using tokens or if we just use like a userId that we create
upon login and then pass that in for every subsequent mutation/query
'''

# Mutations 
class Register(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    
    user = graphene.Field(User)

    def mutate(self, info, username, password):
        # check if the username and email are not already in the database
        if collection.find_one({"username": username}):
            raise Exception("A username is already in use")
        
        # insert the new user info into database
        id = collection.count_documents({}) + 1
        data = {
            "id": str(id),
            "username": username,
            "email": None,
            "password": password,
            "expenses": [],
            "budget": []
        }
        result = collection.insert_one(data)
        new_user = User(
            id = str(id), # add id after database implementation
            username = username,
            email = None,
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
        result = collection.find_one({"$and": [{"username": username}, {"password": password}]})
        if not result:
            raise Exception("Username or password is wrong")

        # get userId that will be subqsequntly passwed in later mutations and queries for user
        user = User(
            id = result['id'], # add id after database implementation
            username = username,
            email = result['email'],
            password = password,
            expenses = result['expenses'],
            budget = result['budget']
        )

        return Login(user=user)

class AddExpense(graphene.Mutation):
    class Arguments:
        userId = graphene.ID()
        description = graphene.String(required=True)
        amount = graphene.Float(required=True)
        date = graphene.String(required=True)
        category = graphene.Argument(ExpenseCategory, required=True)
    
    user = graphene.Field(User)

    def mutate(self, info, userId, description, amount, date, category):
        # maybe change to tokens later

        # check if valid expense
        if amount < 0:
            raise Exception("Expense invalid")

        # add new expense to database
        result = collection.find_one({"id": userId})
        id = len(result['expenses']) + 1 if result else 1
        expense = {
            "id": str(id),
            "description": description,
            "amount": amount,
            "date": datetime.strptime(date, "%Y-%m-%d"),
            "category": category
        }
        collection.update_one(
            {"id": userId},
            {"$push": {"expenses": expense}}
        )
        user = User(
            id = result['id'], # add id after database implementation
            username = result['username'],
            email = result['email'],
            password = result['password'],
            expenses = result['expenses'],
            budget = result['budget']
        )
        return AddExpense(user=user)

class AddBudget(graphene.Mutation):
    class Arguments():
        userId = graphene.ID()
        budget_total = graphene.Float(required=True)
        budget_remaining = graphene.Float(required=True)
        budget_exceeded = graphene.Boolean()
        category = graphene.Argument(ExpenseCategory)
    
    user = graphene.Field(User)

    def mutate(self, info, userId, budget_total, budget_remaining, budget_exceeded, category):
        # maybe change to tokens later

        #check if valid budget
        if budget_remaining < 0 or budget_total < 0:
            raise Exception("Budget invalid")
        
        result = collection.find_one({"id": userId})
        id = len(result['budget']) + 1 if result else 1
        # add budget to the database
        budget = {
            "id": id,
            "budget_total": budget_total,
            "budget_remaining": budget_remaining,
            "budget_exceeded": False,
            "category": category
        }
        collection.update_one(
            {"id": userId},
            {"$push": {"budget": budget}}
        )

        user = User(
            id = result['id'], # add id after database implementation
            username = result['username'],
            email = result['email'],
            password = result['password'],
            expenses = result['expenses'],
            budget = result['budget']
        )
        return AddBudget(user=user)
    
class Mutation(graphene.ObjectType):
    register = Register.Field()
    login = Login.Field()
    add_expense = AddExpense.Field()
    add_budget = AddBudget.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)