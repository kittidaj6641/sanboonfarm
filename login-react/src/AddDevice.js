import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Save, HardDrive } from 'lucide-react';
import axios from 'axios';
import config from './config';
import './AddDevice.css';

function AddDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      navigate('/login');
    }
  }, [navigate]);

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
    
    if (!token) {
        alert('Session หมดอายุ กรุณาล็อกอินใหม่');
        navigate('/login');
        return;
    }

    try {
      // ยิง API ไปที่ /member/devices/add
      const response = await axios.post(
        `${config.API_BASE_URL}/member/devices/add`, 
        formData,
        {
            headers: { Authorization: `Bearer ${token}` } 
        }
      );

      if (response.status === 201) {
        alert('✅ เพิ่มอุปกรณ์สำเร็จ!');
        navigate('/');
      }
    } catch (error) {
      console.error("Error adding device:", error);
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
          <h1>ลงทะเบียนอุปกรณ์</h1>
          <p>เพิ่มอุปกรณ์ใหม่ลงในระบบฐานข้อมูล</p>
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
            <label>สถานที่ติดตั้ง</label>
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
