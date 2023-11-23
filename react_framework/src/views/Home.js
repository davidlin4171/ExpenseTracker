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

import { Divider } from 'primereact/divider';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [dates, setDates] = useState(null)
  const expensesAndBudget = {
    "expenses": [
      {
        "id": "e3",
        "description": "Concert Ticket",
        "amount": 50.00,
        "date": "2023-09-10",
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
        "budget_exceeded": true,
        "category": "All Categories"
      },
      {
        "id": "b2",
        "budget_total": 1000.00,
        "budget_remaining": 150.00,
        "budget_exceeded": false,
        "category": "Housing"
      }
    ]
  };

    const mergeExpensesAndBudget = [...expensesAndBudget.expenses];
  
    expensesAndBudget.budget.forEach(budgetItem => {
      const correspondingExpense = mergeExpensesAndBudget.find(expense => expense.category == budgetItem.category);
  
      if (correspondingExpense) {
        correspondingExpense.budget_total = budgetItem.budget_total;
        correspondingExpense.budget_remaining = budgetItem.budget_remaining;
        correspondingExpense.budget_exceeded = budgetItem.budget_exceeded;
      } else {
        // If there is no corresponding expense, create a new entry
        mergeExpensesAndBudget.push({
          "category": budgetItem.category,
          "budget_total": budgetItem.budget_total,
          "budget_remaining": budgetItem.budget_remaining,
          "budget_exceeded": budgetItem.budget_exceeded,
        });
      }
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



const data = {
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
filteredExpensesAndBudget.forEach((expense, i) => {
  if(expense.category!== 'All Categories') {
    data.labels.push(expense.category);
    data.datasets[0].data.push(expense.amount);
    data.datasets[0].backgroundColor.push(donutColors[i]);
    data.datasets[0].borderColor.push(donutColors[i]);
  }
  
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
  return !rowData.budget_exceeded ? <i className="pi pi-exclamation-triangle" style={{ color: 'red' }}></i> : <i className="pi pi-check" style={{ color: 'green' }}></i>;
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
                    <h4>Expenses History</h4>
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
                     <Doughnut data={data} />
                  </div>
                  ) : (
                    <p>No expenses to display.</p>
                  )}
				          </div>
                  <Divider />
                  <div className="table-container">
                    <DataTable value={filteredExpensesAndBudget} tableStyle={{ minWidth: '50rem' }}>
                      <Column field="category" sortable header="Category"></Column>
                      <Column field="amount" sortable header="Amount($)"></Column>
                      <Column field="description"sortable  header="Description"></Column>
                      <Column field="date" sortable header="Date"></Column>
                      <Column field="budget_total" sortable header="Total Budget ($)"></Column>
                      <Column field="budget_exceeded" header="Within a budget" body={renderWarningIcon} />
                    </DataTable>
                  </div>         
                </TabPanel>
                <TabPanel header="Add Spending">
                  <div className="card flex flex-column md:flex-row gap-3">
                    <div className="p-inputgroup flex-1">
                      <InputText placeholder="Category" />
                    </div>
                    <div className="p-inputgroup flex-1">
                      <InputNumber placeholder="Amount" />
                      <span className="p-inputgroup-addon">.00</span>
                    </div>     
                    <Button label="Submit" />
                  </div>
                </TabPanel>
                <TabPanel header="Set Budegts">
                <div className="flex flex-column gap-2">
                  <label>Food and Dining</label>
                  <InputText id="FOOD" />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Transportation</label>
                  <InputText id="TRANSPORTATION" />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Housing</label>
                  <InputText id="HOUSING" />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Entertainment</label>
                  <InputText id="ENTERTAINMENT" />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Healthcare and Fitness</label>
                  <InputText id="HEALTH" />
                </div>

                <div className="flex flex-column gap-2">
                  <label>Miscellaneous</label>
                  <InputText id="MISC" />
                </div>
                <div>
                <div className="card flex flex-column md:flex-row gap-3">
                    
                    <Button label="Submit" />
                  </div>
                </div>
                
                </TabPanel>
            </TabView>
        </div>      
			</Container>
		</React.Fragment>
	)
}

export default Home;