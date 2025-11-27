import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Save, HardDrive } from 'lucide-react';
import axios from 'axios';
import config from './config'; // ดึง URL ของ Backend มาใช้
import './AddDevice.css';

function AddDevice() {
  const navigate = useNavigate();
  
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    location: ''
  });
  
  const [loading, setLoading] = useState(false);

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยังเมื่อเข้ามาที่หน้านี้
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      navigate('/login');
    }
  }, [navigate]);

  // ฟังก์ชันจัดการการเปลี่ยนค่าใน Input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ฟังก์ชันส่งข้อมูลเมื่อกดปุ่มบันทึก
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');

    // ป้องกันกรณี token หายไประหว่างใช้งาน
    if (!token) {
        alert('Session หมดอายุ กรุณาล็อกอินใหม่');
        navigate('/login');
        return;
    }

    try {
      // ยิง API ไปที่ Backend (path ใหม่ที่อยู่ใน member.js)
      const response = await axios.post(
        `${config.API_BASE_URL}/member/devices/add`, 
        formData,
        {
            headers: { Authorization: `Bearer ${token}` } 
        }
      );

      if (response.status === 201) {
        alert('✅ บันทึกข้อมูลอุปกรณ์สำเร็จ!');
        navigate('/'); // กลับหน้าหลักเมื่อเสร็จ
      }
    } catch (error) {
      console.error("Error adding device:", error);
      
      // แสดงข้อความ Error จาก Backend หรือข้อความทั่วไป
      const errorMsg = error.response?.data?.error || error.message || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
      alert(`❌ เกิดข้อผิดพลาด: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="add-device-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* ปุ่มกลับหน้าหลัก */}
      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <div className="form-card">
        <div className="form-header">
          <div className="icon-bg">
            <HardDrive size={32} color="#007bff" />
          </div>
          <h1>ลงทะเบียนอุปกรณ์</h1>
          <p>เพิ่มอุปกรณ์ใหม่เข้าสู่ระบบ</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่ออุปกรณ์ (Device Name)</label>
            <input 
              type="text" 
              name="deviceName" 
              placeholder="เช่น บ่อกุ้งโซน A" 
              value={formData.deviceName}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label>รหัสอุปกรณ์ (Device ID)</label>
            <div className="input-with-hint">
              <input 
                type="text" 
                name="deviceId" 
                placeholder="เช่น ESP32_001" 
                value={formData.deviceId}
                onChange={handleChange}
                required 
              />
              <small className="hint">* ห้ามซ้ำกับที่มีอยู่ในระบบ</small>
            </div>
          </div>

          <div className="form-group">
            <label>สถานที่ติดตั้ง (Location)</label>
            <input 
              type="text" 
              name="location" 
              placeholder="ระบุพิกัด หรือ ชื่อฟาร์ม" 
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'กำลังบันทึก...' : (
              <>
                <Save size={18} /> บันทึกข้อมูล
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default AddDevice;
