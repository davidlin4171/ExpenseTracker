import React, { useState } from 'react';
import  { Calendar } from 'primereact/calendar';
import { Container } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TabView, TabPanel } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const [dates, setDates] = useState(null)

 const data = {
  labels: ['Jan', 'Feb', 'March', 'April', 'May', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
        
      ],
      borderWidth: 1,
    },
  ],
};
	return (
		<React.Fragment>
			<Container className='py-5'>
      <div className="card">
            <TabView>
                <TabPanel header="Past Spending">
                  <div className="flex justify-content-end">
                    <Calendar 
                      placeholder="Select a date range"
                      value={dates} onChange ={(e) => setDates(e.value)} selectionMode="range" readOnlyInput/>
                  </div>
				          <div className="chart-container">
				            <Doughnut data={data} />
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
                  <label htmlFor="username">Category 1</label>
                  <InputText id="username" aria-describedby="username-help" />
                </div>
                <div className="flex flex-column gap-2">
                  <label htmlFor="username">Category 2</label>
                  <InputText id="username" aria-describedby="username-help" />
                </div>
                <div className="flex flex-column gap-2">
                <label htmlFor="username">Category 3</label>
                  <InputText id="username" aria-describedby="username-help" />
                </div>
                <div className="flex flex-column gap-2">
                <label htmlFor="username">Category 4</label>
                  <InputText id="username" aria-describedby="username-help" />
                </div>
                <div className="flex flex-column gap-2">
                <label htmlFor="username">Category 5</label>
                  <InputText id="username" aria-describedby="username-help" />
                </div>
                <div className="flex flex-column gap-2">
                <label htmlFor="username">Category 6</label>
                  <InputText id="username" aria-describedby="username-help" />
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