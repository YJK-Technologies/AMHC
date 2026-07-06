import React, { useState, useEffect } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "ag-grid-enterprise";
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUserPlus, faListUl, faMagnifyingGlass, faUserMinus, faPrint, faEnvelope, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import { AgGridReact } from 'ag-grid-react';
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showConfirmationToast } from './ToastConfirmation';
import { nanoid } from "nanoid";
const config = require('../ApiConfig');


const Report = () => {

  const navigate = useNavigate();
  const [rowData, setRowData] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [SIDNo, setSIDNo] = useState("");
  const [Plan, setPlan] = useState("");
  const [checkupDate, setCheckupDate] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [gridApi, setGridApi] = useState(null);
  const [selectGender, setSelectGender] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [Gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [Genderdrop, setGenderdrop] = useState([]);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedSIDNo, setSelectedSIDNo] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedPhoneNo, setSelectedPhoneNo] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMsgStatus, setSelectMsgStatus] = useState('');
  const [selectedplandrop, setSelectplandrop] = useState('');
  const [msgStatus, setMsgStatus] = useState("");
  const [plandropStatus, setplandropStatus] = useState("");
  const [msgDrop, setMsgDrop] = useState([]);
  const [plandrop, setplandrop] = useState([]);
  const [SIDdrop, setSIDdrop] = useState([]);
  const [SelectSIDdrop, setSelectSIDdrop] = useState('');
  const [SIDdropStatus, setSIDdropStatus] = useState('');
  const [selectedplan, setselectedplan] = useState('');
  const [isSending, setIsSending] = useState(false);


  const permissions = JSON.parse(sessionStorage.getItem('permissions')) || {};
  const uploadedPatientPermission = permissions
    .filter(permission => permission.screen_type === 'UploadedPatient')
    .map(permission => permission.permission_type.toLowerCase());


  const selectedUserCode = sessionStorage.getItem('selectedUserCode');

  const onGridReady = (params) => {
    setGridApi(params.api);
  };
  const currentLength = rowData.length;

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerName: 'S.No',
      field: 'serialNumber',
      valueGetter: (params) => {
        return params.node.rowIndex + 1;
      },
      maxWidth: 100,
      sortable: false,
      editable: false,
    },
    {
      headerName: 'SID No',
      field: 'SID_no',
      // maxWidth: 100,
      sortable: false,
    },

    // {
    //   headerName: '',
    //   field: 'delete',
    //   editable: false,
    //   maxWidth: 40,
    //   tooltipValueGetter: () => "Delete",
    //   // onCellClicked: handleDelete,
    //   cellRenderer: () => (
    //     <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', marginRight: "12px" }} />
    //   ),
    //   cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
    //   sortable: false
    // },
    {
      headerName: 'Date',
      field: 'checkup_date',
      editable: true,
      // minWidth: 120,
      // maxWidth: 120,
      filter: true,
      sortable: false,
      valueFormatter: (params) => {
        const value = params.value;
        if (!value) return '';

        const isDateFormatted = /^\d{2}-\d{2}-\d{4}$/.test(value);
        if (isDateFormatted) {
          return value;
        }

        const date = new Date(value);
        if (isNaN(date)) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}-${month}-${year}`;
      }
    },
    {
      headerName: 'Patient Name',
      field: 'patient_name',
      editable: true,
      // minWidth: 210,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Phone No',
      field: 'phone_no',
      editable: true,
      // minWidth: 150,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Gender',
      field: 'gender',
      editable: true,
      // minWidth: 110,
      filter: true,
      sortable: false
    },
    {
      headerName: 'Msg Prefrence',
      field: 'msg_preference',
      editable: true,
      // maxWidth: 410,
      // minWidth: 410,
      filter: true,
      sortable: false,
      hide: true
    },
    {
      headerName: 'Plan',
      field: 'plans',
      editable: true,
      // maxWidth: 150,
      // minWidth: 150,

    },
    {
      headerName: 'Sent SMS',
      field: 'msg_status',
      editable: true,
      // maxWidth: 200,
      // minWidth: 200,
      filter: true,
      sortable: false,
    },
    {
      headerName: 'Keyfield',
      field: 'Keyfield',
      editable: true,
      // maxWidth: 410,
      // minWidth: 410,
      filter: true,
      sortable: false,
      hide: true
    },
  ];

  const handleNavigate = () => {
    navigate("/UploadPatient");
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getpatientdata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          SID_no: SIDdropStatus,
          plans: plandropStatus,
          patient_name: patientName,
          checkup_date: checkupDate,
          gender: Gender,
          phone_no: phoneNo,
          msg_status: msgStatus,

        })
      });
      if (response.ok) {
        const searchData = await response.json();
        setRowData(searchData);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        console.log("Data not found");
        toast.warning("Data not found")
        setRowData([]);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || "Failed to get data");
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error("Error while Deleting data:", error);
      toast.error('An error occurred while fetching data: ' + error.message);
    }
  };

  const handleDelete = async () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to delete");
      return;
    }
    const SID_nos = selectedRows.map((row) => row.SID_no);
    showConfirmationToast(
      "Are you sure you want to Delete the data in the selected rows?",
      async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/deletePatientData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Modified-By": selectedUserCode,
            },
            body: JSON.stringify({
              SID_nos: SID_nos,
            }),
          });
          if (response.ok) {
            console.log("Rows deleted successfully:", SID_nos);
            // handleSearch();
            toast.success("Rows deleted successfully")
          } else {
            const errorResponse = await response.json();
            toast.warning(errorResponse.message || "Failed to delete data");
            console.error(errorResponse.details || errorResponse.message);
          }
        } catch (error) {
          console.error("Error deleting rows:", error);
          toast.error('Error inserting data: ' + error.message);
        }
      },
      () => {
        toast.info("Data Delete cancelled.");
      }
    );
  };

  const generateReport = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one row to generate a report.");
      return;
    }

    const reportData = selectedRows.map((row) => {
      const formattedDate = new Date(row.checkup_date).toISOString().split("T")[0];
      return {
        "SID No": row.SID_no,
        "Date": formattedDate,
        "Patient Name": row.patient_name,
        "Phone No": row.phone_no,
        "Gender": row.gender,
        "Plan": row.plans
      };
    });

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write("<html><head><title>Master Health Checkup</title>");
    reportWindow.document.write("<style>");
    reportWindow.document.write(`
      body {
          font-family: Arial, sans-serif;
          margin: 20px;
      }
      h1 {
          color: maroon;
          text-align: center;
          font-size: 24px;
          margin-bottom: 30px;
          text-decoration: underline;
      }
      table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
      }
      th, td {
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
          vertical-align: top;
      }
      th {
          background-color: maroon;
          color: white;
          font-weight: bold;
      }
      td {
          background-color: #fdd9b5;
      }
      tr:nth-child(even) td {
          background-color: #fff0e1;
      }
      .report-button {
          display: block;
          width: 150px;
          margin: 20px auto;
          padding: 10px;
          background-color: maroon;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
          text-align: center;
          border-radius: 5px;
      }
      .report-button:hover {
          background-color: darkred;
      }
      @media print {
          .report-button {
              display: none;
          }
          body {
              margin: 0;
              padding: 0;
          }
      }
    `);
    reportWindow.document.write("</style></head><body>");
    reportWindow.document.write("<h1><u>Master Health Checkup</u></h1>");

    // Create table with headers
    reportWindow.document.write("<table><thead><tr>");
    Object.keys(reportData[0]).forEach((key) => {
      reportWindow.document.write(`<th>${key}</th>`);
    });
    reportWindow.document.write("</tr></thead><tbody>");

    // Populate the rows
    reportData.forEach((row) => {
      reportWindow.document.write("<tr>");
      Object.values(row).forEach((value) => {
        reportWindow.document.write(`<td>${value}</td>`);
      });
      reportWindow.document.write("</tr>");
    });

    reportWindow.document.write("</tbody></table>");

    reportWindow.document.write(
      '<button class="report-button" onclick="window.print()">Print</button>'
    );
    reportWindow.document.write("</body></html>");
    reportWindow.document.close();
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      const date = event.data.checkup_date;
      const phoneNo = event.data.phone_no;
      const patientName = event.data.patient_name;
      const gender = event.data.gender;
      const SIDNo = event.data.SID_no;
      const plan = event.data.plans;
      setSelectedPatientName(patientName);
      setSelectGender(gender);
      setSelectedPhoneNo(phoneNo);
      setSelectedDate(date);
      setSelectedSIDNo(SIDNo);
      setSelectedPlan(plan);
    }
  };

  // const handleGenerateMessage = () => {
  //   if (selectedPatientName && selectedPhoneNo) {
  //     const title = selectGender && selectGender.toLowerCase() === 'male' ? 'Mr.' : 'Miss.';
  //     const fullPatientName = `${title} ${selectedPatientName}`;

  //     const patientData = JSON.stringify({ SIDNo: selectedSIDNo, plan: selectedPlan, Date: selectedDate, gender:selectGender });
  //     const encodedData = btoa(patientData);

  //     const feedbackLink = `/Feedback?id=${encodeURIComponent(encodedData)}`;

  //     const message = `
  //           Dear Patient,

  //           Thank you for choosing our hospital for your master health checkup. We appreciate your trust in us and hope your experience was satisfactory.
  //           We would love to hear your feedback

  //           <a href="${feedbackLink}" style="color: blue; text-decoration: underline;">Your valuable feedback</a>

  //           Your feedback is invaluable in helping us enhance our services.
  //           Thank you again for visiting us!
  //           Best regards,
  //           Advance Master Health Checkup Team
  //       `;

  //     const newTab = window.open("", "_blank");
  //     newTab.document.write(`
  //           <pre style="font-family: Arial, sans-serif; font-size: 16px; padding: 20px;">${message}</pre>
  //       `);
  //   } else {
  //     alert("Please select a patient before generating a message.");
  //   }
  // };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/gender`)
      .then((data) => data.json())
      .then((val) => setGenderdrop(val));
  }, []);

  const filteredOptionGender = Genderdrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeGender = (selectedGender) => {
    setSelectedGender(selectedGender);
    setGender(selectedGender ? selectedGender.value : "");
    setError(false);
  };

  const reloadGridData = () => {
    window.location.reload();
  };

  const handleGenerateMessage = async () => {
    if (isSending) return;

    setIsSending(true);

    try {
      const selectedRows = gridApi.getSelectedRows();

      if (selectedRows.length === 0) {
        toast.warning("Please select at least one row.");
        return;
      }

      const uniqueDates = [...new Set(selectedRows.map((row) => row.checkup_date))];
      if (uniqueDates.length > 1) {
        toast.warning("Selected rows must have the same date.");
        return;
      }

      for (const row of selectedRows) {
        const patientData = JSON.stringify({
          SIDNo: row.SID_no
        });

        const encodedData = btoa(patientData);

        if (!row.phone_no) {
          toast.warning(`No phone number found for patient: ${row.patient_name}`);
          continue;
        }

        await handleSMS(row.phone_no, encodedData, row.SID_no);
      }

    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setIsSending(false);
    }
  };

  // const handleSMS = async (phoneNumber, encodedData) => {
  //   try {
  //     const response = await fetch(`${config.apiBaseUrl}/send`, {
  //       method: 'POST', // Use POST method to send data
  //       headers: {
  //         'Content-Type': 'application/json', // Set the content type to JSON
  //       },
  //       body: JSON.stringify({
  //         phoneNumbers: [phoneNumber], // Send phone number as an array
  //         textMessage: encodedData,    // Send the encoded message
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       toast.error(errorData.error || "Error sending SMS");
  //       return;
  //     }

  //     const responseData = await response.json();
  //     toast.success(responseData.message);
  //   } catch (error) {
  //     toast.error("Failed to send SMS");
  //   }
  // };

  const handleSMS = async (phoneNumber, encodedData, SID_no) => {
    //  await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      const feedbackLink = `https://amhc.yjktechnologies.com:3000/Feedback?data=${encodedData}`;

      const response = await fetch(`${config.apiBaseUrl}/SMS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          dynamicURL: feedbackLink,
          SID_no
        }),
      });

      if (response.ok) {
        toast.success(`SMS sent successfully to ${phoneNumber}`);
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

  const handleSendSms = async (SIDNo) => {
    const SentSms = [
      {
        SID_no: SIDNo
      },
    ];

    try {
      const response = await fetch(`${config.apiBaseUrl}/SentSms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          SentSms,
        }),
      });

      if (response.ok) {
        console.log(`SMS data logged successfully for ${patientName}`);
      } else {
        const errorResponse = await response.json();
        toast.warning(errorResponse.message || `Failed to log SMS for ${patientName}`);
        console.error(errorResponse.details || errorResponse.message);
      }
    } catch (error) {
      console.error(`Error logging SMS for ${patientName}:, error`);
      toast.error(`Error logging SMS for ${patientName}: ${error.message}`);
    }
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getMsgStatus`)
      .then((data) => data.json())
      .then((val) => setMsgDrop(val));
  }, []);

  const filteredOptionMsgStatus = msgDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handleChangeMsgStatus = (selectedStatus) => {
    setSelectMsgStatus(selectedStatus);
    setMsgStatus(selectedStatus ? selectedStatus.value : '');
    setError(false);
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getPlan`)
      .then((data) => data.json())
      .then((val) => setplandrop(val));
  }, []);

  const filteredOptionPlanStatus = plandrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const dropPlan = (plandropStatus) => {
    setSelectplandrop(plandropStatus);
    setplandropStatus(plandropStatus ? plandropStatus.value : '');
    setError(false);
  };

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getSID`)
      .then((data) => data.json())
      .then((val) => setSIDdrop(val));
  }, []);

  const filteredOptionSIDStatus = SIDdrop.map((option) => ({
    value: option.SID_no,
    label: option.SID_no,
  }));

  const SIDDropdown = (SelectSIDdrop) => {
    setSelectSIDdrop(SelectSIDdrop);
    setSIDdropStatus(SelectSIDdrop ? SelectSIDdrop.value : '');
    setError(false);
  };


  return (
    <div class="main-content">
      <ToastContainer position="top-right" className="toast-design" theme="colored" />
      <div className="shadow-lg p-0 bg-body-tertiary rounded-3 mb-2 mt-2 ">
        <div className="d-flex justify-content-between">
          <div className="d-flex justify-content-start">
            <h1 className="me-5 ms-4 fs-2 mt-1">Uploaded Patient</h1>
          </div>
          <div className="button-container">
            <div className="dropdown d-md-none rounded-end">
              <div
                className="btn btn-primary p-2 rounded-0 dropdown-toggle"
                type="button"
                onClick={toggleDropdown}
              >
                <FontAwesomeIcon icon={faListUl} />
              </div>
              {isOpen && (
                <ul className="dropdown-menu show">
                  {['add', 'all permission'].some(permission => uploadedPatientPermission.includes(permission)) && (
                    <li className="dropdown-item" onClick={handleNavigate}>
                      <FontAwesomeIcon icon={faUserPlus} style={{ color: "black" }} />
                    </li>
                  )}
                  {['delete', 'all permission'].some(permission => uploadedPatientPermission.includes(permission)) && (
                    <li className="dropdown-item" onClick={handleDelete}>
                      <FontAwesomeIcon icon={faUserMinus} style={{ color: "red" }} />
                    </li>
                  )}
                  {['all permission', 'view'].some(permission => uploadedPatientPermission.includes(permission)) && (
                    <li className="dropdown-item" onClick={generateReport}>
                      <FontAwesomeIcon icon={faPrint} style={{ color: " green" }} />
                    </li>
                  )}
                  <li className="dropdown-item" onClick={handleGenerateMessage}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: "black" }} />
                  </li>
                </ul>
              )}
            </div>
            <div className="d-none d-md-flex  justify-content-end">
              {['add', 'all permission'].some(permission => uploadedPatientPermission.includes(permission)) && (
                <savebutton title='Add' className="purbut" onClick={handleNavigate}>
                  <FontAwesomeIcon icon={faUserPlus} />
                </savebutton>
              )}
              {['delete', 'all permission'].some(permission => uploadedPatientPermission.includes(permission)) && (
                <delbutton title='Delete' className="purbut" onClick={handleDelete}>
                  <FontAwesomeIcon icon={faUserMinus} />
                </delbutton>
              )}
              {['all permission', 'view'].some(permission => uploadedPatientPermission.includes(permission)) && (
                <printbutton title="Generate Report" className="purbut" onClick={generateReport}>
                  <FontAwesomeIcon icon={faPrint} />
                </printbutton>
              )}
              <printbutton
                title="Send SMS"
                className="purbut"
                onClick={handleGenerateMessage}
                disabled={isSending}
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </printbutton>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-lg p-1 bg-body-tertiary rounded-3 mb-2 mt-2">
        <div className="row ms-4 me-4 mt-3">
          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="locno" class="exp-form-labels">
                Date
              </label>
              <input
                id="date"
                className="exp-input-field form-control"
                type="date"
                placeholder=""
                autoComplete='off'
                required
                value={checkupDate}
                onChange={(e) => setCheckupDate(e.target.value)}
                title="Please fill the checkup date here"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="state" class="exp-form-labels">
                SID No
              </label>
              <Select
                id="Gender"
                value={SelectSIDdrop}
                onChange={SIDDropdown}
                options={filteredOptionSIDStatus}
                className="exp-input-field"
                placeholder=""
                required
                data-tip="Please select a payment type"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="lname" class="exp-form-labels">
                Patient Name
              </label>
              <input
                id="lname"
                className="exp-input-field form-control"
                type="text"
                placeholder=""
                autoComplete='off'
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                title="Please fill the patient name here"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="Detail" class="exp-form-labels">
                Phone No
              </label>
              <input
                id="city"
                className="exp-input-field form-control"
                type="text"
                placeholder=""
                required
                autoComplete='off'
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                title="Please fill the phone no here"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="state" class="exp-form-labels">
                Gender
              </label>
              <Select
                id="Gender"
                value={selectedGender}
                onChange={handleChangeGender}
                options={filteredOptionGender}
                className="exp-input-field"
                placeholder=""
                required
                data-tip="Please select a payment type"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="state" class="exp-form-labels">
                Plan
              </label>
              <Select
                id="Gender"
                value={selectedplandrop}
                onChange={dropPlan}
                options={filteredOptionPlanStatus}
                className="exp-input-field"
                placeholder=""
                required
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="col-md-2 form-group mb-2">
            <div class="exp-form-floating">
              <label for="state" class="exp-form-labels">
                Sent SMS
              </label>
              <Select
                id="Gender"
                value={selectedMsgStatus}
                onChange={handleChangeMsgStatus}
                options={filteredOptionMsgStatus}
                className="exp-input-field"
                placeholder=""
                required
                data-tip="Please select a payment type"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div class="col-md-2 form-group mt-4 justify-content-end mb-3">
            <button className="p-2 me-3 ps-3 pe-3" onClick={handleSearch} title="Search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
            <button className="p-2 me-3 ps-3 pe-3" onClick={reloadGridData} title="Refresh">
              <FontAwesomeIcon icon={faArrowRotateRight} />
            </button>
          </div>
        </div>
      </div>
      <div className="shadow-lg p-4 bg-body-tertiary rounded-3 mb-2 mt-2">
        <div class="d-flex justify-content-between">
          <div align="left" class="d-flex justify-content-start">
            <purButton
              type="button">
              Patient
            </purButton>
          </div>
        </div>
        <div className="ag-theme-alpine" style={{ height: 437, width: "100%" }}>
          <AgGridReact
            onGridReady={onGridReady}
            columnDefs={columnDefs}
            rowData={rowData}
            rowSelection="multiple"
            pagination={true}
            paginationAutoPageSize={true}
            onRowSelected={onRowSelected}
          />
        </div>
      </div>
    </div>
  );
}

export default Report