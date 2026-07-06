import React, { useState, useEffect } from "react";
import "../Css/Login.css";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import Logo from "../images/hospital logo.jpg";
import hourglass from './hourglass.png'
const config = require("../ApiConfig");

const LoginForm = () => {
  const navigate = useNavigate();
  const [user_code, setUserCode] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showCapsLockWarning, setShowCapsLockWarning] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const secretKey = "yjk26012024";

  useEffect(() => {
    const handleCapsLock = (e) => {
      if (e instanceof KeyboardEvent && e.getModifierState("CapsLock")) {
        setIsCapsLockOn(true);
        setShowCapsLockWarning(true);
        setTimeout(() => setShowCapsLockWarning(false), 2000);
      } else {
        setIsCapsLockOn(false);
        setShowCapsLockWarning(false);
      }
    };

    window.addEventListener("keydown", handleCapsLock);
    window.addEventListener("keyup", handleCapsLock);

    return () => {
      window.removeEventListener("keydown", handleCapsLock);
      window.removeEventListener("keyup", handleCapsLock);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Encrypt user_code and user_password
      const encryptedUserCode = CryptoJS.AES.encrypt(
        user_code,
        secretKey
      ).toString();
      const encryptedPassword = CryptoJS.AES.encrypt(
        user_password,
        secretKey
      ).toString();

      // console.log("encryptedUserCode", encryptedUserCode)
      // console.log("encryptedPassword", encryptedPassword)

      const response = await fetch(`${config.apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_code: encryptedUserCode,
          user_password: encryptedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const [{ user_code, role_id, user_images }] = data;
        if (user_images && user_images.data) {
          const userImageBase64 = arrayBufferToBase64(user_images.data);
          sessionStorage.setItem("user_image", userImageBase64);
          // console.log("Stored Image in sessionStorage:", sessionStorage.getItem('user_image'));
        }

        sessionStorage.setItem("selectedUserCode", user_code);
        UserPermission(role_id);

        sessionStorage.setItem("isLoggedIn", true);
      } else {
        const errorData = await response.json();
        setLoading(false);
        console.error("Error:", errorData.message);
        setLoginError(errorData.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setLoading(false);
      setLoginError("Internal server error occurred!");
    }
  };

  const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // const UserPermission = async (role_id) => {
  //   try {
  //     const response = await fetch(`${config.apiBaseUrl}/getUserPermission`, {
  //       method: 'post',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ role_id }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log(data);

  //       sessionStorage.setItem('permissions', JSON.stringify(data));
  //       const storedPermissions = JSON.parse(sessionStorage.getItem('permissions'));
  //       console.log('Stored permissions:', storedPermissions);

  //       navigate('/Dashboard');
  //       // window.location.reload();

  //     } else {
  //       const errorData = await response.json();
  //       console.error('Error:', errorData.message);
  //     }
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //   }
  // };

  const UserPermission = async (role_id) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/getUserPermission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role_id }),
      });

      if (response.ok) {
        const data = await response.json();

        sessionStorage.setItem("permissions", JSON.stringify(data));

        window.dispatchEvent(new Event("permissionsUpdated"));
        const storedPermissions = JSON.parse(
          sessionStorage.getItem("permissions")
        );
        // console.log('Stored permissions:', storedPermissions);

        const firstScreenType = storedPermissions?.[0]?.screen_type;

        if (firstScreenType) {
          navigate(`/${firstScreenType}`);
        } else {
          console.warn("No valid screen_type found in permissions.");
        }
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <div className="body">
        <div className="wrapper">
          <div className="d-flex justify-content-center">
            <img src={Logo} className="LOGO" />
          </div>
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            {loginError && (
              <div
                style={{ color: "white", padding: "5px", textAlign: "center" }}
              >
                {loginError}
              </div>
            )}
            {showCapsLockWarning && isCapsLockOn && (
              <div style={{ color: "white", padding: "5px" }}>
                Caps Lock is on
              </div>
            )}
            <div className="input-box">
            <i className="bx bxs-user user-icon"></i>
              <input
                type="text"
                placeholder="Username"
                required
                value={user_code}
                onChange={(e) => setUserCode(e.target.value)}
              />
            </div>
            <div className="input-box">
            <i className="bx bxs-lock-alt lock-icon"></i>
              <input
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                required
                value={user_password}
                onChange={(e) => setUserPassword(e.target.value)}
              />
              <i
                className={`bx ${
                  showPassword ? "bx-show" : "bx-hide"
                } eye-icon`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
            <div className="remember-forgot">
              {/* <a href="#">Forgot password?</a> */}
            </div>
            <button type="submit" className="btn" disabled={loading}>
              Login
            </button>
          </form>
        </div>
        {loading && (
        <div className="loading-popup">
          <div className="popup-content">
            <div className="spinner  display-2">
            <img src={hourglass} width={150} height={140} />
            </div>
            <p>Loading...</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LoginForm;
