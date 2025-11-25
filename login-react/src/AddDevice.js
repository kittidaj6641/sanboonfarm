import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Save, HardDrive } from 'lucide-react';
import axios from 'axios';
import config from './config'; // นำเข้า config เพื่อเอา URL Backend
import './AddDevice.css';

function AddDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      // ยิง API ไปที่ Backend (PostgreSQL)
      const response = await axios.post(
        `${config.API_BASE_URL}/api/devices/add`, 
        formData,
        {
            // ส่ง Token ไปด้วยเพื่อความปลอดภัย (ถ้า Backend เช็ค)
            headers: { Authorization: `Bearer ${token}` } 
        }
      );

      if (response.status === 201) {
        alert('✅ บันทึกข้อมูลลงฐานข้อมูลสำเร็จ!');
        navigate('/'); // กลับหน้าหลัก
      }
    } catch (error) {
      console.error("Error adding device:", error);
      // แสดงข้อความ Error จาก Backend ถ้ามี
      const errorMsg = error.response?.data?.error || "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้";
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
      <button onClick={() => navigate('/')} className="back-home-btn">
        <Home size={16} /> กลับหน้าหลัก
      </button>

      <div className="form-card">
        <div className="form-header">
          <div className="icon-bg">
            <HardDrive size={32} color="#007bff" />
          </div>
          <h1>ลงทะเบียนอุปกรณ์ใหม่</h1>
          <p>ข้อมูลจะถูกบันทึกลงในฐานข้อมูล PostgreSQL (Railway)</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่ออุปกรณ์ (Device Name)</label>
            <input 
              type="text" 
              name="deviceName" 
              placeholder="เช่น บ่อเลี้ยงกุ้ง 1" 
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
                placeholder="เช่น ESP32_01" 
                value={formData.deviceId}
                onChange={handleChange}
                required 
              />
              <small className="hint">* ต้องตรงกับรหัสในโค้ด ESP32 และไม่ซ้ำกับที่มีอยู่</small>
            </div>
          </div>

          <div className="form-group">
            <label>สถานที่ติดตั้ง (Location)</label>
            <input 
              type="text" 
              name="location" 
              placeholder="เช่น โซน A" 
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
