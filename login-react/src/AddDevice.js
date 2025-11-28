import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Save, HardDrive } from 'lucide-react';
import axios from 'axios';
import config from './config'; // ✅ ตรวจสอบ path ให้ถูกต้อง
import './AddDevice.css';

function AddDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceId: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.deviceName.trim() || !formData.deviceId.trim()) {
      setError('กรุณากรอกชื่อและรหัสอุปกรณ์');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Session หมดอายุ กรุณาล็อกอินใหม่');
      navigate('/login');
      return;
    }

    try {
      console.log('Target API:', `${config.API_BASE_URL}/member/devices/add`);
      
      const response = await axios.post(
        `${config.API_BASE_URL}/member/devices/add`, 
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.status === 201) {
        alert('✅ เพิ่มอุปกรณ์สำเร็จ!');
        setFormData({
          deviceName: '',
          deviceId: '',
          location: ''
        });
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      console.error("Error adding device:", error);
      
      let errorMsg = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (Network Error)";
      
      if (error.response) {
        // Server ตอบกลับมา (เช่น 400, 500)
        errorMsg = error.response.data?.error || error.response.data?.msg || errorMsg;
        
        if (error.response.status === 401) {
          errorMsg = 'Session หมดอายุ กรุณาล็อกอินใหม่';
          setTimeout(() => navigate('/login'), 2000);
        }
      } else if (error.request) {
        // ส่งไปไม่ถึง Server (CORS หรือ Server ล่ม)
        errorMsg = "ไม่สามารถติดต่อ Server ได้ (ตรวจสอบ CORS หรือ Internet)";
      }
      
      setError(errorMsg);
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

        {error && (
          <div className="error-message" style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ชื่ออุปกรณ์ (Device Name) *</label>
            <input 
              type="text" 
              name="deviceName" 
              value={formData.deviceName}
              onChange={handleChange}
              disabled={loading}
              required 
              placeholder="เช่น บ่อกุ้งโซน A" 
            />
          </div>

          <div className="form-group">
            <label>รหัสอุปกรณ์ (Device ID) *</label>
            <div className="input-with-hint">
              <input 
                type="text" 
                name="deviceId" 
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
                required 
                placeholder="เช่น ESP32_001" 
              />
              <small className="hint">* ห้ามซ้ำกับที่มีอยู่ในระบบ</small>
            </div>
          </div>

          <div className="form-group">
            <label>สถานที่ติดตั้ง</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              placeholder="ระบุพิกัด หรือ ชื่อฟาร์ม" 
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
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
