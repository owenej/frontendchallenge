import React, {useState} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';

export default function FrontEnd() {
  return (
    <Router>
      <div className="nav">
        <ul>
          <li>
            <Link to="/">Homepage</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/dashboard">Exchange Rates</Link>
          </li>
          <li>
            <Link to="/chart">Historical Chart</Link>
          </li>
        </ul>

        <hr />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/chart">
            <ChartHistory />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="mainEx">
      <h2 className="centreMe">Home</h2>
      <p>Welcome to the homepage of the foreign exchange website</p>
    </div>
  );
}

function About() {
  return (
    <div className="mainEx">
      <h2 className="centreMe">About</h2>
      <p>Established in 2019 we provide a quick reference for exchange rates</p>
    </div>
  );
}

function Dashboard() {
  let resultz = ""
  const [sCurr, setSCurr] = useState("");
  const [sDate, setSDate] = useState("");
  const [dataBlock, setDataBlock] = useState("");
  const [headDate, setHeadDate] = useState("");
  const [seeTable, setSeeTable] = useState("hidden");


  const  handleClick = async () => {
    let value = sCurr;
    let datez = sDate;
    const currentTime = new Date();
    const theirTime = new Date(datez);

    // Only attempt API call if selected date is in the past
    if (currentTime>theirTime){
    let getUrl = 'https://api.exchangeratesapi.io/history?start_at='+datez+'&end_at='+datez+'&base='+value;
    let datezyr = datez.slice(0,4);
    let datezmonth = datez.slice(5,7);
    let datezday = datez.slice(8, 10);
    let formdate = datezday+"/"+datezmonth+"/"+datezyr;

    try{
      const response = await fetch(getUrl);
      const myJson = await response.json();
      const strJson = (JSON.stringify(myJson));
    if (strJson.length<80){
      alert("No data available from the API for this date. Please try another.")
    }

    const truncFront = strJson.substring(23, strJson.length);
    const sliceEnd = truncFront.slice(0, -61);
    let parsed = JSON.parse(sliceEnd);
    setHeadDate(formdate);
    let numberOfIterations = 0;
  
    Object.keys(parsed).forEach(function(key) {
      let assignIdToRow = "rowId"+numberOfIterations;
      // I did have a third column on the table with a call to a function named handleClickChart, I had some issues with arrow functions closing html tags and moved on 
      // I then experienced difficulties with D3 (more detail in later comment) and so did not revisit this issue. I assigned a unique id to each row but did not 
      // use this in the end
     resultz += '<tr id="'+assignIdToRow+'"> <td>' + key + '</td><td>' + parsed[key]+'</td></tr>';
      numberOfIterations++
    })

    setDataBlock(resultz)
    setSeeTable("visible")
    }

    catch (error) {
      console.error(error);
    }
  }
    else {
      alert("Future rates are unfortunately not yet available through this app. Please select a date from the past and try again.");
    }
  };

  return (
    <div>
    <div className="mainEx">
      <h2 className="centreMe">Exchange Rates</h2>
      <div className="row">
        <div className="col1">
      <form>
      <h3> Choose a date:</h3>
      <input type="date" id="start" name="trip-start" onBlur= {e => setSDate(e.target.value)} />
      <h3>          Pick your base currency:</h3>
          <select id="basecurr" className="select-css" onChange= {e => setSCurr(e.target.value)}>
            <option value="EUR">Euro</option>
            <option value="GBP">Pound Sterling</option>
            <option value="USD">US Dollar</option>
            <option value="JPY">Japanese Yen</option>
          </select>
      </form>
      <br />
      <input id="goButton" type='button' value="Go" onClick={handleClick} />
    <div id="results">
    <table id="mytbl" style={{ visibility: seeTable }}>
      <thead>
      <tr>
        <th>Currency</th>
        <th id="datehead">Rate for {headDate} </th>
      </tr>
      </thead>
      {/*
      I tried using Interweave here but the result was wrapped in a span tag and didn't fit properly into columns as a result, td and tr tags were lost.
      This works but I suspect is not best practice. I decided it was better than setting via old style innerHTML as it is at least using state 
      and there are apparently small performance gains to be realised
      */}
      <tbody id="taybody" dangerouslySetInnerHTML={{__html: dataBlock}}>
      </tbody>
    </table>
    </div>
</div>
</div>
    </div>
    </div>
  );
}
  
// I thought the charting side of things was going to be a lot easier than it is, although I'm used to using D3 in standard Javascript I wasn't able  
// to translate this to the React style in time. I've left this code in but the chart is not done, the API response is however formatted into an easily 
// usable format for D3 and this is printed to the page. The API call is also made with placeholder values as the intention was once the chart was built
// I would feed in these values dynamically from a click on the dashboard table
function ChartHistory() {
  const [chartData, setChartData] = useState("");
  const  handleClickTwo = async () => {
  let getUrlTwo = 'https://api.exchangeratesapi.io/history?start_at=2018-01-01&end_at=2018-09-01&symbols=ILS&base=USD';
  try{
    const responseTwo = await fetch(getUrlTwo);
    const myJsonTwo = await responseTwo.json();
    const strJsonTwo = (JSON.stringify(myJsonTwo));
  if (strJsonTwo.length<80){
    alert("No data available from the API for this date, please try another")
  }
  let formatForD3 = []
  Object.keys(myJsonTwo.rates).forEach(function(key) {
    let rateForTheDate = JSON.stringify(myJsonTwo.rates[key]);
    let truncFrontThree = rateForTheDate.substring(7, rateForTheDate.length);
    let sliceEndThree = truncFrontThree.slice(0, -1);
    let oneFineDay = "{\"day\": \""+key+"\", \"rate\": "+sliceEndThree+"\"},"
    formatForD3.push(oneFineDay)
  })
  // Remove trailing comma from last entry in dataset
  formatForD3[formatForD3.length-1] = formatForD3[formatForD3.length-1].slice(0, -1);
  setChartData(formatForD3)
}
catch (error) {
  console.error(error);
}
  };

  return (
    <div className="mainEx">
      <h2 className="centreMe">Historical Chart</h2>
      <p>Example chart for one currency</p>
      <input id="goButtonTwo" type='button' value="Go" onClick={handleClickTwo} />
        <p id="formatted">{chartData}</p>
      <br />
    </div>
  );
}