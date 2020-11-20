import { Card, FormControl, MenuItem, Select, CardContent} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './App.css';
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import { prettyPrintStat, sortData } from "./util";
import "leaflet/dist/leaflet.css";


function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch ("https://disease.sh/v3/covid-19/all")
    .then((responce) => responce.json())
    .then((data) => {
      setCountryInfo(data);
    })
  },[]);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((responce) => responce.json())
      .then((data) => {
        const countries = data.map((country) => ({          
          name: country.country,
          value : country.countryInfo.iso2,       
        })).filter((country) => country.value !== null);;

        let sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // setCountry(countryCode);
    const url = countryCode === "worldwide" 
      ?  "https://disease.sh/v3/covid-19/all" 
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

      await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        if(countryCode === "worldwide"){
          setMapCenter([34.80746, -40.4796]);
          setMapZoom(3);
        }
        else{
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        }   
        
      });

      
  }


  return (
    <div className="app">
      <div className="app__left">      
        <div className="app__header">
        <h1>COVID-19 Tracker</h1> 
        <FormControl className = "app__dropdown">
          <Select variant = "outlined" value = {country} onChange ={onCountryChange}>
          <MenuItem value = "worldwide">Worldwide</MenuItem>
            {/* loop and display all countires */}
              {countries.map((country) => (
                <MenuItem key = {country} value = {country.value}>{country.name}</MenuItem>
              ))}
          </Select>
        </FormControl>
        </div>

        <div className="app__stats">

          {/* InfoBoxs */}
          <InfoBox 
            isRed 
            active = {casesType === "cases"} 
            onClick = {e => setCasesType("cases") } 
            title = "Coronavirus Cases" 
            cases = {prettyPrintStat( countryInfo.todayCases)} 
            total = {prettyPrintStat(countryInfo.cases)}>           
          </InfoBox>

          <InfoBox 
            active = {casesType === "recovered"} 
            onClick = {e => setCasesType("recovered") }
            title = "Recovered" 
            cases = {prettyPrintStat(countryInfo.todayRecovered)} 
            total = {prettyPrintStat(countryInfo.recovered)} >           
          </InfoBox>

          <InfoBox 
            isRed 
            active = {casesType === "deaths"} 
            onClick = {e => setCasesType("deaths") }
            title = "Deaths" 
            cases = {prettyPrintStat(countryInfo.todayDeaths)} 
            total = {prettyPrintStat(countryInfo.deaths)}>           
          </InfoBox>
        </div>

        <Map 
        casesType = {casesType}
        countries = {mapCountries}
        center = {mapCenter}
        zoom = {mapZoom}       
        />
      </div>

      <Card className="app__right">
          {/* Table */}
          <CardContent>
            <div className="app__information">
              <h3>Live Cases by Country</h3>
              <Table countries = {tableData}/>
                <h3 className = "app__graphTitle">Worldwide new {casesType}</h3>
                {/* Graph */}
                <LineGraph className = "app__graph" style={{ width: 305, height: 200}} casesType = {casesType}/>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
