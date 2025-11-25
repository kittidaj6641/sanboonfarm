import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, Activity, Droplets, Thermometer, Wind } from 'lucide-react';
import './Realtime.css';

// Import Config
import { database } from './firebaseConfig'; 
import { ref, onValue } from "firebase/database";

function Realtime() {
  const navigate = useNavigate();

  // ตั้งค่า State ให้ตรงกับข้อมูลที่คุณส่งมา
  const [sensorData, setSensorData] = useState({
    temp: 0, 
    do: 0, 
    ph: 0, 
    turbidity: 0,
    timestamp: null
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เชื่อมต่อ Database ที่ Root (ชั้นนอกสุด)
    const sensorRef = ref(database, '/sensor_readings');

    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // อัปเดตข้อมูลตาม Key ที่คุณให้มาเป๊ะๆ
        setSensorData({
          temp: data.temperature ?? 0,      // temperature
          do:   data.dissolved_oxygen ?? 0, // dissolved_oxygen
          ph:   data.ph ?? 0,               // ph
          turbidity:  data.turbidity ?? 0,  // turbidity
          timestamp: data.timestamp         // timestamp
        });
      } 
      setLoading(false);
    }, (error) => {
      console.error("Error reading realtime data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="realtime-container"
    >
      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <h1><Activity className="icon-pulse" /> ข้อมูลคุณภาพน้ำ (Realtime)</h1>
      
      {loading ? (
        <div className="loading-container">
            <p className="loading-text">กำลังเชื่อมต่อกับเซ็นเซอร์...</p>
        </div>
      ) : (
        <div className="sensor-grid">
          <div className="sensor-card temp">
            <div className="card-header">
                <Thermometer size={24} />
                <h2>Temperature</h2>
            </div>
            <p className="sensor-value">{Number(sensorData.temp).toFixed(1)} <span>°C</span></p>
            {/* เปลี่ยนสีจุดสถานะตามเกณฑ์อุณหภูมิ (เช่น > 32 หรือ < 20 คือผิดปกติ) */}
            <div className="status-dot" style={{background: sensorData.temp > 32 || sensorData.temp < 20 ? '#ff6b6b' : '#2ecc71'}}></div>
          </div>

          <div className="sensor-card do">
             <div className="card-header">
                <Wind size={24} />
                <h2>Dissolved Oxygen</h2>
            </div>
            <p className="sensor-value">{Number(sensorData.do).toFixed(2)} <span>mg/L</span></p>
          </div>

          <div className="sensor-card ph">
             <div className="card-header">
                <Droplets size={24} />
                <h2>pH</h2>
            </div>
            <p className="sensor-value">{Number(sensorData.ph).toFixed(2)}</p>
          </div>

          <div className="sensor-card bod">
             <div className="card-header">
                <Activity size={24} />
                <h2>Turbidity</h2>
            </div>
            <p className="sensor-value">{Number(sensorData.turbidity).toFixed(2)} <span>NTU</span></p>
          </div>
        </div>
      )}

      <p className="update-status">
        <span className="blink-dot"></span> อัปเดตล่าสุด: {sensorData.timestamp ? new Date(sensorData.timestamp).toLocaleString('th-TH') : new Date().toLocaleTimeString('th-TH')}
      </p>
    </motion.div>
  );
}

export default Realtime;
