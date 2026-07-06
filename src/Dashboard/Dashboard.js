import React, { useState, useEffect, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import Select from "react-select";
import styles from './Animatedbg.scss';
import GaugeChart from 'react-gauge-chart';
import './dashboard.css';
import { useNavigate } from "react-router-dom";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Swal from 'sweetalert2';
import Patient from './patient.jpg'
import star from './star.png'
import Department from './Department.jpg'
import poor from "./Poo4.png"
// import Good from './smile.png'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlay, faPause, faArrowRotateRight, faFileExcel, faPrint } from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

ChartJS.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Tooltip, Legend, ChartDataLabels);
const config = require('../ApiConfig');

const Dashboard = ({ data }) => {
  const [rowData, setRowData] = useState([]);
  const [rowDataRemarks, setRowDataRemarks] = useState([]);
  const [startdate, setstartdate] = useState("");
  const [enddate, setenddate] = useState("");
  const [remarksStartDate, setRemarksStartDate] = useState("");
  const [remarksEndDate, setRemarksEndDate] = useState("");
  const [chartStartDate, setChartStartDate] = useState("");
  const [patientStartDate, setPatientStartDate] = useState("");
  const [chartEndDate, setChartEndDate] = useState("");
  const [patientEndDate, setPatientEndDate] = useState("");
  const [verdict, setVerdict] = useState(0);
  const [selecteddpt, setselecteddpt] = useState("");
  const navigate = useNavigate();
  const [Date, setdate] = useState("");
  const [patientDate, setpatientDate] = useState("");
  const [RemarksDate, setRemarksDate] = useState([]);
  const [patientDrop, setPatientDrop] = useState([]);
  const [remarksDrop, setRemarksDrop] = useState([]);
  const [Selectremarks, setSelectremarks] = useState([]);
  const [chartTimeRange, setChartTimeRange] = useState("");
  const [Dptdrop, setDptDrop] = useState([]);
  const [datedrop, setdatedrop] = useState([]);
  const [RemarksDatedrop, setRemarksDatedrop] = useState([]);
  const [chartDrop, setChartDrop] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [patientDateRange, setPatientDateRange] = useState("");
  const [remarksdateRange, setRemarksdateRange] = useState([]);
  const [selectedChartTimeRange, sertSelectedChartTimeRange] = useState([]);
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [Patient_name, setPatient] = useState("");
  const [PhoneNo, setPhoneNo] = useState("");
  const [searchremarks, setsearchremarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [patientCount, setPatientCount] = useState("");
  const [patientFeedbackCount, setPatientFeedbackCount] = useState("");
  const [bestDepartment, setBestDepartment] = useState("");
  const [poorDepartment, setPoorDepartment] = useState("");
  const [totalRating, setTotalRating] = useState("");
  const [totalPoorRating, settotalPoorRating] = useState("");
  const [planDrop, setPlanDrop] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plan, setPlan] = useState("");
  const [bestDepartmentValues, setBestDepartmentValues] = useState([]);
  const [bestDepartmentDefaultValue, setBestDepartmentDefaultValue] = useState("");
  const [poorDepartmentValues, setPoorDepartmentValues] = useState([]);
  const [poorDepartmentDefaultValue, setPoorDepartmentDefaultValue] = useState("");
  const [dropdownBestOpen, setDropdownBestOpen] = useState(false);
  const [dropdownPoorOpen, setDropdownPoorOpen] = useState(false);
  const [ratingStartDate, setRatingStartDate] = useState('');
  const [ratingEndDate, setRatingEndDate] = useState('');
  const [remarkStartDate, setRemarkStartDate] = useState('');
  const [remarkEndDate, setRemarkEndDate] = useState('');
  const userName = sessionStorage.getItem('selectedUserCode');
  const gridRef = useRef();
  const RatingGridRef = useRef();
  const chartRef = useRef();


  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Good",
        data: [],
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Average",
        data: [],
        borderColor: "#FFD700",
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Poor",
        data: [],
        borderColor: "#FF0000",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  });

  const [data1, setData1] = useState({
    labels: [],
    datasets: [],
  });

  const permissions = JSON.parse(sessionStorage.getItem("permissions")) || [];
  const dashboardPermission = permissions
    .filter((permission) => permission.screen_type === "Dashboard")
    .map((permission) => permission.permission_type.toLowerCase());

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDashboardPlan`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setBestDepartmentValues(data);
        if (data.length > 0) {
          setBestDepartmentDefaultValue(data[0].attributedetails_name);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/getDashboardPlan`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setPoorDepartmentValues(data);
        if (data.length > 0) {
          setPoorDepartmentDefaultValue(data[0].attributedetails_name);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    if (bestDepartmentDefaultValue) {
      const fetchBestDepartments = async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/getdashbestdept`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ plans: bestDepartmentDefaultValue }),
          });

          const data = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0].best_department) {
            const [{ best_department, totalrating }] = data;
            setBestDepartment(best_department);
            setTotalRating(totalrating);
          } else if (response.status === 404) {
            setBestDepartment('');
            console.log("Data Not found");
          } else {
            // Do not clear state – just ignore or optionally show an error/toast
            console.log("No valid best department data found");
            setBestDepartment('');
          }

        } catch (error) {
          console.error("Error fetching departments with plan:", error);
        }
      };
      fetchBestDepartments();
    }
  }, [bestDepartmentDefaultValue]);

  useEffect(() => {
    if (poorDepartmentDefaultValue) {
      const fetchPoorDepartments = async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/getdashpoordept`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ plans: poorDepartmentDefaultValue }),
          });

          const data = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0].poor_department) {
            const [{ poor_department, totalrating }] = data;
            setPoorDepartment(poor_department);
            settotalPoorRating(totalrating);
          } else if (response.status === 404) {
            setPoorDepartment('');
            console.log("Data Not found");
          } else {
            console.log("No valid poor department data found");
            setPoorDepartment('');
          }

        } catch (error) {
          console.error("Error fetching departments with plan:", error);
        }
      };
      fetchPoorDepartments();
    }
  }, [poorDepartmentDefaultValue]);

  useEffect(() => {
    if (RemarksDate?.label !== "Custom date") {
      setRemarksStartDate("");
      setRemarksEndDate("");
    }
  }, [RemarksDate]);

  useEffect(() => {
    if (Date?.label !== "Custom date") {
      setstartdate("");
      setenddate("");
    }
  }, [Date]);

  useEffect(() => {
    if (patientDate?.label !== "Custom date") {
      setPatientStartDate("");
      setPatientEndDate("");
    }
  }, [patientDate]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/Daterange`);
        let val = await response.json();

        setChartDrop(val);

        const defaultOption = val.find(
          (option) => option.Questions === "Current Month"
        );

        if (defaultOption) {
          const defaultValue = {
            value: defaultOption.Question_No,
            label: defaultOption.Questions,
          };
          sertSelectedChartTimeRange(defaultValue);
          setChartTimeRange(defaultValue.value);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      }
    };
    fetchChartData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/Daterange`);
        const val = await response.json();
        setdatedrop(val);

        const defaultOption = val.find(
          (option) => option.Questions === "Current Month"
        );

        if (defaultOption) {
          const defaultValue = {
            value: defaultOption.Question_No,
            label: defaultOption.Questions,
          };
          setdate(defaultValue);
          setDateRange(defaultValue.value);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPatientDate = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/Daterange`);
        const val = await response.json();
        setPatientDrop(val);

        const defaultOption = val.find(
          (option) => option.Questions === "Current Month"
        );

        if (defaultOption) {
          const defaultValue = {
            value: defaultOption.Question_No,
            label: defaultOption.Questions,
          };
          setpatientDate(defaultValue);
          setPatientDateRange(defaultValue.value);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      }
    };
    fetchPatientDate();
  }, []);

  useEffect(() => {
    const Remarksdata = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/Daterange`);
        const val = await response.json();
        setRemarksDatedrop(val);

        const defaultOption = val.find(
          (option) => option.Questions === "Current Month"
        );

        if (defaultOption) {
          const defaultValue = {
            value: defaultOption.Question_No,
            label: defaultOption.Questions,
          };
          setRemarksDate(defaultValue);
          setRemarksdateRange(defaultValue.value);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      }
    };
    Remarksdata();
  }, []);

  useEffect(() => {
    const fetchPatientCount = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/GetdashpatientCount`
        );
        if (response.ok) {
          const data = await response.json();
          const count = data?.TPCM?.[0]?.patient_count || 0;
          setPatientCount(count);
          setError(null);
        } else {
          throw new Error("Failed to fetch patient count");
        }
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      }
    };

    fetchPatientCount();
  }, []);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getPlan`);
        let val = await response.json();

        setPlanDrop(val);

        const defaultOption = val.find(
          (option) => option.attributedetails_name === "All"
        );

        if (defaultOption) {
          const defaultValue = {
            value: defaultOption.attributedetails_name,
            label: defaultOption.attributedetails_name,
          };
          setSelectedPlan(defaultValue);
          setPlan(defaultValue.value);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      }
    };
    fetchPlanData();
  }, []);

  const filteredOptionPlan = Array.isArray(planDrop)
    ? planDrop.map((option) => ({
      value: option.attributedetails_name,
      label: option.attributedetails_name,
    }))
    : [];


  const handleChangePlan = (planStatus) => {
    setSelectedPlan(planStatus);
    setPlan(planStatus ? planStatus.value : '');
  };

  useEffect(() => {
    const fetchPatientFeedbackCount = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/GetdashfeedpatientCount`
        );
        if (response.ok) {
          const data = await response.json();
          const patientCount = data?.TPCM?.[0]?.patient_count || 0;
          setPatientFeedbackCount(patientCount);
          setError(null);
        } else {
          setError("Failed to fetch patient feedback count");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      }
    };

    fetchPatientFeedbackCount();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/getRemarks`);
        let val = await response.json();

        setRemarksDrop(val);

        const defaultOption = val.find(
          (option) => option.attributedetails_name === "All"
        );

        if (defaultOption) {
          const defaultValue = {
            value: defaultOption.attributedetails_name,
            label: defaultOption.attributedetails_name,
          };
          setSelectremarks(defaultValue);
          setRemarks(defaultValue.value);
        }
      } catch (error) {
        console.error("Error fetching date range:", error);
      }
    };
    fetchChartData();
  }, []);

  useEffect(() => {
    if (department || dateRange || startdate || enddate || plan) {
      fetchRatingData();
    } else {
      console.log("Waiting for department or date range to be set.");
    }
  }, [department, dateRange, startdate, enddate, plan]);

  const fetchRatingData = async () => {
    try {
      if (dateRange === "CD" && (!startdate || !enddate)) {
        return;
      }

      const body = {
        plans: plan,
        department,
        startdate,
        enddate,
      };

      const response = await fetch(
        `${config.apiBaseUrl}/getDashboard${dateRange}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          const firstItem = searchData[0];
          setRatingStartDate(formatDate(firstItem.DateRange_Start) || "");
          setRatingEndDate(formatDate(firstItem.DateRange_End) || "");
        }

        const newRows = searchData.map((matchedItem) => ({
          checkup_date: matchedItem.checkup_date,
          department: matchedItem.department,
          poor: matchedItem.poor,
          average: matchedItem.average,
          good: matchedItem.good,
        }));
        setRowData(newRows);
        // setRowData(searchData);
      } else if (response.status === 410) {
        console.log("Data not found");
        setRowData([]);
        toast.error("Data not found");
      } else {
        const errorResponse = await response.json();
        console.log("Error:", errorResponse.message || "Bad request");
        toast.error(errorResponse.message || "An unexpected error occurred");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  //   const formatDate = (isoDateString) => {
  //   const date = new Date(isoDateString);
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${day}-${month}-${year}`;
  // };

  const chartOptions = {
    plugins: {
      datalabels: {
        display: true,
        color: "#000",
        align: "end",
        anchor: "end",
        formatter: (value) => value || "",
      },
      tooltip: {
        enabled: true,
      },
    },
    grid: {
      borderColor: "white",
      padding: {
        top: -30,
        right: 0,
        bottom: -8,
        left: 12,
      },
    },
  };

  //   const AudioCellRenderer = (props) => {
  //     const { value } = props;
  //     const [audioSrc, setAudioSrc] = useState(null);
  //     useEffect(() => {
  //         if (value?.type === "Buffer" && value.data) {
  //             const audioBlob = new Blob([new Uint8Array(value.data)], { type: "audio/webm" });
  //             const reader = new FileReader();
  //             reader.onloadend = () => {
  //                 const base64String = reader.result.split(",")[1];
  //                 console.log("Base64 Audio:", base64String);
  //             };
  //             reader.readAsDataURL(audioBlob);
  //             const audioUrl = URL.createObjectURL(audioBlob);
  //             setAudioSrc(audioUrl);
  //             return () => URL.revokeObjectURL(audioUrl);
  //         }
  //     }, [value]);
  //     if (!audioSrc) return <span>No audio available</span>;
  //     return (
  //       <audio className="custom-audio-player" controls>
  //             <source src={audioSrc} type="audio/webm" />
  //             Your browser does not support the audio element.
  //         </audio>
  //     );
  // };

  // const AudioCellRenderer = (props) => {
  //   const { value } = props; // Base64 audio data
  //   console.log(value);

  //   if (!value) return <span>No audio available</span>;

  //   // Convert base64 to Blob
  //   const base64ToBlob = (base64) => {
  //       // Check if the base64 string includes the data URL prefix
  //       const base64String = base64.includes('base64,') ? base64.split('base64,')[1] : base64;

  //       // Decode the base64 string
  //       const byteCharacters = atob(base64String);
  //       const byteArrays = [];

  //       for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
  //           const slice = byteCharacters.slice(offset, offset + 1024);
  //           const byteNumbers = new Array(slice.length);
  //           for (let i = 0; i < slice.length; i++) {
  //               byteNumbers[i] = slice.charCodeAt(i);
  //           }
  //           byteArrays.push(new Uint8Array(byteNumbers));
  //       }

  //       return new Blob(byteArrays, { type: 'audio/mp3' }); // Adjust MIME type if needed
  //   };

  //   const audioBlob = base64ToBlob(value);
  //   const audioUrl = URL.createObjectURL(audioBlob);

  //   return (
  //       <audio controls>
  //           <source src={audioUrl} type="audio/mp3" /> {/* Adjust MIME type if needed */}
  //           Your browser does not support the audio element.
  //       </audio>
  //   );
  // };

  // const audioRef = React.useRef(null);
  // const [audioPlaying, setAudioPlaying] = React.useState(false);

  const [playingRow, setPlayingRow] = React.useState(null);
  const [audioPlaying, setAudioPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

  const Remarkscolumns = [
    {
      headerName: "Date",
      field: "checkup_date",
      // valueFormatter: (params) => {
      //   const value = params.value;
      //   if (!value) return "";

      //   const isDateFormatted = /^\d{2}-\d{2}-\d{4}$/.test(value);
      //   if (isDateFormatted) {
      //     return value;
      //   }

      //   const date = new window.Date(value);
      //   if (isNaN(date)) return "";

      //   const year = date.getFullYear();
      //   const month = String(date.getMonth() + 1).padStart(2, "0");
      //   const day = String(date.getDate()).padStart(2, "0");
      //   console.log(day, month, year);
      //   return `${day}-${month}-${year}`;
      // },
    },
    {
      headerName: "Patient Name",
      editable: true,
      field: "patient_name",
      cellClassRules: {
        "cell-poor": (params) => params.value > 0, // Color if greater than 0
      },
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Phone No",
      field: "phone_no",
      editable: true,
      cellStyle: { textAlign: "center" },
    },
    {
      headerName: "Remarks",
      field: "feedback_comments",
      editable: true,
    },
    {
      headerName: "Audio Comment",
      field: "audio_comment",
      cellRenderer: function (params) {
        const isRowPlaying = playingRow === params.node.id;
        if (params.value !== 1) return null;

        const handleClick = () => {
          const { patient_name, phone_no } = params.data;
          handleAudioComment(patient_name, phone_no, params.node.id);
        };

        return (
          <FontAwesomeIcon
            icon={isRowPlaying ? faPause : faPlay}
            style={{ cursor: "pointer", marginRight: "12px" }}
            onClick={handleClick}
          />
        );
      },
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
  ];

  const handleAudioComment = async (patient_name, phone_no, rowId) => {
    try {
      if (audioPlaying && audioRef.current) {
        audioRef.current.pause();
        setPlayingRow(null);
        setAudioPlaying(false);
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/getAudiocomment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_name, phone_no }),
      });

      if (response.ok) {
        const searchData = await response.json();

        const [{ audio_comment }] = searchData;

        if (audio_comment?.type === "Buffer" && audio_comment.data) {
          const audioBlob = new Blob([new Uint8Array(audio_comment.data)], {
            type: "audio/webm",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioElement = new Audio(audioUrl);

          audioRef.current = audioElement;

          audioElement.onplay = () => {
            setAudioPlaying(true);
            setPlayingRow(rowId);
          };

          audioElement.onpause = () => {
            setAudioPlaying(false);
          };

          audioElement.onended = () => {
            setAudioPlaying(false);
            setPlayingRow(null);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
          };

          audioElement.play().catch((err) => {
            toast.error("Audio playback failed.");
          });
        } else {
          toast.error("No audio available for this comment.");
        }
      } else {
        console.error(
          "Failed to fetch audio data. Response status:",
          response.status
        );
        // handleSearchError(response);
      }
    } catch (error) {
      console.error("Error while fetching audio data:", error);
      toast.error(
        "An error occurred while fetching data. Please try again later."
      );
    }
  };

  // const handleAudioComment = async (patient_name, phone_no) => {
  //   try {
  //     if (audioPlaying && audioRef.current) {
  //       audioRef.current.pause();
  //       setAudioPlaying(false);
  //       return;
  //     }

  //     const searchCriteria = {
  //       patient_name,
  //       phone_no,
  //     };

  //     const response = await fetch(`${config.apiBaseUrl}/getAudiocomment`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(searchCriteria),
  //     });

  //     if (response.ok) {
  //       const searchData = await response.json();
  //       const [{ audio_comment }] = searchData;

  //       if (audio_comment?.type === "Buffer" && audio_comment.data) {
  //         const audioBlob = new Blob([new Uint8Array(audio_comment.data)], { type: "audio/webm" });
  //         const audioUrl = URL.createObjectURL(audioBlob);
  //         const audioElement = new Audio(audioUrl);

  //         audioRef.current = audioElement;

  //         audioElement.onplay = () => setAudioPlaying(true);
  //         audioElement.onpause = () => setAudioPlaying(false);
  //         audioElement.onended = () => {
  //           setAudioPlaying(false);
  //           URL.revokeObjectURL(audioUrl);
  //           audioRef.current = null;
  //         };

  //         audioElement.play().catch((err) => {
  //           console.error("Audio play error:", err);
  //           toast.error("Audio playback failed. Please try again later.");
  //         });
  //       }
  //     } else {
  //       handleSearchError(response);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching search data:", error);
  //     toast.error("An error occurred while fetching data. Please try again later.");
  //   }
  // };

  const handlenavigate = (selectedRow) => {
    const { checkup_date, department } = selectedRow;
    navigate("/Rating", { state: { checkup_date, department } });
    console.log(selectedRow);
  };

  const RatingColumns = [
    {
      headerName: "Date",
      field: "checkup_date",
      valueFormatter: (params) => {
        const value = params.value;
        if (!value) return "";

        const isDateFormatted = /^\d{2}-\d{2}-\d{4}$/.test(value);
        if (isDateFormatted) {
          return value;
        }

        const date = new window.Date(value);
        if (isNaN(date)) return "";

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${day}-${month}-${year}`;
      },
      cellRenderer: (params) => {
        const handleClick = () => {
          handlenavigate(params.data);
        };

        const valueFormatterLogic = (value) => {
          if (!value) return "";

          const isDateFormatted = /^\d{2}-\d{2}-\d{4}$/.test(value);
          if (isDateFormatted) {
            return value;
          }

          const date = new window.Date(value);
          if (isNaN(date)) return "";

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${day}-${month}-${year}`;
        };

        const formattedValue = valueFormatterLogic(params.value);

        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {formattedValue}
          </span>
        );
      },
    },
    {
      headerName: "Department",
      field: "department",
      cellRenderer: (params) => {
        const handleClick = () => {
          handlenavigate(params.data);
        };

        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Poor",
      field: "poor",
      cellClassRules: {
        "cell-poor": (params) => params.value > 0,
      },
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        const handleClick = () => {
          handlenavigate(params.data);
        };

        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Average",
      field: "average",
      cellClassRules: {
        "cell-average": (params) => params.value > 0,
      },
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        const handleClick = () => {
          handlenavigate(params.data);
        };

        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: "Good",
      field: "good",
      cellClassRules: {
        "cell-good": (params) => params.value > 0,
      },
      cellStyle: { textAlign: "center" },
      cellRenderer: (params) => {
        const handleClick = () => {
          handlenavigate(params.data);
        };
        return (
          <span style={{ cursor: "pointer" }} onClick={handleClick}>
            {params.value}
          </span>
        );
      },
    },

  ];

  const handleChartTimeRange = (selectedRange) => {
    sertSelectedChartTimeRange(selectedRange);
    setChartTimeRange(selectedRange ? selectedRange.value : "");
  };

  const handlePatientTimeRange = (selectedRange) => {
    setpatientDate(selectedRange);
    setPatientDateRange(selectedRange ? selectedRange.value : "");
  };

  const filteredChartTimeRange = Array.isArray(chartDrop)
    ? chartDrop.map((option) => ({
      value: option.Question_No,
      label: option.Questions,
    }))
    : [];

  // const filteredPatientTimeRange = patientDrop.map((option) => ({
  //   value: option.Question_No,
  //   label: option.Questions,
  // }));

  const filteredPatientTimeRange = Array.isArray(patientDrop)
    ? patientDrop.map((option) => ({
      value: option.Question_No,
      label: option.Questions,
    }))
    : [];

  const handlechangedate = (selectedDate) => {
    setdate(selectedDate);
    setDateRange(selectedDate ? selectedDate.value : "");
  };

  const handlechangeRemarksdate = (selectedDate) => {
    setRemarksDate(selectedDate);
    setRemarksdateRange(selectedDate ? selectedDate.value : "");
  };

  const filterredoptionDate = Array.isArray(datedrop)
    ? datedrop.map((option) => ({
      value: option.Question_No,
      label: option.Questions,
    }))
    : [];


  const filterredoptionRemarksDate = Array.isArray(RemarksDatedrop)
    ? RemarksDatedrop.map((option) => ({
      value: option.Question_No,
      label: option.Questions,
    }))
    : [];

  const handlechangedpt = (selectedDept) => {
    setselecteddpt(selectedDept);
    setDepartment(selectedDept ? selectedDept.value : "");
  };


  const filterredoptionDpt = Array.isArray(Dptdrop)
    ? Dptdrop.map((option) => ({
      value: option.Questions,
      label: option.Questions,
    }))
    : [];

  useEffect(() => {
    if (plan) {
      const fetchDepartments = async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/departement`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ attributeheader_code: plan }),
          });

          const data = await response.json();

          const updatedData = [
            { Questions: "All" },
            ...data
          ];

          setDptDrop(updatedData);

          setselecteddpt({ value: "All", label: "All" });
          setDepartment("All");

        } catch (error) {
          console.error("Error fetching departments with plan:", error);
        }
      };
      fetchDepartments();
    }
  }, [plan]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/average`);
        const data = await response.json();
        const [{ Verdict }] = data;
        setVerdict(Verdict);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDashboardData();
  }, []);

  const chartStyle = {
    width: "100%",
    color: "white",
  };

  useEffect(() => {
    if (chartTimeRange || chartStartDate || chartEndDate) {
      fetchChartData();
    } else {
      console.log("Waiting for department or date range to be set.");
    }
  }, [chartTimeRange, chartStartDate, chartEndDate]);

  const fetchChartData = async () => {
    try {
      if (chartTimeRange === "CD" && (!chartStartDate || !chartEndDate)) {
        return;
      }

      const body = {
        mode: chartTimeRange,
        CustomStartDate: chartStartDate,
        CustomEndDate: chartEndDate,
      };

      const response = await fetch(`${config.apiBaseUrl}/Chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();

        const labels = searchData.map((item) => {
          return item.MonthYear || formatDate(item.Date);
        });

        const goodData = searchData.map((item) =>
          item.Good ? formatValue(item.Good) : 0
        );
        const averageData = searchData.map((item) =>
          item.Average ? formatValue(item.Average) : 0
        );
        const poorData = searchData.map((item) =>
          item.Poor ? formatValue(item.Poor) : 0
        );

        setChartData({
          labels,
          datasets: [
            { ...chartData.datasets[0], data: goodData },
            { ...chartData.datasets[1], data: averageData },
            { ...chartData.datasets[2], data: poorData },
          ],
        });
      } else if (response.status === 404) {
        console.log("Data Not found");
        toast.error("Feedback statistics data not found");
      } else {
        const errorResponse = await response.json();
        console.log("Error:", errorResponse.message || "Bad request");
        toast.error(errorResponse.message || "An unexpected error occurred");
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    if (patientDateRange || patientStartDate || patientEndDate) {
      fetchPatientChartData();
    } else {
      console.log("Waiting for department or date range to be set.");
    }
  }, [patientDateRange, patientStartDate, patientEndDate]);

  const fetchPatientChartData = async () => {
    try {
      if (patientDateRange === "CD" && (!patientStartDate || !patientEndDate)) {
        return;
      }

      const body = {
        mode: patientDateRange,
        CustomStartDate: patientStartDate,
        CustomEndDate: patientEndDate,
      };

      const response = await fetch(`${config.apiBaseUrl}/GenderChart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const searchData = await response.json();

        const labels = searchData.map((entry) => {
          return entry.MonthYear || formatDate(entry.Date);
        });
        const maleData = searchData.map((entry) => entry.male);
        const femaleData = searchData.map((entry) => entry.female);
        const otherData = searchData.map((entry) => entry.others);

        setData1({
          labels,
          datasets: [
            { label: "Male", data: maleData, backgroundColor: "#5BBCFF" },
            { label: "Female", data: femaleData, backgroundColor: "#61DDAA" },
            { label: "Others", data: otherData, backgroundColor: "#F6789D" },
          ],
        });
      } else if (response.status === 404) {
        console.log("Data Not found");
        toast.error("Gender overview chart data not found");
      } else {
        const errorResponse = await response.json();
        console.log("Error:", errorResponse.message || "Bad request");
        toast.error(errorResponse.message || "An unexpected error occurred");
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const formatDate = (dateString) => {
    if (typeof dateString === "string" && dateString) {
      const dateParts = dateString.split("T")[0].split("-");
      if (dateParts.length === 3) {
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }
    }
    return "";
  };

  const formatValue = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "k";
    }
    return value.toString();
  };

  const handleCustomDatestart = (e) => {
    e.preventDefault();
    setstartdate(e.target.value);
  };

  const handleCustomDateend = (e) => {
    e.preventDefault();
    setenddate(e.target.value);
    // if (startdate) {
    //   fetchRatingData();
    // }
  };

  const handleRemarksCustomDateStart = (e) => {
    e.preventDefault();
    setRemarksStartDate(e.target.value);
  };

  const handleRemarksCustomDatEend = (e) => {
    e.preventDefault();
    setRemarksEndDate(e.target.value);
    // if (remarksStartDate) {
    //   handleSearch();
    // }
  };

  const handleChartCustomDateStart = (e) => {
    e.preventDefault();
    setChartStartDate(e.target.value);
  };

  const handlePatientCustomDateStart = (e) => {
    e.preventDefault();
    setPatientStartDate(e.target.value);
  };

  const handleChartCustomDateEnd = (e) => {
    e.preventDefault();
    setChartEndDate(e.target.value);
    // if (chartStartDate) {
    //   fetchChartData();
    // }
  };

  const handlePatientCustomDateEnd = (e) => {
    e.preventDefault();
    setPatientEndDate(e.target.value);
    // if (patientStartDate) {
    //   fetchPatientChartData();
    // }
  };

  const filterredoptionRemarks = remarksDrop.map((option) => ({
    value: option.attributedetails_name,
    label: option.attributedetails_name,
  }));

  const handlechangeRemarks = (selectedOption) => {
    setSelectremarks(selectedOption);
    setRemarks(selectedOption ? selectedOption.value : "");
    if (selectedOption.label === "WithOut Remarks") {
      setsearchremarks("");
    }
  };

  const handleSearch = async () => {
    try {
      if (remarksdateRange === "CD" && (!remarksStartDate || !remarksEndDate)) {
        return;
      }

      const searchCriteria = {
        mode: remarksdateRange,
        patient_name: Patient_name,
        phone_no: PhoneNo,
        remarkstype: remarks,
        start_date: remarksStartDate,
        end_date: remarksEndDate,
        remarks: searchremarks,
      };

      const response = await fetch(
        `${config.apiBaseUrl}/getRemarks_Dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteria),
        }
      );

      if (response.ok) {
        const searchData = await response.json();
        if (searchData.length > 0) {
          const firstItem = searchData[0];
          setRemarkStartDate(formatDate(firstItem.DateRange_Start) || "");
          setRemarkEndDate(formatDate(firstItem.DateRange_End) || "");
        }

        const newRows = searchData.map((matchedItem) => ({
          checkup_date: formatDate(matchedItem.checkup_date),
          patient_name: matchedItem.patient_name,
          phone_no: matchedItem.phone_no,
          feedback_comments: matchedItem.feedback_comments,
          audio_comment: matchedItem.HasAudioComment,
        }));
        setRowDataRemarks(newRows);
        console.log("Data fetched successfully");
      } else if (response.status === 404) {
        setRowDataRemarks([]);
        console.log("Data Not found");
        toast.error("Data not found");
      } else {
        const errorResponse = await response.json();
        console.log("Error:", errorResponse.message || "Bad request");
        toast.error(errorResponse.message || "An unexpected error occurred");
      }
    } catch (error) {
      console.error("Error fetching search data:", error);
    }
  };

  const handleReload = async () => {
    window.location.reload();
  };
  const isMobile = window.innerWidth <= 768;

  const handleBestDropdownSelect = (selectedValue) => {
    setBestDepartmentDefaultValue(selectedValue);
    setDropdownBestOpen(false);
  };

  const handlePoorDropdownSelect = (selectedValue) => {
    setPoorDepartmentDefaultValue(selectedValue);
    setDropdownPoorOpen(false);
  };

  const handleExportExcelRemarks = () => {
    if (!gridRef.current) return;

    const rowCount = gridRef.current.api.getDisplayedRowCount();
    if (rowCount === 0) {
      toast.error("No data available to export excel!");
      return;
    }

    const columns = Remarkscolumns.filter(
      col => col.field && col.field !== "audio_comment"
    );
    const headerNames = columns.map(col => col.headerName);
    const fields = columns.map(col => col.field);

    const rowDataToExport = [];
    gridRef.current.api.forEachNode((node) => {
      const row = {};
      fields.forEach((field, index) => {
        let value = node.data[field];

        // Handle date conversion for "checkup_date"
        if (field === "checkup_date") {
          value = formatDate(value);
        }

        row[headerNames[index]] = value ?? ""; // default to empty if null/undefined
      });
      rowDataToExport.push(row);
    });

    // Create custom headers
    const headerData = [
      ['Patient Feedback Report'],
      [`Date Range: ${remarkStartDate} to ${remarkEndDate}`],
      [`User: ${userName}`],
      [],
    ];

    // Convert to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(headerData);
    XLSX.utils.sheet_add_json(worksheet, rowDataToExport, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Remarks");

    XLSX.writeFile(workbook, "remarks_export.xlsx");
  };

  const handleExportExcelRating = () => {
    if (!RatingGridRef.current) return;

    const rowCount = RatingGridRef.current.api.getDisplayedRowCount();
    if (rowCount === 0) {
      toast.error("No data available to export excel!");
      return;
    }

    // Step 1: Get visible column headers
    const columns = RatingColumns.filter(col => col.field);
    const headerNames = columns.map(col => col.headerName);
    const fields = columns.map(col => col.field);

    // Step 2: Get all row data from AG Grid
    const rowDataToExport = [];
    RatingGridRef.current.api.forEachNode((node) => {
      const row = {};
      fields.forEach((field, index) => {
        let value = node.data[field];

        // Format checkup_date field
        if (field === "checkup_date") {
          value = formatDate(value);
        }

        row[headerNames[index]] = value ?? ""; // avoid null/undefined
      });
      rowDataToExport.push(row);
    });

    // Step 3: Create custom header
    const headerData = [
      ['Patient Rating Report'],
      [`Date Range: ${ratingStartDate} to ${ratingEndDate}`],
      [`User: ${userName}`],
      [],
    ];

    // Step 4: Add JSON data after header rows
    const worksheet = XLSX.utils.aoa_to_sheet(headerData);
    XLSX.utils.sheet_add_json(worksheet, rowDataToExport, { origin: 'A5' });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rating");

    XLSX.writeFile(workbook, "rating_export.xlsx");
  };

  const handlePrintRemarks = () => {
    if (!gridRef.current) return;

    const rowCount = gridRef.current.api.getDisplayedRowCount();

    if (rowCount === 0) {
      toast.error("No data available to print!");
      return;
    }

    const columns = Remarkscolumns.filter(
      col => col.field && col.field !== "audio_comment"
    );
    const headers = columns.map(col => col.headerName);
    const fields = columns.map(col => col.field);

    const rowData = [];
    gridRef.current.api.forEachNode((node) => {
      const row = {};
      fields.forEach((field, index) => {
        let value = node.data[field];

        // Format date if field is "checkup_date"
        if (field === "checkup_date" && value) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, '0');
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const year = date.getFullYear();
              value = `${day}-${month}-${year}`;
            }
          } catch (err) {
            console.error("Invalid date format:", value, err);
          }
        }

        row[headers[index]] = value;
      });
      rowData.push(row);
    });

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Patient Feedback</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
    body {
        font-family: Arial, sans-serif;
        margin: 20px;
    }
    h1 {
        text-align: center;
        color: maroon;
        text-decoration: underline;
        margin-bottom: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: left;
        vertical-align: top;
    }
    th {
        background-color: maroon;
        color: white;
    }
    td {
        background-color: #fdd9b5;
    }
    tr:nth-child(even) td {
        background-color: #fff0e1;
    }
    .print-button {
        display: block;
        width: 150px;
        margin: 20px auto;
        padding: 10px;
        background-color: maroon;
        color: white;
        border: none;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
    }
    .print-button:hover {
        background-color: darkred;
    }
    @media print {
        .print-button {
            display: none;
        }
    }
  `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write("<h1>Patient Feedback Report</h1>");

    // Header row
    printWindow.document.write("<table><thead><tr>");
    headers.forEach((header) => {
      printWindow.document.write(`<th>${header}</th>`);
    });
    printWindow.document.write("</tr></thead><tbody>");

    // Data rows
    rowData.forEach((row) => {
      printWindow.document.write("<tr>");
      headers.forEach((header) => {
        printWindow.document.write(`<td>${row[header] ?? ""}</td>`);
      });
      printWindow.document.write("</tr>");
    });

    printWindow.document.write("</tbody></table>");
    printWindow.document.write(
      '<button class="print-button" onclick="window.print()">Print</button>'
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
  };

  const formatDateDDMMYYYY = (value) => {
    const parsed = new window.Date(value);
    if (isNaN(parsed)) return "";
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePrintRating = () => {
    if (!RatingGridRef.current) return;

    const rowCount = RatingGridRef.current.api.getDisplayedRowCount();

    if (rowCount === 0) {
      toast.error("No data available to print!");
      return;
    }

    const columns = RatingColumns.filter(col => col.field);
    const headers = columns.map(col => col.headerName);
    const fields = columns.map(col => col.field);

    const rowData = [];
    RatingGridRef.current.api.forEachNode((node) => {
      const row = {};
      fields.forEach((field, index) => {
        let value = node.data[field];

        // Format date if field is "checkup_date"
        if (field === "checkup_date" && value) {
          value = formatDateDDMMYYYY(value);
        }

        row[headers[index]] = value;
      });
      rowData.push(row);
    });

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Patient Rating</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
    body {
        font-family: Arial, sans-serif;
        margin: 20px;
    }
    h1 {
        text-align: center;
        color: maroon;
        text-decoration: underline;
        margin-bottom: 20px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: left;
        vertical-align: top;
    }
    th {
        background-color: maroon;
        color: white;
    }
    td {
        background-color: #fdd9b5;
    }
    tr:nth-child(even) td {
        background-color: #fff0e1;
    }
    .print-button {
        display: block;
        width: 150px;
        margin: 20px auto;
        padding: 10px;
        background-color: maroon;
        color: white;
        border: none;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        text-align: center;
    }
    .print-button:hover {
        background-color: darkred;
    }
    @media print {
        .print-button {
            display: none;
        }
    }
  `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write("<h1>Patient Rating Report</h1>");

    // Header row
    printWindow.document.write("<table><thead><tr>");
    headers.forEach((header) => {
      printWindow.document.write(`<th>${header}</th>`);
    });
    printWindow.document.write("</tr></thead><tbody>");

    // Data rows
    rowData.forEach((row) => {
      printWindow.document.write("<tr>");
      headers.forEach((header) => {
        printWindow.document.write(`<td>${row[header] ?? ""}</td>`);
      });
      printWindow.document.write("</tr>");
    });

    printWindow.document.write("</tbody></table>");
    printWindow.document.write(
      '<button class="print-button" onclick="window.print()">Print</button>'
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
  };

  const handlePrintFeedback = () => {
    const chartCanvas = chartRef.current?.querySelector("canvas");
    if (!chartCanvas) {
      alert("Chart not rendered yet.");
      return;
    }

    const dataUrl = chartCanvas.toDataURL(); // Convert canvas to image

    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Print Chart</title></head><body>");
    printWindow.document.write(`<img src="${dataUrl}" style="width:100%;max-width:800px;" />`);
    printWindow.document.write("<script>window.onload = function() { window.print(); }</script>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
  };

  const handleExportChartToExcel = async () => {
    const canvas = chartRef.current?.querySelector("canvas");
    if (!canvas) return;

    const imageBase64 = canvas.toDataURL("image/png");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Chart Image");

    const imageId = workbook.addImage({
      base64: imageBase64,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 1, row: 1 },
      ext: { width: 600, height: 400 }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Feedback_statistics.xlsx");
  };

  return (
    <div>
      <Toaster position={isMobile ? "top-center" : "top-right"} class="toast-design" toastOptions={{ duration: 2000 }} />
      <div className="main-content mb-3">
        <div className="desktop" style={{ maxWidth: "100%" }}>
          <div className="row mb-4 justify-content-center">
            <div className="col-md-3 d-flex justify-content-center">
              <div className="fixed-card">
                <div className="card-content">
                  <h2>{patientCount}</h2>
                  <p>Total Patients</p>
                </div>
                <div className="card-img">
                  <img src={Patient} alt="patient icon" />
                </div>
              </div>
            </div>
            <div className="col-md-3 d-flex justify-content-center">
              <div className="fixed-card">
                <div className="card-content">
                  <h2>{patientFeedbackCount}</h2>
                  <p>Total Reviews</p>
                </div>
                <div className="card-img">
                  <img src={star} alt="review icon" />
                </div>
              </div>
            </div>
            <div className="col-md-3 d-flex justify-content-center">
              <div className="fixed-card position-relative">
                <div className="card-content">
                  {/* <h2>{totalRating || 0}</h2> */}
                  <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>{bestDepartment || '-'}</p>
                  <p>Best Department</p>
                  {/* <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>{bestDepartment || '-'}</p> */}
                </div>
                <div className="card-img">
                  <img src={Department} />
                </div>
                <div className="dropdown-hover position-absolute top-0 end-0 m-2">
                  <button className="dropdown-btn border-0 bg-transparent p-1">
                    <i className="bi bi-three-dots-vertical fs-5" />
                  </button>
                  <div className="dropdown-content-hover">
                    {bestDepartmentValues.map((item, index) => (
                      <a
                        key={index}
                        href="#"
                        onClick={() => handleBestDropdownSelect(item.attributedetails_name)}
                      >
                        {item.attributedetails_name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 d-flex justify-content-center">
              <div className="fixed-card position-relative">
                <div className="card-content">
                  {/* <h2>{totalPoorRating || 0}</h2> */}
                  <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>
                    {poorDepartment || '-'}
                  </p>
                  <p>Poor Department</p>
                  {/* <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>
                    {poorDepartment || '-'}
                  </p> */}
                </div>
                <div className="card-img">
                  <img src={poor} alt="poor icon" />
                </div>
                <div className="dropdown-hover position-absolute top-0 end-0 m-2">
                  <button className="dropdown-btn border-0  bg-transparent p-1">
                    <i className="bi bi-three-dots-vertical fs-5" />
                  </button>
                  <div className="dropdown-content-hover">
                    {poorDepartmentValues.map((item, index) => (
                      <a
                        key={index}
                        href="#"
                        onClick={() => handlePoorDropdownSelect(item.attributedetails_name)}
                      >
                        {item.attributedetails_name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-1 ms-1 me-5">
            <div className="col-lg-8 chart col-9 mb-4 shadow-sm border rounded-5">
              <h5 className="mt-3">Feedback Statistics</h5>
              <div className="row">
                <div className="col-md-4">
                  <span className="">Date Range</span>
                  <Select
                    id="date"
                    value={selectedChartTimeRange}
                    onChange={handleChartTimeRange}
                    options={filteredChartTimeRange}
                    className="col-5  me-2 col-md-12"
                    placeholder=""
                    required
                    data-tip="Please select a payment type"
                  />
                </div>
                <div className="col-lg-8">
                  {selectedChartTimeRange?.label === "Custom date" && (
                    <div className="row">
                      <div className="col-md-6">
                        <span className="">From</span>
                        <input
                          type="date"
                          value={chartStartDate}
                          onChange={handleChartCustomDateStart}
                          className=" form-control me-2  "
                        />
                      </div>
                      <div className="col-md-6">
                        <span className="">To</span>
                        <input
                          type="date"
                          value={chartEndDate}
                          onChange={handleChartCustomDateEnd}
                          className="form-control me-2  "
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-md-3 mb-3">
                  <button className="mt-4 me-3 p-2" title='Export Excel' onClick={handleExportChartToExcel}>
                    <FontAwesomeIcon icon={faFileExcel} />
                  </button>
                  <button className="mt-4 p-2" title='Print' onClick={handlePrintFeedback}>
                    <FontAwesomeIcon icon={faPrint} />
                  </button>
                </div>
              </div>
              <div className="p-4" ref={chartRef} style={{ width: "100%", height: "600px" }}>
                <Line data={chartData} options={chartOptions} />
                <canvas></canvas>
              </div>
            </div>
            <div className="col-9 col-md-6 col-lg-4 align-content-center d-flex p-3">
              <div
                className={`${styles.dashboardBg} dashboardBg shadow-sm rounded-5 text-center`}
              >
                <h3 className="text-start">Feedback</h3>
                <GaugeChart
                  id="gauge-chart"
                  style={chartStyle}
                  nrOfLevels={20}
                  percent={verdict}
                  textColor={chartStyle.color}
                  colors={["#FF0000", "#FFFF00", "#00FF00"]}
                />
              </div>
            </div>
          </div>
          <div className="row me-4">
            <div className="col-md-8  mb-3">
              <div
                className="p-4 chart border  rounded-5 shadow-sm pb-2"
                style={{ height: "600px" }}
              >
                <h5 className="mb-3">Rating</h5>
                <div className="row">
                  <div className="col-md-4">
                    <span className="">Department</span>
                    <Select
                      id="department"
                      value={selecteddpt}
                      onChange={handlechangedpt}
                      options={filterredoptionDpt}
                      className="col-5 col-md-12   "
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="col-md-2 form-group mb-2">
                    <div class="exp-form-floating">
                      <label for="state" class="exp-form-labels">
                        Plan
                      </label>
                      <Select
                        id="Gender"
                        value={selectedPlan}
                        onChange={handleChangePlan}
                        options={filteredOptionPlan}
                        className="exp-input-field"
                        placeholder=""
                        required
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <span className=" mt-4 me-1">Date Range</span>
                    <Select
                      id="dateRange"
                      value={Date}
                      onChange={handlechangedate}
                      options={filterredoptionDate}
                      className="col-5 col-md-12  "
                      placeholder=""
                      required
                      data-tip="Please select a payment type"
                    />
                  </div>
                  {Date?.label === "Custom date" && (
                    <div className="col-md-5">
                      <div className="row">
                        <div className="col-md-6">
                          <span className="">From</span>
                          <input
                            type="date"
                            value={startdate}
                            onChange={handleCustomDatestart}
                            className=" form-control  mb-3  "
                          />{" "}
                        </div>
                        <div className="col-md-6">
                          <span className=" ">To</span>
                          <input
                            type="date"
                            value={enddate}
                            onChange={handleCustomDateend}
                            className="form-control mb-3  "
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="col-md-3 mb-3">
                    <button className="mt-4 me-3 p-2" title='Export Excel' onClick={handleExportExcelRating}>
                      <FontAwesomeIcon icon={faFileExcel} />
                    </button>
                    <button className="mt-4 p-2" title='Print' onClick={handlePrintRating}>
                      <FontAwesomeIcon icon={faPrint} />
                    </button>
                  </div>
                </div>
                <div
                  className="ag-theme-alpine"
                  style={{ height: 350, width: "100%", maxHeight: "100%" }}
                >
                  <AgGridReact ref={RatingGridRef} columnDefs={RatingColumns} rowData={rowData} />
                </div>
              </div>
            </div>
            <div
              className="col-9 col-lg-4 shadow-sm border rounded-5 pb-0 chart"
              style={{ height: "600px" }}
            >
              <div className="mt-5">
                <h5>Gender Overview</h5>
                <div className="col-md-6">
                  <Select
                    id="dateRange"
                    value={patientDate}
                    onChange={handlePatientTimeRange}
                    options={filteredPatientTimeRange}
                    className="col-12  mb-3"
                    placeholder=""
                    required
                    data-tip="Please select a payment type"
                  />
                </div>
                {patientDate?.label === "Custom date" && (
                  <div className="row">
                    <div className="col-md-6">
                      <span className="me-4 ">From</span>
                      <input
                        type="date"
                        value={patientStartDate}
                        onChange={handlePatientCustomDateStart}
                        className=" form-control me-2 mb-3  "
                      />
                    </div>
                    <div className="col-md-6">
                      <span className="me-4 ">To</span>
                      <input
                        type="date"
                        value={patientEndDate}
                        onChange={handlePatientCustomDateEnd}
                        className="form-control me-2 mb-3 "
                      />
                    </div>
                  </div>
                )}
                <div className="mt-5">
                  <Bar
                    data={data1}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxHeight: "900px",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-12 mt-3">
              <div className="p-4 chart border  rounded-5 shadow-sm">
                <h5 className="mb-3">Remarks</h5>
                <div className="row">
                  <div className="col-md-3">
                    <span className="">Date Range</span>
                    <Select
                      id="dateRange"
                      value={RemarksDate}
                      onChange={handlechangeRemarksdate}
                      options={filterredoptionRemarksDate}
                      className="col-md-12 mb-3"
                      required
                      data-tip="Please select a payment type"
                    />
                  </div>
                  {RemarksDate?.label === "Custom date" && (
                    <div className="col-md-5 mb-3">
                      <div className="row">
                        <div className="col-md-6">
                          <span className="">From</span>
                          <input
                            type="date"
                            value={remarksStartDate}
                            onChange={handleRemarksCustomDateStart}
                            className=" form-control "
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSearch()
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <span className="">To</span>
                          <input
                            type="date"
                            value={remarksEndDate}
                            onChange={handleRemarksCustomDatEend}
                            className="form-control"
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSearch()
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="col-md-3">
                    <span className=" mt-4"> Patient Name</span>
                    <input
                      type="text"
                      className=" form-control "
                      placeholder=""
                      value={Patient_name}
                      onChange={(e) => setPatient(e.target.value.trim())}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="col-md-3 col-5 ">
                    <span className="">Phone</span>
                    <input
                      type="text"
                      className=" form-control col-md-2"
                      value={PhoneNo}
                      maxLength={13}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        setPhoneNo(numericValue);
                      }}
                      // onChange={(e) => setPhoneNo(e.target.value.trim())}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <div className="col-md-3 col-5 ">
                    <div class="exp-form-floating">
                      <label>Select Remarks</label>
                      <Select
                        id="dateRange"
                        value={Selectremarks}
                        onChange={handlechangeRemarks}
                        options={filterredoptionRemarks}
                        className="col-12  mb-3"
                      />
                    </div>
                  </div>
                  {Selectremarks?.label !== "WithOut Remarks" && (
                    <div className="col-md-3 col-5 ">
                      <div class="exp-form-floating">
                        <label>Search Remarks</label>
                        <input
                          type="text"
                          className="form-control col-md-2 "
                          value={searchremarks}
                          onChange={(e) =>
                            setsearchremarks(e.target.value.trim())
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>
                    </div>
                  )}
                  <div className="col-md-3 mb-3">
                    <button className="mt-4 me-3 p-2" title='Search' onClick={handleSearch}>
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                    <button className="mt-4 me-3 p-2" title='Reload' onClick={handleReload}>
                      <FontAwesomeIcon icon={faArrowRotateRight} />
                    </button>
                    <button className="mt-4 me-3 p-2" title='Export Excel' onClick={handleExportExcelRemarks}>
                      <FontAwesomeIcon icon={faFileExcel} />
                    </button>
                    <button className="mt-4 p-2" title='Print' onClick={handlePrintRemarks}>
                      <FontAwesomeIcon icon={faPrint} />
                    </button>
                  </div>
                </div>
                <div
                  className="ag-theme-alpine"
                  style={{ height: 450, width: "100%" }}
                >
                  <AgGridReact
                    ref={gridRef}
                    columnDefs={Remarkscolumns}
                    rowData={rowDataRemarks}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobileview code below */}
      {/* ******************************************************** */}
      <div>
        <div className="container-fluid mobile-only mobileview">
          <div className="row mb-4">
            <div className="col-12 mb-3">
              <div className="fixed-card">
                <div className="card-content">
                  <h2>{patientCount}</h2> {/* Use static 0 if no value */}
                  <p>Total Patients</p>
                </div>
                <div className="card-img">
                  <img src={Patient} alt="patient icon" />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="fixed-card">
                <div className="card-content">
                  <h2>{patientFeedbackCount}</h2>
                  <p>Total Reviews</p>
                </div>
                <div className="card-img">
                  <img src={star} alt="review icon" />
                </div>
              </div>
            </div>
            <div className="col-12 mb-3">
              <div className="fixed-card position-relative">
                <div className="dropdown-btn-container dropdown-hover position-absolute">
                  <button className="dropdown-btn border-0 bg-transparent p-1">
                    <i className="bi bi-three-dots-vertical fs-5" />
                  </button>
                  <div className="dropdown-content-hover">
                    {bestDepartmentValues.map((item, index) => (
                      <a
                        key={index}
                        href="#"
                        onClick={() => handleBestDropdownSelect(item.attributedetails_name)}
                      >
                        {item.attributedetails_name}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="card-content">
                  {/* <h2>{totalRating || 0}</h2> */}
                  <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>{bestDepartment || '-'}</p>
                  <p>Best Department</p>
                  {/* <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>{bestDepartment || '-'}</p> */}
                </div>
                <div className="card-img">
                  <img src={Department} />
                </div>
              </div>
            </div>
            <div className="col-12 mb-1">
              <div className="fixed-card position-relative">
                <div className="dropdown-btn-container dropdown-hover position-absolute">
                  <button className="dropdown-btn border-0 bg-transparent p-1">
                    <i className="bi bi-three-dots-vertical fs-5" />
                  </button>
                  <div className="dropdown-content-hover">
                    {poorDepartmentValues.map((item, index) => (
                      <a key={index} href="#" onClick={() => handlePoorDropdownSelect(item.attributedetails_name)}>
                        {item.attributedetails_name}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="card-content">
                  {/* <h2>{totalPoorRating || 0}</h2> */}
                  <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>
                    {poorDepartment || '-'}
                  </p>
                  <p>Poor Department</p>
                  {/* <p style={{ fontSize: '13px', fontWeight: 400, maxWidth: '220px', wordWrap: 'break-word' }}>
                    {poorDepartment || '-'}
                  </p> */}
                </div>
                <div className="card-img">
                  <img src={poor} alt="poor icon" />
                </div>
              </div>
            </div>
            <div className="col-12 me-3 mt-3 mb-3">
              <div className="">
                <div
                  className={`${styles.dashboardBg} dashboardBg  pt-2 shadow-sm rounded-5 text-center`}
                >
                  <h3 className="text-start fs-6">Feedback</h3>
                  <GaugeChart
                    id={"gauge-chart"}
                    style={chartStyle}
                    nrOfLevels={10} // This determines the color segments
                    percent={verdict} // This represents 30%
                    textColor={chartStyle.color}
                    colors={["#FF0000", "#FFFF00", "#00FF00"]} // Colors from red to green
                  />
                </div>
              </div>
            </div>
            <div className="col-12 chart mb-3 shadow-sm border rounded-3">
              <h5 className="mt-3">Feedback Statistics</h5>
              <div className="col-md-6">
                <Select
                  id="darte"
                  value={selectedChartTimeRange}
                  onChange={handleChartTimeRange}
                  options={filteredChartTimeRange}
                  className="exp-input-field"
                  placeholder=""
                  required
                  data-tip="Please select a payment type"
                  isSearchable={false} // Disable keyboard pop-up
                />
              </div>
              {selectedChartTimeRange?.label === "Custom date" && (
                <div className="col-12">
                  <span className=" ">From</span>
                  <input
                    type="date"
                    value={chartStartDate}
                    onChange={handleChartCustomDateStart}
                    className=" form-control "
                  />
                  <span className="">To</span>
                  <input
                    type="date"
                    value={chartEndDate}
                    onChange={handleChartCustomDateEnd}
                    className="form-control "
                  />
                </div>
              )}
              <div className="col-md-3 mb-3">
                <button className="p-2 mt-2 me-3 ps-3 pe-3" title='Export Excel' onClick={handleExportChartToExcel}>
                  <FontAwesomeIcon icon={faFileExcel} />
                </button>
                <button className="p-2 mt-2 me-3 ps-3 pe-3" title='Print' onClick={handlePrintFeedback}>
                  <FontAwesomeIcon icon={faPrint} />
                </button>
              </div>
              <div className="mt-1">
                <Line
                  data={chartData}
                  options={{ maintainAspectRatio: false }}
                  style={{
                    maxWidth: "150%",
                    height: "304px",
                    boxSizing: "border-box",
                    display: "block",
                    width: "250px",
                  }}
                />
              </div>
            </div>
            <div className="col-12 chart mb-3 shadow-sm border   chart  rounded ">
              <div className="mt-2">
                <h5>Gender Overview</h5>
                <div className="col-md-6">
                  <Select
                    id="dateRange"
                    value={patientDate}
                    onChange={handlePatientTimeRange}
                    options={filteredPatientTimeRange}
                    className="col-12  mb-3"
                    placeholder=""
                    required
                    data-tip="Please select a payment type"
                    isSearchable={false}
                  />
                </div>
                {patientDate?.label === "Custom date" && (
                  <div className="col-12">
                    <span className=" mt-2">From</span>
                    <input
                      type="date"
                      value={patientStartDate}
                      onChange={handlePatientCustomDateStart}
                      className=" form-control me-2 mb-3 mt-3 "
                      isSearchable={false}
                    />
                    <span className=" mt-2 ">To</span>
                    <input
                      type="date"
                      value={patientEndDate}
                      onChange={handlePatientCustomDateEnd}
                      className="form-control me-2 mb-3 mt-3 "
                      isSearchable={false}
                    />
                  </div>
                )}
                <div className="">
                  <Bar
                    data={data1}
                    options={{ maintainAspectRatio: false }}
                    style={{
                      maxWidth: "100%",
                      height: "304px",
                      boxSizing: "border-box",
                      display: "block",
                      width: "208px",
                    }}
                  />
                </div>
              </div>
              {/* <Bar data={data1} style={{ maxWidth: '100%', height: '804px', boxSizing: 'border-box', display: 'block', width: '208px' }}/> */}
            </div>
          </div>
          <div className="p-3 col-12  border  rounded-3 shadow-sm chart">
            <h5 className="mb-3">Rating</h5>
            <span className="me-4 mt-4">Department</span>
            <Select
              id="department"
              value={selecteddpt}
              onChange={handlechangedpt}
              options={filterredoptionDpt}
              className="col-12 col-md-4 me-2  mb-2"
              placeholder=""
              required
              isSearchable={false}
            />
            <span className="me-4 mt-4">  Plan</span>
            <Select
              id="dateRange"
              value={selectedPlan}
              onChange={handleChangePlan}
              options={filteredOptionPlan}
              className="col-12 col-md-4 me-2 mb-2"
              placeholder=""
              required
              isSearchable={false}
            />
            <span className="me-4 mt-4">Date Range</span>
            <Select
              id="dateRange"
              value={Date}
              onChange={handlechangedate}
              options={filterredoptionDate}
              className="col-12 col-md-4 me-2 mb-2"
              placeholder=""
              required
              isSearchable={false}
            />
            {Date?.label === "Custom date" && (
              <div className="">
                <span className="me-4 mt-1">From</span>
                <input
                  type="date"
                  value={startdate}
                  onChange={handleCustomDatestart}
                  className="col-md-4 col-10 form-control me-2  mt-3 "
                  isSearchable={false}
                />
                <span className="me-4 mt-1 ">To</span>
                <input
                  type="date"
                  value={enddate}
                  onChange={handleCustomDateend}
                  className="col-md-4 col-10 form-control me-2 mb-3 mt-3 "
                  isSearchable={false}
                />
              </div>
            )}
            <div className="col-md-3 mb-3">
              <button className="p-2 me-3 ps-3 pe-3" title='Export Excel' onClick={handleExportExcelRating}>
                <FontAwesomeIcon icon={faFileExcel} />
              </button>
              <button className="p-2 me-3 ps-3 pe-3" title='Print' onClick={handlePrintRating}>
                <FontAwesomeIcon icon={faPrint} />
              </button>
            </div>
            <div
              className="ag-theme-alpine"
              style={{ height: 500, width: "100%" }}
            >
              <AgGridReact ref={RatingGridRef} columnDefs={RatingColumns} rowData={rowData} />
            </div>
          </div>
          <div className="col-12 mb-4 mt-3">
            <div className="p-4  border rounded shadow-sm chart">
              <h5 className="mb-3">Remarks</h5>
              <div className="row">
                <div className=" col-12 mb-2">
                  <span className=" ">Date Range</span>
                  <Select
                    id="dateRange"
                    value={RemarksDate}
                    onChange={handlechangeRemarksdate}
                    options={filterredoptionRemarksDate}
                    className="col-12"
                    placeholder=""
                    required
                    data-tip="Please select a payment type"
                    isSearchable={false}
                  />
                </div>
                <div className="col-md-5 mb-0">
                  {RemarksDate?.label === "Custom date" && (
                    <div className="row">
                      <div className="col-md-4">
                        <span className="">From</span>
                        <input
                          type="date"
                          value={remarksStartDate}
                          onChange={handleRemarksCustomDateStart}
                          className=" form-control  "
                        />
                      </div>
                      <div className="col-md-4">
                        <span className="">To</span>
                        <input
                          type="date"
                          value={remarksEndDate}
                          onChange={handleRemarksCustomDatEend}
                          className="form-control"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-12 mb-2">
                  <span className="">Patient Name</span>
                  <input
                    id="department"
                    value={Patient_name}
                    onChange={(e) => setPatient(e.target.value)}
                    className="form-control  col-md-2"
                    placeholder=""
                    type="text"
                    required
                  />
                </div>

                <div className="col-12 mt-0">
                  <span className="">Phone</span>
                  <input
                    id="department"
                    value={PhoneNo}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                      setPhoneNo(numericValue);
                    }}
                    // onChange={(e) => setPhoneNo(e.target.value)}
                    className="form-control  col-md-2"
                    placeholder=""
                    required
                  />
                </div>
                <div className="col-12 mt-0">
                  <span className="">Select Remarks</span>
                  <Select
                    id="department"
                    value={Selectremarks}
                    onChange={handlechangeRemarks}
                    options={filterredoptionRemarks}
                    className=" col-12 mb-2"
                    placeholder=""
                    required
                    isSearchable={false}
                  />
                </div>
                {Selectremarks?.label !== "WithOut Remarks" && (
                  <div className="col-12">
                    <div class="exp-form-floating">
                      <label for="lname" class="exp-form-labels">
                        Search Remarks
                      </label>
                      <input
                        type="text"
                        className="form-control  col-md-2 mb-2"
                        value={searchremarks}
                        onChange={(e) => setsearchremarks(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-3 mb-3 ">
                <button
                  className="p-2 me-3 ps-3 pe-3"
                  onClick={handleSearch}
                  title="Search"
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
                <button
                  className="p-2 me-3 ps-3 pe-3"
                  onClick={handleReload}
                  title="Search"
                >
                  <FontAwesomeIcon icon={faArrowRotateRight} />
                </button>
                <button
                  className="p-2 me-3 ps-3 pe-3"
                  title='Export Excel'
                  onClick={handleExportExcelRemarks}
                >
                  <FontAwesomeIcon icon={faFileExcel} />
                </button>
                <button
                  className="p-2 me-3 ps-3 pe-3"
                  onClick={handlePrintRemarks}
                  title="Print"
                >
                  <FontAwesomeIcon icon={faPrint} />
                </button>
              </div>
              <div
                className="ag-theme-alpine"
                style={{ height: 500, width: "100%" }}
              >
                <AgGridReact
                  ref={gridRef}
                  columnDefs={Remarkscolumns}
                  rowData={rowDataRemarks}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
