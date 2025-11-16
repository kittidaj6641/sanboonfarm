import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react'; // Import ไอคอน
import './Realtime.css'; // Import ไฟล์ CSS ที่เราจะสร้าง

function Realtime() {
  const navigate = useNavigate();

  // (นี่คือข้อมูลสมมติ)
  // ในอนาคต คุณจะต้องเปลี่ยนส่วนนี้ให้ดึงข้อมูลมาจาก API
  const sensorData = {
    temp: 29.1,
    do: 6.5,
    ph: 7.3,
    bod: 2.1
  };

  return (
    // ใช้ motion.div เพื่อให้ทำงานกับ AnimatePresence
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="realtime-container"
    >
      {/* ปุ่มกลับหน้าหลัก (เพิ่มเข้ามาเผื่อ) */}
      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <h1>ข้อมูลคุณภาพน้ำ (Realtime)</h1>
      
      <div className="sensor-grid">
        
        <div className="sensor-card">
          <h2>Temperature</h2>
          <p className="sensor-value">{sensorData.temp} <span>°C</span></p>
        </div>

        <div className="sensor-card">
          <h2>Dissolved Oxygen</h2>
          <p className="sensor-value">{sensorData.do} <span>mg/L</span></p>
        </div>

        <div className="sensor-card">
          <h2>pH Level</h2>
          <p className="sensor-value">{sensorData.ph}</p>
        </div>

        <div className="sensor-card">
          <h2>BOD</h2>
          <p className="sensor-value">{sensorData.bod} <span>mg/L</span></p>
        </div>
        
      </div>
    </motion.div>
  );
}

export default Realtime;
