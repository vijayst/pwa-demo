import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [hospitals, setHospitals] = useState([]);
    const [activeId, setActiveId] = useState();
    const [hospitalData, setHospitalData] = useState({
        id: null,
        name: '',
        specialities: 0,
        doctors: 0,
        surgeries: 0,
        bedCount: 0,
    });
    const [message, setMessage] = useState();

    useEffect(() => {
        fetchHospitals();
    }, []);

    function fetchHospitals() {
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
                    const clearRequest = store.clear();
                    clearRequest.onsuccess = function () {
                        response.data.forEach((hospital) => {
                            store.add(hospital);
                        });
                    };
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
    }

    function handleEditClick(hospital) {
        setActiveId(hospital.id);
        setHospitalData(hospital);
    }

    function handleCancelClick() {
        setActiveId(null);
    }

    function handleDataChange(e, key) {
        setHospitalData({
            ...hospitalData,
            [key]: parseInt(e.target.value),
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        axios
            .post(`http://localhost:4000/hospital/${activeId}`, hospitalData)
            .then(() => {
                setMessage('Data saved successfully');
                setActiveId(null);
                fetchHospitals();
                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            })
            .catch(() => {
                setMessage('Data saved for syncing');
                setActiveId(null);
                setHospitals((hospitals) => {
                    const index = hospitals.findIndex(
                        (h) => h.id === hospitalData.id
                    );
                    if (index !== -1) {
                        const newHospitals = hospitals.slice();
                        newHospitals[index] = hospitalData;
                        return newHospitals;
                    }
                    return hospitals;
                });
                const dbOpenRequest = indexedDB.open('hospitalDB', 1);
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    const txn = db.transaction('hospitalStore', 'readwrite');
                    const store = txn.objectStore('hospitalStore');
                    store.put(hospitalData);
                };
                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            });
    }

    return (
        <div className="app">
            <h1>Hospitals</h1>
            {hospitals.map((hospital) =>
                activeId === hospital.id ? (
                    <form
                        className="form"
                        key={hospital.id}
                        onSubmit={handleSubmit}
                    >
                        <h3>{hospital.name}</h3>
                        <div className="form__control">
                            <label>Specialities</label>
                            <input
                                type="number"
                                value={hospitalData.specialities}
                                onChange={(e) =>
                                    handleDataChange(e, 'specialities')
                                }
                            />
                        </div>
                        <div className="form__control">
                            <label>Doctors</label>
                            <input
                                type="number"
                                value={hospitalData.doctors}
                                onChange={(e) => handleDataChange(e, 'doctors')}
                            />
                        </div>
                        <div className="form__control">
                            <label>Surgeries</label>
                            <input
                                type="number"
                                value={hospitalData.surgeries}
                                onChange={(e) =>
                                    handleDataChange(e, 'surgeries')
                                }
                            />
                        </div>
                        <div className="form__control">
                            <label>Bed count</label>
                            <input
                                type="number"
                                value={hospitalData.bedCount}
                                onChange={(e) =>
                                    handleDataChange(e, 'bedCount')
                                }
                            />
                        </div>
                        <div className="buttons">
                            <button
                                type="button"
                                className="button"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </button>
                            <button className="button">Update</button>
                        </div>
                    </form>
                ) : (
                    <div key={hospital.id} className="card">
                        <h3>{hospital.name}</h3>
                        <div>Specialities: {hospital.specialities}</div>
                        <div>Doctors: {hospital.doctors}</div>
                        <div>Surgeries: {hospital.surgeries}</div>
                        <div>Bed count: {hospital.bedCount}</div>
                        <div className="buttons">
                            <button
                                className="button"
                                onClick={() => handleEditClick(hospital)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )
            )}
            {message && <div className="message">{message}</div>}
        </div>
    );
}

export default App;
