import graphene
from graphene import Date
import pymongo

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
    date = Date()
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
    user = graphene.Field(User) 
    user_expenses = graphene.List(Expense, expense_amount=graphene.Float(default_value=0), greater=graphene.Boolean(default_value=True),
                                  period=graphene.String(default_value=None),
                                 expense_category=graphene.Field(ExpenseCategory, default_value='ALL'))
    # Do we want it so that user can select all budgets that are above below a certain budget total/remaning amount?
    # seems like a bit much
    user_budget = graphene.List(Budget, budget_category=graphene.Field(ExpenseCategory, default_value='ALL'))
    user_budget_exceeded = graphene.List(Budget)

    def resolve_user(self, info):
        # Implement authentication for the user

        # Connect to the database to get user data
        user_data = ...

        # Logic for returning only the field values requested by the user
        # Get the requested fields from the query
        requested_fields = info.field_asts[0].selection_set.selections if info.field_asts else []

        # Initialize a dictionary to hold the selected user fields
        selected_user_fields = {}

        # Populate the selected_user_fields dictionary with the requested fields
        for field in requested_fields:
            field_name = field.name.value
            # Ensure the field exists in the user data before adding it
            if field_name in user_data:
                selected_user_fields[field_name] = user_data[field_name]

        return selected_user_fields
    

    def resolve_user_expenses(self, info, expense_amount, greater, period, expense_category):
        # Authenticate user? or just add a user_id scalar to Expense to find expenses for selected user?

        # Connect to database to get expense data for user
        # idk pymongo. will implement after i see database setup
        
        # filter by input fields
        
        # return filtered data
        return
    
    def resolve_user_budget(self, info, budget_category):
        # Authenticate user? or just add a user_id scalar to budget to find budget for selected user?

        # Connect to database to get expense data for user
        # idk pymongo. will implement after i see database setup
        
        # filter by input fields
        
        # return filtered data
        return

    def resolve_user_budget_exceeded(self, info, budget_category):
        # Authenticate user? or just add a user_id scalar to budget to find budget for selected user?

       # Connect to database to get expense data for user
        # idk pymongo. will implement after i see database setup
        
        # filter by input fields
        
        # return filtered data
        return
    
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

        # insert the new user info into database

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

        # create a token for the login
        token = ...
        # retrieve user data from the database
        user = ...

        return Login(token=token, user=user)

class AddExpense(graphene.Mutation):
    class Arguments:
        description = graphene.String(required=True)
        amount = graphene.Float(required=True)
        date = Date(required=True)
        category = graphene.Field(ExpenseCategory, required=True)
    
    user = graphene.Field(User)

    def mutate(self, info, description, amount, date, category):
        # authenticate user somehow
        updated_user = graphene.Field(User) # placeholder might be like a mongoengine type or something idk

        # check if valid expense

        new_expense = Expense(
            id=None, # change later
            description=description,
            amount=amount,
            date=date, 
            category=category
        )

        # add new expense to database

        updated_user.expenses.append(new_expense)
        
        return AddExpense(user=updated_user)

class AddBudget(graphene.Mutation):
    class Arguments():
        budget_total = graphene.Float(required=True)
        budget_remaining = graphene.Float(required=True)
        category = graphene.Field(ExpenseCategory)
    
    user = graphene.Field(User)

    def mutate(self, info, budget_total, budget_remaning, budget_exceeded, category):
        # authenticate user somehow
        updated_user = graphene.Field(User) # placeholder might be like a mongoengine type or something idk

        # check if the budget category does not already exist in the database, error if does
        # also check if the budget remaining and total make sense

        new_budget = Budget(
            id = None, # change later
            budget_total=budget_total,
            budget_remaning=budget_remaning,
            budget_exceeded=False,
            category=category
        )

        # add budget to the database

        updated_user.budget.append(new_budget)
 
        return AddBudget(user=updated_user)
    
class Mutation(graphene.ObjectType):
    register = Register.Field()
    login = Login.Field()
    add_expense = AddExpense.Field()
    add_budget = AddBudget.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)