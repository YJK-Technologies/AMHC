import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import StarRating from './StarRating.js';
import './FeedbackForm.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import vectorImage from './vector1.jpg';
import config from '../ApiConfig.js';

const FeedbackFromQr = () => {
    // =========================================================
    // BASIC DETAILS STATE
    // =========================================================
    const [patientName, setPatientName] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [plandrop, setplandrop] = useState([]);
    const [genderdrop, setGenderdrop] = useState([]);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);

    const [showBasicDetails, setShowBasicDetails] = useState(true);

    // =========================================================
    // FEEDBACK STATE
    // =========================================================
    const [currentPage, setCurrentPage] = useState(0);
    const [responses, setResponses] = useState({});
    const [direction, setDirection] = useState('');
    const [questions, setQuestions] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [date, setDate] = useState('');

    // =========================================================
    // AUDIO STATE
    // =========================================================
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const maxTime = 30;
    const [timer, setTimer] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    // =========================================================
    // FETCH PLAN & GENDER OPTIONS
    // =========================================================
    useEffect(() => {
        fetch(`${config.apiBaseUrl}/getPlan`)
            .then((res) => res.json())
            .then((data) => setplandrop(data))
            .catch((err) => {
                console.error("Error fetching Plan:", err);
                toast.error("Unable to load Plan options");
            });

        fetch(`${config.apiBaseUrl}/gender`)
            .then((res) => res.json())
            .then((data) => setGenderdrop(data))
            .catch((err) => {
                console.error("Error fetching Gender:", err);
                toast.error("Unable to load Gender options");
            });
    }, []);

    // Format options for react-select
    const planOptions = plandrop
        .filter((opt) => opt.attributedetails_name?.trim().toLowerCase() !== 'all')
        .map((opt) => ({
            value: opt.attributedetails_name,
            label: opt.attributedetails_name,
        }));

    const genderOptions = genderdrop
        .filter((opt) => opt.attributedetails_name?.trim().toLowerCase() !== 'all')
        .map((opt) => ({
            value: opt.attributedetails_name,
            label: opt.attributedetails_name,
        }));

    // =========================================================
    // BASIC DETAILS SUBMIT
    // =========================================================
    const handleBasicDetailsSubmit = async (e) => {
        e.preventDefault();

        if (!patientName.trim()) {
            toast.warning("Please enter Patient Name");
            return;
        }
        if (!phoneNo.trim()) {
            toast.warning("Please enter Phone Number");
            return;
        }
        if (!selectedPlan) {
            toast.warning("Please select Plan");
            return;
        }
        if (!selectedGender) {
            toast.warning("Please select Gender");
            return;
        }

        try {
            const response = await fetch(`${config.apiBaseUrl}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attributeheader_code: selectedPlan.value,
                    descriptions: selectedGender.value,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch feedback questions");

            const data = await response.json();
            setQuestions(data);
            setResponses({});
            setCurrentPage(0);
            setRemarks('');
            setShowBasicDetails(false);
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error("Unable to load feedback questions");
        }
    };

    // =========================================================
    // QUESTION RESPONSE & NAVIGATION
    // =========================================================
    const handleResponseChange = (question, value) => {
        setResponses((prev) => ({
            ...prev,
            [question]: value,
        }));
    };

    const handleNext = () => {
        currentQuestions.forEach((question) => {
            if (responses[question.Questions] === undefined) {
                setResponses((prev) => ({
                    ...prev,
                    [question.Questions]: 0,
                }));
            }
        });

        setDirection('next');
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrevious = () => {
        setDirection('prev');
        setCurrentPage((prev) => prev - 1);
    };

    // =========================================================
    // AUDIO RECORDING LOGIC
    // =========================================================
    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                audioChunks.current = [];
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            setTimer(
                setInterval(() => {
                    setRecordingTime((prev) => {
                        if (prev >= maxTime) {
                            stopRecording();
                            return maxTime;
                        }
                        return prev + 1;
                    });
                }, 1000)
            );
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Microphone access is required for recording.');
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        clearInterval(timer);
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    // =========================================================
    // FINAL SUBMIT
    // =========================================================
    const handleFinalSubmit = async (e) => {
        if (e) e.preventDefault();

        const updatedResponses = { ...responses };
        currentQuestions.forEach((question) => {
            if (updatedResponses[question.Questions] === undefined) {
                updatedResponses[question.Questions] = 0;
            }
        });

        const feedbackData = Object.entries(updatedResponses).map(([key, value]) => ({
            checkup_date: date || new Date().toISOString().split('T')[0],
            SID_no: null,
            patient_name: patientName,
            plans: selectedPlan?.value || '',
            department: key,
            rating: value || 0,
            phone_no: phoneNo,
            gender: selectedGender?.value || '',
        }));

        let commentData = {
            checkup_date: date || new Date().toISOString().split('T')[0],
            SID_no: null,
            patient_name: patientName,
            plans: selectedPlan?.value || '',
            department: 'Comments',
            feedback_comments: remarks,
            audio_comment: null,
            phone_no: phoneNo,
            gender: selectedGender?.value || '',
        };

        if (audioBlob) {
            try {
                const base64Audio = await convertBlobToBase64(audioBlob);
                commentData.audio_comment = base64Audio;
            } catch (error) {
                console.error("Error converting audio:", error);
                toast.error("Error processing audio comment.");
                return;
            }
        }

        feedbackData.push(commentData);

        try {
            const response = await fetch(`${config.apiBaseUrl}/addFeedbackFormtest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savedData: feedbackData }),
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                const errorResponse = await response.json();
                toast.warning(errorResponse.message || 'Failed to save feedback');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Error submitting feedback: ' + error.message);
        }
    };

    const handleClose = () => {
        setIsSubmitted(false);
        setShowBasicDetails(true);
        setPatientName('');
        setPhoneNo('');
        setSelectedPlan(null);
        setSelectedGender(null);
        setQuestions([]);
        setResponses({});
        setRemarks('');
        setAudioBlob(null);
        setAudioUrl(null);
        window.close();
    };

    const myStyle = {
        backgroundImage: `url(${vectorImage})`,
        marginTop: "-70px",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
    };

    // =========================================================
    // RENDER STEP 1: BASIC DETAILS WITH REACT-SELECT
    // =========================================================
    if (showBasicDetails) {
        return (
            <div>
                <div className="feedback-form">
                    <ToastContainer position="top-right" className="toast-design" theme="colored" />

                    <form onSubmit={handleBasicDetailsSubmit} className="qr-basic-form">
                        <h2 className="text-center mb-4 text-white fw-bold">Feedback</h2>

                        {/* Patient Name Field */}
                        <div className="form-group mb-3">
                            <label className="text-white d-block mb-1 fw-semibold">Patient Name</label>
                            <input
                                type="text"
                                className="qr-input-field"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Enter Patient Name"
                                required
                            />
                        </div>

                        {/* Phone Number Field */}
                        <div className="form-group mb-3">
                            <label className="text-white d-block mb-1 fw-semibold">Phone Number</label>
                            <input
                                type="tel"
                                className="qr-input-field"
                                value={phoneNo}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    if (val.length <= 10) setPhoneNo(val);
                                }}
                                placeholder="Enter 10 digit Phone Number"
                                maxLength={10}
                                required
                            />
                        </div>

                        {/* Plan Field */}
                        <div className="form-group mb-3">
                            <label className="text-white d-block mb-1 fw-semibold">Plan</label>
                            <Select
                                options={planOptions}
                                value={selectedPlan}
                                onChange={(option) => setSelectedPlan(option)}
                                placeholder="Select Plan..."
                                isClearable
                                className="qr-select-container"
                                classNamePrefix="qr-select"
                            />
                        </div>

                        {/* Gender Field */}
                        <div className="form-group mb-3">
                            <label className="text-white d-block mb-1 fw-semibold">Gender</label>
                            <Select
                                options={genderOptions}
                                value={selectedGender}
                                onChange={(option) => setSelectedGender(option)}
                                placeholder="Select Gender..."
                                isClearable
                                className="qr-select-container"
                                classNamePrefix="qr-select"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="d-flex justify-content-center mt-4">
                            <button type="submit" className="btn btn-primary Submitbutton w-100 py-2">
                                Continue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (!questions.length) return <div>Loading questions...</div>;

    const startIdx = currentPage * 2;
    const endIdx = startIdx + 2;
    const currentQuestions = questions.slice(startIdx, endIdx);

    // =========================================================
    // RENDER STEP 2: QUESTIONS & UI EXACTLY LIKE FEEDBACKFORM.JS
    // =========================================================
    return (
        <div>
            <div className="feedback-form">
                <ToastContainer position="top-right" className="toast-design" theme="colored" />

                <div className="progress-indicator">
                    {startIdx + 1} - {Math.min(endIdx, questions.length)} of {questions.length}
                </div>

                <form onSubmit={handleFinalSubmit} className={`form-container ${direction}`}>
                    {currentQuestions.map((question) => (
                        <div key={question.Question_No || question.Questions} className={`question ${direction}`}>
                            <p>{question.Questions}</p>
                            <StarRating
                                rating={responses[question.Questions] || 0}
                                onChange={(value) => handleResponseChange(question.Questions, value)}
                            />
                        </div>
                    ))}

                    {currentPage === Math.ceil(questions.length / 2) - 1 && (
                        <div className="remarks-container">
                            <div className="mic-container">
                                <div className='col-4'>
                                    <div className="recording-time">
                                        <p>{isRecording ? `${formatTime(recordingTime)}` : ''}</p>
                                    </div>
                                    <div className={`circle ms-2 ${isRecording ? 'active' : ''}`} onClick={toggleRecording}>
                                        <FontAwesomeIcon className='icon' icon={faMicrophone} size='3x' />
                                    </div>
                                </div>
                            </div>

                            {audioUrl && (
                                <div className="audio-preview">
                                    <p>Recorded Audio:</p>
                                    <audio controls src={audioUrl} type="audio/webm"></audio>
                                </div>
                            )}

                            <label htmlFor="remarks" className="comments-label">Comments:</label>
                            <textarea
                                id="remarks"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows="4"
                                placeholder="Enter your comments here..."
                                className="remarks-textarea"
                            />
                        </div>
                    )}

                    <div className="d-flex justify-content-between gap-2">
                        <div className='d-flex justify-content-start'>
                            {currentPage > 0 && (
                                <div className="btn btn-primary Submitbutton p-2" onClick={handlePrevious}>
                                    Back
                                </div>
                            )}
                        </div>

                        <div className='d-flex justify-content-end'>
                            {currentPage < Math.ceil(questions.length / 2) - 1 ? (
                                <div
                                    className="btn btn-primary Submitbutton p-2"
                                    onClick={handleNext}
                                    disabled={currentQuestions.some(q => responses[q.Questions] === undefined)}
                                >
                                    Next
                                </div>
                            ) : (
                                <div
                                    className="btn btn-primary Submitbutton p-2"
                                    onClick={handleFinalSubmit}
                                    disabled={questions.some(q => !responses[q.Questions])}
                                >
                                    Submit
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {isSubmitted && (
                    <div className="thank-you-modal p-3">
                        <div className="modal-content2 p-3" style={myStyle}>
                            <div className='p-3'>
                                <h2 align="center" style={{ color: "black" }}>Thank You!</h2>
                                <p style={{ color: "black" }}>Your feedback has been submitted successfully.</p>
                                <button align="center" className="p-2 btn btn-primary" onClick={handleClose}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackFromQr;