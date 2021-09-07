import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [hospitals, setHospitals] = useState([]);
    useEffect(() => {
        axios
            .get('http://localhost:4000/hospitals')
            .then((response) => {
                const dbOpenRequest = indexedDB.open('hospitalDB', 1);
                dbOpenRequest.onupgradeneeded = function (event) {
                    const db = event.target.result;
                    db.createObjectStore('hospitalStore', { keyPath: 'id' });
                };
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    const txn = db.transaction('hospitalStore', 'readwrite');
                    const store = txn.objectStore('hospitalStore');
                    response.data.forEach((hospital) => {
                        store.add(hospital);
                    });
                };
                setHospitals(response.data);
            })
            .catch(() => {
                const dbOpenRequest = indexedDB.open('hospitalDB', 1);
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    const txn = db.transaction('hospitalStore', 'readonly');
                    const store = txn.objectStore('hospitalStore');
                    const getAllRequest = store.getAll();
                    getAllRequest.onsuccess = function () {
                        setHospitals(getAllRequest.result);
                    };
                };
            });
    }, []);
    return (
        <div className="app">
            <h1>Hospitals</h1>
            {hospitals.map((hospital) => (
                <div key={hospital.id} className="card">
                    <h3>{hospital.name}</h3>
                    <div>Specialities: {hospital.specialities}</div>
                    <div>Doctors: {hospital.doctors}</div>
                    <div>Surgeries: {hospital.surgeries}</div>
                    <div>Bed count: {hospital.bedCount}</div>
                </div>
            ))}
        </div>
    );
}

export default App;
