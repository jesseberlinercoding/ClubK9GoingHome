import React, { useState, useEffect } from 'react';

import './forMe.css';

import dayjs from 'dayjs';

export default function GoingHome() {
	const [globalArray, setGlobalArray] = useState(null);
	const [myKey, setMyKey] = useState(() => {
		// getting stored value
		const saved = localStorage.getItem("myKey");
		const initialValue = JSON.parse(saved);
		return initialValue || "";
	});
	
	const today = dayjs();
	
	
	useEffect(() => {
		localStorage.setItem("myKey", JSON.stringify(myKey));
	}, [myKey]);
	

	
	
	
	async function fetchData(e) {
		e.preventDefault();
		
		let pass = myKey;
		
		if (pass !== '') {
			const url = 'https://club-k9.gingrapp.com/api/v1/reservations?key=' + pass;
			
			const dayFormatted = today.format('YYYY-MM-DD');
			const dayPlusOneFormatted = today.add(1, 'day').format('YYYY-MM-DD');
			const payload = `start_date=${dayFormatted}&end_date=${dayPlusOneFormatted}`;
			const initStuff = {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: payload
			};
			try {
				const response = await fetch(url, initStuff);
				const newData = await response.json();
				
				let modifiedArray = createArrayData(newData.data);
				
				setGlobalArray(modifiedArray);
				
			}
			catch (error) {
				alert("invalid key");
			}
		}
		
	};
	

	function sortDogs(itemA, itemB) {
		if (itemA.end.format('HHmm') > itemB.end.format('HHmm'))  
			return 1;
		if (itemA.end.format('HHmm') < itemB.end.format('HHmm'))
			return -1;
		return 0;
			
	}

	function createArrayData(results) {
		let returnObjects = Object.entries(results).map(reservation => (
		{
			dog_name: reservation[1].animal.name.trim(),
			owner_last: reservation[1].owner.last_name.trim(),
			end: dayjs(reservation[1].end_date),
			canceled: reservation[1].cancelled_date === null ? false : true,
			hasCheckedOut: reservation[1].check_out_date === null ? false : true
		}
		)).filter(res => (!res.canceled && !res.hasCheckedOut)).filter(res => (dayjs(res.end).format('MM-DD') === today.format('MM-DD')));
		
		returnObjects.sort(sortDogs);
		return returnObjects;
	}
	

	return (
	<>
			<form>
				<div className="test">
					<input type="text" placeholder="API key" value={myKey} onChange={(e) => setMyKey(e.target.value)} aria-label="apikey" />
					<input type="submit" value="Go" onClick={fetchData}></input>
				</div>
			</form>
			{globalArray ? (
				<table>
					<thead>
					<tr>
						<th>Dog name</th>
						<th>Time</th>
					</tr>
					</thead>
					<tbody>
					{globalArray.map((data, index) => (
						<tr key={index}>
							<td>{data.dog_name}</td>
							<td>{data.end.format('HHmm')}</td>
						</tr>
					))}
					</tbody>
				</table>
				)
				: <div className="error">Enter API key</div>
			}		
		</>
		);
}


		