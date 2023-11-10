import React, { useState } from 'react';
import  { Calendar } from 'primereact/calendar';
import { Container } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

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
      <h3 className='fw-normal'>Tracker</h3>

        <div className="flex justify-content-end">
          <Calendar 
          placeholder="Select a date range"
          value={dates} onChange ={(e) => setDates(e.value)} selectionMode="range" readOnlyInput/>
        </div>

				<div className="chart-container">

				<Doughnut data={data} />
				</div>
			</Container>
		</React.Fragment>
	)
}

export default Home;