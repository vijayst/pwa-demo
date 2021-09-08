import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [hospitals, setHospitals] = useState([]);
    const [activeId, setActiveId] = useState();
    const [hospitalData, setHospitalData] = useState({
        specialities: 0,
        doctors: 0,
        surgeries: 0,
        bedCount: 0,
    });

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
    }, []);

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
        console.log('submitting');
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
        </div>
    );
}

export default App;
