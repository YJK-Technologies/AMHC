// controllers/dataController.js
const sql = require("mssql");
const connection = require("../connection/connection");
const dbConfig = require("../config/dbConfig");
const CryptoJS = require('crypto-js');
const twilio = require("twilio");
const multer = require('multer')
const http = require("http");
const https = require('https');
const querystring = require('querystring');
const upload = multer({ storage: multer.memoryStorage() });

const accountSid = "AC310b839363f201619504003725860286";
const authToken = "1641d6484f33fb67790da17909dce534";
const twilioClient = twilio(accountSid, authToken);



const login = async (req, res) => {
  const { user_code, user_password } = req.body;
  const secretKey = 'yjk26012024';

  try {
    // Decrypt user_code and user_password
    const decryptedUserCode = CryptoJS.AES.decrypt(user_code, secretKey).toString(CryptoJS.enc.Utf8);
    const decryptedPassword = CryptoJS.AES.decrypt(user_password, secretKey).toString(CryptoJS.enc.Utf8);

    // Check if the user exists in the database based on decryptedUserCode
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "LUC")
      .input("user_code", sql.NVarChar, decryptedUserCode)
      .input("user_password", sql.NVarChar, decryptedPassword)
      .query(`EXEC [SP_user_info_hdr] 'LUC',@user_code,'','','',@user_password,'','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    if (!result.recordset[0]) {
      // User not found
      return res.status(401).json({ message: "Invalid usercode" });
    } else {
      const user = result.recordset[0]; // Assuming the first record is the user data
      // Check if the provided user_password matches the one in the database
      if (user.user_password !== decryptedPassword) {
        // Passwords don't match
        return res.status(401).json({ message: "Invalid password" });
      } else {
        // Both username and password are validated successfully
        if (result.recordset.length > 0) {
          res.status(200).json(result.recordset); // 200 OK if data is found
        } else {
          res.status(404).send("Data not found"); // 404 Not Found if no data is found
        }
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    // Close the connection
    await sql.close();
  }
};

//Code Added by Harish 29/10/2024

const getStatus = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      `EXEC sp_attribute_Info 'F','','status','','', '' , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const addattrihdrData = async (req, res) => {
  const {
    company_code,
    attributeheader_code,
    attributeheader_name,
    status,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("mode", sql.NVarChar, "I")
      .input("company_code", sql.NVarChar, company_code)
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .input("attributeheader_name", sql.NVarChar, attributeheader_name)
      .input("status", sql.NVarChar, status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC sp_attribute_hdr @mode,@company_code,@attributeheader_code,@attributeheader_name,@status,@created_by,@modified_by,@tempstr1,@tempstr2,@tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const geattrihdrcode = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'TS','','', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const addattridetData = async (req, res) => {
  const {
    company_code,
    attributeheader_code,
    attributedetails_code,
    attributedetails_name,
    descriptions,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  try {
    // Input validation
    if (!attributeheader_code) {
      return res.status(400).json({ error: 'Attribute Header Code cannot be blank' });
    }

    // Establish connection to the database
    const pool = await sql.connect(dbConfig);

    // Execute the stored procedure
    const result = await pool.request()
      .input('mode', sql.NVarChar, 'I') // Insert mode
      .input("company_code", sql.NVarChar, company_code)
      .input('attributeheader_code', sql.NVarChar, attributeheader_code)
      .input('attributedetails_code', sql.NVarChar, attributedetails_code)
      .input('attributedetails_name', sql.NVarChar, attributedetails_name)
      .input('descriptions', sql.NVarChar, descriptions)
      .input('created_by', sql.NVarChar, created_by)
      .input('modified_by', sql.NVarChar, modified_by)
      .input('tempstr1', sql.NVarChar, tempstr1)
      .input('tempstr2', sql.NVarChar, tempstr2)
      .input('tempstr3', sql.NVarChar, tempstr3)
      .input('tempstr4', sql.NVarChar, tempstr4)
      .input('datetime1', sql.NVarChar, datetime1)
      .input('datetime2', sql.NVarChar, datetime2)
      .input('datetime3', sql.NVarChar, datetime3)
      .input('datetime4', sql.NVarChar, datetime4)
      .query(
        `EXEC sp_attribute_Info @mode,@company_code,@attributeheader_code, @attributedetails_code,@attributedetails_name,@descriptions,@created_by,@modified_by,@tempstr1, @tempstr2, @tempstr3, @tempstr4, 
              @datetime1, @datetime2, @datetime3, @datetime4`
      );
    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ message: error.message || "Internal Server Error" });

  }
};

const getattributeSearchdata = async (req, res) => {
  const { attributeheader_code, attributedetails_code, attributedetails_name, descriptions } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .input("attributedetails_code", sql.NVarChar, attributedetails_code)
      .input("attributedetails_name", sql.NVarChar, attributedetails_name)
      .input("descriptions", sql.NVarChar, descriptions)
      .query(`EXEC sp_attribute_Info 'SC','',@attributeheader_code,@attributedetails_code,@attributedetails_name,@descriptions,'','','','','','','','','',''
              `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deleteAttriDetailData = async (req, res) => {
  const { attributeheader_codesToDelete, attributedetails_codeToDelete } = req.body;

  if (!attributeheader_codesToDelete || !attributeheader_codesToDelete.length || !attributedetails_codeToDelete || !attributedetails_codeToDelete.length) {
    res.status(400).send("Invalid or empty Codes or codeDetails array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    const deleteQuery = `EXEC sp_attribute_Info 'D',@company_code,@attributeheader_code, @attributedetails_code,'','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
            `;
    for (let i = 0; i < attributeheader_codesToDelete.length; i++) {
      try {
        await pool.request()
          .input("attributeheader_code", attributeheader_codesToDelete[i])
          .input("attributedetails_code", attributedetails_codeToDelete[i])
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .input("company_code", sql.NVarChar, req.headers['company_code'])
          .query(deleteQuery);
      } catch (error) {
        if (error.number === 50000) {
          // Foreign key constraint violation
          res.status(400).send("The attribute cannot be deleted due to a link with another record");
          return;
        } else {
          throw error; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).send("Attribute data deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send(err.message || "Internal Server Error");

  }
};

const updattridetData = async (req, res) => {
  const { attributeheader_codesToUpdate, attributedetails_codesToUpdate, updatedData } = req.body;

  if (!attributeheader_codesToUpdate || !attributeheader_codesToUpdate.length ||
    !attributedetails_codesToUpdate || !attributedetails_codesToUpdate.length ||
    !updatedData || !updatedData.length) {
    res.status(400).send("Invalid or empty input data.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (let i = 0; i < attributeheader_codesToUpdate.length; i++) {
      const updatedRow = updatedData[i]; // Assuming updatedData is an array of objects with updated values

      await pool.request()
        .input("mode", sql.NVarChar, "U")
        .input("company_code", sql.NVarChar, req.headers['company_code'])
        .input("attributeheader_code", attributeheader_codesToUpdate[i])
        .input("attributedetails_code", attributedetails_codesToUpdate[i])
        .input("attributedetails_name", sql.NVarChar, updatedRow.attributedetails_name)
        .input("descriptions", sql.NVarChar, updatedRow.descriptions)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC sp_attribute_Info @mode,@company_code, @attributeheader_code, @attributedetails_code, @attributedetails_name, @descriptions, @created_by,@modified_by, @tempstr1, @tempstr2, @tempstr3, @tempstr4, @datetime1, @datetime2, @datetime3, @datetime4`
        );
    }

    res.status(200).send("Updated data successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send(err.message || "Internal Server Error");

  }
};


//Code Ended by Harish 29/10/2024

const getQuetions = async (req, res) => {
  const { attributeheader_code, descriptions } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "FT")
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .input("descriptions", sql.NVarChar, descriptions)
      .query(`EXEC sp_attribute_Info @mode,'',@attributeheader_code,'','', @descriptions , '','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};


const getGender = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'F','','Gender','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const addformdata = async (req, res) => {
  const {
    id,
    patient_name,
    checkup_date,
    phone_no,
    department,
    rating,
    feedback_comments,
    feedback_date,
    staff_member,
    resolved_status,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("mode", sql.NVarChar, "I")
      .input("id", sql.Int, id)
      .input("patient_name", sql.NVarChar, patient_name)
      .input("checkup_date", sql.Date, checkup_date)
      .input("phone_no", sql.NVarChar, phone_no)
      .input("department", sql.NVarChar, department)
      .input("rating", sql.Int, rating)
      .input("feedback_comments", sql.Text, feedback_comments)
      .input("feedback_date", sql.Date, feedback_date)
      .input("staff_member", sql.NVarChar, staff_member)
      .input("resolved_status", sql.TinyInt, resolved_status)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC sp_Feedback_Form @mode,0,@patient_name,@checkup_date,@phone_no,@department,@rating,@feedback_comments,@feedback_date,@staff_member,@resolved_status,'', @created_by,@modified_by, @tempstr1, @tempstr2, @tempstr3, @tempstr4, @datetime1, @datetime2, @datetime3, @datetime4`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Form already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).send(err.message || "Internal Server Error");

    }
  }
};

const deleteformdata = async (req, res) => {
  const keyfieldsToDelete = req.body.keyfields;

  if (!keyfieldsToDelete || !keyfieldsToDelete.length) {
    res.status(400).send("Invalid or empty company_nos array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const keyfield of keyfieldsToDelete) {
      try {
        await pool.request().input("keyfield", keyfield)
          .query(`
                  EXEC sp_Feedback_Form 'i',0,'kathir','2024/06/24','9361934394','bloodcells',1,'not good','2024/06/25','Pavun',0,'ak','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL

                  `);
      } catch (error) {
        if (error.number === 547) {
          // Foreign key constraint violation
          res.status(400).send(error.message);
          return;
        } else {
          throw error; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).send("FormData deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const AddReport = async (req, res) => {
  const { SID_no, plans, patient_name, checkup_date, phone_no, gender, created_by } = req.body;

  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I")
      .input("SID_no", sql.Int, SID_no)
      .input("plans", sql.VarChar, plans)
      .input("patient_name", sql.NVarChar, patient_name)
      .input("checkup_date", sql.Date, checkup_date)
      .input("phone_no", sql.NVarChar, phone_no)
      .input("gender", sql.NVarChar, gender)
      .input("created_by", sql.NVarChar, created_by)
      .query(`EXEC sp_patient_list @mode,@SID_no,@plans,@patient_name,@checkup_date,@phone_no,@gender,'','','',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      res.status(200).json({
        message: "Data inserted successfully",
      })
    } else {
      res.status(404).send("Data not found");
    }
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });

  }
};

const getpatientdata = async (req, res) => {
  const { SID_no, patient_name, checkup_date, phone_no, gender, msg_prefernce, msg_status, plans } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("SID_no", sql.Int, SID_no)
      .input("plans", sql.VarChar, plans)
      .input("patient_name", sql.NVarChar, patient_name)
      .input("checkup_date", sql.NVarChar, checkup_date)
      .input("phone_no", sql.NVarChar, phone_no)
      .input("gender", sql.NVarChar, gender)
      .input("msg_prefernce", sql.NVarChar, msg_prefernce)
      .input("msg_status", sql.NVarChar, msg_status)
      .query(`
         EXEC sp_patient_list @mode,@SID_no,@plans,@patient_name,@checkup_date,@phone_no,@gender,@msg_prefernce,@msg_status,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};





const deletePatientData = async (req, res) => {
  const { SID_nos } = req.body;
  try {
    if (!SID_nos || !Array.isArray(SID_nos) || SID_nos.length === 0) {
      return res.status(400).json({ error: 'SID_nos is required and should be a non-empty array' });
    }
    const pool = await connection.connectToDatabase();
    for (const SID_no of SID_nos) {
      await pool.request()
        .input("SID_no", sql.Int, SID_no)
        .query(`EXEC sp_patient_list 'D', @SID_no, '', '', '', '', '', '', '', '', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL`);
    }
    res.status(200).send("Patient data deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An error occurred while deleting the patient data'
    });
  }
};



const addFeedbackForm = async (req, res) => {
  const savedData = req.body.savedData;



  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of savedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "I")
        .input("patient_name", updatedRow.patient_name)
        .input("checkup_date", updatedRow.checkup_date)
        .input("phone_no", updatedRow.phone_no)
        .input("department", updatedRow.department)
        .input("rating", updatedRow.rating)
        .input("feedback_comments", updatedRow.feedback_comments)
        .input("feedback_date", updatedRow.feedback_date)
        .input("staff_member", updatedRow.staff_member)
        .input("resolved_status", updatedRow.resolved_status)
        .input("created_by", updatedRow.created_by)
        .query(`EXEC sp_Feedback_Form @mode,@patient_name,@checkup_date,@phone_no,@department,@rating,@feedback_comments,@feedback_date,@staff_member,@resolved_status,'','', @created_by,'', '', '', '', '', '', '', '', ''`);
    }

    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const Sms = async (req, res) => {
  const { to, message } = req.body;

  const twilioFromNumber = "+917904460297";

  try {
    const messageResponse = await twilioClient.messages.create({
      body: message,
      from: twilioFromNumber,
      to: to,
    });

    res.status(200).json({ success: true, message: "Message sent!", sid: messageResponse.sid });
  } catch (error) {
    console.error("Twilio error:", error);
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};


//Code Added by Harish on 02-11-2024
const getDashboard = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "L3M") // Insert mode
      .input("department", sql.NVarChar, department)
      .input("plans", sql.NVarChar, plans)
      .query(`EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getdepartement = async (req, res) => {
  const { attributeheader_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "DD")
      .input("attributeheader_code", sql.NVarChar, attributeheader_code)
      .query("EXEC sp_attribute_Info @mode,'',@attributeheader_code,'','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL");
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getDashboardLW = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "LW") // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(` EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });

  }
};


const getDashboardCY = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "cy") // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(`EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getDashboardL6M = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "L6M") // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(` EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getDashboardCD = async (req, res) => {
  const { department, startdate, enddate, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CD") // Insert mode
      .input("startdate", sql.Date, startdate) // Insert mode
      .input("enddate", sql.Date, enddate) // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(`EXEC sp_masterhealth_dashboard_dept @mode,@startdate,@enddate,@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getaverage = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC  sp_Avg_rating_masterhealth"
    );
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getDaterange = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'DR','',' Date Range','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getplan = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'F','','Plan','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};



const getDashboardLY = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "LY") // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(` EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

