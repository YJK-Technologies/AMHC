import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import '../Css/AddReport.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFloppyDisk, faFileExcel, faXmark, faListUl } from '@fortawesome/free-solid-svg-icons'; // Import icons
import { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router-dom';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import '../Css/Report.css'
const config = require('../ApiConfig');

const AddReport = () => {

    const navigate = useNavigate();
    const [rowData, setRowData] = useState([]);

    const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
    const uploadPatientPermission = permissions
        .filter(permission => permission.screen_type === 'UploadPatient')
        .map(permission => permission.permission_type.toLowerCase());

    const selectedUserCode = sessionStorage.getItem('selectedUserCode');

    const fileInputRef = useRef(null);

    const handleFileUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };


    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             try {
    //                 const data = new Uint8Array(e.target.result);
    //                 const workbook = XLSX.read(data, { type: 'array' });
    //                 const sheetName = workbook.SheetNames[0];
    //                 const worksheet = workbook.Sheets[sheetName];

    //                 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //                 const [headers, ...rows] = jsonData;

    //                 if (!headers) {
    //                     toast.warning("Invalid File: Missing headers.");
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 const normalizedHeaders = headers.map(header => header?.toString().toLowerCase());
    //                 const expectedHeaders = ["Date", "Patient Name", "Phone No", "Gender"];
    //                 const expectedHeadersLowerCase = expectedHeaders.map(header => header.toLowerCase());

    //                 const missingHeaders = expectedHeadersLowerCase.filter(
    //                     header => !normalizedHeaders.includes(header)
    //                 );

    //                 if (missingHeaders.length > 0) {
    //                     toast.warning(`Invalid File: Missing headers: ${missingHeaders.join(', ')}`);
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 const headerIndexMap = {};
    //                 expectedHeaders.forEach((header, i) => {
    //                     headerIndexMap[header] = normalizedHeaders.indexOf(expectedHeadersLowerCase[i]);
    //                 });

    //                 const excelDateToJSDate = (excelDate) => {
    //                     const date = new Date((excelDate - 25569) * 86400 * 1000);
    //                     const year = date.getFullYear();
    //                     const month = String(date.getMonth() + 1).padStart(2, '0');
    //                     const day = String(date.getDate()).padStart(2, '0');
    //                     return `${year}-${month}-${day}`;
    //                 };

    //                 const currentLength = rowData.length;

    //                 const newData = rows.map((row, index) => ({
    //                     serialNumber: currentLength + index + 1,
    //                     date: typeof row[headerIndexMap["Date"]] === 'number'
    //                         ? excelDateToJSDate(row[headerIndexMap["Date"]])
    //                         : row[headerIndexMap["Date"]] || '',
    //                     patientName: row[headerIndexMap["Patient Name"]] || '',
    //                     phoneNO: row[headerIndexMap["Phone No"]] || '',
    //                     gender: row[headerIndexMap["Gender"]] || ''
    //                 }));

    //                 setRowData(prevData => [...prevData, ...newData]);

    //             } catch (error) {
    //                 console.error("Error processing file:", error);
    //                 toast.error("An error occurred while processing the file. Please check the file format and try again.");
    //             } finally {
    //                 resetFileInput(event.target);
    //             }
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };


    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             try {
    //                 const data = new Uint8Array(e.target.result);
    //                 const workbook = XLSX.read(data, { type: 'array' });
    //                 const sheetName = workbook.SheetNames[0];
    //                 const worksheet = workbook.Sheets[sheetName];

    //                 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //                 const [headers, ...rows] = jsonData;

    //                 if (!headers) {
    //                     toast.warning("Invalid File: Missing headers.");
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 const normalizedHeaders = headers.map(header => header?.toString().toLowerCase());
    //                 const expectedHeaders = ["Date", "Patient Name", "Phone No", "Gender"];
    //                 const expectedHeadersLowerCase = expectedHeaders.map(header => header.toLowerCase());

    //                 const missingHeaders = expectedHeadersLowerCase.filter(
    //                     header => !normalizedHeaders.includes(header)
    //                 );

    //                 if (missingHeaders.length > 0) {
    //                     toast.warning(`Invalid File: Missing headers: ${missingHeaders.join(', ')}`);
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 const headerIndexMap = {};
    //                 expectedHeaders.forEach((header, i) => {
    //                     headerIndexMap[header] = normalizedHeaders.indexOf(expectedHeadersLowerCase[i]);
    //                 });

    //                 const excelDateToJSDate = (excelDate) => {
    //                     const date = new Date((excelDate - 25569) * 86400 * 1000);
    //                     const year = date.getFullYear();
    //                     const month = String(date.getMonth() + 1).padStart(2, '0');
    //                     const day = String(date.getDate()).padStart(2, '0');
    //                     return `${year}-${month}-${day}`;
    //                 };

    //                 const currentLength = rowData.length;

    //                 const newData = rows.map((row, index) => ({
    //                     serialNumber: currentLength + index + 1,
    //                     date: typeof row[headerIndexMap["Date"]] === 'number'
    //                         ? excelDateToJSDate(row[headerIndexMap["Date"]])
    //                         : row[headerIndexMap["Date"]] || '',
    //                     patientName: row[headerIndexMap["Patient Name"]] || '',
    //                     phoneNO: row[headerIndexMap["Phone No"]] || '',
    //                     gender: row[headerIndexMap["Gender"]] || ''
    //                 }));

    //                 // Check if all dates are the same
    //                 const uniqueDates = [...new Set(newData.map(item => item.date).filter(date => date))];
    //                 if (uniqueDates.length > 1) {
    //                     toast.warning(`Invalid File: All dates must be the same. Found dates: ${uniqueDates.join(', ')}`);
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 setRowData(prevData => [...prevData, ...newData]);

    //             } catch (error) {
    //                 console.error("Error processing file:", error);
    //                 toast.error("An error occurred while processing the file. Please check the file format and try again.");
    //             } finally {
    //                 resetFileInput(event.target);
    //             }
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };

    //patient name and gender validatioon code
    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             try {
    //                 const data = new Uint8Array(e.target.result);
    //                 const workbook = XLSX.read(data, { type: 'array' });
    //                 const sheetName = workbook.SheetNames[0];
    //                 const worksheet = workbook.Sheets[sheetName];

    //                 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //                 const [headers, ...rows] = jsonData;

    //                 if (!headers) {
    //                     toast.warning("Invalid File: Missing headers.");
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 const normalizedHeaders = headers.map(header => header?.toString().toLowerCase());
    //                 const expectedHeaders = ["Date", "Patient Name", "Phone No", "Gender"];
    //                 const expectedHeadersLowerCase = expectedHeaders.map(header => header.toLowerCase());

    //                 const missingHeaders = expectedHeadersLowerCase.filter(
    //                     header => !normalizedHeaders.includes(header)
    //                 );

    //                 if (missingHeaders.length > 0) {
    //                     toast.warning(`Invalid File: Missing headers: ${missingHeaders.join(', ')}`);
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 const headerIndexMap = {};
    //                 expectedHeaders.forEach((header, i) => {
    //                     headerIndexMap[header] = normalizedHeaders.indexOf(expectedHeadersLowerCase[i]);
    //                 });

    //                 const excelDateToJSDate = (excelDate) => {
    //                     const date = new Date((excelDate - 25569) * 86400 * 1000);
    //                     const year = date.getFullYear();
    //                     const month = String(date.getMonth() + 1).padStart(2, '0');
    //                     const day = String(date.getDate()).padStart(2, '0');
    //                     return `${year}-${month}-${day}`;
    //                 };

    //                 const currentLength = rowData.length;

    //                 const newData = rows.map((row, index) => {
    //                     const patientName = row[headerIndexMap["Patient Name"]] || '';
    //                     const gender = row[headerIndexMap["Gender"]] || '';

    //                     // Validations for patientName
    //                     const nameRegex = /^[a-zA-Z\s]+$/; // Only allows alphabets and spaces
    //                     if (!nameRegex.test(patientName)) {
    //                         toast.warning(
    //                             `Invalid patient name in row ${index + 1}. Only alphabets and spaces are allowed.`
    //                         );
    //                         throw new Error("Invalid patient name");
    //                     }

    //                     // Validations for gender
    //                     const genderRegex = /^[a-zA-Z]+$/; // Only allows alphabets
    //                     if (!genderRegex.test(gender)) {
    //                         toast.warning(
    //                             `Invalid gender in row ${index + 1}. Only alphabets are allowed.`
    //                         );
    //                         throw new Error("Invalid gender");
    //                     }

    //                     return {
    //                         serialNumber: currentLength + index + 1,
    //                         date: typeof row[headerIndexMap["Date"]] === 'number'
    //                             ? excelDateToJSDate(row[headerIndexMap["Date"]])
    //                             : row[headerIndexMap["Date"]] || '',
    //                         patientName,
    //                         phoneNO: row[headerIndexMap["Phone No"]] || '',
    //                         gender,
    //                     };
    //                 });

    //                 // Check if all dates are the same
    //                 const uniqueDates = [...new Set(newData.map(item => item.date).filter(date => date))];
    //                 if (uniqueDates.length > 1) {
    //                     toast.warning(
    //                         `Invalid File: All dates must be the same. Found dates: ${uniqueDates.join(', ')}`
    //                     );
    //                     resetFileInput(event.target); // Reset input value
    //                     return;
    //                 }

    //                 setRowData(prevData => [...prevData, ...newData]);

    //             } catch (error) {
    //                 console.error("Error processing file:", error);
    //                 toast.error(
    //                     "An error occurred while processing the file. Please check the file format and try again."
    //                 );
    //             } finally {
    //                 resetFileInput(event.target);
    //             }
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             try {
    //                 const data = new Uint8Array(e.target.result);
    //                 const workbook = XLSX.read(data, { type: 'array' });
    //                 const sheetName = workbook.SheetNames[0];
    //                 const worksheet = workbook.Sheets[sheetName];

    //                 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //                 const [headers, ...rows] = jsonData;

    //                 if (!headers) {
    //                     toast.warning("Invalid File: Missing headers.");
    //                     resetFileInput(event.target);
    //                     return;
    //                 }

    //                 const normalizedHeaders = headers.map(header => header?.toString().toLowerCase());
    //                 const expectedHeaders = ["Date", "Patient Name", "Phone No", "Gender"];
    //                 const expectedHeadersLowerCase = expectedHeaders.map(header => header.toLowerCase());

    //                 const missingHeaders = expectedHeadersLowerCase.filter(
    //                     header => !normalizedHeaders.includes(header)
    //                 );

    //                 if (missingHeaders.length > 0) {
    //                     toast.warning(`Invalid File: Missing headers: ${missingHeaders.join(', ')}`);
    //                     resetFileInput(event.target); 
    //                     return;
    //                 }

    //                 const headerIndexMap = {};
    //                 expectedHeaders.forEach((header, i) => {
    //                     headerIndexMap[header] = normalizedHeaders.indexOf(expectedHeadersLowerCase[i]);
    //                 });

    //                 const excelDateToJSDate = (excelDate) => {
    //                     const date = new Date((excelDate - 25569) * 86400 * 1000);
    //                     const year = date.getFullYear();
    //                     const month = String(date.getMonth() + 1).padStart(2, '0');
    //                     const day = String(date.getDate()).padStart(2, '0');
    //                     return `${year}-${month}-${day}`;
    //                 };

    //                 const currentLength = rowData.length;

    //                 const newData = rows.map((row, index) => {
    //                     const patientName = row[headerIndexMap["Patient Name"]] || '';
    //                     const gender = row[headerIndexMap["Gender"]] || '';
    //                     const phoneNo = row[headerIndexMap["Phone No"]] || '';

    //                     const nameRegex = /^[a-zA-Z\s]+$/; 
    //                     if (!nameRegex.test(patientName)) {
    //                         toast.warning(
    //                             `Invalid patient name in row ${index + 1}: "${patientName}". Only alphabets and spaces are allowed.`
    //                         );
    //                         throw new Error("Invalid patient name");
    //                     }

    //                     const genderRegex = /^[a-zA-Z]+$/; 
    //                     if (!genderRegex.test(gender)) {
    //                         toast.warning(
    //                             `Invalid gender in row ${index + 1}: "${gender}". Only alphabets are allowed.`
    //                         );
    //                         throw new Error("Invalid gender");
    //                     }

    //                     const phoneRegex = /^[6-9]\d{9}$/;
    //                     if (!phoneRegex.test(phoneNo)) {
    //                         toast.warning(
    //                             `Invalid phone number in row ${index + 1}: Phone No: "${phoneNo}", Patient Name: "${patientName}".`
    //                         );
    //                         throw new Error("Invalid phone number");
    //                     }

    //                     return {
    //                         serialNumber: currentLength + index + 1,
    //                         date: typeof row[headerIndexMap["Date"]] === 'number'
    //                             ? excelDateToJSDate(row[headerIndexMap["Date"]])
    //                             : row[headerIndexMap["Date"]] || '',
    //                         patientName,
    //                         phoneNO: phoneNo,
    //                         gender,
    //                     };
    //                 });

    //                 const uniqueDates = [...new Set(newData.map(item => item.date).filter(date => date))];
    //                 if (uniqueDates.length > 1) {
    //                     toast.warning(
    //                         `Invalid File: All dates must be the same. Found dates: ${uniqueDates.join(', ')}`
    //                     );
    //                     resetFileInput(event.target); 
    //                     return;
    //                 }

    //                 setRowData(prevData => [...prevData, ...newData]);

    //             } catch (error) {
    //                 console.error("Error processing file:", error);
    //                 toast.error(
    //                     "An error occurred while processing the file. Please check the file format and try again."
    //                 );
    //             } finally {
    //                 resetFileInput(event.target);
    //             }
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onload = (e) => {
    //             try {
    //                 const data = new Uint8Array(e.target.result);
    //                 const workbook = XLSX.read(data, { type: 'array' });
    //                 const sheetName = workbook.SheetNames[0];
    //                 const worksheet = workbook.Sheets[sheetName];

    //                 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    //                 const [headers, ...rows] = jsonData;

    //                 if (!headers) {
    //                     toast.warning("Invalid File: Missing headers.");
    //                     resetFileInput(event.target);
    //                     return;
    //                 }

    //                 const normalizedHeaders = headers.map(header => header?.toString().toLowerCase());
    //                 const expectedHeaders = ["SID No","Date", "Patient Name", "Phone No", "Gender","Plan"];
    //                 const expectedHeadersLowerCase = expectedHeaders.map(header => header.toLowerCase());

    //                 const missingHeaders = expectedHeadersLowerCase.filter(
    //                     header => !normalizedHeaders.includes(header)
    //                 );

    //                 if (missingHeaders.length > 0) {
    //                     toast.warning(`Invalid File: Missing headers: ${missingHeaders.join(', ')}`);
    //                     resetFileInput(event.target);
    //                     return;
    //                 }

    //                 const headerIndexMap = {};
    //                 expectedHeaders.forEach((header, i) => {
    //                     headerIndexMap[header] = normalizedHeaders.indexOf(expectedHeadersLowerCase[i]);
    //                 });

    //                 const excelDateToJSDate = (excelDate) => {
    //                     const date = new Date((excelDate - 25569) * 86400 * 1000);
    //                     const year = date.getFullYear();
    //                     const month = String(date.getMonth() + 1).padStart(2, '0');
    //                     const day = String(date.getDate()).padStart(2, '0');
    //                     return `${year}-${month}-${day}`;
    //                 };

    //                 const currentLength = rowData.length;

    //                 const newData = rows
    //                     .filter(row => 
    //                         row.some(cell => cell && cell.toString().trim() !== '')
    //                     ) // Remove rows that are entirely empty or contain only spaces
    //                     .map((row, index) => {
    //                         const SIDNo = row[headerIndexMap["SID No"]] || '';
    //                         const patientName = row[headerIndexMap["Patient Name"]] || '';
    //                         const gender = row[headerIndexMap["Gender"]] || '';
    //                         const phoneNo = row[headerIndexMap["Phone No"]] || '';
    //                         const plan = row[headerIndexMap["Plan"]] || '';


    //                         const nameRegex = /^[a-zA-Z\s]+$/;
    //                         if (!nameRegex.test(patientName)) {
    //                             toast.warning(
    //                                 `Invalid patient name in row ${index + 1}: "${patientName}". Only alphabets and spaces are allowed.`
    //                             );
    //                             throw new Error("Invalid patient name");
    //                         }

    //                         const genderRegex = /^[a-zA-Z]+$/;
    //                         if (!genderRegex.test(gender)) {
    //                             toast.warning(
    //                                 `Invalid gender in row ${index + 1}: "${gender}". Only alphabets are allowed.`
    //                             );
    //                             throw new Error("Invalid gender");
    //                         }

    //                         const phoneRegex = /^[6-9]\d{9}$/;
    //                         if (!phoneRegex.test(phoneNo)) {
    //                             toast.warning(
    //                                 `Invalid phone number in row ${index + 1}: Phone No: "${phoneNo}", Patient Name: "${patientName}".`
    //                             );
    //                             throw new Error("Invalid phone number");
    //                         }

    //                         return {
    //                             serialNumber: currentLength + index + 1,
    //                             date: typeof row[headerIndexMap["Date"]] === 'number'
    //                                 ? excelDateToJSDate(row[headerIndexMap["Date"]])
    //                                 : row[headerIndexMap["Date"]] || '',
    //                             patientName,
    //                             phoneNO: phoneNo,
    //                             gender,
    //                         };
    //                     });

    //                 const uniqueDates = [...new Set(newData.map(item => item.date).filter(date => date))];
    //                 if (uniqueDates.length > 1) {
    //                     toast.warning(
    //                         `Invalid File: All dates must be the same. Found dates: ${uniqueDates.join(', ')}`
    //                     );
    //                     resetFileInput(event.target);
    //                     return;
    //                 }

    //                 setRowData(prevData => [...prevData, ...newData]);

    //             } catch (error) {
    //                 console.error("Error processing file:", error);
    //                 toast.error(
    //                     "An error occurred while processing the file. Please check the file format and try again."
    //                 );
    //             } finally {
    //                 resetFileInput(event.target);
    //             }
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const [headers, ...rows] = jsonData;

                    if (!headers) {
                        toast.warning("Invalid File: Missing headers.");
                        resetFileInput(event.target);
                        return;
                    }

                    const normalizedHeaders = headers.map(header => header?.toString().toLowerCase());
                    const expectedHeaders = ["SID No", "Date", "Patient Name", "Phone No", "Gender", "Plan"];
                    const expectedHeadersLowerCase = expectedHeaders.map(header => header.toLowerCase());

                    const missingHeaders = expectedHeadersLowerCase.filter(
                        header => !normalizedHeaders.includes(header)
                    );

                    if (missingHeaders.length > 0) {
                        toast.warning(`Invalid File: Missing headers: ${missingHeaders.join(', ')}`);
                        resetFileInput(event.target);
                        return;
                    }

                    const headerIndexMap = {};
                    expectedHeaders.forEach((header, i) => {
                        headerIndexMap[header] = normalizedHeaders.indexOf(expectedHeadersLowerCase[i]);
                    });

                    const excelDateToJSDate = (excelDate) => {
                        const date = new Date((excelDate - 25569) * 86400 * 1000);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    const currentLength = rowData.length;

                    const newData = rows
                        .filter(row =>
                            row.some(cell => cell && cell.toString().trim() !== '')
                        )
                        .map((row, index) => {
                            const SIDNo = row[headerIndexMap["SID No"]]?.toString().trim() || '';
                            const patientName = row[headerIndexMap["Patient Name"]]?.toString().trim() || '';
                            const gender = row[headerIndexMap["Gender"]]?.toString().trim() || '';
                            const phoneNo = row[headerIndexMap["Phone No"]]?.toString().trim() || '';
                            const plan = row[headerIndexMap["Plan"]]?.toString().trim() || '';
                            const dateCell = row[headerIndexMap["Date"]];

                            const sidRegex = /^\d+$/;
                            if (!sidRegex.test(SIDNo)) {
                                toast.warning(
                                    `Invalid SID No in row ${index + 1}: "${SIDNo}". SID No should be a numeric value.`
                                );
                                throw new Error("Invalid SID No");
                            }

                            const validPlans = ["gold", "platinum", "diamond", "platinum plus", "nt scan"];
                            if (!validPlans.includes(plan.toLowerCase())) {
                                toast.warning(
                                    `Invalid Plan in row ${index + 1}: "${plan}". Valid plans are: ${validPlans.join(', ')}.`
                                );
                                throw new Error("Invalid Plan");
                            }

                            const nameRegex = /^[a-zA-Z.\s]+$/;
                            if (!nameRegex.test(patientName)) {
                                toast.warning(
                                    `Invalid patient name in row ${index + 1}: "${patientName}". Only letters, spaces, and periods are allowed.`
                                );
                                throw new Error("Invalid patient name");
                            }

                            const genderRegex = /^[a-zA-Z\s]+$/;
                            if (!genderRegex.test(gender)) {
                                toast.warning(
                                    `Invalid gender in row ${index + 1}: "${gender}". Only alphabets and spaces are allowed.`
                                );
                                throw new Error("Invalid gender");
                            }

                            const validGenders = ["male", "female"];
                            if (!validGenders.includes(gender.toLowerCase())) {
                                toast.warning(
                                    `Invalid gender in row ${index + 1}: "${gender}". Valid genders are: ${validGenders.join(', ')}.`
                                );
                                throw new Error("Invalid gender");
                            }

                            return {
                                serialNumber: currentLength + index + 1,
                                date: typeof dateCell === 'number'
                                    ? excelDateToJSDate(dateCell)
                                    : dateCell?.toString().trim() || '',
                                patientName,
                                phoneNO: phoneNo,
                                gender,
                                plan,
                                SIDNo,
                            };
                        })

                    const uniqueDates = [...new Set(newData.map(item => item.date).filter(date => date))];
                    if (uniqueDates.length > 1) {
                        toast.warning(
                            `Invalid File: All dates must be the same. Found dates: ${uniqueDates.join(', ')}`
                        );
                        resetFileInput(event.target);
                        return;
                    }

                    setRowData(prevData => [...prevData, ...newData]);

                } catch (error) {
                    console.error("Error processing file:", error);
                } finally {
                    resetFileInput(event.target);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const resetFileInput = (inputElement) => {
        if (inputElement) {
            inputElement.value = "";
        }
    };

    const handleDelete = (params) => {
        const serialNumberToDelete = params.data.serialNumber;

        const updatedRowData = rowData.filter(row => row.serialNumber !== serialNumberToDelete);

        setRowData(updatedRowData);

        const updatedRowDataWithNewSerials = updatedRowData.map((row, index) => ({
            ...row,
            serialNumber: index + 1
        }));
        setRowData(updatedRowDataWithNewSerials);

    };

    const columnDefs = [
        {
            headerName: 'S.No',
            field: 'serialNumber',
            maxWidth: 70,
            sortable: false,
            editable: false,
        },
        {
            headerName: '',
            field: 'delete',
            editable: false,
            maxWidth: 40,
            tooltipValueGetter: () => "Delete",
            onCellClicked: handleDelete,
            cellRenderer: () => (
                <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', marginRight: "12px" }} />
            ),
            cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
            sortable: false
        },
        {
            headerName: 'SID No',
            field: 'SIDNo',
            maxWidth: 100,
            sortable: false,
        },
        {
            headerName: 'Date',
            field: 'date',
            editable: false,
            maxWidth: 150,
            minWidth: 150,
            filter: true,
            sortable: false,
            valueFormatter: (params) => {
                if (params.value) {
                    const date = new Date(params.value);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${day}-${month}-${year}`;
                }
                return '';
            }
        },
        {
            headerName: 'Patient Name',
            field: 'patientName',
            editable: false,
            maxWidth: 520,
            minWidth: 520,
            filter: true,
            sortable: false
        },
        {
            headerName: 'Phone No',
            field: 'phoneNO',
            editable: false,
            maxWidth: 150,
            minWidth: 150,
            filter: true,
            sortable: false
        },
        {
            headerName: 'Gender',
            field: 'gender',
            editable: false,
            maxWidth: 110,
            minWidth: 110,
            filter: true,
            sortable: false
        },

        {
            headerName: 'Plan',
            field: 'plan',
            editable: true,
            maxWidth: 150,
            minWidth: 150,

        },
    ];

    // CODE TO SAVE DOWNLOAD PATIENT 
    // const handleSaveClick = async () => {
    //     if (rowData.length === 0 || (rowData.length === 1 && !rowData[0].patientName)) {
    //         toast.warning("Please import the Excel file first.");
    //         return;
    //     }

    //     try {
    //         for (const row of rowData) {
    //             const Details = {
    //                 created_by: selectedUserCode,
    //                 patient_name: row.patientName,
    //                 checkup_date: row.date,
    //                 phone_no: row.phoneNO.toString(),
    //                 gender: row.gender,
    //             };

    //             const response = await fetch(`${config.apiBaseUrl}/AddReport`, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(Details),
    //             });

    //             if (response.ok) {
    //                 toast.success("Data inserted successfully");

    //                 const phoneNumberWithCountryCode = `91${row.phoneNO.toString()}`;

    //                 const smsDetails = {
    //                     phoneNumber: phoneNumberWithCountryCode,
    //                     textMessage: `Dear ${row.patientName}, We would love to hear your feedback. Your feedback is valuable in helping us enhance our services. Thank you again for visiting us!-AVVAJK`,
    //                 };

    //                 const smsResponse = await fetch(`${config.apiBaseUrl}/send`, {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify(smsDetails),
    //                 });

    //                 if (smsResponse.ok) {
    //                     // toast.success(`SMS sent to ${phoneNumberWithCountryCode}`);
    //                 } else {
    //                     const smsError = await smsResponse.json();
    //                     toast.warning(`Failed to send SMS to ${phoneNumberWithCountryCode}: ${smsError.message}`);
    //                 }
    //             } else {
    //                 const errorResponse = await response.json();
    //                 toast.warning(errorResponse.message || "Failed to insert sales data");
    //                 console.error(errorResponse.details || errorResponse.message);
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error inserting data:", error);
    //         toast.error('Error inserting data: ' + error.message);
    //     }
    // };


    const handleSaveClick = async () => {

        if (rowData.length === 0 || (rowData.length === 1 && !rowData[0].patientName)) {
            toast.warning("Please import the Excel file first.");
            return;
        }

        let isSuccess = true;
        let failedRows = [];

        try {
            for (const row of rowData) {

                const phoneNumber = row.phoneNO.toString()

                // const phoneNumber = row.phoneNO.toString().startsWith("91")
                // ? row.phoneNO.toString() 
                // : "91" + row.phoneNO.toString();

                if (phoneNumber.length < 10 || phoneNumber.length > 13 || !/^\d+$/.test(phoneNumber)) {
                    toast.warning(`Invalid phone number for patient: ${row.patientName}. Phone number must be between 10 and 13 digits.`);
                    failedRows.push(row.patientName);
                    continue;
                }

                const formattedDate = new Date(row.date).toISOString().split('T')[0];
                console.log(formattedDate);

                const Details = {
                    created_by: selectedUserCode,
                    patient_name: row.patientName,
                    checkup_date: formattedDate,
                    phone_no: phoneNumber,
                    gender: row.gender,
                    SID_no: row.SIDNo,
                    plans: row.plan

                };

                const response = await fetch(`${config.apiBaseUrl}/AddReport`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(Details),
                });

                if (response.ok) {
                    toast.success("Data inserted successfully!");
                } else {
                    const errorResponse = await response.json();
                    toast.warning(errorResponse.message || "Failed to delete data");
                    console.error(errorResponse.details || errorResponse.message);
                }
                // if (!response.ok) {
                //     const errorResponse = await response.json();
                //     toast.warning(errorResponse.message || "Failed to insert data");
                //     console.error(errorResponse.details || errorResponse.message);
                //     failedRows.push(row.patientName); 
                //     isSuccess = false;
                // }
            }

            // toast.success("Data inserted successfully!");

            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error("Error inserting data:", error);
            toast.error('Error inserting data: ' + error.message);
        }
    };

    // const handleSaveClick = async () => {
    //     if (rowData.length === 0 || (rowData.length === 1 && !rowData[0].patientName)) {
    //         toast.warning("Please import the Excel file first.");
    //         return;
    //     }

    //     let isSuccess = true;
    //     let failedRows = [];
    //     let successfulPhoneNumbers = [];

    //     try {
    //         for (const row of rowData) {

    //             const phoneNumber = row.phoneNO.toString().startsWith("91")
    //             ? row.phoneNO.toString() 
    //             : "91" + row.phoneNO.toString(); 

    //             if (phoneNumber.length < 10 || phoneNumber.length > 13 || !/^\d+$/.test(phoneNumber)) {
    //                 toast.warning(`Invalid phone number for patient: ${row.patientName}. Phone number must be between 10 and 13 digits.`);
    //                 failedRows.push(row.patientName);
    //                 continue;
    //             }

    //             const formattedDate = new Date(row.date).toISOString().split('T')[0];

    //             const Details = {
    //                 created_by: selectedUserCode,
    //                 patient_name: row.patientName,
    //                 checkup_date: formattedDate,
    //                 phone_no: phoneNumber,
    //                 gender: row.gender,
    //             };

    //             const response = await fetch(`${config.apiBaseUrl}/AddReport`, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(Details),
    //             });

    //             if (response.ok) {
    //                 successfulPhoneNumbers.push(phoneNumber);
    //             } else {
    //                 const errorResponse = await response.json();
    //                 toast.warning(errorResponse.message || "Failed to insert data");
    //                 console.error(errorResponse.details || errorResponse.message);
    //                 failedRows.push(row.patientName);
    //                 isSuccess = false;
    //             }
    //         }

    //         if (isSuccess) {
    //             toast.success("Data inserted successfully!");
    //         } else {
    //             toast.warning(`Some data failed to insert for the following patients: ${failedRows.join(', ')}`);
    //         }

    //         if (successfulPhoneNumbers.length > 0) {
    //             await handleSMS(successfulPhoneNumbers);
    //         }

    //         setTimeout(() => {
    //             window.location.reload();
    //         }, 2000);

    //     } catch (error) {
    //         console.error("Error inserting data:", error);
    //         toast.error('Error inserting data: ' + error.message);
    //     }
    // };

    const handleSMS = async (phoneNumbers) => {
        try {
            const textMessage = "Dear patientName, We would love to hear your feedback. Your feedback is valuable in helping us enhance our services. Thank you again for visiting us!-AVVAJK";

            const response = await fetch(`${config.apiBaseUrl}/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumbers,
                    textMessage,
                }),
            });

            if (response.ok) {
                toast.success("SMS sent successfully!");
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || "Failed to send SMS");
                console.error(errorResponse.details || errorResponse.message);
            }
        } catch (error) {
            console.error("Error sending SMS:", error);
            toast.error("Error sending SMS: " + error.message);
        }
    };

    const handleNavigate = () => {
        navigate(-1);
    };

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <ToastContainer position="top-right" className="toast-design" theme="colored" />
            <div className="shadow-lg p-0 bg-body-tertiary rounded-3 mb-2 mt-2 ">
                <div className="d-flex justify-content-between">
                    <div className="d-flex justify-content-start">
                        <h1 className="me-5 ms-4 fs-2 mt-1">Upload Patient</h1>
                    </div>
                    <div className="button-container">
                        <div className="dropdown d-md-none rounded-end">
                            <div
                                className="btn btn-primary p-2 rounded-end dropdown-toggle"
                                type="button"
                                onClick={toggleDropdown}
                            >
                                <FontAwesomeIcon icon={faListUl} />
                            </div>
                            {isOpen && (
                                <ul className="dropdown-menu show ">
                                    {['add', 'all permission'].some(permission => uploadPatientPermission.includes(permission)) && (
                                        <li className="dropdown-item">
                                            <FontAwesomeIcon icon={faFloppyDisk} style={{ color: "green" }} onClick={handleSaveClick} />
                                        </li>
                                    )}
                                    <li className="dropdown-item">
                                        <FontAwesomeIcon icon={faFileExcel} style={{ color: "black" }} onClick={handleFileUploadClick} />
                                    </li>
                                    <li className="dropdown-item">
                                        <FontAwesomeIcon icon={faXmark} style={{ color: "red" }} onClick={handleNavigate} />
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className="d-none d-md-flex justify-content-end me-3">
                            {['add', 'all permission'].some(permission => uploadPatientPermission.includes(permission)) && (
                                <savebutton className="purbut" title='Save' onClick={handleSaveClick}>
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                </savebutton>
                            )}
                            <printbutton className="purbut" title='Upload Excel' onClick={handleFileUploadClick}>
                                <FontAwesomeIcon icon={faFileExcel} />
                            </printbutton>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                            <button onClick={handleNavigate} className="btn btn-danger rounded-end h-70 fs-5" required title="Close">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="shadow-lg p-4 bg-body-tertiary rounded-3 mb-2 mt-2 ">
                <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={rowData}
                    />
                </div>
            </div>
        </div>
    );
}

export default AddReport;
