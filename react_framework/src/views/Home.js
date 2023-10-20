import React from 'react';
import { Container } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
        

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {

  //array with past spending history 
 const pastSpending = [{
  id: '1000',
  code: 'f230fh0g3',
  name: 'Rent',
  description: 'Product Description',
  image: 'bamboo-watch.jpg',
  price: 65,
  category: 'Housing',
  quantity: 1,
  inventoryStatus: 'INSTOCK',
  rating: 5
}];
 const data = {
  labels: ['Home', 'Shopping', 'Food/Drink', 'Entertainment/Miscellaneous', 'Transportation', 'Savings'],
  datasets: [
    {
      label: 'Percent of Budget Spent',
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

				<div className="chart-container">

				<Doughnut data={data} />
				</div> 
        <DataTable value={pastSpending} tableStyle={{ minWidth: '50rem' }}>
        <Column field="name" header="Name of Purchase"></Column>
        <Column field="category" header="Category"></Column>
        <Column field="quantity" header="Quantity"></Column>
        <Column field="price" header="Price($)"></Column>
        </DataTable>
			</Container>
		</React.Fragment>
	)
}

export default Home;