import React, { useState } from 'react';
import  { Calendar } from 'primereact/calendar';
import { Container } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
// import {format} from 'date-fns';
import { Divider } from 'primereact/divider';
import { useMutation, useQuery, gql } from '@apollo/client';

ChartJS.register(ArcElement, Tooltip, Legend);

const EXPENSE_QUERY = gql`
  query Expense($userId: ID!) {
    user(userId: $userId) {
      expenses {
        id
        description
        amount
        date
        category
      }
      budget {
        id
        budgetTotal
        budgetRemaining
        budgetExceeded
        category
      }
    }
  }
`;

const ADD_EXPENSE = gql`
  mutation AddExpense($userId: ID!, $amount: Float!, $description: String!, $category: ExpenseCategory!, $date: String!) {
    addExpense(userId: $userId, amount: $amount, description: $description, category: $category, date: $date) {
      user {
        id
      }
    }
  }
`;

const ADD_BUDGET = gql`
  mutation AddBudget($userId: ID!, $budgetTotal: Float!, $category: ExpenseCategory!) {
    addBudget(userId: $userId, budgetTotal: $budgetTotal, category: $category) {
      user {
        id
      }
    }
  }
`;
const Home = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(); // Assuming amount is a number
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState(null);
  const [errorMessage, setExpenseError] = useState('');

  const [food, setFood] = useState('');
  const [transportation, setTransportation] = useState('');
  const [housing, setHousing] = useState('');
  const [ent, setEnt] = useState('');
  const [health, setHealth] = useState('');
  const [misc, setMisc] = useState('');
  const [budgetError, setBudgetError] = useState('');


  //authenticate user
  const userToken = localStorage.getItem('user-token');
  const userId = userToken;

  // mutation for adding expenses
  const [add_expense, {data: expense_data, loading: expense_loading, error: expense_error}] = useMutation(ADD_EXPENSE);

  // mutation for adding budgets
  const [add_budget, {data: budget_data, loading: budget_loading, error: budget_error}] = useMutation(ADD_BUDGET);

  // query for retrieving expenses and budget
  const {loading, error, data} = useQuery(EXPENSE_QUERY, {
    variables: {userId},
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No data available.</p>;

  const expensesAndBudget = data['user'];

  const budgetInfoByCategory = new Map();
  const runningTotals = new Map();

  expensesAndBudget.budget.forEach(budgetItem => {
    budgetInfoByCategory.set(budgetItem.category, {
      budgetTotal: budgetItem.budgetTotal,
      budgetRemaining: budgetItem.budgetRemaining,
      budgetExceeded: budgetItem.budgetExceeded
    });
  });
  const mergeExpensesAndBudget = expensesAndBudget.expenses.map(expense => {
    const budgetInfo = budgetInfoByCategory.get(expense.category) || {};
    let total = runningTotals.get(expense.category) || 0;
  
    // Update the running total for this category
    total += expense.amount;
    runningTotals.set(expense.category, total);
  
    // Calculate remaining budget and check if exceeded
    const budgetTotal = budgetInfo.budgetTotal || null;
    const budgetRemaining = budgetTotal !== null ? budgetTotal - total : null;
    const budgetExceeded = budgetRemaining !== null ? budgetRemaining < 0 : false;
  
    return {
      ...expense,
      budgetTotal: budgetTotal,
      budgetRemaining: budgetRemaining,
      budgetExceeded: budgetExceeded
    };
  });

  const filteredExpensesAndBudget = mergeExpensesAndBudget.filter(item => {
    if (!dates) {
      // If both range values are null, include all items
      return true;
    }
  
    const itemDate = new Date(item.date); // Assuming 'date' is a property in each expense
  
    const rangeStartDate = dates[0] ? new Date(dates[0]) : null;
    const rangeEndDate = dates[1] ? new Date(dates[1]) : null;
  
    return (
      (!rangeStartDate || itemDate >= rangeStartDate) &&
      (!rangeEndDate || itemDate <= rangeEndDate)
    );
  });

  const donutColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

  const data_info = {
    labels: [],
    datasets: [
      {
        label: 'Amount',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  };

  // Process each expense and add data to the chart object
  // Object to hold the aggregated totals
  const categoryTotals = {};

  // Aggregate expenses by category
  filteredExpensesAndBudget.forEach(expense => {
    if (expense.category !== 'All Categories') {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    }
  });
  // Now generate the chart data
  data_info.labels = [];
  data_info.datasets[0].data = [];
  data_info.datasets[0].backgroundColor = [];
  data_info.datasets[0].borderColor = [];

  Object.keys(categoryTotals).forEach((category, i) => {
    data_info.labels.push(category);
    data_info.datasets[0].data.push(categoryTotals[category]);
    data_info.datasets[0].backgroundColor.push(donutColors[i % donutColors.length]); // Use modulo for color cycling
    data_info.datasets[0].borderColor.push(donutColors[i % donutColors.length]);
  });


  const getExpensePeriod = (expenses) => {
    if (expenses.length === 0) {
      return null; // No expenses, return null or handle accordingly
    }

    return expenses.reduce((acc, expense) => {
      acc.start = !acc.start || expense.date < acc.start ? expense.date : acc.start;
      acc.end = !acc.end || expense.date > acc.end ? expense.date : acc.end;

      return acc;
    }, {});
  };


  const expensePeriod = getExpensePeriod(mergeExpensesAndBudget);

  const renderWarningIcon = (rowData) => {
    return rowData.budgetExceeded ? <i className="pi pi-exclamation-triangle" style={{ color: 'red' }}></i> : <i className="pi pi-check" style={{ color: 'green' }}></i>;
  };

  function getCurrentDateFormatted() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, add 1 to get correct month
    const day = date.getDate().toString().padStart(2, '0'); // Pad with leading 0 if necessary

    return `${year}-${month}-${day}`;
  };

  const date = getCurrentDateFormatted();
  const AddSpending = async () => {
 
    try {
      await add_expense({
        variables: {userId, amount, description, category: category.toUpperCase(), date},
      });
      window.location.reload();
    } catch(error) {
      console.log("there was an error processing your expense");
      setExpenseError("Invalid Expense");
    };  

  };

  function isValidInput(input) {
    return !isNaN(input) && Number(input) > 0;
  }

  const SetBudgets = async () => {

    const categories = ['FOOD', 'HOUSING',  'TRANSPORTATION', 'ENTERTAINMENT', 'HEALTH', 'MISC'];
    const budgets = [food, housing, transportation, ent, health, misc];
    try {
      for(let i = 0; i < categories.length; i++) {
        if (!budgets[i]) {
          continue;
        } else if (!isValidInput(budgets[i])) {
          throw new Error("Not Valid");
        } else {
          await add_budget({
            variables: {userId, budgetTotal: budgets[i], category: categories[i]}
          });
        }
      }
      window.location.reload();
    } catch (budget_error) {
      console.log("error");
      setBudgetError("Invalid Budget");
    };
  };

	return (
		<React.Fragment>
			<Container className='py-5'>
      <div className="card">
            <TabView>
                <TabPanel header="Past Spending">
                  <div>
                  {expensePeriod ? (
                  <div>
                    <h4>Expense History</h4>
                  </div>
                  ) : (
                    <p>No expenses to display.</p>
                  )}
                  </div>
                  <Divider />

                  <div className="flex justify-content-end">
                    <Calendar 
                      placeholder="Select a date range"
                      value={dates} onChange ={(e) => setDates(e.value)} selectionMode="range" readOnlyInput/>
                  </div>
				          <div className="chart-container">				           
                    {filteredExpensesAndBudget.length ? (
                  <div>
                     <Doughnut data={data_info} />
                  </div>
                  ) : (
                    <p>No expenses to display.</p>
                  )}
				          </div>
                  <Divider />
                  <div className="table-container">
                    <DataTable value={filteredExpensesAndBudget.reverse()} tableStyle={{ minWidth: '50rem' }}>
                      <Column field="category" sortable header="Category"></Column>
                      <Column field="amount" sortable header="Amount($)"></Column>
                      <Column field="description"sortable  header="Description"></Column>
                      <Column field="date" sortable header="Date"></Column>
                      <Column field="budgetTotal" sortable header="Total Budget ($)"></Column>
                      <Column field="budgetRemaining" sortable header="Budget Remaining"></Column>
                      <Column field="budgetExceeded" header="Within budget" body={renderWarningIcon} />
                    </DataTable>
                  </div>         
                </TabPanel>
                <TabPanel header="Add Spending">
                  <div className="card flex flex-column md:flex-row gap-3">
                    <div className="p-inputgroup flex-1">
                      <InputText value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
                    </div>
                    <div className="p-inputgroup flex-1">
                      <InputText value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                    </div>
                    <div className="p-inputgroup flex-1">
                      <InputNumber value={amount} onValueChange={(e) => setAmount(e.value)} placeholder="Amount" mode="decimal" />
                    </div>
                    <Button label="Submit" onClick={AddSpending} />
                  </div>
                  {/* error if wrong username or password*/}
                  {errorMessage && (
                                <div className="error-message" style={{ color: 'red' }}>
                                    {errorMessage}
                                    <br></br>Valid Categories:  <br></br>
                                              FOOD <br></br>
                                              TRANSPORTATION <br></br>
                                              HOUSING <br></br>
                                              ENTERTAINMENT <br></br>
                                              HEALTH <br></br>
                                              MISC <br></br>
                                </div>
                            )}
                </TabPanel>
                <TabPanel header="Set Budget">
                <div className="flex flex-column gap-2">
                  <label>Food and Dining</label>
                  <InputText id="FOOD"  value={food} onChange={(e) => setFood(e.target.value)} />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Transportation</label>
                  <InputText id="TRANSPORTATION" value={transportation} onChange={(e) => setTransportation(e.target.value)} />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Housing</label>
                  <InputText id="HOUSING" value={housing} onChange={(e) => setHousing(e.target.value)} />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Entertainment</label>
                  <InputText id="ENTERTAINMENT" value={ent} onChange={(e) => setEnt(e.target.value)} />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Healthcare and Fitness</label>
                  <InputText id="HEALTH" value={health} onChange={(e) => setHealth(e.target.value)}/>
                </div>

                <div className="flex flex-column gap-2">
                  <label>Miscellaneous</label>
                  <InputText id="MISC" value={misc} onChange={(e) => setMisc(e.target.value)} />
                </div>
                <div>
                <div className="card flex flex-column md:flex-row gap-3">
                <Button label="Submit" onClick={SetBudgets} />
                  </div>
                </div> 
                {budgetError && (
                                <div className="error-message" style={{ color: 'red' }}>
                                    {budgetError}
                                </div>
                            )}
                </TabPanel>
            </TabView>
        </div>      
			</Container>
		</React.Fragment>
	)
}

export default Home;