//Code ENDED BY HARISH on 02-11-2024

const Chart = async (req, res) => {
  const { mode, CustomStartDate, CustomEndDate } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("CustomStartDate", sql.NVarChar, CustomStartDate)
      .input("CustomEndDate", sql.NVarChar, CustomEndDate)
      .query(`EXEC sp_dashboard_chart @mode,@CustomStartDate,@CustomEndDate`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset);
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


//Code Added BY HARISH on 07-11-2024


const adduserscreenmap = async (req, res) => {
  const {
    role_id,
    screen_type,
    permission_type,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("role_id", sql.VarChar, role_id)
      .input("screen_type", sql.NVarChar, screen_type)
      .input("permission_type", sql.VarChar, permission_type)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(
        `EXEC sp_rolescreen_mapping @mode,@role_id, @screen_type,@permission_type,'',@created_by,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getRoleIDDrop = async (req, res) => {
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "F")
      .query(`EXEC sp_role_info @mode,'','','','','',null,null,null,null,null,null,null,null`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getRoleRights = async (req, res) => {
  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "RF")
      .query(`EXEC sp_rolescreen_mapping @mode,'','','','','',null,null,null,null,null,null,null,null,null`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};






const getAlluserscreenmap = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_rolescreen_mapping 'A','','','','','','',
                    null,null,null,null,null,null,null,null`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const userscreenmapdeleteData = async (req, res) => {
  const keyfieldsToDelete = req.body.keyfield;

  // if (!keyfieldsToDelete || !keyfieldsToDelete.length) {
  //   res.status(400).send("Invalid or empty company_nos array.");
  //   return;
  // }

  try {
    const pool = await connection.connectToDatabase();

    for (const keyfield of keyfieldsToDelete) {
      try {
        await pool.request().input("keyfield", keyfield)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`EXEC sp_rolescreen_mapping 'D','','','',@keyfield,'',@modified_by,null,null,null,null,null,null,null,null`);
      } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send(err.message || "Internal Server Error");

      }
    }

    res.status(200).send("User screen mapping deleted successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send(err.message || "Internal Server Error");

  }
};

const saveEditeduserscreenmap = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).send("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("role_id", updatedRow.role_id)
        .input("screen_type", updatedRow.screen_type)
        .input("permission_type", updatedRow.permission_type)
        .input("keyfield", updatedRow.keyfield)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", updatedRow.tempstr1)
        .input("tempstr2", updatedRow.tempstr2)
        .input("tempstr3", updatedRow.tempstr3)
        .input("tempstr4", updatedRow.tempstr4)
        .input("datetime1", updatedRow.datetime1)
        .input("datetime2", updatedRow.datetime2)
        .input("datetime3", updatedRow.datetime3)
        .input("datetime4", updatedRow.datetime4)
        .query(`EXEC sp_rolescreen_mapping @mode, @role_id, @screen_type, @permission_type, @keyfield,'', @modified_by,  
             @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
            @datetime1, @datetime2, @datetime3, @datetime4`);
    }

    res.status(200).send("Edited data saved successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getuserscreensearchdata = async (req, res) => {
  const { role_id, screen_type, permission_type } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("role_id", sql.VarChar, role_id)
      .input("screen_type", sql.NVarChar, screen_type)
      .input("permission_type", sql.NVarChar, permission_type)
      .query(`EXEC sp_rolescreen_mapping @mode,@role_id,@screen_type,@permission_type,'','','',
null,null,null,null,null,null,null,null`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getUserPermission = async (req, res) => {
  const { role_id } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "UP")
      .input("role_id", sql.NVarChar, role_id)
      .query(`EXEC sp_rolescreen_mapping @mode,@role_id,'','','','','',null,null,null,null,null,null,null,null
    `);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};



const AddRoleInfoData = async (req, res) => {
  const {

    role_id,
    role_name,
    description,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I") // Insert mode
      .input("role_id", sql.NVarChar, role_id)
      .input("role_name", sql.NVarChar, role_name)
      .input("description", sql.NVarChar, description)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC sp_role_info @mode, @role_id,
            @role_name,@description,
            @created_by,@modified_by,
            @tempstr1, @tempstr2, @tempstr3, @tempstr4, 
            @datetime1, @datetime2, @datetime3, @datetime4`
      );

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Role already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).send(error.message || "Internal Server Error");

    }
  }
};

const getAllRoleInfoData = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(`EXEC sp_role_Info 'A','','','','','','','','','','','','',''`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send(err.message || "Internal Server Error");

  }
};


const roledeleteData = async (req, res) => {
  const role_idsToDelete = req.body.role_ids;

  if (!role_idsToDelete || !role_idsToDelete.length) {
    res.status(400).send("Invalid or empty RoleID array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const role_id of role_idsToDelete) {
      try {
        await pool.request().input("role_id", role_id)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`
          EXEC sp_Role_Info 'D',@role_id,'','','',@modified_by,
        NULL, NULL, NULL, NULL,NULL, NULL, NULL, NULL
          `);
      } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send(err.message || "Internal Server Error");

      }
    }

    res.status(200).send("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  } finally {
    connection.closeDatabaseConnection();
  }
};

const RolesaveEditedData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).send("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U") // update mode
        .input("role_id", sql.NVarChar, updatedRow.role_id)
        .input("role_name", sql.NVarChar, updatedRow.role_name)
        .input("description", sql.NVarChar, updatedRow.description)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(
          `EXEC sp_Role_Info @mode,@role_id,@role_name,@description,@created_by,@modified_by,@tempstr1,@tempstr2,
            @tempstr3,@tempstr4,@datetime1,@datetime2,@datetime3,@datetime4
            `
        );
    }

    res.status(200).send("Edited data saved successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send(err.message || "Internal Server Error");

  }
};


const getRolesearchdata = async (req, res) => {
  const { role_id, role_name } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("role_id", sql.NVarChar, role_id)
      .input("role_name", sql.NVarChar, role_name)
      .query(`EXEC sp_Role_Info @mode,@role_id,@role_name,'','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


//Code Ended by harish 07/11/2024

//Code Added by harish 08/11/2024

const getroleid = async (req, res) => {
  const { company_code } = req.body;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("company_code", sql.NVarChar, company_code)
      .query(
        `EXEC sp_role_info 'F','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};


const getScreens = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'F','','Screens','',' ', ' ','','' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getpermission = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'F','','Permission','',' ', ' ','','' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getRemarks = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'F','','Remarks','',' ', ' ','','' , NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

// Code Ended By harish 08/11/2024


const getLoginorout = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'F','','Log IN/OUT','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getUserRole = async (req, res) => {
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .query(
        `EXEC sp_role_info 'UR','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
      );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getUsertype = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      `EXEC sp_attribute_Info 'F','','User Type', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
        `
    );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const userAddData = async (req, res) => {
  const { user_code, user_name, first_name, last_name, user_password, user_status, log_in_out, user_type, email_id, dob, gender,
    role_id, created_by, modified_by, tempstr1, tempstr2, tempstr3, tempstr4, datetime1, datetime2, datetime3, datetime4 } = req.body;

  let user_img = null;

  if (req.file) {
    user_img = req.file.buffer;
  }
  try {
    pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "I")
      .input("user_code", sql.NVarChar, user_code)
      .input("user_name", sql.NVarChar, user_name)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("user_password", sql.NVarChar, user_password)
      .input("user_status", sql.NVarChar, user_status)
      .input("log_in_out", sql.NVarChar, log_in_out)
      .input("user_type", sql.NVarChar, user_type)
      .input("email_id", sql.NVarChar, email_id)
      .input("dob", sql.NVarChar, dob)
      .input("gender", sql.NVarChar, gender)
      .input("role_id", sql.NVarChar, role_id)
      .input("user_img", sql.VarBinary, user_img)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC SP_user_info_hdr @mode,@user_code,@user_name,@first_name,@last_name,@user_password,@user_status,@log_in_out,@user_type,@email_id,@dob,@gender,@role_id,@user_img,@created_by,@modified_by,
          @tempstr1, @tempstr2, @tempstr3, @tempstr4,@datetime1, @datetime2, @datetime3, @datetime4`);
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (err) {
    console.error("Error inserting data:", err);

    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

const getUsersearchdata = async (req, res) => {
  const { user_code, user_name, first_name, last_name, user_status, email_id, dob, gender, role_id, user_img } = req.body;

  try {
    // Connect to the database
    const pool = await connection.connectToDatabase();

    // Execute the query
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SC")
      .input("user_code", sql.NVarChar, user_code)
      .input("user_name", sql.NVarChar, user_name)
      .input("first_name", sql.NVarChar, first_name)
      .input("last_name", sql.NVarChar, last_name)
      .input("user_status", sql.NVarChar, user_status)
      .input("email_id", sql.NVarChar, email_id)
      .input("dob", sql.NVarChar, dob)
      .input("gender", sql.NVarChar, gender)
      .input("role_id", sql.NVarChar, role_id)
      .input("user_img", sql.NVarChar, user_img)
      .query(` EXEC SP_user_info_hdr @mode,@user_code,@user_name,@first_name,@last_name,'',@user_status,'','',@email_id,@dob,@gender,@role_id,@user_img,'','','','','','','','','',''`);

    // Send response
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const UserdeleteData = async (req, res) => {
  const user_codesToDelete = req.body.user_codes;

  if (!user_codesToDelete || !user_codesToDelete.length) {
    res.status(400).send("Invalid or empty user_codes array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase();

    for (const user_code of user_codesToDelete) {
      try {
        await pool.request()
          .input("user_code", user_code)
          .input("modified_by", sql.NVarChar, req.headers['modified-by'])
          .query(`EXEC SP_user_info_hdr 'D',@user_code,'','','','', '', '', '','','', '','','','',@modified_by,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
      } catch (error) {
        if (error.number === 50000) {
          // Foreign key constraint violation
          res.status(400).send("The user cannot be deleted due to a link with another record");
          return;
        } else {
          throw error; // Rethrow other SQL errors
        }
      }
    }

    res.status(200).send("user deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const UsersaveEditedData = async (req, res) => {
  const editedData = req.body.editedData;

  if (!editedData || !editedData.length) {
    res.status(400).send("Invalid or empty editedData array.");
    return;
  }

  try {
    const pool = await connection.connectToDatabase(dbConfig);

    for (const updatedRow of editedData) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "U")
        .input("user_code", sql.NVarChar, updatedRow.user_code)
        .input("user_name", sql.NVarChar, updatedRow.user_name)
        .input("first_name", sql.NVarChar, updatedRow.first_name)
        .input("last_name", sql.NVarChar, updatedRow.last_name)
        .input("user_password", sql.NVarChar, updatedRow.user_password)
        .input("user_status", sql.NVarChar, updatedRow.user_status)
        .input("log_in_out", sql.NVarChar, updatedRow.log_in_out)
        .input("user_type", sql.NVarChar, updatedRow.user_type)
        .input("email_id", sql.NVarChar, updatedRow.email_id)
        .input("dob", sql.NVarChar, updatedRow.dob)
        .input("gender", sql.NVarChar, updatedRow.gender)
        .input("role_id", sql.NVarChar, updatedRow.role_id)
        .input("created_by", sql.NVarChar, updatedRow.created_by)
        .input("modified_by", sql.NVarChar, req.headers['modified-by'])
        .input("tempstr1", sql.NVarChar, updatedRow.tempstr1)
        .input("tempstr2", sql.NVarChar, updatedRow.tempstr2)
        .input("tempstr3", sql.NVarChar, updatedRow.tempstr3)
        .input("tempstr4", sql.NVarChar, updatedRow.tempstr4)
        .input("datetime1", sql.NVarChar, updatedRow.datetime1)
        .input("datetime2", sql.NVarChar, updatedRow.datetime2)
        .input("datetime3", sql.NVarChar, updatedRow.datetime3)
        .input("datetime4", sql.NVarChar, updatedRow.datetime4)
        .query(`EXEC SP_user_info_hdr @mode, @user_code, @user_name, @first_name, @last_name,@user_password, @user_status, @log_in_out, @user_type, @email_id, @dob, @gender,@role_id,'', @created_by,  
              @modified_by, @tempstr1, @tempstr2, @tempstr3,@tempstr4, @datetime1, @datetime2, @datetime3, @datetime4`);
    }
    res.status(200).send("Edited data saved successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const UpdateUserImage = async (req, res) => {
  const { user_code } = req.body;

  let user_img = null;

  if (req.file) {
    user_img = req.file.buffer;
  }

  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("user_code", sql.NVarChar, user_code)
      .input("user_img", sql.VarBinary, user_img)
      .query(`EXEC [SP_user_info_hdr] 'UIU',@user_code,'','','','','','','','','','','',@user_img,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Item already exists', error: error.message });
    } else {
      // Handle unexpected errors
      res.status(500).json({ message: error.message || "Internal Server Error" });

    }
  }
};


const addformdataTest = async (req, res) => {
  const {
    patient_name,
    checkup_date,
    phone_no,
    department,
    rating,
    feedback_comments,
    feedback_date,
    staff_member,
    resolved_status,
    created_by,
    modified_by,
    tempstr1,
    tempstr2,
    tempstr3,
    tempstr4,
    datetime1,
    datetime2,
    datetime3,
    datetime4,
  } = req.body;

  let audio_comment = null;

  if (req.file) {
    audio_comment = req.file.buffer; // Buffer containing the uploaded image
  }

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input("mode", sql.NVarChar, "I")
      .input("patient_name", sql.NVarChar, patient_name)
      .input("checkup_date", sql.Date, checkup_date)
      .input("phone_no", sql.NVarChar, phone_no)
      .input("department", sql.NVarChar, department)
      .input("rating", sql.Int, rating)
      .input("feedback_comments", sql.Text, feedback_comments)
      .input("feedback_date", sql.Date, feedback_date)
      .input("staff_member", sql.NVarChar, staff_member)
      .input("resolved_status", sql.TinyInt, resolved_status)
      .input("audio_comment", sql.VarBinary, audio_comment)
      .input("created_by", sql.NVarChar, created_by)
      .input("modified_by", sql.NVarChar, modified_by)
      .input("tempstr1", sql.NVarChar, tempstr1)
      .input("tempstr2", sql.NVarChar, tempstr2)
      .input("tempstr3", sql.NVarChar, tempstr3)
      .input("tempstr4", sql.NVarChar, tempstr4)
      .input("datetime1", sql.NVarChar, datetime1)
      .input("datetime2", sql.NVarChar, datetime2)
      .input("datetime3", sql.NVarChar, datetime3)
      .input("datetime4", sql.NVarChar, datetime4)
      .query(`EXEC sp_Feedback_Form @mode,@patient_name,@checkup_date,@phone_no,@department,@rating,@feedback_comments,@feedback_date,@staff_member,@resolved_status,'',@audio_comment,@created_by,@modified_by, @tempstr1, @tempstr2, @tempstr3, @tempstr4, @datetime1, @datetime2, @datetime3, @datetime4`);

    // Return success response
    if (result.rowsAffected && result.rowsAffected[0] > 0) {
      return res.status(200).json({ success: true, message: 'Data inserted successfully' });
    }
  } catch (error) {
    if (error.class === 16 && error.number === 50000) {
      // Custom error from the stored procedure
      res.status(400).json({ message: 'Form already exists' });
    } else {
      // Handle unexpected errors
      res.status(500).send(error.message || "Internal Server Error");

    }
  }
};


const addFeedbackFormtest = async (req, res) => {
  const savedData = req.body.savedData;
  if (!savedData || !savedData.length) {
    res.status(400).send("Invalid or empty savedData array.");
    return;
  }
  try {
    const pool = await connection.connectToDatabase();
    for (const updatedRow of savedData) {
      let audioComment = updatedRow.audio_comment || null;
      if (audioComment) {
        const buffer = Buffer.from(audioComment, 'base64');
        audioComment = buffer;
      }
      await pool
        .request()
        .input("mode", sql.NVarChar, "I")
        .input("patient_name", updatedRow.patient_name)
        .input("checkup_date", updatedRow.checkup_date)
        .input("phone_no", updatedRow.phone_no)
        .input("department", updatedRow.department)
        .input("rating", updatedRow.rating)
        .input("feedback_comments", updatedRow.feedback_comments)
        .input("feedback_date", updatedRow.feedback_date)
        .input("staff_member", updatedRow.staff_member)
        .input("resolved_status", updatedRow.resolved_status)
        .input("audio_comment", audioComment)  // Use audioComment from updatedRow
        .input("SID_no", updatedRow.SID_no)
        .input("plans", updatedRow.plans)
        .input("created_by", updatedRow.created_by)
        .query(`
                  EXEC sp_Feedback_Form
                    @mode, @patient_name, @checkup_date, @phone_no, @department, @rating,
                    @feedback_comments, @feedback_date, @staff_member, 0,'', @audio_comment,@SID_no,@plans,@created_by, '', '', '', '', '', '', '', '',''
                `);
    }
    res.json({ success: true, message: "Data inserted successfully" });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getRemarks_Dashboard = async (req, res) => {
  const { mode, start_date, end_date, remarks, patient_name, phone_no, remarkstype } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("start_date", sql.NVarChar, start_date)
      .input("end_date", sql.NVarChar, end_date)
      .input("remarks", sql.NVarChar, remarks)
      .input("patient_name", sql.NVarChar, patient_name)
      .input("phone_no", sql.NVarChar, phone_no)
      .input("remarkstype", sql.NVarChar, remarkstype)
      .query(`EXEC sp_remarks @mode,@start_date,@end_date,@remarks,@patient_name,@phone_no,@remarkstype`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found");  // 404 if no data found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getratingdetails = async (req, res) => {
  const { date, department } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "RR")
      .input("date", sql.NVarChar, date)
      .input("department", sql.NVarChar, department)
      .query(`EXEC sp_dashboard_rating_details @mode,@date,@department`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const GenderChart = async (req, res) => {
  const { mode, CustomStartDate, CustomEndDate } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, mode)
      .input("CustomStartDate", sql.NVarChar, CustomStartDate)
      .input("CustomEndDate", sql.NVarChar, CustomEndDate)
      .query(`EXEC sp_dashboard_gender_chart @mode,@CustomStartDate,@CustomEndDate`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const GetdashpatientCount = async (req, res) => {
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PC")
      .query(`EXEC sp_dashboard_patient_count @mode,''`);
    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        TPCM: result.recordsets[0],
        SPCM: result.recordsets[1] || [],
      };
      res.status(200).json(data);
    } else {
      res.status(404).send("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const GetdashfeedpatientCount = async (req, res) => {
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "FC")
      .query(`EXEC sp_dashboard_patient_count @mode,''`);
    if (result.recordsets && result.recordsets.length > 0 && result.recordsets[0].length > 0) {
      const data = {
        TPCM: result.recordsets[0],
        SPCM: result.recordsets[1] || [],
      };
      res.status(200).json(data);
    } else {
      res.status(404).send("Data not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getdashbestdept = async (req, res) => {
  const { plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "BD")
      .input("plans", sql.NVarChar, plans)
      .query(`EXEC sp_dashboard_patient_count @mode,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const getdashpoordept = async (req, res) => {
  const { plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "PD")
      .input("plans", sql.NVarChar, plans)
      .query(`EXEC sp_dashboard_patient_count @mode,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).json("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message || "Internal Server Error");
  }
};


//   const sendSMS = async (req, res) => {
//     try {
//         const { phoneNumber, textMessage } = req.body;

//         if (!phoneNumber || !textMessage) {
//             return res.status(400).json({ error: "Phone number and text message are required." });
//         }

//         const apiKey = "SyDRBwUYBUifknCNSW2P9A";
//         const senderId = "AVVAJK";
//         const smsApiHost = "admin.avvainexs.com";

//         const params = new URLSearchParams({
//             APIKey: apiKey,
//             senderid: senderId,
//             channel: "2",
//             DCS: "0",
//             flashsms: "0",
//             number: phoneNumber,
//             text: textMessage,
//             route: "1",
//         });

//         const options = {
//             hostname: smsApiHost,
//             path: `/api/mt/SendSMS?${params.toString()}`,
//             method: "GET",
//         };

//         const request = http.request(options, (response) => {
//             let data = "";

//             response.on("data", (chunk) => {
//                 data += chunk;
//             });

//             response.on("end", () => {
//                 res.status(200).json({ message: "SMS sent successfully", response: JSON.parse(data) });
//             });
//         });

//         request.on("error", (err) => {
//             console.error(err);
//             res.status(500).send("Failed to send SMS");
//         });

//         request.end();
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Internal Server Error");
//     }
// };

const sendSMS = async (req, res) => {
  try {
    const { phoneNumbers, textMessage } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: "Phone numbers must be a non-empty array." });
    }
    if (!textMessage) {
      return res.status(400).json({ error: "Text message is required." });
    }

    const apiKey = "SyDRBwUYBUifknCNSW2P9A";
    const senderId = "AVVAJK";
    const smsApiHost = "admin.avvainexs.com";

    const numbers = phoneNumbers.join(",");

    const params = new URLSearchParams({
      APIKey: apiKey,
      senderid: senderId,
      channel: "2",
      DCS: "0",
      flashsms: "0",
      number: numbers,
      text: textMessage,
      route: "1",
    });

    const options = {
      hostname: smsApiHost,
      path: `/api/mt/SendSMS?${params.toString()}`,
      method: "GET",
    };

    const request = http.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const jsonResponse = JSON.parse(data);
          res.status(200).json({ message: "SMS sent successfully", response: jsonResponse });
        } catch (error) {
          console.error("Error parsing response:", error);
          res.status(500).json({ error: "Failed to parse SMS API response" });
        }
      });
    });

    request.on("error", (err) => {
      console.error("Request error:", err);
      res.status(500).json({ error: "Failed to send SMS" });
    });

    request.end();
  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAudiocomment = async (req, res) => {
  const { phone_no, patient_name } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "AF")
      .input("phone_no", sql.NVarChar, phone_no)
      .input("patient_name", sql.NVarChar, patient_name)
      .query(`EXEC sp_remarks @mode,'','','',@patient_name,@phone_no,''`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

const SentSms = async (req, res) => {
  const SentSms = req.body.SentSms;
  if (!SentSms || !SentSms.length) {
    res.status(400).send("Invalid or empty SentSms array.");
    return;
  }
  try {
    const pool = await connection.connectToDatabase(dbConfig);
    for (const updatedRow of SentSms) {
      await pool
        .request()
        .input("mode", sql.NVarChar, "MS")
        .input("SID_no", sql.Int, updatedRow.SID_no)
        .query(`EXEC sp_patient_list @mode,@SID_no,'','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    }
    res.status(200).json("sms sent successfully");
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};


const getMsgStatus = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      `EXEC sp_attribute_Info 'F','','Msg Status', '','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL
            `
    );

    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");

  }
};

const GetSndnoData = async (req, res) => {
  const { SID_no } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "SDN")
      .input("SID_no", sql.Int, SID_no)
      .query(`EXEC sp_patient_list @mode,@SID_no,'','','','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || "Internal Server Error");
  }
};

// const SMS = async (req, res) => {
//   try {
//     const { phoneNumber, dynamicURL } = req.body;

//     // The base URL for the SMS API
//     const baseUrl = 'https://simsms.avvainexs.com/services/send.php';
//     const apiKey = 'f867bb8c27f987fb52d2de9b8066e0fc0f72ecdc';

//     // Constructing the message
//     const message = `Dear Sir/Madam, We appreciate your trust in us and hope your experience was satisfactory. We would love to hear your feedback. Your valuable feedback: ${dynamicURL}. Your feedback is invaluable in helping us enhance our services. Thank you again for visiting us!\n- AMHC Team`;

//     const devices = 7; 
//     const devicesParam = devices; 

//     const params = {
//       key: apiKey,
//       number: phoneNumber,
//       message: message,
//       devices: devicesParam,
//       type: 'sms',
//       prioritize: 0,
//     };

//     // Converting the parameters to query string format
//     const queryString = querystring.stringify(params);

//     // Construct the full URL with query parameters
//     const url = `${baseUrl}?${queryString}`;

//     console.log("Sending SMS with URL: ", url);

//     // Returning a promise to handle the SMS request asynchronously
//     return new Promise((resolve, reject) => {
//       const request = https.get(url, (response) => {
//         let data = '';

//         // Collect data chunks
//         response.on('data', (chunk) => {
//           data += chunk;
//         });

//         // On response end, parse the data and send it to the client
//         response.on('end', () => {
//           try {
//             const jsonResponse = JSON.parse(data);
//             res.status(200).send(jsonResponse); // Sending the response back to the client
//             resolve(jsonResponse);              // Resolving the promise
//           } catch (error) {
//             console.error('Error parsing SMS response:', error.message);
//             res.status(500).send({ error: 'Failed to parse SMS response' });
//             reject(error);
//           }
//         });
//       });

//       // Handling request errors
//       request.on('error', (error) => {
//         console.error('Error sending SMS:', error.message);
//         res.status(500).send({ error: error.message });
//         reject(error);
//       });

//       // Ending the request
//       request.end();
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).send({ error: error.message });
//   }
// };

// const SMS = async (req, res) => {
//   try {
//     const { phoneNumber, dynamicURL } = req.body;

//     const baseUrl = 'https://simsms.avvainexus.com/services/send.php'; // fixed domain
//     const apiKey = 'c2990d56da533f17ab84266d452732e32732e9a7';

//     const message = `Dear Sir/Madam, We appreciate your trust in us. Feedback: ${dynamicURL} - AMHC Team`;

//     const params = {
//       key: apiKey,
//       number: phoneNumber, // example: +919790847645
//       message: message,
//       option: 2, // added option param
//       type: 'sms',
//       prioritize: 1, // match example URL
//     };

//     const queryString = querystring.stringify(params);
//     const url = `${baseUrl}?${queryString}`;

//     console.log("Sending SMS with URL: ", url);

//     return new Promise((resolve, reject) => {
//       const request = https.get(url, (response) => {
//         let data = '';

//         response.on('data', (chunk) => {
//           data += chunk;
//         });

//         response.on('end', () => {
//           try {
//             const jsonResponse = JSON.parse(data);
//             res.status(200).send(jsonResponse);
//             resolve(jsonResponse);
//           } catch (error) {
//             console.error('Error parsing SMS response:', error.message);
//             res.status(500).send({ error: 'Failed to parse SMS response' });
//             reject(error);
//           }
//         });
//       });

//       request.on('error', (error) => {
//         console.error('Error sending SMS:', error.message);
//         res.status(500).send({ error: error.message });
//         reject(error);
//       });

//       request.end();
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).send({ error: error.message });
//   }
// };

const SMS = async (req, res) => {
  try {
    const { phoneNumber, dynamicURL, SID_no } = req.body;

    const pool = await connection.connectToDatabase(dbConfig);

    const check = await pool.request()
      .input("SID_no", sql.Int, SID_no)
      .query(`
        SELECT msg_status 
        FROM tbl_uploadedPatients 
        WHERE SID_no = @SID_no
      `);

    if (check.recordset.length > 0 && check.recordset[0].msg_status === 'Yes') {
      return res.status(500).json({
        message: `Already SMS sent for SID ${SID_no}`
      });
    }

    // ✅ 2. SEND SMS
    const baseUrl = 'https://simsms.avvainexus.com/services/send.php';
    const apiKey = 'c2990d56da533f17ab84266d452732e32732e9a7';

    const message = `Dear Sir/Madam, We appreciate your trust in us. Feedback: ${dynamicURL} - AMHC Team`;

    const params = {
      key: apiKey,
      number: phoneNumber,
      message: message,
      option: 2,
      type: 'sms',
      prioritize: 1,
    };

    const queryString = querystring.stringify(params);
    const url = `${baseUrl}?${queryString}`;

    https.get(url, async (response) => {
      let data = '';

      response.on('data', chunk => data += chunk);

      response.on('end', async () => {
        try {
          const jsonResponse = JSON.parse(data);

          if (
            jsonResponse.success === true &&
            jsonResponse.data?.messages?.length > 0
          ) {
            await pool.request()
              .input("SID_no", sql.Int, SID_no)
              .query(`
                UPDATE tbl_uploadedPatients
                SET msg_status = 'Yes'
                WHERE SID_no = @SID_no
              `);
          }

          res.status(200).json(jsonResponse);

        } catch (err) {
          res.status(500).json({ error: "SMS parse error" });
        }
      });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlan = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      `EXEC sp_patient_list 'A','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getSID = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      `EXEC sp_patient_list 'SID','','','','','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL`
    );

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getDashboardPlan = async (req, res) => {
  try {
    await connection.connectToDatabase();
    const result = await sql.query(
      "EXEC sp_attribute_Info 'DP','','Plan','','', '' ,'','', NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL"
    );
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(404).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

//Code added by pavun on 04-07-25
const getDashboardCM = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "CM") // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(` EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getDashboardLM = async (req, res) => {
  const { department, plans } = req.body;
  let pool;
  try {
    const pool = await connection.connectToDatabase();
    const result = await pool
      .request()
      .input("mode", sql.NVarChar, "LM") // Insert mode
      .input("department", sql.NVarChar, department) // Insert mode
      .input("plans", sql.NVarChar, plans)
      .query(` EXEC sp_masterhealth_dashboard_dept @mode,'','',@department,@plans`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset); // 200 OK if data is found
    } else {
      res.status(410).send("Data not found"); // 404 Not Found if no data is found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
//Code Ended by pavun on 0-07-25

module.exports = {
  login,
  getStatus,
  addattrihdrData,
  geattrihdrcode,
  addattridetData,
  getattributeSearchdata,
  deleteAttriDetailData,
  updattridetData,
  addformdata,
  deleteformdata,
  AddReport,
  getQuetions,
  getpatientdata,
  deletePatientData,
  getGender,
  addFeedbackForm,
  Sms,
  getDashboard,
  getdepartement,
  getDashboardLW,
  getDashboardCY,
  getDashboardL6M,
  getDashboardCD,
  getaverage,
  getDaterange,
  getplan,
  getDashboardLY,
  Chart,
  adduserscreenmap,
  getAlluserscreenmap,
  userscreenmapdeleteData,
  saveEditeduserscreenmap,
  getuserscreensearchdata,
  getUserPermission,
  AddRoleInfoData,
  getAllRoleInfoData,
  roledeleteData,
  RolesaveEditedData,
  getRolesearchdata,
  getroleid,
  getScreens,
  getpermission,
  getRemarks,
  getLoginorout,
  getUserRole,
  getUsertype,
  userAddData,
  getUsersearchdata,
  UserdeleteData,
  UsersaveEditedData,
  UpdateUserImage,
  addformdataTest,
  addFeedbackFormtest,
  getRemarks_Dashboard,
  getratingdetails,
  GenderChart,
  GetdashpatientCount,
  GetdashfeedpatientCount,
  getdashbestdept,
  sendSMS,
  getAudiocomment,
  SentSms,
  getMsgStatus,
  getRoleIDDrop,
  getRoleRights,
  SMS,
  getPlan,
  getSID,
  getdashpoordept,
  getDashboardPlan,
  GetSndnoData,
  getDashboardCM,
  getDashboardLM
};
